import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import nodemailer from "nodemailer";
import { OrderStatus } from "@/app/generated/prisma"; 

// Helper Penentu URL Lacak Resi
function getTrackingUrl(courier: string, trackingNumber: string) {
  const c = courier.toLowerCase();
  
  // Ekspedisi yang support 1-Klik dari URL
  if (c.includes("jnt") || c.includes("j&t")) {
    return `https://jet.co.id/track?awb=${trackingNumber}`;
  } else if (c.includes("sicepat")) {
    return `https://www.sicepat.com/checkAwb/${trackingNumber}`;
  } else if (c.includes("ninja")) {
    return `https://www.ninjaxpress.co/id-id/tracking?tracking_id=${trackingNumber}`;
  } 
  
  // Ekspedisi yang harus copy-paste manual (Diarahkan ke web resmi)
  else if (c.includes("jne")) {
    return `https://www.jne.co.id/tracking-package`;
  } else if (c.includes("pos")) {
    return `https://www.posindonesia.co.id/id/tracking`;
  } else if (c.includes("tiki")) {
    return `https://tiki.id/id/track`;
  } else if (c.includes("sap")) {
    return `https://www.sapx.id/id/cek-awb/`;
  } else if (c.includes("idexpress") || c.includes("ide")) {
    return `https://idexpress.com/lacak-paket`;
  } 
  
  // Fallback jika kurir tidak dikenali: Arahkan ke pencarian Google
  else {
    return `https://www.google.com/search?q=cek+resi+${courier}+${trackingNumber}`;
  }
}

// Email Notifikasi Pengiriman
async function sendShippingEmail(email: string, name: string, orderCode: string, courier: string, trackingNumber: string) {
  const smtpEmail = process.env.SMTP_EMAIL;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (!smtpEmail || !smtpPassword) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: smtpEmail, pass: smtpPassword },
  });

  const trackLink = getTrackingUrl(courier, trackingNumber);

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="margin: 0; font-family: serif; letter-spacing: 2px;">URBYNO</h1>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 12px; letter-spacing: 2px;">PERFUMERY</p>
      </div>
      
      <p style="font-size: 16px; color: #333;">Halo <strong>${name}</strong>,</p>
      <p style="color: #555; line-height: 1.6;">Pesanan parfum Anda saat ini <strong>sudah diserahkan ke pihak kurir</strong> dan sedang dalam perjalanan menuju alamat Anda. 🚚</p>
      
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Nomor Pesanan:</strong> ${orderCode}</p>
        <p style="margin: 5px 0;"><strong>Kurir Pengiriman:</strong> <span style="text-transform: uppercase;">${courier}</span></p>
        <p style="margin: 5px 0;"><strong>Nomor Resi (AWB):</strong> <span style="font-size: 18px; font-weight: bold; color: #16a34a; letter-spacing: 1px;">${trackingNumber}</span></p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${trackLink}" target="_blank" rel="noopener noreferrer" style="background-color: #000; color: #fff; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 5px; font-size: 14px; letter-spacing: 1px; display: inline-block;">LACAK PESANAN SAYA</a>
      </div>

      <p style="color: #777; font-size: 13px; text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
        Jika Anda memiliki pertanyaan mengenai pesanan ini, silakan hubungi tim kami.<br/>
        &copy; ${new Date().getFullYear()} Urbyno Perfumery.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Urbyno Perfumery" <${smtpEmail}>`,
      to: email,
      subject: `Pesanan Anda Sedang Dikirim! 🚚 - Resi: ${trackingNumber}`,
      html: emailHtml,
    });
    console.log(`Email resi berhasil dikirim ke ${email}`);
  } catch (error) {
    console.error("Gagal mengirim email resi:", error);
  }
}


// API Input Resi
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, trackingNumber, notes } = body;

    if (!orderId || !trackingNumber) {
      return NextResponse.json({ error: "INVALID_REQUEST", message: "orderId dan trackingNumber wajib diisi" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderCode: true,
        status: true,
        courierCode: true,
        customerName: true,
        customerEmail: true,
      }
    });

    if (!order) {
      return NextResponse.json({ error: "NOT_FOUND", message: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    if (order.status !== OrderStatus.PAID) {
      return NextResponse.json({ error: "INVALID_STATUS", message: "Hanya pesanan berstatus PAID yang bisa dikirim" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.shipment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          courierCode: order.courierCode,
          trackingNumber: trackingNumber.trim(),
          shippedAt: new Date(),
          notes: notes?.trim() || null,
        },
        update: {
          trackingNumber: trackingNumber.trim(),
          shippedAt: new Date(),
          notes: notes?.trim() || null,
        }
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: "SHIPPED" as OrderStatus }
      });
    });

    if (order.customerEmail) {
      try {
        await sendShippingEmail(
          order.customerEmail,
          order.customerName,
          order.orderCode,
          order.courierCode,
          trackingNumber.trim()
        );
      } catch (emailError) {
        console.error("Email gagal, tapi resi tetap tersimpan:", emailError);
      }
    }

    return NextResponse.json({ success: true, message: "Nomor resi berhasil disimpan dan notifikasi email sedang dikirim!" });

  } catch (error: any) {
    console.error("Input Resi Error:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: error.message || "Terjadi kesalahan pada server" }, { status: 500 });
  }
}