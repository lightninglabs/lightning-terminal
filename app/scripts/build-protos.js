/* eslint-disable @typescript-eslint/no-var-requires */
const util = require('util');
const https = require('https');
const exec = util.promisify(require('child_process').exec);
const { promises: fs } = require('fs');
const { join, sep } = require('path');
const { platform } = require('os');
const appPath = join(__dirname, '..');

/**
 * Specify the pattern under which the project's version can be found in the
 * root directory's go.mod file.
 */
const LND_VERSION_PATTERN = /^\tgithub\.com\/lightningnetwork\/lnd (v[\d.]+-beta)/ms;
const LOOP_VERSION_PATTERN = /^\tgithub\.com\/lightninglabs\/loop (v[\d.]+-beta)/ms;

/** mapping of proto files to the github url to download each from */
const protoSources = async () => {
  console.log('Parsing go.mod for versions...');
  const goModPath = join(appPath, '..', 'go.mod');
  const goModSource = (await fs.readFile(goModPath)).toString();

  const lndVersion = goModSource.match(LND_VERSION_PATTERN);
  if (!lndVersion || lndVersion.length !== 2) {
    throw new Error(`go.mod did not match pattern ${LND_VERSION_PATTERN}`);
  }
  
  const loopVersion = goModSource.match(LOOP_VERSION_PATTERN);
  if (!loopVersion || loopVersion.length !== 2) {
    throw new Error(`go.mod did not match pattern ${LOOP_VERSION_PATTERN}`);
  }

  console.log(`Found lnd version ${lndVersion[1]} and loop version ${loopVersion[1]}.`);
  return {
    lnd: `lightningnetwork/lnd/${lndVersion[1]}/lnrpc/rpc.proto`,
    loop: `lightninglabs/loop/${loopVersion[1]}/looprpc/client.proto`,
  };
};

/** list of proto files and patches to apply */
const filePatches = {
  lnd: 'lnrpc: {}',
  loop: 'looprpc: {}',
  trader: 'poolrpc: {}',
  auctioneer: 'poolrpc: {}',
  'google/api/annotations': 'google: { api: {} }',
  'google/api/http': 'google: { api: {} }',
};

/**
 * Downloads the *.proto files into the `../proto` dir
 */
const download = async () => {
  console.log('\nDownloading proto files...');
  for ([name, urlPath] of Object.entries(await protoSources())) {
    const url = `https://raw.githubusercontent.com/${urlPath}`;
    const filePath = join(appPath, '..', 'proto', `${name}.proto`);
    console.log(`${url}`);
    console.log(` -> ${filePath}`);
    const content = await new Promise((resolve, reject) => {
      https.get(url, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('error', err => reject(err));
        res.on('end', () => resolve(data));
      });
    });
    await fs.writeFile(filePath, content);
  }
};

/**
 * Executes the `protoc` compiler to convert *.proto files into TS & JS code
 */
const generate = async () => {
  console.log('\nCompiling protobuf definitions...');
  await fs.mkdir('./src/types/generated', { recursive: true });

  const protocGen = join(
    appPath,
    'node_modules',
    '.bin',
    platform() === 'win32' ? 'protoc-gen-ts.cmd' : 'protoc-gen-ts',
  );
  const protocCmd = [
    'protoc',
    `--plugin=protoc-gen-ts=${protocGen}`,
    '--proto_path=../proto',
    '--js_out=import_style=commonjs,binary:./src/types/generated',
    '--ts_out=service=grpc-web:./src/types/generated',
    ...Object.keys(filePatches).map(file => `../proto/${file}.proto`),
  ].join(' ');

  console.log(protocCmd);
  const { stderr } = await exec(protocCmd, { cwd: appPath });
  if (stderr) {
    throw new Error(`exec stderr:\n${stderr}`);
  }
};

/**
 * Patches the generated JS files as they contain a type error that prevents webpack from bundling properly.
 * The code below will prepend the necessary code to resolve the error.
 * Example: prepends `var proto = { lnrpc: {} };` to lnd_pb.js
 */
const patch = async () => {
  console.log('\nPatching generated JS files');

  for (const filename of Object.keys(filePatches)) {
    const patch = [
      '/* eslint-disable */',
      `var proto = { ${filePatches[filename]} };`,
      '',
    ].join('\n');
    const path = join(
      appPath,
      'src',
      'types',
      'generated',
      `${filename.replace(/\//, sep)}_pb.js`,
    );

    console.log(` - ${path}`);
    let content = await fs.readFile(path);
    content = `${patch}\n${content}`;
    await fs.writeFile(path, content);
  }
};

/**
 * An async wrapper with error handling around the two funcs above
 */
const main = async () => {
  try {
    await download();
    await generate();
    await patch();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

/**
 * execute the main function
 */
main();
