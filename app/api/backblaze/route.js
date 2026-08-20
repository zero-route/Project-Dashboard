import { NextResponse } from "next/server";

export async function GET() {
  try {
    const keyId = process.env.B2_APPLICATION_KEY_ID;
    const applicationKey = process.env.B2_APPLICATION_KEY;

    if (!keyId || !applicationKey) {
      return NextResponse.json(
        {
          configured: false,
          health: "Unknown",
          message: "B2_APPLICATION_KEY_ID atau B2_APPLICATION_KEY belum diatur.",
          buckets: [],
        },
        { status: 200 }
      );
    }

    // Authenticate dengan Read-Only Application Key via Basic Auth
    const authHeader = Buffer.from(`${keyId}:${applicationKey}`).toString("base64");
    const authRes = await fetch("https://api.backblazeb2.com/b2api/v3/b2_authorize_account", {
      headers: { Authorization: `Basic ${authHeader}` },
      next: { revalidate: 300 }, // Cache credentials selama 5 menit
    });

    if (!authRes.ok) {
      throw new Error(`Auth B2 Failed: ${authRes.statusText}`);
    }

    const authData = await authRes.json();

    // Fetch daftar bucket
    const bucketsRes = await fetch(`${authData.apiUrl}/b2api/v3/b2_list_buckets`, {
      method: "POST",
      headers: {
        Authorization: authData.authorizationToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accountId: authData.accountId }),
      next: { revalidate: 300 },
    });

    if (!bucketsRes.ok) {
      throw new Error(`Fetch B2 Buckets Failed: ${bucketsRes.statusText}`);
    }

    const bucketsData = await bucketsRes.json();

    const formattedBuckets = (bucketsData.buckets || []).map((b) => ({
      id: b.bucketId,
      name: b.bucketName,
      type: b.bucketType, // allPublic / allPrivate
      s3Endpoint: `s3.${authData.apiUrl.split("//")[1]?.split(".")[0] || "us-west-004"}.backblazeb2.com`,
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
        error: error.message || "Gagal mengambil data dari Backblaze B2 API",
        buckets: [],
      },
      { status: 500 }
    );
  }
}
