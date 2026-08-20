import { NextResponse } from "next/server";

export async function GET() {
  try {
    const keyId = (process.env.B2_APPLICATION_KEY_ID || "").trim();
    const applicationKey = (process.env.B2_APPLICATION_KEY || "").trim();

    if (!keyId || !applicationKey) {
      return NextResponse.json(
        {
          configured: false,
          health: "Unknown",
          message: "B2_APPLICATION_KEY_ID atau B2_APPLICATION_KEY belum diset di Vercel.",
          buckets: [],
        },
        { status: 200 }
      );
    }

    const credentials = Buffer.from(`${keyId}:${applicationKey}`).toString("base64");

    // Wajib sertakan User-Agent agar request dari Vercel/Node.js diterima Backblaze
    const authRes = await fetch("https://api.backblazeb2.com/b2api/v3/b2_authorize_account", {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
        "User-Agent": "ProjectDashboard/1.0",
      },
      cache: "no-store",
    });

    const authData = await authRes.json();

    if (!authRes.ok || !authData.apiUrl) {
      return NextResponse.json(
        {
          configured: true,
          health: "Error",
          error: `Backblaze Reject (${authData.code || authRes.status}): ${authData.message || "Gagal Autentikasi API Key"}`,
          buckets: [],
        },
        { status: 200 }
      );
    }

    // Ambil daftar bucket menggunakan token autentikasi yang valid
    const bucketsRes = await fetch(`${authData.apiUrl}/b2api/v3/b2_list_buckets`, {
      method: "POST",
      headers: {
        Authorization: authData.authorizationToken,
        "Content-Type": "application/json",
        "User-Agent": "ProjectDashboard/1.0",
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
