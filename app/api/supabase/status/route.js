// GET /api/supabase/status
// Query asli ke tabel "absen" via @supabase/supabase-js pakai service_role key.
// Ambil: total baris + 5 data terbaru. Kolom dibaca dinamis (nggak asumsi nama
// kolom tetap), jadi tetap jalan walau struktur tabel kamu beda dari contoh.

import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const tableName = process.env.SUPABASE_TABLE_ABSEN || "absen";

  if (!url || !key) {
    return Response.json(
      { configured: false, message: "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diset." },
      { status: 200 }
    );
  }

  const supabase = createClient(url, key);

  try {
    // Total baris
    const { count, error: countError } = await supabase
      .from(tableName)
      .select("*", { count: "exact", head: true });

    if (countError) {
      return Response.json(
        { configured: true, error: `Gagal query tabel "${tableName}"`, detail: countError.message },
        { status: 200 }
      );
    }

    // 5 data terbaru — coba order by created_at, kalau kolom itu nggak ada, fallback tanpa order
    let recent = [];
    const tryOrdered = await supabase.from(tableName).select("*").order("created_at", { ascending: false }).limit(5);
    if (!tryOrdered.error) {
      recent = tryOrdered.data;
    } else {
      const fallback = await supabase.from(tableName).select("*").limit(5);
      recent = fallback.data || [];
    }

    return Response.json({
      configured: true,
      tableName,
      totalRows: count ?? 0,
      recentRows: recent,
      columns: recent[0] ? Object.keys(recent[0]) : [],
    });
  } catch (err) {
    return Response.json(
      { configured: true, error: "Gagal konek ke Supabase", detail: String(err) },
      { status: 200 }
    );
  }
}