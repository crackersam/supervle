"use client";
import React from "react";
import { useAction } from "next-safe-action/hooks";
import { registerSchema } from "@/schemas/register";
import { registerUser } from "./register-action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
import Link from "next/link";
import Image from "next/image";
import school from "@/public/school.jpg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const RegisterPage = () => {
  const router = useRouter();
  const { execute, isPending } = useAction(registerUser, {
    onSuccess: (data) => {
      if (data.data?.success) {
        toast.success(data.data.success);
        router.push("/");
      }
      if (data.data?.error) {
        toast.error(data.data.error);
      }
    },
  });
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      forename: "",
      surname: "",
      role: "STUDENT",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    await execute(data);
  };

  return (
    <section className="relative w-full h-screen">
      {/* Background Image */}
      <Image
        src={school}
        alt="Background"
        fill /* makes it position absolute + inset-0 */
        className="object-cover bg-black/90"
        priority /* optional: loads it eagerly */
      />

      <div className="absolute inset-0 bg-black/50" />

      {/* Overlay or content goes here */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="sm:w-[400px] w-full mx-auto border p-4 rounded-md shadow-md bg-white">
            <div className="mb-4 flex flex-col items-center">
              <h1 className="text-2xl font-bold mb-4">Register</h1>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="forename"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forename</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Surname</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="STUDENT">student</SelectItem>
                          <SelectItem value="GUARDIAN">guardian</SelectItem>
                          <SelectItem value="TEACHER">teacher</SelectItem>
                          <SelectItem value="ADMIN">admin</SelectItem>
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
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
                        <Input type="password" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isPending}>
                  Submit
                </Button>
              </form>
            </Form>
            <p className="text-sm text-center my-4">
              Already have an account? Please{" "}
              <Link
                href={"/login"}
                className="underline hover:bg-[#ff0] py-[2px] px-[1px] rounded-sm"
              >
                login
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegisterPage;
