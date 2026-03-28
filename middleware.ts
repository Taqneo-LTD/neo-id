import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextRequest } from "next/server";

export default withAuth(async function middleware(req: NextRequest) {
  // Kinde handles the redirect to login for unauthenticated users
}, {
  isReturnToCurrentPage: true,
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profiles/:path*",
    "/company/:path*",
    "/orders/:path*",
    "/admin/:path*",
    "/onboarding/:path*",
    "/settings/:path*",
  ],
};
