// GET /api/supabase/status
// TODO: aktifkan setelah SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY diisi.
//
// Dua sumber data berbeda yang perlu digabung di sini nanti:
// 1. Status project (paused/active, storage, dsb) -> Supabase Management API
//    GET https://api.supabase.com/v1/projects/{ref}  (butuh token akun, beda dari service key)
// 2. Data aplikasi (tabel "absen") -> query langsung pakai @supabase/supabase-js
//
// Contoh query tabel absen (aktifkan setelah install @supabase/supabase-js):
//
// import { createClient } from "@supabase/supabase-js";
// const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
// const { data, error } = await supabase
//   .from("absen")
//   .select("nama, waktu, status")
//   .order("waktu", { ascending: false })
//   .limit(10);

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return Response.json(
      {
        configured: false,
        message: "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diset.",
      },
      { status: 200 }
    );
  }

  // Placeholder response — ganti dengan query asli begitu kredensial ada
  return Response.json({
    configured: true,
    note: "Ganti isi route ini dengan query supabase-js ke tabel absen & project status.",
  });
}
