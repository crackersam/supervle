"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

// 1. Dynamically import both calendars with SSR turned off:
const BigCalendar = dynamic(() => import("@/components/big-calendar"), {
  ssr: false,
});
const ReactCalendar = dynamic(() => import("react-calendar"), { ssr: false });

export default function HomePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);

  // 2. Only render anything after we've mounted on the client:
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <main>
        <BigCalendar date={date} />
      </main>
      <ReactCalendar
        onChange={(value) => setDate(value as Date)}
        value={date}
      />
      <p>Selected date: {date.toDateString()}</p>
    </>
  );
}
