// Step 1 of the editor sign-in: send the person to GitHub to log in.
// Needs GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET set in Vercel.
const crypto = require("crypto");

module.exports = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).send("GITHUB_CLIENT_ID is not set in Vercel.");
    return;
  }
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const state = crypto.randomBytes(16).toString("hex");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `https://${host}/api/callback`,
    scope: "repo,user",
    state,
  });
  res.setHeader(
    "Set-Cookie",
    `cms_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  );
  res.writeHead(302, { Location: `https://github.com/login/oauth/authorize?${params}` });
  res.end();
};
