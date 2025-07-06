"use client";

import { createEvent } from "@/app/(logged-in)/admin/actions";

export default function AddEventForm() {
  return (
    <form
      onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await createEvent(formData);
      }}
      style={{
        marginBottom: "1rem",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
        gap: "0.5rem",
      }}
    >
      <input name="title" placeholder="Title" required />
      <input name="start" type="datetime-local" required />
      <input name="end" type="datetime-local" required />

      {/* Recurrence */}
      <select name="freq" defaultValue="">
        <option value="">None</option>
        <option value="DAILY">Daily</option>
        <option value="WEEKLY">Weekly</option>
        <option value="MONTHLY">Monthly</option>
      </select>
      <input
        name="interval"
        type="number"
        min="1"
        defaultValue={1}
        title="Interval"
      />
      <input name="until" type="date" title="Ends on" />

      <button type="submit">Add Event</button>
    </form>
  );
}
