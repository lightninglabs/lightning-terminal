/* eslint-disable @typescript-eslint/no-var-requires */
const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function (app) {
  app.use(
    '/',
    createProxyMiddleware(
      ['/lnrpc.Lightning', '/looprpc.SwapClient', '/frdrpc.FaradayServer'],
      {
        target: 'https://localhost:8443',
        ws: true,
        secure: false,
      },
    ),
  );
};
