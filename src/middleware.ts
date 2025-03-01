import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const url = request.nextUrl;

    const authRoutes = ["/sign-in", "/sign-up", "/verify"];
    const protectedRoutes = ["/dashboard"];

    // 🚀 If the user is logged in and trying to access auth pages, redirect to dashboard
    if (token && authRoutes.includes(url.pathname)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 🚀 If the user is NOT logged in and trying to access protected pages, redirect to sign-in
    if (!token && protectedRoutes.some(route => url.pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
}

// ✅ Apply middleware only on relevant routes
export const config = {
    matcher: [
        '/',
        '/sign-in',
        '/sign-up',
        '/verify/:path*',
        '/dashboard/:path*'
    ]
};








// import { NextRequest, NextResponse } from 'next/server'
// // import type { NextRequest } from 'next/server'
// export { default } from "next-auth/middleware";
// import { getToken } from 'next-auth/jwt';
 
// // This function can be marked `async` if using `await` inside
// export async function middleware(request: NextRequest) {

//     const token = await getToken({req: request});
//     const url = request.nextUrl;

//     //? Redirection on the basis of token
//     if (token && (
//         url.pathname.startsWith("/sign-in") ||
//         url.pathname.startsWith("/sign-up") ||
//         url.pathname.startsWith("/verify") ||
//         url.pathname.startsWith("/")
//     )) {
//         return NextResponse.redirect(new URL('/dashbaord', request.url))
//     }
//   return NextResponse.redirect(new URL('/home', request.url))
// }
 
// // See "Matching Paths" below to learn more
// export const config = {
//   matcher: [
//     // '/sign-in',
//     '/sign-up',
//     // '/',
//     '/dashboard/:path*', // it means dashboard k andar jtny b parts hngy sab routes p middleware use ho
//     '/verify/:path*'
//   ]
// }