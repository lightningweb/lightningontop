const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const tools = [
  {
    type: "function",
    function: {
      name: "set_settings",
      description: "Update top-level site settings. Only include fields you want to change.",
      parameters: {
        type: "object",
        properties: {
          siteName: { type: "string" },
          tagline: { type: "string" },
          version: { type: "string" },
          maintenanceMode: { type: "boolean" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_game",
      description: "Add a new game or app card.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          url: { type: "string" },
          icon: { type: "string", description: "Emoji, e.g. 🎮" },
          description: { type: "string" },
          image: { type: "string", description: "Thumbnail image URL" },
          tag: { type: "string", description: "Optional small chip, e.g. 'new'" },
          category: { type: "string", enum: ["game", "app"] },
          external: { type: "boolean" },
        },
        required: ["name", "url"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_game",
      description: "Update fields of an existing game by id.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          url: { type: "string" },
          icon: { type: "string" },
          description: { type: "string" },
          image: { type: "string" },
          tag: { type: "string" },
          category: { type: "string", enum: ["game", "app"] },
          external: { type: "boolean" },
        },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "remove_game",
      description: "Remove a game by id.",
      parameters: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_quote",
      description: "Add a new quote.",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string" },
          author: { type: "string" },
        },
        required: ["text"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "remove_quote",
      description: "Remove a quote by its index (0-based) in the quotes list.",
      parameters: {
        type: "object",
        properties: { index: { type: "number" } },
        required: ["index"],
        additionalProperties: false,
      },
    },
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const password = String(body?.password ?? "");
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const currentConfig = body?.config ?? {};

    const expected = Deno.env.get("LIGHTNING_ADMIN_PASSWORD") ?? "";
    if (!expected || password !== expected) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Trim config for context — drop heavy fields where possible
    const summary = {
      siteName: currentConfig.siteName,
      tagline: currentConfig.tagline,
      version: currentConfig.version,
      maintenanceMode: currentConfig.maintenanceMode,
      games: (currentConfig.games ?? []).map((g: { id: string; name: string; category?: string; tag?: string; url: string }) => ({
        id: g.id, name: g.name, category: g.category, tag: g.tag, url: g.url,
      })),
      quotes: (currentConfig.quotes ?? []).map((q: { text: string; author?: string }, i: number) => ({
        index: i, text: q.text, author: q.author,
      })),
    };

    const systemPrompt = `You are an admin assistant for a personal hub site called "${summary.siteName ?? "lightning"}".
You help the admin manage their site config: settings (siteName, tagline, version, maintenanceMode), games/apps, and quotes.

You have tools to propose changes. The user reviews them and clicks Save. Use tools whenever the user asks to add/edit/remove anything. You can call multiple tools in one response.

Be brief in chat replies. After making tool calls, summarize what you proposed in 1 short sentence.

Current config:
${JSON.stringify(summary, null, 2)}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        tools,
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — try again in a minute." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in workspace settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiRes.text();
      console.error("AI error", aiRes.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const msg = data.choices?.[0]?.message ?? {};
    const toolCalls = (msg.tool_calls ?? []).map((tc: { function: { name: string; arguments: string } }) => {
      let args: unknown = {};
      try { args = JSON.parse(tc.function.arguments || "{}"); } catch { /* ignore */ }
      return { name: tc.function.name, args };
    });

    return new Response(JSON.stringify({
      reply: msg.content ?? "",
      toolCalls,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("admin-chat error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});