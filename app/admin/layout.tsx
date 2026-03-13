export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // Kita paksa background hitam pekat di sini agar "kaca" login-nya terlihat
    <div className="min-h-screen bg-black text-black antialiased">
      {children}
    </div>
  );
}