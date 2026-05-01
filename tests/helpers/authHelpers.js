function tokenFromSetCookie(res) {
  const raw = res.headers['set-cookie'];
  if (!raw) return null;
  const joined = Array.isArray(raw) ? raw.join(';') : String(raw);
  const match = joined.match(/token=([^;]+)/);
  return match ? decodeURIComponent(match[1].trim()) : null;
}

async function registerAndLogin(request, registerBody) {
  const registerRes = await request.post('/api/auth/register').send(registerBody);

  const loginRes = await request.post('/api/auth/login').send({
    identifier: registerBody.email,
    password: registerBody.password,
  });

  const token = tokenFromSetCookie(loginRes);

  return { registerRes, loginRes, token };
}

module.exports = {
  tokenFromSetCookie,
  registerAndLogin,
};