// flag to check if the app is running in a local development environment
export const IS_DEV = process.env.NODE_ENV === 'development';

// flag to check if the app is running in a a production environment
export const IS_PROD = process.env.NODE_ENV === 'production';

// flag to check if the app is running in a a test environment
export const IS_TEST = process.env.NODE_ENV === 'test';

export const PUBLIC_URL = process.env.PUBLIC_URL;

// detect the host currently serving the app files
const { protocol, hostname, port } = window.location;
const host = `${protocol}//${hostname}:${port}`;
// the GRPC server to make requests to
export const DEV_HOST = process.env.REACT_APP_DEV_HOST || host;

export const USE_SAMPLE_DATA = process.env.REACT_APP_USE_SAMPLE_DATA === 'true';
