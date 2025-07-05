"use client";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { resetPassword } from "./reset-password.action";
import { useSearchParams } from "next/navigation";
import { resetPasswordSchema } from "@/schemas/password-reset";
import { signIn } from "next-auth/react";

const ForgotPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { execute, isPending } = useAction(resetPassword, {
    onSuccess: async (data) => {
      if (data.data?.success) {
        toast.success(data.data.success);
        setTimeout(async () => {
          await signIn("credentials", {
            email: data.data?.email ?? "",
            password: data?.data?.password ?? "",
            redirectTo: "/",
          });
        }, 4000);
      }
      if (data.data?.error) {
        toast.error(data.data.error);
      }
    },
    onError: () => {
      toast.error("Invalid credentials");
    },
  });
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    execute(values);
  }

  return (
    <div className="sm:w-[400px] w-[100%] bg-white dark:bg-black text-foreground rounded-lg justify-center flex flex-col gap-5 p-4">
      <div className="flex justify-center mb-4">
        <h1 className="text-2xl font-bold">Reset password</h1>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    {...field}
                    className="border border-black dark:border-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    className="border border-black dark:border-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className={`${!isPending ? "cursor-pointer" : "cursor-default"} `}
            disabled={isPending}
          >
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ForgotPasswordForm;
