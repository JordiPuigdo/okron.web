import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      translate="no"
      className="max-h-screen h-full bg-white text-hg-black"
    >
      <body>{children}</body>
    </html>
  );
}
