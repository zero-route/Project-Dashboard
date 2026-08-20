import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  try {
    const accessKeyId = (process.env.B2_APPLICATION_KEY_ID || "").trim();
    const secretAccessKey = (process.env.B2_APPLICATION_KEY || "").trim();

    if (!accessKeyId || !secretAccessKey) {
      return NextResponse.json(
        { configured: false, health: "Unknown", message: "Key belum diatur.", buckets: [] },
        { status: 200 }
      );
    }

    // Menggunakan B2 S3 API Endpoint & AWS SigV4 Auth
    const region = "us-west-004";
    const host = `s3.${region}.backblazeb2.com`;
    const endpoint = `https://${host}/`;
    
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.substring(0, 8);

    const method = "GET";
    const canonicalUri = "/";
    const canonicalQuery = "";
    const payloadHash = crypto.createHash("sha256").update("").digest("hex");

    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = "host;x-amz-content-sha256;x-amz-date";

    const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQuery}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
    
    const algorithm = "AWS4-HMAC-SHA256";
    const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
    const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${crypto.createHash("sha256").update(canonicalRequest).digest("hex")}`;

    // Generate HMAC Keys
    const kDate = crypto.createHmac("sha256", `AWS4${secretAccessKey}`).update(dateStamp).digest();
    const kRegion = crypto.createHmac("sha256", kDate).update(region).digest();
    const kService = crypto.createHmac("sha256", kRegion).update("s3").digest();
    const kSigning = crypto.createHmac("sha256", kService).update("aws4_request").digest();
    const signature = crypto.createHmac("sha256", kSigning).update(stringToSign).digest("hex");

    const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        Host: host,
        "x-amz-date": amzDate,
        "x-amz-content-sha256": payloadHash,
        Authorization: authorizationHeader,
      },
      cache: "no-store",
    });

    const xmlText = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        {
          configured: true,
          health: "Error",
          error: `S3 Error [HTTP ${res.status}]: Kredensial B2 ditolak via S3 API`,
          buckets: [],
        },
        { status: 200 }
      );
    }

    // Parse XML bucket names
    const bucketNames = [...xmlText.matchAll(/<Name>(.*?)<\/Name>/g)].map((m) => m[1]);

    const formattedBuckets = bucketNames.map((name, i) => ({
      id: `b2-bucket-${i}`,
      name: name,
      type: "s3-compatible",
      s3Endpoint: host,
    }));

    return NextResponse.json({
      configured: true,
      health: "Operational",
      buckets: formattedBuckets,
    });
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        health: "Error",
        error: error.message || "Gagal menghubungkan ke B2",
        buckets: [],
      },
      { status: 500 }
    );
  }
}
