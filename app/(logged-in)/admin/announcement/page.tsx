// app/announcements/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Megaphone, CalendarIcon, Trash2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { createAnnouncement, deleteAnnouncement } from "./action";
import { getAnnouncements } from "./action";
import { announcementSchema } from "@/schemas/announcement";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type AnnouncementFormData = z.infer<typeof announcementSchema>;

interface Announcement {
  id: string;
  title: string;
  date: Date;
  description: string;
}

export default function AnnouncementsPage() {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDateDialog, setOpenDateDialog] = useState(false);
  const [openCalendarDialog, setOpenCalendarDialog] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
  });

  const { execute: executeCreate, status: createStatus } =
    useAction(createAnnouncement);
  const { execute: executeDelete } = useAction(deleteAnnouncement, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message);
        fetchAnnouncements(); // Re-fetch after delete
      }
    },
    onError: ({ error }) => {
      toast.error(`Error: ${error.serverError}`);
    },
  });

  const onSubmit = (data: AnnouncementFormData) => {
    executeCreate(data);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [date]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const fetchedAnnouncements = await getAnnouncements(
      weekStart.toISOString(),
      weekEnd.toISOString()
    );
    setAnnouncements(fetchedAnnouncements);
    setLoading(false);
  };

  React.useEffect(() => {
    if (createStatus === "hasSucceeded") {
      toast.success("Announcement created successfully");
      reset();
      fetchAnnouncements(); // Re-fetch after create
      setOpenCreateDialog(false);
    }
  }, [createStatus, reset]);

  return (
    <div className="py-6">
      <div className="max-w-2xl mx-auto space-y-8 mt-8">
        <div className="w-full flex flex-col justify-center items-center">
          <h2 className="text-2xl font-semibold text-left w-full mt-4 ml-2">
            Announcements
          </h2>
          <div className="flex flex-row w-full gap-4 mt-2 items-center justify-center">
            <Dialog
              open={openCalendarDialog}
              onOpenChange={setOpenCalendarDialog}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-fit justify-between text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  {date ? format(date, "dd/MM/yyyy") : "Select a date"}
                  <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-auto">
                <DialogHeader>
                  <DialogTitle>Select date</DialogTitle>
                  <DialogDescription>
                    Choose a date to view announcements for that week.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex justify-center mb-4">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(day) => {
                      if (day) {
                        setDate(day);
                      }
                    }}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </div>

                <DialogFooter className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setOpenCalendarDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setOpenCalendarDialog(false)}>
                    Done
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
              <DialogTrigger asChild>
                <Button className="w-fit">Create a new announcement</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center justify-center">
                    <Megaphone className="mr-2 h-6 w-6 text-indigo-600" />
                    Create Announcement
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6 p-4"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-gray-700 font-medium"
                    >
                      Title
                    </Label>
                    <Input
                      id="title"
                      {...register("title")}
                      placeholder="Enter announcement title"
                      className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-gray-700 font-medium">
                      Date
                    </Label>
                    <Controller
                      control={control}
                      name="date"
                      render={({ field }) => (
                        <Dialog
                          open={openDateDialog}
                          onOpenChange={setOpenDateDialog}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-between text-left font-normal rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? format(field.value, "dd/MM/yyyy")
                                : "Select date"}
                              <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-full !max-w-sm">
                            <DialogHeader>
                              <DialogTitle>Select date</DialogTitle>
                              <DialogDescription>
                                Choose a date for your announcement.
                              </DialogDescription>
                            </DialogHeader>

                            {/* Calendar */}
                            <div className="flex justify-center mb-4">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(day) => {
                                  if (day) {
                                    field.onChange(day);
                                  }
                                }}
                                disabled={(date) =>
                                  date <
                                  new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                              />
                            </div>

                            <DialogFooter className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => setOpenDateDialog(false)}
                              >
                                Cancel
                              </Button>
                              <Button onClick={() => setOpenDateDialog(false)}>
                                Done
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    />
                    {errors.date && (
                      <p className="text-red-500 text-sm">
                        {errors.date.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-gray-700 font-medium"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Enter announcement description"
                      className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px]"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                    disabled={createStatus === "executing"}
                  >
                    Submit Announcement
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : announcements.length === 0 ? (
          <p className="text-gray-600">No announcements this week.</p>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann, index) => (
              <Card
                key={ann.id}
                className={`bg-gray-50 rounded-lg w-full border-t-4 border-l border-r border-b ${index % 2 === 0 ? "border-blue-200" : "border-purple-200"} shadow-md hover:shadow-lg transition-shadow duration-300`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-lg">{ann.title}</h4>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-lg">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl">
                            Delete Announcement?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600">
                            This action cannot be undone. Are you sure you want
                            to delete &quot;{ann.title}&quot;?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => executeDelete({ id: ann.id })}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <p
                    className="text-sm text-gray-500 mb-2"
                    suppressHydrationWarning
                  >
                    {format(new Date(ann.date), "MMMM d, yyyy")}
                  </p>
                  <p className="text-gray-700">{ann.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
