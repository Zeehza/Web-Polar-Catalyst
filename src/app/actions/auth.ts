"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    // Rate Limiting: Maksimal 5 percobaan login per 5 menit per IP
    const clientIp = await getClientIp();
    const rateLimit = checkRateLimit(`login:${clientIp}`, {
      interval: 5 * 60 * 1000, // 5 menit
      limit: 5,
    });

    if (!rateLimit.success) {
      const minutesLeft = Math.ceil((rateLimit.resetAt - Date.now()) / 60000);
      return `Terlalu banyak percobaan login gagal. Demi keamanan, silakan tunggu ${minutesLeft} menit sebelum mencoba lagi.`;
    }

    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Username atau password salah.";
        default:
          return "Terjadi kesalahan saat autentikasi. Silakan coba lagi.";
      }
    }
    throw error;
  }
}
