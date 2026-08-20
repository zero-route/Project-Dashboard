import { NextResponse } from "next/server";

export async function GET() {
  try {
    let keyId = process.env.B2_APPLICATION_KEY_ID?.trim();
    const applicationKey = process.env.B2_APPLICATION_KEY?.trim();

    if (!keyId || !applicationKey) {
      return NextResponse.json(
        {
          configured: false,
          health: "Unknown",
          message: "Key ID atau Application Key belum diatur di Vercel.",
          buckets: [],
        },
        { status: 200 }
      );
    }

    // PENTING: Jika menggunakan Master Key (keyID pendek/12 karakter), 
    // Backblaze mewajibkan awalan 004 agar formatnya sesuai dengan API spec.
    if (keyId.length === 12 && !keyId.startsWith("004")) {
      keyId = `004${keyId}`;
    }

    // Authenticate ke Backblaze B2 via Basic Auth
    const authHeader = Buffer.from(`${keyId}:${applicationKey}`).toString("base64");
    const authRes = await fetch("https://api.backblazeb2.com/b2api/v3/b2_authorize_account", {
      headers: { Authorization: `Basic ${authHeader}` },
      cache: "no-store",
    });

    const authData = await authRes.json();

    if (!authRes.ok || !authData.apiUrl) {
      return NextResponse.json(
        {
          configured: true,
          health: "Error",
          error: `Backblaze Auth Gagal (${authData.code || authRes.status}): ${authData.message || "Key ID atau Application Key tidak diterima oleh server B2."}`,
          buckets: [],
        },
        { status: 200 }
      );
    }

    // Fetch list buckets
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
          error: `Fetch Bucket Gagal: ${bucketsData.message || bucketsRes.statusText}`,
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
        error: error.message || "Gagal terhubung ke Backblaze B2",
        buckets: [],
      },
      { status: 500 }
    );
  }
}
