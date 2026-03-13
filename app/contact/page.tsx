"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    comment: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  // 👇 Tambahkan ": string" di sini
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 👇 Tambahkan tipe event HTML di sini
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (status.type === "error") setStatus({ type: "", message: "" });
  };

  // 👇 Tambahkan tipe event Form di sini
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.comment.trim()) {
      setStatus({ type: "error", message: "Nama dan pesan tidak boleh kosong." });
      return;
    }
    if (!isValidEmail(formData.email)) {
      setStatus({ type: "error", message: "Format email tidak valid." });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", message: "Pesan berhasil terkirim! Kami akan segera menghubungi Anda." });
        setFormData({ name: "", email: "", phone: "", comment: "" });
      } else {
        setStatus({ type: "error", message: data.message || "Gagal mengirim pesan." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Terjadi kesalahan jaringan." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black py-16 px-6 sm:px-12 lg:px-24 flex justify-center">
      <div className="w-full max-w-4xl mt-10">
        
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-10">
          CONTACT
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-[#f4f4f4] p-5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition-shadow"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full bg-[#f4f4f4] p-5 text-sm focus:outline-none focus:ring-2 transition-shadow ${
                status.type === "error" && status.message.includes("email") 
                ? "ring-2 ring-red-500 focus:ring-red-500/50" 
                : "focus:ring-black/10"
              }`}
            />
          </div>

          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full bg-[#f4f4f4] p-5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition-shadow"
          />

          <textarea
            name="comment"
            placeholder="Comment"
            rows={8}
            value={formData.comment}
            onChange={handleChange}
            className="w-full bg-[#f4f4f4] p-5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition-shadow resize-y"
          ></textarea>

          {status.message && (
            <p className={`text-sm font-medium ${status.type === "error" ? "text-red-600" : "text-green-600"}`}>
              {status.message}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-black hover:bg-zinc-800 text-white px-10 py-4 text-sm font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}