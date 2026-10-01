"use client";

import { useTransition } from "react";

export default function GroupSelect({
  teamId,
  defaultGroup,
  action,
}: {
  teamId: string;
  defaultGroup: string;
  action: (formData: FormData) => Promise<unknown>;
}) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const formData = new FormData();
    formData.set("teamId", teamId);
    formData.set("group", e.target.value);

    startTransition(() => {
      action(formData);
    });
  };

  return (
    <select
      name="group"
      defaultValue={defaultGroup}
      disabled={isPending}
      className={`text-xs px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md outline-none transition-opacity ${isPending ? "opacity-50" : ""}`}
      onChange={handleChange}
    >
      <option value="">No Group</option>
      <option value="A">Grup A</option>
      <option value="B">Grup B</option>
      <option value="C">Grup C</option>
      <option value="D">Grup D</option>
    </select>
  );
}
