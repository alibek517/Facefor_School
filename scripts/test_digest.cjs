const http = require('http');
const crypto = require('crypto');

function digestRequest(options) {
  return new Promise((resolve) => {
    const req1 = http.request({
      hostname: options.host,
      port: options.port || 80,
      path: options.path,
      method: options.method || 'GET',
      timeout: 3000
    }, (res1) => {
      if (res1.statusCode !== 401 || !res1.headers['www-authenticate']) {
        let b = '';
        res1.on('data', c => b += c);
        res1.on('end', () => resolve({ status: res1.statusCode, body: b }));
        return;
      }

      const auth = res1.headers['www-authenticate'];
      const realmMatch = auth.match(/realm="([^"]+)"/);
      const nonceMatch = auth.match(/nonce="([^"]+)"/);
      const qopMatch = auth.match(/qop="([^"]+)"/);
      const realm = realmMatch ? realmMatch[1] : '';
      const nonce = nonceMatch ? nonceMatch[1] : '';
      const qop = qopMatch ? qopMatch[1] : '';

      const ha1 = crypto.createHash('md5').update(`${options.username}:${realm}:${options.password}`).digest('hex');
      const ha2 = crypto.createHash('md5').update(`${options.method || 'GET'}:${options.path}`).digest('hex');
      let response;
      let authHeader;
      if (qop && qop.includes('auth')) {
        const nc = '00000001';
        const cnonce = 'abcdef12';
        response = crypto.createHash('md5').update(`${ha1}:${nonce}:${nc}:${cnonce}:auth:${ha2}`).digest('hex');
        authHeader = `Digest username="${options.username}", realm="${realm}", nonce="${nonce}", uri="${options.path}", qop=auth, nc=${nc}, cnonce="${cnonce}", response="${response}"`;
      } else {
        response = crypto.createHash('md5').update(`${ha1}:${nonce}:${ha2}`).digest('hex');
        authHeader = `Digest username="${options.username}", realm="${realm}", nonce="${nonce}", uri="${options.path}", response="${response}"`;
      }

      const req2 = http.request({
        hostname: options.host,
        port: options.port || 80,
        path: options.path,
        method: options.method || 'GET',
        headers: { 'Authorization': authHeader },
        timeout: 3000
      }, (res2) => {
        let b = '';
        res2.on('data', c => b += c);
        res2.on('end', () => resolve({ status: res2.statusCode, body: b }));
      });
      req2.on('error', e => resolve({ error: e.message }));
      req2.on('timeout', () => { req2.destroy(); resolve({ error: 'timeout' }); });
      req2.end();
    });
    req1.on('error', e => resolve({ error: e.message }));
    req1.on('timeout', () => { req1.destroy(); resolve({ error: 'timeout' }); });
    req1.end();
  });
}

async function run() {
  const host = '192.168.1.35';
  console.log('Testing deviceInfo:');
  const d = await digestRequest({ host, path: '/ISAPI/System/deviceInfo', username: 'admin', password: 'Islam4343' });
  console.log(d.status, d.body ? d.body.slice(0, 300) : d.error);

  console.log('Testing ContentMgmt/Storage:');
  const s = await digestRequest({ host, path: '/ISAPI/ContentMgmt/Storage', username: 'admin', password: 'Islam4343' });
  console.log(s.status, s.body ? s.body.slice(0, 300) : s.error);
}

run();
