import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const admin = await prisma.admin.findUnique({
          where: {
            username: credentials.username as string
          }
        })

        if (!admin) {
          return null
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          admin.passwordHash
        )

        if (!isValidPassword) {
          return null
        }

        return {
          id: admin.id,
          name: admin.username,
        }
      }
    })
  ],
  session: { strategy: "jwt" }
})
