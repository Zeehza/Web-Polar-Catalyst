"use server";

import { prisma } from "@/lib/prisma";

export async function submitContactForm(prevState: unknown, formData: FormData) {
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

  try {
    // 1. Simpan ke Database
    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        company,
        email,
        message,
      },
    });

    // 2. Kirim Webhook Discord (jika ada)
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    let discordSent = false;
    
    if (discordWebhookUrl) {
      try {
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

        const res = await fetch(discordWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(discordPayload),
        });
        
        if (res.ok) {
          discordSent = true;
          // Update status di DB
          await prisma.contactSubmission.update({
            where: { id: submission.id },
            data: { discordSent: true },
          });
        }
      } catch (err) {
        console.error("Gagal mengirim webhook Discord:", err);
      }
    }

    // 3. Kirim Email via Resend (jika ada)
    const resendApiKey = process.env.RESEND_API_KEY;
    let emailSent = false;

    if (resendApiKey) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
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
        });

        if (res.ok) {
          emailSent = true;
          // Update status di DB
          await prisma.contactSubmission.update({
            where: { id: submission.id },
            data: { emailSent: true },
          });
        }
      } catch (err) {
        console.error("Gagal mengirim email via Resend:", err);
      }
    }

    return {
      success: true,
      message: "Pesan Anda berhasil dikirim! Tim kami akan segera menghubungi Anda.",
      details: { discordSent, emailSent }
    };

  } catch (error) {
    console.error("Error saving contact submission:", error);
    return {
      success: false,
      error: "Terjadi kesalahan internal saat memproses pesan Anda. Silakan coba lagi nanti."
    };
  }
}
