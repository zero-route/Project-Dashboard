"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body style={{ margin: 0, background: "#0a0c14", color: "#e7e9f3", fontFamily: "monospace", padding: 24 }}>
        <h2 style={{ color: "#ff8a9b" }}>Terjadi error</h2>
        <p style={{ fontSize: 13, whiteSpace: "pre-wrap", background: "#12162a", padding: 12, borderRadius: 8 }}>
          {error?.message || "Tidak ada pesan error"}
        </p>
        {error?.digest && (
          <p style={{ fontSize: 11, color: "#7d8199" }}>Digest: {error.digest}</p>
        )}
        <pre style={{ fontSize: 10, color: "#7d8199", whiteSpace: "pre-wrap", maxHeight: 300, overflow: "auto" }}>
          {error?.stack}
        </pre>
        <button
          onClick={() => reset()}
          style={{ marginTop: 16, background: "#1a1e33", color: "#fff", border: "1px solid #2a2f4a", padding: "8px 14px", borderRadius: 8 }}
        >
          Coba lagi
        </button>
      </body>
    </html>
  );
}