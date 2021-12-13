const http = require('http');
http
  .createServer((req, res) => {
    const proxyReq = http.request(
      {
        hostname: 'localhost',
        port: 8000,
        path: req.url.includes('.') ? req.url : '/',
        method: req.method,
        headers: req.headers,
      },
      (proxyRes) => {
        if (proxyRes.statusCode === 404) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<h1>404, page not found</h1>');
        } else {
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res, { end: true });
        }
      }
    );
    req.pipe(proxyReq, { end: true });
  })
  .listen(3000);
