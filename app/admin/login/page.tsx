"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { createBrowserClient } from '@supabase/ssr';
import { Eye, EyeOff, Sparkles, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter(); // Inisialisasi router
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // State untuk pesan kesalahan
  const [isLoading, setIsLoading] = useState(false);

  const handleCopyPassword = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const fakeHash = "$2b$12$LQv3c1VycW.8.X6.cE.uVjK0r8u7g6f5e4d3c2b1a"; 
    navigator.clipboard.writeText(fakeHash);
  };

  // Fungsi Verifikasi Kredensial
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Reset error setiap mencoba login

    // Simulasi verifikasi (Nanti ini bisa disambungkan ke Supabase/API)
    // Di sini kita cek jika email & password adalah "admin"
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid credentials. Please check your email and password.");
      setIsLoading(false);
    } else {
      // Jika berhasil, Supabase otomatis menyimpan session di browser
      router.push("/admin/dashboard");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* GLOW EFFECT */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-zinc-900/80 border border-white/10 backdrop-blur-2xl rounded-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
              <Sparkles className="w-6 h-6 text-amber-500 group-hover:rotate-12 transition-transform" />
              <span className="text-2xl font-serif tracking-widest uppercase text-white">URBYNO</span>
            </Link>
            <h1 className="text-xl font-bold text-white tracking-tight">Admin Portal</h1>
            <p className="text-zinc-400 text-sm mt-2 font-light">Please sign in to continue.</p>
          </div>

          {/* MENAMPILKAN PESAN ERROR */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* TAMBAHKAN onSubmit DI FORM */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/80 ml-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full bg-black/50 border border-zinc-800 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-zinc-700"
                placeholder="Enter your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/80 ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  onCopy={handleCopyPassword}
                  onPaste={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                  required
                  className="w-full bg-black/50 border border-zinc-800 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-zinc-700"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-linear-to-r from-amber-600 to-amber-700 text-white font-bold py-4 rounded-xl mt-4 hover:from-amber-500 hover:to-amber-600 transition-all shadow-lg shadow-amber-900/20 active:scale-95 uppercase tracking-[0.2em] text-[11px] disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Enter Dashboard"}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-zinc-600 text-[9px] font-bold uppercase tracking-[0.3em]">
          &copy; 2024 Urbyno Perfumery
        </p>
      </div>
    </div>
  );
}