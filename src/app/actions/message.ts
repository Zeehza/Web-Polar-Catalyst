"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { withAdminActionError } from "@/lib/action-utils";

export async function markMessageAsRead(formData: FormData) {
  await withAdminActionError("marking message as read", "Gagal menandai pesan dibaca.", async () => {
    const messageId = formData.get("messageId") as string;
    if (!messageId) return;

    await prisma.contactSubmission.update({
      where: { id: messageId },
      data: { isRead: true },
    });

    revalidatePath("/admin/pesan");
    revalidatePath("/admin"); // Revalidate dashboard if it shows unread count
  });
}

export async function deleteMessage(formData: FormData) {
  await withAdminActionError("deleting message", "Gagal menghapus pesan.", async () => {
    const messageId = formData.get("messageId") as string;
    if (!messageId) return;

    await prisma.contactSubmission.delete({
      where: { id: messageId },
    });

    revalidatePath("/admin/pesan");
    revalidatePath("/admin");
  });
}
