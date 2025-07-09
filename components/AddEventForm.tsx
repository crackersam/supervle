"use client";

// import { createEvent } from "@/app/(logged-in)/admin/schedule/actions";
import { useForm } from "react-hook-form";
import { scheduleLessonSchema } from "@/schemas/schedule-lesson";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { cn } from "@/lib/utils";
import { CalendarIcon, Check, ChevronDownIcon } from "lucide-react";

import { useState, Fragment } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { createEvent } from "@/app/(logged-in)/admin/lessons/actions";
// Generate time slots every 30 minutes
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hh = String(Math.floor(i / 2)).padStart(2, "0");
  const mm = i % 2 ? "30" : "00";
  return `${hh}:${mm}`;
});

export default function AddEventForm() {
  const [openDialog, setOpenDialog] = useState(false);
  const [timeValue, setTimeValue] = useState(TIME_SLOTS[0]);
  const [timeValueEnd, setTimeValueEnd] = useState(TIME_SLOTS[0]);
  const [openDialogEnd, setOpenDialogEnd] = useState(false);
  const [openDialogUntil, setOpenDialogUntil] = useState(false);

  const form = useForm<z.infer<typeof scheduleLessonSchema>>({
    resolver: zodResolver(scheduleLessonSchema),
    defaultValues: {
      title: "",
      start: new Date(), // Default to now
      end: new Date(new Date().getTime() + 60 * 60 * 1000), // Default to one hour later
      freq: "NONE",
      until: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // Default to one month later
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof scheduleLessonSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    await createEvent(values);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lesson title</FormLabel>
              <FormControl>
                <Input placeholder="Maths" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="start"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of lecture</FormLabel>
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-64 sm:w-80 flex justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? format(new Date(field.value), "dd/MM/yyyy HH:mm")
                      : "Pick a date"}
                    <CalendarIcon className="ml-2 w-4 h-4 opacity-50" />
                  </Button>
                </DialogTrigger>

                <DialogContent className="w-auto">
                  <DialogHeader>
                    <DialogTitle>Select date & time</DialogTitle>
                    <DialogDescription>
                      Choose a day and set a time for your lecture.
                    </DialogDescription>
                  </DialogHeader>

                  {/* Time selector via Listbox */}
                  <div className="flex items-center justify-center gap-2 w-64 sm:w-80">
                    <span>Time:</span>
                    <Listbox
                      value={timeValue}
                      onChange={(newTime) => {
                        setTimeValue(newTime);
                        if (field.value) {
                          const [h, m] = newTime.split(":").map(Number);
                          const dt = new Date(field.value);
                          dt.setHours(h, m, 0, 0);
                          field.onChange(dt);
                        }
                      }}
                    >
                      <div className="relative">
                        <ListboxButton className="border px-2 py-1 rounded w-32 flex justify-between items-center">
                          {timeValue} <ChevronDownIcon className="w-4 h-4" />
                        </ListboxButton>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <ListboxOptions className="absolute mt-1 w-32 bg-white shadow-lg rounded max-h-60 overflow-auto z-10">
                            {TIME_SLOTS.map((slot) => (
                              <ListboxOption
                                key={slot}
                                value={slot}
                                className={({ active }) =>
                                  `px-2 py-1 cursor-pointer ${
                                    active ? "bg-gray-100" : ""
                                  }`
                                }
                              >
                                {({ selected }) => (
                                  <div className="flex justify-between">
                                    <span>{slot}</span>
                                    {selected && <Check className="w-4 h-4" />}
                                  </div>
                                )}
                              </ListboxOption>
                            ))}
                          </ListboxOptions>
                        </Transition>
                      </div>
                    </Listbox>
                  </div>

                  {/* Calendar */}
                  <div className="flex justify-center mb-4">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(day) => {
                        if (!day) return;
                        const [h, m] = timeValue.split(":").map(Number);
                        const dt = new Date(day);
                        dt.setHours(h, m, 0, 0);
                        field.onChange(dt);
                      }}
                      disabled={(date) =>
                        date.getTime() < new Date().setHours(0, 0, 0, 0)
                      }
                      initialFocus={true}
                    />
                  </div>

                  <DialogFooter className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setOpenDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => setOpenDialog(false)}>Done</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="end"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of lecture</FormLabel>
              <Dialog open={openDialogEnd} onOpenChange={setOpenDialogEnd}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-64 sm:w-80 flex justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? format(new Date(field.value), "dd/MM/yyyy HH:mm")
                      : "Pick a date"}
                    <CalendarIcon className="ml-2 w-4 h-4 opacity-50" />
                  </Button>
                </DialogTrigger>

                <DialogContent className="w-auto">
                  <DialogHeader>
                    <DialogTitle>Select date & time</DialogTitle>
                    <DialogDescription>
                      Choose a day and set a time for your lecture.
                    </DialogDescription>
                  </DialogHeader>

                  {/* Time selector via Listbox */}
                  <div className="flex items-center justify-center gap-2 w-64 sm:w-80">
                    <span>Time:</span>
                    <Listbox
                      value={timeValueEnd}
                      onChange={(newTime) => {
                        setTimeValueEnd(newTime);
                        if (field.value) {
                          const [h, m] = newTime.split(":").map(Number);
                          const dt = new Date(field.value);
                          dt.setHours(h, m, 0, 0);
                          field.onChange(dt);
                        }
                      }}
                    >
                      <div className="relative">
                        <ListboxButton className="border px-2 py-1 rounded w-32 flex justify-between items-center">
                          {timeValueEnd} <ChevronDownIcon className="w-4 h-4" />
                        </ListboxButton>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <ListboxOptions className="absolute mt-1 w-32 bg-white shadow-lg rounded max-h-60 overflow-auto z-10">
                            {TIME_SLOTS.map((slot) => (
                              <ListboxOption
                                key={slot}
                                value={slot}
                                className={({ active }) =>
                                  `px-2 py-1 cursor-pointer ${
                                    active ? "bg-gray-100" : ""
                                  }`
                                }
                              >
                                {({ selected }) => (
                                  <div className="flex justify-between">
                                    <span>{slot}</span>
                                    {selected && <Check className="w-4 h-4" />}
                                  </div>
                                )}
                              </ListboxOption>
                            ))}
                          </ListboxOptions>
                        </Transition>
                      </div>
                    </Listbox>
                  </div>

                  {/* Calendar */}
                  <div className="flex justify-center mb-4">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(day) => {
                        if (!day) return;
                        const [h, m] = timeValue.split(":").map(Number);
                        const dt = new Date(day);
                        dt.setHours(h, m, 0, 0);
                        field.onChange(dt);
                      }}
                      disabled={(date) =>
                        date.getTime() < new Date().setHours(0, 0, 0, 0)
                      }
                      initialFocus={true}
                    />
                  </div>

                  <DialogFooter className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setOpenDialogEnd(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => setOpenDialogEnd(false)}>
                      Done
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="freq"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lesson title</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="until"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date to end class</FormLabel>
              <Dialog open={openDialogUntil} onOpenChange={setOpenDialogUntil}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-64 sm:w-80 flex justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? format(new Date(field.value), "dd/MM/yyyy")
                      : "Pick a date"}
                    <CalendarIcon className="ml-2 w-4 h-4 opacity-50" />
                  </Button>
                </DialogTrigger>

                <DialogContent className="w-auto">
                  <DialogHeader>
                    <DialogTitle>Select date</DialogTitle>
                    <DialogDescription>
                      Choose a date and for your class to end recurrence.
                    </DialogDescription>
                  </DialogHeader>

                  {/* Calendar */}
                  <div className="flex justify-center mb-4">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(day) => {
                        if (!day) return;

                        const dt = new Date(day);

                        field.onChange(dt);
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus={true}
                    />
                  </div>

                  <DialogFooter className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setOpenDialogUntil(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => setOpenDialogUntil(false)}>
                      Done
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
    // <form
    //   onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
    //     e.preventDefault();
    //     const formData = new FormData(e.currentTarget);
    //     await createEvent(formData);
    //   }}
    //   style={{
    //     marginBottom: "1rem",
    //     display: "grid",
    //     gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
    //     gap: "0.5rem",
    //   }}
    // >
    //   <input name="title" placeholder="Title" required />
    //   <input name="start" type="datetime-local" required />
    //   <input name="end" type="datetime-local" required />

    //   {/* Recurrence */}
    //   <select name="freq" defaultValue="">
    //     <option value="">None</option>
    //     <option value="DAILY">Daily</option>
    //     <option value="WEEKLY">Weekly</option>
    //     <option value="MONTHLY">Monthly</option>
    //   </select>
    //   <input
    //     name="interval"
    //     type="number"
    //     min="1"
    //     defaultValue={1}
    //     title="Interval"
    //   />
    //   <input name="until" type="date" title="Ends on" />
    //   <input type="hidden" name="userId" value={userId} />

    //   <button type="submit">Add Event</button>
    // </form>
  );
}
