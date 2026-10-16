import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/setup", "/admin/auth"];

/**
 * Refreshes the Supabase session cookie on admin routes and sends signed-out
 * visitors to the login page. This is an optimistic check only: every admin
 * page and server action verifies the user again on the server.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isPublic = PUBLIC_ADMIN_PATHS.some((p) => request.nextUrl.pathname.startsWith(p));
  if (!url || !key) {
    return isPublic ? NextResponse.next() : NextResponse.redirect(new URL("/admin/login?e=config", request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  if (!data.user && !isPublic) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
