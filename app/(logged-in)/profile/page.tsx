"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { uploadAvatar } from "./actions";
import { avatarInputSchema } from "@/schemas/profile";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

export default function ProfileAvatarUpload() {
  const {
    setValue,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof avatarInputSchema>>({
    resolver: zodResolver(avatarInputSchema),
    defaultValues: { avatar: undefined },
  });

  const { execute, result, status } = useAction(uploadAvatar);
  const session = useSession();
  const didUpdate = useRef(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = (data: z.infer<typeof avatarInputSchema>) => {
    execute(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("avatar", file, { shouldValidate: true });
    }
  };

  // Trigger session refresh after successful upload
  useEffect(() => {
    if (result.data?.success && !didUpdate.current) {
      didUpdate.current = true;
      router.refresh();
      reset({ avatar: undefined });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [result.data?.success, session, router, reset]);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto space-y-8">
        <Card className="shadow-lg rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-center">
              <Upload className="mr-2 h-6 w-6 text-indigo-600" />
              Upload Avatar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="avatar" className="text-gray-700 font-medium">
                  Select Image (JPEG, PNG, GIF; max 5MB)
                </Label>
                <input
                  id="avatar"
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
                {errors.avatar && (
                  <p className="text-red-500">{errors.avatar.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={status === "executing"}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
