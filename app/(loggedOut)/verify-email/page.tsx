import { prisma } from "@/prisma-singleton";
import React from "react";
import Image from "next/image";
import school from "@/public/school.jpg";

const VerifyEmail = async ({
  searchParams,
}: {
  searchParams: Promise<{ token: string }>;
}) => {
  let success;
  let error;

  const { token } = await searchParams;
  try {
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
      },
    });
    if (!verificationToken || verificationToken.expires < new Date()) {
      error = "Invalid token";
    } else {
      await prisma.user.update({
        where: {
          id: verificationToken.userId,
        },
        data: {
          emailVerified: new Date(),
        },
      });
      await prisma.verificationToken.deleteMany({
        where: {
          userId: verificationToken.userId,
        },
      });
      success = "Email verified";
    }
  } catch (error) {
    console.error(error);
  }

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
        <div className="flex w-full items-center flex-col justify-center bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
          <div className="flex justify-center">
            <h1 className="text-2xl font-bold justify-center mb-3">
              Verify Email
            </h1>
          </div>
          <div className="flex flex-wrap">
            {success && (
              <div className="flex flex-col justify-center mx-auto">
                <span className="text-green-500 mx-auto">{success}.</span> You
                can now login.
              </div>
            )}
            {error && <div className="text-red-500 mx-auto">{error}.</div>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerifyEmail;
