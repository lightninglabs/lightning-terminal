/* eslint-disable @typescript-eslint/no-var-requires */
const util = require('util');
const https = require('https');
const exec = util.promisify(require('child_process').exec);
const { promises: fs, mkdirSync } = require('fs');
const { join, sep, dirname } = require('path');
const { platform } = require('os');
const appPath = join(__dirname, '..');

/**
 * Specify the pattern under which the project's version can be found in the
 * root directory's go.mod file.
 */
const LND_VERSION_PATTERN = /^\tgithub\.com\/lightningnetwork\/lnd (v[\d.]+-beta)/ms;
const LOOP_VERSION_PATTERN = /^\tgithub\.com\/lightninglabs\/loop (v[\d.]+-beta)/ms;
const POOL_VERSION_PATTERN = /^\tgithub\.com\/lightninglabs\/pool (v[\d.]+-alpha)/ms;

/** mapping of proto files to the github url to download each from */
const protoSources = async () => {
  console.log('Parsing go.mod for versions...');
  const goModPath = join(appPath, '..', 'go.mod');
  const goModSource = (await fs.readFile(goModPath)).toString();

  const lndVersion = ['', '8d8db527237e0cc897398ebea8b296638c55d946']; // TODO: goModSource.match(LND_VERSION_PATTERN);
  if (!lndVersion || lndVersion.length !== 2) {
    throw new Error(`go.mod did not match pattern ${LND_VERSION_PATTERN}`);
  }

  const loopVersion = goModSource.match(LOOP_VERSION_PATTERN);
  if (!loopVersion || loopVersion.length !== 2) {
    throw new Error(`go.mod did not match pattern ${LOOP_VERSION_PATTERN}`);
  }

  const poolVersion = goModSource.match(POOL_VERSION_PATTERN);
  if (!poolVersion || poolVersion.length !== 2) {
    throw new Error(`go.mod did not match pattern ${POOL_VERSION_PATTERN}`);
  }

  console.log(
    `Found:\n LND ${lndVersion[1]}\n Loop ${loopVersion[1]}\n Pool ${poolVersion[1]}`,
  );
  return {
    lnd: `lightningnetwork/lnd/${lndVersion[1]}/lnrpc/lightning.proto`,
    loop: `lightninglabs/loop/${loopVersion[1]}/looprpc/client.proto`,
    common: `lightninglabs/loop/${loopVersion[1]}/looprpc/common.proto`,
    trader: `lightninglabs/pool/${poolVersion[1]}/poolrpc/trader.proto`,
    'auctioneerrpc/auctioneer': `lightninglabs/pool/${poolVersion[1]}/auctioneerrpc/auctioneer.proto`,
  };
};

/** list of proto files and patches to apply */
const filePatches = {
  lnd: 'lnrpc: {}',
  loop: 'looprpc: {}',
  common: 'looprpc: {}',
  trader: 'poolrpc: {}',
  'auctioneerrpc/auctioneer': 'poolrpc: {}',
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
    mkdirSync(dirname(filePath), { recursive: true });
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
 * Adds "[jstype = JS_STRING]" to uint64 fields to indicate that they should be
 * represented as strings to avoid Number overflow issues
 */
const sanitize = async () => {
  const filePaths = Object.keys(filePatches).map(name =>
    join(appPath, '..', 'proto', `${name}.proto`),
  );
  for (path of filePaths) {
    let content = (await fs.readFile(path)).toString();
    content = content.replace(/^\s*(repeated)? u?int64 ((?!jstype).)*$/gm, match => {
      // add the jstype descriptor
      return /^.*];$/.test(match)
        ? match.replace(/\s*];$/, `, jstype = JS_STRING];`)
        : match.replace(/;$/, ` [jstype = JS_STRING];`);
    });
    await fs.writeFile(path, content);
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
    `-I../proto`,
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
    const path = join(
      appPath,
      'src',
      'types',
      'generated',
      `${filename.replace(/\//, sep)}_pb.js`,
    );

    console.log(` - ${path}`);
    let content = await fs.readFile(path);

    // apply the webpack patch
    const patch = [
      '/* eslint-disable */',
      `var proto = { ${filePatches[filename]} };`,
      '',
    ].join('\n');
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
    await sanitize();
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
