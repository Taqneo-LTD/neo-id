import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>
          Get started with your smart business card
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full" asChild>
          <RegisterLink postLoginRedirectURL="/dashboard">
            Sign Up
          </RegisterLink>
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-neo-teal hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
