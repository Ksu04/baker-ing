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
    } & DefaultSession['user']
  }
  interface User {
    role?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
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
        const isValid = await bcrypt.compare(
          credentials!.password as string,
          user.password
        )
        console.log('AUTH42')

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})
