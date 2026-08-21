import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return Response.json({ configured: false }, { status: 200 });
  }

  const supabase = createClient(url, key);
  const userAgent = req.headers.get("user-agent") || "";
  const referrer = req.headers.get("referer") || "";

  const { error } = await supabase
    .from("visitor_logs")
    .insert({ user_agent: userAgent, referrer });

  if (error) {
    return Response.json({ configured: true, error: error.message }, { status: 200 });
  }
  return Response.json({ configured: true, success: true });
}

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return Response.json({ configured: false, message: "Supabase belum dikonfigurasi" }, { status: 200 });
  }

  const supabase = createClient(url, key);

  try {
    const { count, error: countError } = await supabase
      .from("visitor_logs")
      .select("*", { count: "exact", head: true });

    if (countError) {
      return Response.json({ configured: true, error: countError.message }, { status: 200 });
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data: recent, error: recentError } = await supabase
      .from("visitor_logs")
      .select("visited_at")
      .gte("visited_at", sevenDaysAgo);

    return Response.json({
      configured: true,
      total: count ?? 0,
      recent: recentError ? [] : recent || [],
    });
  } catch (err) {
    return Response.json({ configured: true, error: "Gagal konek ke Supabase", detail: String(err) }, { status: 200 });
  }
}