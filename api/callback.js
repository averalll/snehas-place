// Step 2 of the editor sign-in: swap GitHub's code for a token and hand it
// back to the editor window (the standard Decap/Sveltia popup handshake).
function page(status, payload) {
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
  return `<!DOCTYPE html><html><body><p>Signing you in…</p><script>
(function () {
  var msg = ${JSON.stringify(message).replace(/</g, "\\u003c")};
  function receive(e) {
    window.opener.postMessage(msg, e.origin);
    window.removeEventListener("message", receive, false);
    setTimeout(function () { window.close(); }, 300);
  }
  window.addEventListener("message", receive, false);
  window.opener.postMessage("authorizing:github", "*");
})();
</script></body></html>`;
}

module.exports = async (req, res) => {
  const url = new URL(req.url, "https://placeholder");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = (req.headers.cookie || "")
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("cms_oauth_state="))
    ?.split("=")[1];

  res.setHeader("Content-Type", "text/html; charset=utf-8");

  if (!code || !state || state !== cookieState) {
    res.status(400).send(page("error", { message: "Sign-in expired. Close this window and try again." }));
    return;
  }

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const data = await response.json();
    if (!data.access_token) throw new Error(data.error_description || "No token returned");
    res.setHeader("Set-Cookie", "cms_oauth_state=; Path=/api; Max-Age=0");
    res.status(200).send(page("success", { token: data.access_token, provider: "github" }));
  } catch (err) {
    res.status(500).send(page("error", { message: err.message }));
  }
};
