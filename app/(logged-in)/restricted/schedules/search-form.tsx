"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export default function SearchForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const forename = params.get("forename") ?? "";
  const surname = params.get("surname") ?? "";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const fn = (form.get("forename") as string).trim();
    const sn = (form.get("surname") as string).trim();

    const qs = new URLSearchParams();
    if (fn) qs.set("forename", fn);
    if (sn) qs.set("surname", sn);

    startTransition(() => {
      // update the URL, trigger a server‐render of your page,
      // but *without* a full browser refresh
      router.replace(`/restricted/schedules?${qs.toString()}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2 mb-6">
      <input
        name="forename"
        placeholder="Search forename"
        defaultValue={forename}
        className="flex-1 border px-3 py-2 rounded"
      />
      <input
        name="surname"
        placeholder="Search surname"
        defaultValue={surname}
        className="flex-1 border px-3 py-2 rounded"
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
