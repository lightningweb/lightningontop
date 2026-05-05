import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LIGHTNING_ID = "11111111-1111-1111-1111-111111111111";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const password = String(body?.password ?? "");
    const action = String(body?.action ?? "");
    const expected = Deno.env.get("LIGHTNING_ADMIN_PASSWORD") ?? "";
    if (!expected || password !== expected) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (action === "list_threads") {
      // Every user that has exchanged a message with @lightning
      const { data: msgs, error } = await supabase
        .from("messages")
        .select("sender_id,recipient_id,content,created_at")
        .or(`sender_id.eq.${LIGHTNING_ID},recipient_id.eq.${LIGHTNING_ID}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const byUser = new Map<string, { last: string; at: string }>();
      for (const m of msgs ?? []) {
        const other = m.sender_id === LIGHTNING_ID ? m.recipient_id : m.sender_id;
        if (!byUser.has(other)) byUser.set(other, { last: m.content, at: m.created_at });
      }
      const ids = [...byUser.keys()];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id,username,display_name")
        .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
      const threads = ids.map((id) => {
        const p = profiles?.find((x) => x.id === id);
        const t = byUser.get(id)!;
        return {
          user_id: id,
          username: p?.username ?? "unknown",
          display_name: p?.display_name ?? p?.username ?? "unknown",
          last_message: t.last,
          last_at: t.at,
        };
      });
      return new Response(JSON.stringify({ threads }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_thread") {
      const userId = String(body?.user_id ?? "");
      const { data, error } = await supabase
        .from("messages")
        .select("id,sender_id,recipient_id,content,created_at")
        .or(
          `and(sender_id.eq.${LIGHTNING_ID},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${LIGHTNING_ID})`
        )
        .order("created_at", { ascending: true });
      if (error) throw error;
      return new Response(JSON.stringify({ messages: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "send") {
      const userId = String(body?.user_id ?? "");
      const content = String(body?.content ?? "").trim();
      if (!userId || !content) throw new Error("Missing user_id or content");
      const { error } = await supabase
        .from("messages")
        .insert({ sender_id: LIGHTNING_ID, recipient_id: userId, content });
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});