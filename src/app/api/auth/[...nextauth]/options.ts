import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import UserModel, { User } from "@/models/user.model";
import dbConnect from "@/lib/dbConnect";

// Define the credentials interface
interface Credentials {
  identifier: string;
  password: string;
}

// Define the authorize return type - must include 'id' for NextAuth compatibility
interface AuthorizedUser {
  id: string;
  _id: string;
  username: string;
  email: string;
  isVerified: boolean;
  isAcceptingMessages: boolean;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",

      credentials: {
        identifier: { label: "Email/Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(
        credentials: Record<"identifier" | "password", string> | undefined,
        // req: Pick<any, "body" | "method" | "query" | "headers">
      ): Promise<AuthorizedUser | null> {
        if (!credentials) {
          throw new Error("No credentials provided");
        }

        const typedCredentials: Credentials = {
          identifier: credentials.identifier,
          password: credentials.password,
        };

        await dbConnect();
        
        try {
          const user: User | null = await UserModel.findOne({
            $or: [
              { email: typedCredentials.identifier },
              { username: typedCredentials.identifier },
            ],
          });

          // If no user
          if (!user) {
            throw new Error("No user found with this email");
          }

          // If user found but not verified
          if (!user.isVerified) {
            throw new Error("Please verify your account first");
          }

          // Compare the password for authorization
          const isPasswordCorrect = await bcrypt.compare(
            typedCredentials.password,
            user.password
          );

          if (isPasswordCorrect) {
            return {
              id: user._id.toString(), // Required by NextAuth
              _id: user._id.toString(),
              username: user.username,
              email: user.email,
              isVerified: user.isVerified,
              isAcceptingMessages: user.isAcceptingMessage,
            };
          } else {
            throw new Error("Incorrect Password");
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error("An unknown error occurred during authentication");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};