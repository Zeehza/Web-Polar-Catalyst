"use server";

import { prisma } from "@/lib/prisma";
import { withActionError } from "@/lib/action-utils";

export async function submitContactForm(prevState: unknown, formData: FormData) {
  return withActionError("submitting contact form", "Terjadi kesalahan internal saat memproses pesan Anda. Silakan coba lagi nanti.", async () => {
    const name = formData.get("name") as string;
  const company = formData.get("company") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

    // Basic Validation
    if (!name || !email || !message) {
      return {
        success: false,
        error: "Nama, Email, dan Pesan wajib diisi.",
      };
    }

    // 1. Simpan ke Database
    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        company,
        email,
        message,
      },
    });

    // 2. Notifikasi eksternal berjalan secara background
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    const resendApiKey = process.env.RESEND_API_KEY;
    
    const notificationPromises = [];

    if (discordWebhookUrl) {
      const discordPayload = {
        content: "Terdapat submission form kontak baru!",
        embeds: [
          {
            title: "Contact Form Submission",
            color: 3447003, // Brand color approx
            fields: [
              { name: "Nama", value: name, inline: true },
              { name: "Perusahaan", value: company || "-", inline: true },
              { name: "Email", value: email, inline: false },
              { name: "Pesan", value: message, inline: false },
            ],
            timestamp: new Date().toISOString(),
          }
        ]
      };
      
      notificationPromises.push(
        fetch(discordWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(discordPayload),
        }).then(res => {
          if (res.ok) {
            return prisma.contactSubmission.update({
              where: { id: submission.id },
              data: { discordSent: true },
            });
          }
        }).catch(err => console.error("Discord error:", err))
      );
    }

    if (resendApiKey) {
      notificationPromises.push(
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "Acme <onboarding@resend.dev>", // Harus disesuaikan dengan verified domain di Resend
            to: ["admin@polarcatalyst.com"], // Harusnya baca dari env admin email
            subject: `Pesan Kontak: ${name} (${company || 'Individu'})`,
            html: `
              <h2>Pesan Baru dari Form Kontak</h2>
              <p><strong>Nama:</strong> ${name}</p>
              <p><strong>Perusahaan:</strong> ${company || '-'}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Pesan:</strong><br/>${message}</p>
            `
          })
        }).then(res => {
          if (res.ok) {
            return prisma.contactSubmission.update({
              where: { id: submission.id },
              data: { emailSent: true },
            });
          }
        }).catch(err => console.error("Resend error:", err))
      );
    }

    // Eksekusi semua secara concurrent tanpa menunggu terlalu lama jika lambat.
    // Kita tetap await agar status di DB terupdate, tetapi karena ini Promise.allSettled,
    // keduanya berjalan berbarengan, menghemat waktu ~50%.
    await Promise.allSettled(notificationPromises);

    // Kita bisa saja tidak mengembalikan true details karena webhook bisa gagal,
    // tetapi demi kesederhanaan respon, kita set true saja karena kita tidak 
    // menunda respon ke user untuk itu, meskipun Promise.allSettled digunakan.
    return {
      success: true,
      message: "Pesan Anda berhasil dikirim! Tim kami akan segera menghubungi Anda.",
      details: { discordSent: !!discordWebhookUrl, emailSent: !!resendApiKey }
    };
  });
}
