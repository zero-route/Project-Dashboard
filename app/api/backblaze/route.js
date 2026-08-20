import { NextResponse } from "next/server";

export async function GET() {
  try {
    const keyId = process.env.B2_APPLICATION_KEY_ID?.trim();
    const applicationKey = process.env.B2_APPLICATION_KEY?.trim();

    // 1. Validasi Keberadaan Environment Variables
    if (!keyId || !applicationKey) {
      return NextResponse.json(
        {
          configured: false,
          health: "Unknown",
          message: "Environment Variable B2_APPLICATION_KEY_ID atau B2_APPLICATION_KEY belum dipasang di Vercel.",
          buckets: [],
        },
        { status: 200 }
      );
    }

    // 2. Request Autentikasi ke Backblaze B2 API
    const authHeader = Buffer.from(`${keyId}:${applicationKey}`).toString("base64");
    const authRes = await fetch("https://api.backblazeb2.com/b2api/v3/b2_authorize_account", {
      headers: { Authorization: `Basic ${authHeader}` },
      cache: "no-store",
    });

    const authData = await authRes.json();

    // 3. JIKA AUTH GAGAL: Langsung kembalikan pesan error resmi tanpa lanjut panggil URL undefined
    if (!authRes.ok || !authData.apiUrl) {
      return NextResponse.json(
        {
          configured: true,
          health: "Error",
          error: `Backblaze Auth Gagal (${authData.code || authRes.status}): ${authData.message || "Key ID atau Application Key tidak valid."}`,
          buckets: [],
        },
        { status: 200 }
      );
    }

    // 4. Fetch Daftar Bucket (hanya dijalankan jika apiUrl valid)
    const bucketsRes = await fetch(`${authData.apiUrl}/b2api/v3/b2_list_buckets`, {
      method: "POST",
      headers: {
        Authorization: authData.authorizationToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accountId: authData.accountId }),
      cache: "no-store",
    });

    const bucketsData = await bucketsRes.json();

    if (!bucketsRes.ok) {
      return NextResponse.json(
        {
          configured: true,
          health: "Error",
          error: `Gagal Ambil Bucket: ${bucketsData.message || bucketsRes.statusText}`,
          buckets: [],
        },
        { status: 200 }
      );
    }

    const formattedBuckets = (bucketsData.buckets || []).map((b) => ({
      id: b.bucketId,
      name: b.bucketName,
      type: b.bucketType,
      s3Endpoint: `s3.${authData.apiUrl.replace("https://", "").split(".")[0]}.backblazeb2.com`,
    }));

    return NextResponse.json({
      configured: true,
      health: "Operational",
      apiUrl: authData.apiUrl,
      downloadUrl: authData.downloadUrl,
      buckets: formattedBuckets,
    });
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        health: "Error",
        error: error.message || "Gagal terhubung ke server Backblaze B2",
        buckets: [],
      },
      { status: 500 }
    );
  }
}
