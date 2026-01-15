import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;

  const protectedPaths = ['/dashboard', '/review', '/housing/new', '/profile'];
  const isProtected = protectedPaths.some(path => nextUrl.pathname.startsWith(path));

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`, nextUrl.origin)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
