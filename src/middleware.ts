import NextAuth from "next-auth"
import { NextResponse } from "next/server"

const { auth } = NextAuth({
  basePath: "/zbank/api/auth",
  providers: [],
  session: { strategy: "jwt" },
  pages: { signIn: "/zbank/auth/signin" },
})

export default auth((req) => {
  const isAuth = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/zbank/auth')
  const isApiAuthRoute = req.nextUrl.pathname.startsWith('/zbank/api/auth')

  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  if (!isAuth) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/auth/signin?from=${encodeURIComponent(from)}`, req.url)
    );
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}