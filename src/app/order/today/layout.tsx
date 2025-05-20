export default function PublicOrderLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="bg-gray-50">{children}</body>
    </html>
  );
} 