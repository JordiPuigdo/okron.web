import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" translate="no">
      <body className="min-h-screen bg-gray-100">{children}</body>
    </html>
  );
}
