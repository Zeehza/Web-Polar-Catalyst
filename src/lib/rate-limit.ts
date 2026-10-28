import { headers } from "next/headers";

interface RateLimitConfig {
  interval: number; // millisecond
  limit: number;    // max requests per interval
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers();
    const forwarded = headerList.get("x-forwarded-for");
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }
    const realIp = headerList.get("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }
  } catch {
    // Fallback if called outside request context
  }
  return "127.0.0.1";
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  // Periodically clean expired entries
  if (rateLimitStore.size > 5000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetAt < now) {
        rateLimitStore.delete(k);
      }
    }
  }

  if (!record || record.resetAt < now) {
    const resetAt = now + config.interval;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { success: true, remaining: config.limit - 1, resetAt };
  }

  if (record.count >= config.limit) {
    return { success: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return { success: true, remaining: config.limit - record.count, resetAt: record.resetAt };
}

