export const metadata = {
  title: "Pantau — Monitoring Dashboard",
  description: "Dashboard monitoring GitHub, Vercel, Supabase, dan Cloudflare",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, background: "#0a0c14" }}>{children}</body>
    </html>
  );
}
