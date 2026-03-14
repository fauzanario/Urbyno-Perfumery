"use client";
import { useState } from "react";
import { createBrowserClient } from '@supabase/ssr';
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // 👇 INI KUNCINYA! Supabase akan otomatis ngarahin link email ke sini 👇
        redirectTo: `${window.location.origin}/admin/passwordreset`,
      });
      if (error) throw error;
      setIsSent(true);
    } catch (error: any) {
      alert("Gagal mengirim email: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="bg-white border border-zinc-200 p-8 rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4 border border-amber-100">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Lupa Password?</h1>
          <p className="text-xs text-zinc-500 mt-2 text-center">
            Masukkan email admin Anda. Kami akan mengirimkan link untuk mereset password.
          </p>
        </div>

        {isSent ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm border border-green-200">
              Link reset password telah dikirim ke <b>{email}</b>. Silakan periksa kotak masuk atau folder spam Anda.
            </div>
            <Link href="/admin/login" className="text-xs font-bold text-amber-600 hover:text-amber-700 uppercase tracking-widest block mt-6">
              Kembali ke Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Email Admin</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-zinc-400"
                  placeholder="admin@urbyno.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black hover:bg-zinc-800 text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kirim Link Reset"}
            </button>
            
            <Link href="/admin/login" className="flex items-center justify-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors uppercase tracking-widest mt-4">
              <ArrowLeft className="w-3 h-3" /> Kembali ke Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}