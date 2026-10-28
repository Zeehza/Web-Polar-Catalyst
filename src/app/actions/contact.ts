"use server";

import { prisma } from "@/lib/prisma";
import { withActionError } from "@/lib/action-utils";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function submitContactForm(
  prevState: unknown,
  formData: FormData,
) {
  return withActionError(
    "submitting contact form",
    "Terjadi kesalahan internal saat memproses pesan Anda. Silakan coba lagi nanti.",
    async () => {
      // 1. Rate Limiting Check (Maksimal 5 pengiriman pesan per 10 menit per IP)
      const clientIp = await getClientIp();
      const rateLimitResult = checkRateLimit(`contact:${clientIp}`, {
        interval: 10 * 60 * 1000, // 10 menit
        limit: 5,
      });

      if (!rateLimitResult.success) {
        const minutesLeft = Math.ceil((rateLimitResult.resetAt - Date.now()) / 60000);
        return {
          success: false,
          error: `Terlalu banyak permintaan dari koneksi Anda. Silakan tunggu ${minutesLeft} menit sebelum mencoba lagi.`,
        };
      }

      const name = (formData.get("name") as string)?.trim();
      const company = (formData.get("company") as string)?.trim() || "";
      const email = (formData.get("email") as string)?.trim();
      const message = (formData.get("message") as string)?.trim();
      const website = (formData.get("website") as string)?.trim(); // Honeypot field

      // 2. Anti-spam Honeypot Check
      if (website) {
        console.warn("Spam bot detected via honeypot");
        return {
          success: true,
          message:
            "Pesan Anda berhasil dikirim! Tim kami akan segera menghubungi Anda.",
          details: { discordSent: false, emailSent: false },
        };
      }

      // 3. Input Validation & Bounds
      if (!name || !email || !message) {
        return {
          success: false,
          error: "Nama, Email, dan Pesan wajib diisi.",
        };
      }

      if (name.length < 2 || name.length > 100) {
        return {
          success: false,
          error: "Nama harus berisi antara 2 hingga 100 karakter.",
        };
      }

      if (company.length > 100) {
        return {
          success: false,
          error: "Nama perusahaan maksimal 100 karakter.",
        };
      }

      if (email.length > 150 || !isValidEmail(email)) {
        return {
          success: false,
          error: "Format alamat email tidak valid.",
        };
      }

      if (message.length < 5 || message.length > 3000) {
        return {
          success: false,
          error: "Pesan harus berisi antara 5 hingga 3000 karakter.",
        };
      }

      // 4. Simpan ke Database
      const submission = await prisma.contactSubmission.create({
        data: {
          name,
          company: company || null,
          email,
          message,
        },
      });

      // 5. Notifikasi eksternal berjalan secara background
      const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
      const resendApiKey = process.env.RESEND_API_KEY;

      const notificationPromises = [];

      if (discordWebhookUrl) {
        const discordPayload = {
          content: "Terdapat submission form kontak baru!",
          embeds: [
            {
              title: "Contact Form Submission",
              color: 16711680,
              fields: [
                { name: "Nama", value: name.slice(0, 100), inline: true },
                { name: "Perusahaan", value: company ? company.slice(0, 100) : "-", inline: true },
                { name: "Email", value: email.slice(0, 150), inline: false },
                { name: "Pesan", value: message.slice(0, 1000), inline: false },
              ],
              timestamp: new Date().toISOString(),
            },
          ],
        };

        notificationPromises.push(
          fetch(discordWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(discordPayload),
          })
            .then((res) => {
              if (res.ok) {
                return prisma.contactSubmission.update({
                  where: { id: submission.id },
                  data: { discordSent: true },
                });
              }
            })
            .catch((err) => console.error("Discord error:", err)),
        );
      }

      if (resendApiKey) {
        // Escaped HTML prevents Email HTML injection / Stored XSS
        const safeName = escapeHtml(name);
        const safeCompany = company ? escapeHtml(company) : "-";
        const safeEmail = escapeHtml(email);
        const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");

        notificationPromises.push(
          fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Acme <onboarding@resend.dev>",
              to: ["admin@polarcatalyst.com"],
              subject: `Pesan Kontak: ${safeName} (${safeCompany})`,
              html: `
              <h2>Pesan Baru dari Form Kontak</h2>
              <p><strong>Nama:</strong> ${safeName}</p>
              <p><strong>Perusahaan:</strong> ${safeCompany}</p>
              <p><strong>Email:</strong> ${safeEmail}</p>
              <p><strong>Pesan:</strong><br/>${safeMessage}</p>
            `,
            }),
          })
            .then((res) => {
              if (res.ok) {
                return prisma.contactSubmission.update({
                  where: { id: submission.id },
                  data: { emailSent: true },
                });
              }
            })
            .catch((err) => console.error("Resend error:", err)),
        );
      }

      await Promise.allSettled(notificationPromises);

      return {
        success: true,
        message:
          "Pesan Anda berhasil dikirim! Tim kami akan segera menghubungi Anda.",
        details: {
          discordSent: !!discordWebhookUrl,
          emailSent: !!resendApiKey,
        },
      };
    },
  );
}
