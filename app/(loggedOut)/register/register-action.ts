'use server'
import { actionClient } from '@/lib/safe-action'
import { registerSchema } from '@/schemas/register'
import { prisma } from '@/prisma'
import * as bcrypt from 'bcrypt-ts-edge'
import crypto from 'crypto'

export const registerUser = actionClient
  .schema(registerSchema)
  .action(async ({ parsedInput: { forename, surname, email, password } }) => {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })
    if (existingUser) {
      return {
        error: 'User with this email already exists',
      }
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const user = await prisma.user.create({
      data: {
        forename: forename[0].toUpperCase() + forename.slice(1),
        surname: surname[0].toUpperCase() + surname.slice(1),

        email: email.toLowerCase(),
        password: hashedPassword,
      },
    })
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expires: new Date(Date.now() + 5 * 60 * 60 * 1000),
      },
    })

    fetch(`${process.env.BASE_URL}/api/sendWelcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        from: 'welcome@lecturetheplanet.com',
        subject: 'Verify your email',
        forename: forename[0].toUpperCase() + forename.slice(1),
        verificationToken,
      }),
    })
    return { success: 'Verification email sent!' }
  })
