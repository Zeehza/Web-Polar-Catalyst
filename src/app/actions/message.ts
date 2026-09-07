"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markMessageAsRead(formData: FormData): Promise<void> {
  try {
    const messageId = formData.get("messageId") as string;
    if (!messageId) return;

    await prisma.contactSubmission.update({
      where: { id: messageId },
      data: { isRead: true },
    });

    revalidatePath("/admin/pesan");
    revalidatePath("/admin"); // Revalidate dashboard if it shows unread count
  } catch (error) {
    console.error("Error marking message as read:", error);
  }
}

export async function deleteMessage(formData: FormData): Promise<void> {
  try {
    const messageId = formData.get("messageId") as string;
    if (!messageId) return;

    await prisma.contactSubmission.delete({
      where: { id: messageId },
    });

    revalidatePath("/admin/pesan");
    revalidatePath("/admin");
  } catch (error) {
    console.error("Error deleting message:", error);
  }
}
