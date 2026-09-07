import React from "react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Mail, Building2, User, Check, Trash2 } from "lucide-react";
import { markMessageAsRead, deleteMessage } from "@/app/actions/message";

export const metadata = {
  title: "Pesan Masuk | Admin Dashboard",
};

export default async function AdminPesanPage() {
  const messages = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Inbox Pesan Masuk</h1>
          <p className="text-neutral-500 text-sm mt-1">Daftar penawaran dan pesan dari form kontak.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-500 font-semibold border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-6 py-4">Pengirim</th>
                <th className="px-6 py-4">Perusahaan</th>
                <th className="px-6 py-4 w-1/2">Pesan</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Belum ada pesan masuk.
                  </td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-neutral-400" />
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">{msg.name}</p>
                          <p className="text-xs text-brand-600 dark:text-brand-400">{msg.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                        <Building2 className="h-4 w-4 text-neutral-400" />
                        {msg.company || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-neutral-600 dark:text-neutral-300 line-clamp-2" title={msg.message}>
                        {msg.message}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-neutral-500">
                      {format(new Date(msg.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        msg.isRead 
                          ? "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" 
                          : "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                      }`}>
                        {msg.isRead ? "Read" : "New"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!msg.isRead && (
                          <form action={markMessageAsRead}>
                            <input type="hidden" name="messageId" value={msg.id} />
                            <button 
                              type="submit"
                              className="p-1.5 text-neutral-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-md transition-colors"
                              title="Tandai sudah dibaca"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          </form>
                        )}
                        <form action={deleteMessage}>
                          <input type="hidden" name="messageId" value={msg.id} />
                          <button 
                            type="submit"
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                            title="Hapus pesan"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
