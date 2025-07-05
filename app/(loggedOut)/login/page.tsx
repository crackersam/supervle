"use client";
import React from "react";
import { loginSchema } from "@/schemas/login";
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
import { signIn } from "next-auth/react";
import Image from "next/image";
import school from "@/public/school.jpg";

const LoginPage = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    const res = await signIn("credentials", {
      redirect: false,
      email: data.email.toLowerCase(),
      password: data.password,
    });
    if (res?.error) {
      toast.error("Invalid credentials. Is your email verified?");
    } else {
      toast.success("Login successful");
      router.refresh();
    }
  };

  return (
    <section className="relative w-full h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={school}
          alt="Background"
          fill /* makes it position absolute + inset-0 */
          className="object-cover bg-black/90"
          priority /* optional: loads it eagerly */
        />
      </div>

      <div className="absolute inset-0 bg-black/50" />

      {/* Overlay or content goes here */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="sm:w-[400px] w-full mx-auto border p-4 rounded-md shadow-md bg-white">
            <div className="mb-4 flex flex-col items-center">
              <h1 className="text-2xl font-bold mb-4">Login</h1>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
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

                <Button type="submit">Submit</Button>
              </form>
            </Form>

            <p className="text-sm text-center mt-4 mb-4">
              Forgot your password? Please{" "}
              <Link
                href={"/forgot-password"}
                className="underline hover:bg-[#ff0] py-[2px] px-[1px] rounded-sm"
              >
                reset it
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
