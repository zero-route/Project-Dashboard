import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function POST(req) {
  const userAgent = req.headers.get("user-agent") || "";
  const referrer = req.headers.get("referer") || "";

  const { error } = await supabase
    .from("visitor_logs")
    .insert({ user_agent: userAgent, referrer });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}

export async function GET() {
  const { count, error } = await supabase
    .from("visitor_logs")
    .select("*", { count: "exact", head: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // ambil juga jumlah 7 hari terakhir buat chart
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const { data: recent } = await supabase
    .from("visitor_logs")
    .select("visited_at")
    .gte("visited_at", sevenDaysAgo);

  return Response.json({ total: count, recent: recent || [] });
}