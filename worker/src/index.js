/**
 * Cloudflare Worker: Real-time Notion -> Tellzzang Class JSON Proxy
 * - Reads live Notion page blocks & child pages using encrypted NOTION_TOKEN secret.
 * - Exposes CORS-enabled JSON with short edge cache (10s) for near-instant F5 updates.
 */

const NOTION_VERSION = "2022-06-28";

function corsHeaders(origin, allowedOrigin) {
  const allow =
    origin === allowedOrigin ||
    origin === "http://localhost:8000" ||
    origin === "http://127.0.0.1:8000"
      ? origin
      : allowedOrigin || "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
  };
}

function richTextToPlain(richText = []) {
  return richText.map((item) => item.plain_text || "").join("");
}

async function notionFetch(path, token) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Notion API ${res.status}: ${body}`);
  }
  return res.json();
}

function normalizeBlock(block) {
  const type = block.type;
  const data = block[type] || {};
  const text = richTextToPlain(data.rich_text || []);

  if (type === "callout") {
    return { id: block.id, type: "callout", icon: data.icon?.emoji || "📢", text };
  }
  if (type === "heading_1" || type === "heading_2" || type === "heading_3") {
    return { id: block.id, type, text };
  }
  if (type === "paragraph" || type === "bulleted_list_item" || type === "numbered_list_item") {
    return { id: block.id, type, text };
  }
  if (type === "to_do") {
    return { id: block.id, type: "to_do", checked: Boolean(data.checked), text };
  }
  if (type === "child_page") {
    return { id: block.id, type: "child_page", title: data.title || "" };
  }
  if (type === "image") {
    const url = data.type === "external" ? data.external?.url : data.file?.url;
    return { id: block.id, type: "image", url, caption: richTextToPlain(data.caption || []) };
  }
  if (type === "table_row") {
    const cells = (data.cells || []).map((cell) => richTextToPlain(cell));
    return { id: block.id, type: "table_row", cells };
  }
  return { id: block.id, type, text };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const headers = corsHeaders(origin, env.ALLOWED_ORIGIN);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (!env.NOTION_TOKEN) {
      return new Response(
        JSON.stringify({ ok: false, error: "NOTION_TOKEN secret is not configured." }),
        { status: 500, headers }
      );
    }

    const pageId = url.searchParams.get("pageId") || env.DEFAULT_PAGE_ID;
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    try {
      const [pageMeta, childrenRes] = await Promise.all([
        notionFetch(`/pages/${pageId}`, env.NOTION_TOKEN),
        notionFetch(`/blocks/${pageId}/children?page_size=100`, env.NOTION_TOKEN),
      ]);

      const titleProp = Object.values(pageMeta.properties || {}).find((p) => p.type === "title");
      const title = richTextToPlain(titleProp?.title || []);
      const blocks = (childrenRes.results || []).map(normalizeBlock);

      // Expand table rows if a table block is present
      const tables = [];
      for (const b of childrenRes.results || []) {
        if (b.type === "table") {
          const rowsRes = await notionFetch(`/blocks/${b.id}/children?page_size=100`, env.NOTION_TOKEN);
          tables.push({
            id: b.id,
            rows: (rowsRes.results || []).map((r) =>
              (r.table_row?.cells || []).map((cell) => richTextToPlain(cell))
            ),
          });
        }
      }

      const payload = {
        ok: true,
        fetchedAt: new Date().toISOString(),
        pageId,
        lastEditedTime: pageMeta.last_edited_time,
        title,
        icon: pageMeta.icon?.emoji || "📚",
        blocks,
        tables,
      };

      const response = new Response(JSON.stringify(payload), {
        status: 200,
        headers: {
          ...headers,
          "Cache-Control": "public, max-age=10, s-maxage=10",
        },
      });
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    } catch (err) {
      return new Response(
        JSON.stringify({ ok: false, error: err.message }),
        { status: 502, headers }
      );
    }
  },
};
