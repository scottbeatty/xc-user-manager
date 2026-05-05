export default async (req) => {
  // Only accept POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { tenant, token, method, path, body } = await req.json();

    if (!tenant || !token || !method || !path) {
      return new Response(JSON.stringify({ error: "Missing tenant, token, method, or path" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Build the real XC API URL
    const url = `https://${tenant}.console.ves.volterra.io${path}`;

    // Forward the request to XC
    const opts = {
      method: method,
      headers: {
        "Authorization": `APIToken ${token}`,
        "Content-Type": "application/json"
      }
    };

    if (body && method !== "GET") {
      opts.body = JSON.stringify(body);
    }

    const resp = await fetch(url, opts);
    const text = await resp.text();

    if (!resp.ok) {
      return new Response(JSON.stringify({ error: `HTTP ${resp.status}: ${text.substring(0, 500)}` }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Return the XC API response as-is
    return new Response(text, {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = {
  path: "/.netlify/functions/proxy"
};
