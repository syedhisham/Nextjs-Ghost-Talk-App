import NextAuth from "next-auth";
import { authOptions } from "./options";

const handler = NextAuth(authOptions); // Idhr nam bhi same hna chye

export {handler as GET, handler as POST} 