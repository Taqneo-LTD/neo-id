import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function SignInPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your NEO ID account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full" asChild>
          <LoginLink postLoginRedirectURL="/dashboard">
            Sign In
          </LoginLink>
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-neo-teal hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
