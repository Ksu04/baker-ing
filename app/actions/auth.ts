'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

export async function signInAction({
  email,
  password,
}: {
  email: string
  password: string
}) {
  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    return { success: true }
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: 'Invalid email or password' }
    }
    throw err
  }
}
