"use client";

import React, { useState } from "react";

type Role = "STUDENT" | "TEACHER" | "ADMIN" | "GUARDIAN";

type Event = {
  id: string;
  title: string;
  users: { id: string; forename: string; surname: string; role: Role }[];
};

type Props = {
  events: Event[];
  registerAttendance: (formData: FormData) => Promise<void>;
};

export default function RegisterForm({ events, registerAttendance }: Props) {
  const [selectedId, setSelectedId] = useState<string>(events[0]?.id || "");
  const selectedEvent = events.find((evt) => evt.id === selectedId)!;

  return (
    <form action={registerAttendance} className="space-y-4">
      <div>
        <label htmlFor="event" className="block font-medium">
          Select today&apos;s class:
        </label>
        <select
          name="eventId"
          id="event"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="mt-1 block w-full rounded p-2 border"
        >
          {events.map((evt) => (
            <option key={evt.id} value={evt.id}>
              {evt.title}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="font-medium">Mark attendance:</legend>
        {selectedEvent.users
          .filter((user) => user.role === "STUDENT") // Filter only students
          .map((user) => (
            <div key={user.id} className="flex items-center">
              <input
                type="checkbox"
                name="present"
                value={user.id}
                id={`user-${user.id}`}
                className="mr-2"
              />
              <label htmlFor={`user-${user.id}`}>
                {user.forename} {user.surname}
              </label>
            </div>
          ))}
      </fieldset>

      <button
        type="submit"
        className="mt-4 px-4 py-2 rounded bg-blue-600 text-white"
      >
        Submit Attendance
      </button>
    </form>
  );
}
