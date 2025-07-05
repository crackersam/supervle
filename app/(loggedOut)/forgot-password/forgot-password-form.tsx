"use client";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { forgotPasswordSchema } from "@/schemas/forgot-password";
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
import { forgotPassword } from "./forgot-password.action";
import { useSearchParams } from "next/navigation";

const ForgotPasswordForm = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const { execute, isPending } = useAction(forgotPassword, {
    onSuccess: (data) => {
      if (data.data?.success) {
        toast.success(data.data.success);
      }
      if (data.data?.error) {
        toast.error(data.data.error);
      }
    },
    onError: () => {
      toast.error("Invalid credentials");
    },
  });
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: email || "",
    },
  });

  function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
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
