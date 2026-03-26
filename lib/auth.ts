import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide both email and password.")
        }

        const email = credentials.email.toLowerCase().trim()

        // 1. Check auth_credentials collection
        const authRef = doc(db, "auth_credentials", email)
        const authSnap = await getDoc(authRef)

        if (!authSnap.exists()) {
          throw new Error("No account found with this email. Please sign up first.")
        }

        const authData = authSnap.data()

        if (!authData.passwordHash) {
          throw new Error("This account was created with Google. Please use Google Sign-In.")
        }

        // 2. Compare password hash
        const isValid = await bcrypt.compare(credentials.password, authData.passwordHash)
        if (!isValid) {
          throw new Error("Incorrect password. Please try again.")
        }

        // 3. Fetch public profile from users collection
        const userRef = doc(db, "users", email)
        const userSnap = await getDoc(userRef)
        const userData = userSnap.exists() ? userSnap.data() : {}

        return {
          id: email,
          email: email,
          name: userData.name || email.split("@")[0],
          image: userData.image || "",
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false

      const email = user.email.toLowerCase().trim()

      try {
        // Mirror profile into users collection
        const userRef = doc(db, "users", email)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email,
            name: user.name || "",
            image: user.image || "",
            role: "customer",
            createdAt: serverTimestamp(),
            adminSecret: 'gharanapickles_secure_key_123'
          })
        } else {
          await setDoc(userRef, {
            name: user.name || userSnap.data().name || "",
            image: user.image || userSnap.data().image || "",
            adminSecret: 'gharanapickles_secure_key_123'
          }, { merge: true })
        }

        // For Google logins, also ensure auth_credentials tracks the provider
        if (account?.provider === "google") {
          const authRef = doc(db, "auth_credentials", email)
          const authSnap = await getDoc(authRef)

          if (!authSnap.exists()) {
            await setDoc(authRef, {
              email,
              authProviders: ["google"],
              createdAt: serverTimestamp(),
              adminSecret: 'gharanapickles_secure_key_123'
            })
          } else {
            const existing = authSnap.data().authProviders || []
            if (!existing.includes("google")) {
              await setDoc(authRef, {
                authProviders: [...existing, "google"],
                adminSecret: 'gharanapickles_secure_key_123'
              }, { merge: true })
            }
          }
        }

        return true
      } catch (error) {
        console.error("Error in signIn callback:", error)
        return true
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id || user.email
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.uid
        session.user.email = token.email as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  }
}
