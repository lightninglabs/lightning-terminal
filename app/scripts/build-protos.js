/* eslint-disable @typescript-eslint/no-var-requires */
const util = require('util');
const https = require('https');
const exec = util.promisify(require('child_process').exec);
const { promises: fs } = require('fs');
const { join, sep } = require('path');
const { platform } = require('os');
const appPath = join(__dirname, '..');

/** Specify the versions of LND and Loop protos to download */
const LND_VERSION = 'v0.11.1-beta';
const LOOP_VERSION = 'v0.11.2-beta';

/** mapping of proto files to the github url to download each from */
const protoSources = {
  lnd: `lightningnetwork/lnd/${LND_VERSION}/lnrpc/rpc.proto`,
  loop: `lightninglabs/loop/${LOOP_VERSION}/looprpc/client.proto`,
};

/** list of proto files and patches to apply */
const filePatches = {
  lnd: 'lnrpc: {}',
  loop: 'looprpc: {}',
  'google/api/annotations': 'google: { api: {} }',
  'google/api/http': 'google: { api: {} }',
};

/**
 * Downloads the *.proto files into the `../proto` dir
 */
const download = async () => {
  console.log('\nDownloading proto files...');
  for ([name, urlPath] of Object.entries(protoSources)) {
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
