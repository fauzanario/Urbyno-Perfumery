import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// 👇 Tambahkan ": Request" di sini
export async function POST(req: Request) {
  try {
    const { name, email, phone, comment } = await req.json();

    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (!smtpEmail || !smtpPassword) {
      return NextResponse.json({ message: "Konfigurasi SMTP belum diatur" }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: smtpEmail, pass: smtpPassword },
    });

    const mailOptions = {
      from: `"Urbyno Web Form" <${smtpEmail}>`,
      to: smtpEmail.replace("@", "support@"),
      replyTo: email,
      subject: `Pesan Baru dari: ${name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Pesan Baru dari Form Kontak Website</h2>
          <p><strong>Nama:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Telepon:</strong> ${phone}</p>
          <hr />
          <p><strong>Pesan:</strong></p>
          <p style="white-space: pre-wrap;">${comment}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, message: "Pesan berhasil dikirim!" });

  } catch (error) {
    console.error("Gagal mengirim pesan kontak:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}