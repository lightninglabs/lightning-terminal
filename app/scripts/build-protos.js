/* eslint-disable @typescript-eslint/no-var-requires */
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { promises: fs } = require('fs');
const { join, sep } = require('path');
const { platform } = require('os');
const appPath = join(__dirname, '..');

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
 * Executes the `protoc` compiler to convert *.proto files into TS & JS code
 */
const generate = async () => {
  console.log('Compiling protobuf definitions');
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
  const { stdout, stderr } = await exec(protocCmd, { cwd: appPath });
  if (stderr) {
    throw new Error(`exec stderr:\n${stderr}`);
  }
  console.log(stdout);
};

/**
 * Patches the generated JS files as they contain a type error that prevents webpack from bundling properly.
 * The code below will prepend the necessary code to resolve the error.
 * Example: prepends `var proto = { lnrpc: {} };` to lnd_pb.js
 */
const patch = async () => {
  console.log('Patching generated JS files');

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
