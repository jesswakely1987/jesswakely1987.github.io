// Vercel serverless function — the secure bridge between Lumina and Claude.
// Your secret Anthropic key lives here on the server, never in the web page.
//
// Deploy: place this file at  api/lumina.js  in your Vercel repo (Jess_Wakely).
// Then in Vercel → Project → Settings → Environment Variables, add:
//   Name:  ANTHROPIC_API_KEY
//   Value: your real key (starts with sk-ant-...)
 
export default async function handler(req, res) {
  // Only allow your own sites to use this bridge.
  const allowed = [
    "https://jesswakely.com",
    "https://www.jesswakely.com",
    "https://jesswakely1987.github.io"
  ];
  const origin = req.headers.origin;
  if (allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
 
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }
 
  try {
    const { system, messages, max_tokens } = req.body || {};
 
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",   // change here any time to use a newer model
        max_tokens: max_tokens || 1000,
        system: system || "",
        messages: messages || []
      })
    });
 
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
 
