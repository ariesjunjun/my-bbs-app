export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-slate-50 text-slate-900">
        {/* ナビバーなど共通UI */}
        <main className="min-h-screen container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
