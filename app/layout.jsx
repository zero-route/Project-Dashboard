import "./globals.css";

export const metadata = {
  title: "Pantau — Monitoring Dashboard",
  description: "Dashboard monitoring GitHub, Vercel, Supabase, dan Cloudflare",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}