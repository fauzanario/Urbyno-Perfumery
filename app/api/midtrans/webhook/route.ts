import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/app/lib/prisma";
import { OrderStatus } from "@/app/generated/prisma";
import nodemailer from "nodemailer";

type MidtransNotification = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status?: string; 
  payment_type?: string;
  fraud_status?: string;       
  transaction_id?: string;
  status_message?: string;
  settlement_time?: string;
};

function sha512(input: string) {
  return crypto.createHash("sha512").update(input).digest("hex");
}

function mapToOrderStatus(n: MidtransNotification): OrderStatus | null {
  const ts = (n.transaction_status || "").toLowerCase();
  const fraud = (n.fraud_status || "").toLowerCase();

  if (ts === "settlement") return OrderStatus.PAID;
  if (ts === "capture") {
    if (fraud === "accept") return OrderStatus.PAID;
    return OrderStatus.UNPAID;
  }
  if (ts === "pending") return OrderStatus.UNPAID;
  if (ts === "expire") return OrderStatus.EXPIRED;
  if (ts === "cancel") return OrderStatus.CANCELED;
  if (ts === "deny" || ts === "failure") return OrderStatus.UNPAID;

  return null;
}

// ========================================================
// FUNGSI BARU: KIRIM EMAIL MENGGUNAKAN GOOGLE SMTP
// ========================================================
async function sendEmailInvoice(email: string, orderCode: string, name: string, total: string) {
  console.log(`Mencoba mengirim Email Invoice ke: ${email}`);

  const smtpEmail = process.env.SMTP_EMAIL;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  if (!smtpEmail || !smtpPassword) {
    console.error("GAGAL: SMTP_EMAIL atau SMTP_PASSWORD tidak ditemukan di .env!");
    return;
  }

  // Konfigurasi Transporter Nodemailer untuk Gmail
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpEmail,
      pass: smtpPassword,
    },
  });

  const invoiceLink = `${baseUrl}/invoice/${orderCode}`;

  // Desain HTML Email yang Elegan
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="margin: 0; font-family: serif; letter-spacing: 2px;">URBYNO</h1>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 12px; letter-spacing: 2px;">PERFUMERY</p>
      </div>
      
      <p style="font-size: 16px; color: #333;">Halo <strong>${name}</strong>,</p>
      <p style="color: #555; line-height: 1.6;">Terima kasih telah mempercayakan <em>signature scent</em> Anda kepada kami. Pembayaran Anda telah berhasil kami terima dan pesanan Anda sedang kami siapkan.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Nomor Pesanan:</strong> ${orderCode}</p>
        <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">DIBAYAR</span></p>
        <p style="margin: 5px 0;"><strong>Total Pembayaran:</strong> Rp ${total}</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${invoiceLink}" style="background-color: #000; color: #fff; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 5px; font-size: 14px; letter-spacing: 1px; display: inline-block;">LIHAT INVOICE DIGITAL</a>
      </div>

      <p style="color: #777; font-size: 13px; text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
        Email ini dikirimkan secara otomatis oleh sistem Urbyno. Harap tidak membalas email ini.<br/>
        &copy; ${new Date().getFullYear()} Urbyno Perfumery.
      </p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Urbyno Perfumery" <${smtpEmail}>`,
      to: email,
      subject: `Invoice Pembayaran Berhasil - Order ${orderCode}`,
      html: emailHtml,
    });
    console.log("Email berhasil terkirim! Message ID:", info.messageId);
  } catch (error) {
    console.error("Error saat mengirim email:", error);
  }
}

export async function POST(req: Request) {
  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      return NextResponse.json({ error: "SERVER_MISCONFIG", message: "MIDTRANS_SERVER_KEY belum di-set" }, { status: 500 });
    }

    const notif = (await req.json()) as Partial<MidtransNotification>;

    const orderId = String(notif.order_id || "").trim();
    const statusCode = String(notif.status_code || "").trim();
    const grossAmount = String(notif.gross_amount || "").trim();
    const signatureKey = String(notif.signature_key || "").trim().toLowerCase();

    if (!orderId || !statusCode || !grossAmount || !signatureKey) {
      return NextResponse.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
    }

    const expected = sha512(orderId + statusCode + grossAmount + serverKey).toLowerCase();

    if (expected !== signatureKey) {
      return NextResponse.json({ error: "INVALID_SIGNATURE", message: "signature_key tidak valid" }, { status: 401 });
    }

    const payment = await prisma.payment.findFirst({
      where: { midtransOrderId: orderId },
      select: { id: true, orderId: true, grossAmount: true },
    });

    if (!payment) {
      return NextResponse.json({ received: true, note: "payment_not_found" });
    }

    const newOrderStatus = mapToOrderStatus(notif as MidtransNotification);

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: payment.orderId },
        select: {
          id: true,
          orderCode: true,
          status: true,
          voucherId: true,
          customerName: true,
          customerPhone: true,
          customerEmail: true,
          discountAmount: true,
        },
      });

      if (!order) return;

      const wasPaid = order.status === OrderStatus.PAID;
      const willBePaid = newOrderStatus === OrderStatus.PAID;

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          transactionStatus: (notif.transaction_status || null) as any,
          paymentType: notif.payment_type || null,
          fraudStatus: notif.fraud_status || null,
          rawNotification: notif as any,
        },
      });

      if (newOrderStatus) {
        if (wasPaid && newOrderStatus !== OrderStatus.PAID) {
          // do nothing
        } else {
          await tx.order.update({
            where: { id: order.id },
            data: { status: newOrderStatus },
          });
        }
      }

      if (!wasPaid && willBePaid) {
        const items = await tx.orderItem.findMany({
          where: { orderId: order.id },
          select: { variantId: true, qty: true },
        });

        for (const it of items) {
          if (it.variantId) {
            await tx.productVariant.update({
              where: { id: it.variantId },
              data: { stock: { decrement: it.qty } },
            });
          }
        }

        if (order.voucherId) {
          await tx.voucherRedemption.create({
            data: {
              voucherId: order.voucherId,
              orderId: order.id,
              customerPhone: order.customerPhone,
              customerEmail: order.customerEmail,
              discountAmount: order.discountAmount,
            },
          });

          await tx.voucher.update({
            where: { id: order.voucherId },
            data: { usedCount: { increment: 1 } },
          });
        }

        // ====================================================
        // EKSEKUSI PENGIRIMAN EMAIL
        // ====================================================
        const formattedTotal = new Intl.NumberFormat("id-ID").format(Number(payment.grossAmount));
        
        // Cek apakah user memasukkan email saat checkout
        if (order.customerEmail) {
          // Tidak memakai 'await' agar Webhook segera mengembalikan respon 200 OK ke Midtrans
          sendEmailInvoice(
            order.customerEmail, 
            order.orderCode, 
            order.customerName, 
            formattedTotal
          ).catch(console.error);
        } else {
          console.log("Email tidak dikirim karena user tidak mengisi email saat checkout.");
        }
      }
    });

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ received: true, note: "internal_error" });
  }
}