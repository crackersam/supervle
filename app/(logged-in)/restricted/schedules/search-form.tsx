"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="max-w-lg mx-auto shadow-lg rounded-2xl border border-gray-200 mb-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-center">
          <Search className="mr-2 h-5 w-5 text-indigo-600" />
          Search Users
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
        >
          <div className="space-y-2">
            <Label htmlFor="forename" className="text-gray-700 font-medium">
              Forename
            </Label>
            <Input
              id="forename"
              name="forename"
              placeholder="Search forename"
              defaultValue={forename}
              className="rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="surname" className="text-gray-700 font-medium">
              Surname
            </Label>
            <Input
              id="surname"
              name="surname"
              placeholder="Search surname"
              defaultValue={surname}
              className="rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
          >
            <Search className="mr-2 h-4 w-4" />
            {isPending ? "Searching…" : "Search"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
