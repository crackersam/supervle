import WelcomeEmail from "@/emails/welcome-email";
import { NextRequest } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { to, from, subject, forename, verificationToken } = await req.json();
    console.log("Sending email to:", to);
    const { data, error } = await resend.emails.send({
      from: from,
      to: [to],
      subject: subject,
      react: WelcomeEmail({
        forename,
        verificationToken,
      }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
