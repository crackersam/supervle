import React from 'react'
import Image from 'next/image'
import ForgotPasswordForm from './forgot-password-form'
import school from '@/public/school.jpg'

const Login = () => {
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
        <div className="flex w-full items-center flex-col justify-center">
          <ForgotPasswordForm />
        </div>
      </div>
    </section>
  )
}

export default Login
