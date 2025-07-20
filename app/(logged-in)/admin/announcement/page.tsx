// app/announcements/page.tsx
"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Megaphone, CalendarIcon } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { createAnnouncement } from "./action";
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

type AnnouncementFormData = z.infer<typeof announcementSchema>;

export default function AnnouncementsPage() {
  const [openDialog, setOpenDialog] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
  });

  const { execute, result, status } = useAction(createAnnouncement);

  const onSubmit = (data: AnnouncementFormData) => {
    execute(data);
  };

  React.useEffect(() => {
    if (result.data?.success) {
      toast.success(result.data.message);
      reset();
    } else if (result.serverError) {
      toast.error(`Error: ${result.serverError}`);
    } else if (result.validationErrors) {
      toast.error("Validation error");
    }
  }, [result, reset]);

  return (
    <div className="py-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="shadow-lg rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-center">
              <Megaphone className="mr-2 h-6 w-6 text-indigo-600" />
              Create Announcement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-700 font-medium">
                  Title
                </Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="Enter announcement title"
                  className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title.message}</p>
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
                    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
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
                            : "Pick a date"}
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
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </div>

                        <DialogFooter className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setOpenDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={() => setOpenDialog(false)}>
                            Done
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm">{errors.date.message}</p>
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
                disabled={status === "executing"}
              >
                Submit Announcement
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
