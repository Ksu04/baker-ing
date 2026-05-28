import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from '@/lib/prisma'
import bcrypt from 'bcrypt'
import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      phone: string | null
    } & DefaultSession['user']
  }
  interface User {
    role?: string
    phone?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    phone?: string | null
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        console.log('AUTHORIZE')
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email as string },
          include: { bakerProfile: true, customerProfile: true },
        })
        console.log('AUTHORIZE 2')

        if (!user) return null

        console.log('AUTHORIZE 3')
        if (!user.password) return null
        const isValid = await bcrypt.compare(
          credentials!.password as string,
          user.password
        )
        console.log('AUTH42')

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role
        token.phone = user.phone ?? null
        token.name = user.name ?? null
      }
      if (trigger === 'update' && session) {
        if (session.name !== undefined) token.name = session.name
        if (session.phone !== undefined) token.phone = session.phone
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub as string
<<<<<<< HEAD
        session.user.role = (token as any).role as string
        session.user.phone = (token as any).phone as string | null
        session.user.name = (token as any).name as string | null
=======
        session.user.role = token.role as string
        session.user.phone = token.phone as string | null
        session.user.name = token.name as string | null
<<<<<<< Updated upstream
=======
>>>>>>> 16c2f262b39d013f401fb4fc6d7a77d7d47dfaae
>>>>>>> Stashed changes
      }
      return session
    },
  },
})
