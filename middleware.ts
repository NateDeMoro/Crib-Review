import { auth } from "@/auth";

export default auth((req) => {
  // Middleware logic can go here
  // The auth() function automatically handles the authConfig.callbacks.authorized
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
