"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log error jika diperlukan
    console.error(error);
  }, [error]);

  return (
    <div style={{ padding: 20, color: "#ff8a9b", background: "#1a0e14", borderRadius: 12, margin: 20 }}>
      <h3 style={{ margin: "0 0 10px 0" }}>Terjadi Crash pada Client:</h3>
      <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, wordBreak: "break-all", background: "#0a0c14", padding: 12, borderRadius: 8 }}>
        {error?.stack || error?.toString()}
      </pre>
      <button
        onClick={() => reset()}
        style={{
          marginTop: 12,
          padding: "8px 16px",
          background: "#5b8def",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Coba Lagi
      </button>
    </div>
  );
}