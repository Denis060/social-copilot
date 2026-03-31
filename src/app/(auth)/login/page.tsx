import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function LoginPage(props: { searchParams: Promise<{ next?: string, error?: string, message?: string }> }) {
  const searchParams = await props.searchParams;
  const nextUrl = searchParams.next ?? "/dashboard";

  async function login(formData: FormData) {
    "use server";
    console.log("Login action triggered with", formData.get("email"));
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login Error:", error.message);
      return redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }

    redirect(nextUrl);
  }

  async function signup(formData: FormData) {
    "use server";
    console.log("Signup action triggered with", formData.get("email"));
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const headersList = await headers();
    const origin = headersList.get("origin") ?? "";

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/callback`,
      },
    });

    if (error) {
      console.error("Signup Error:", error.message);
      return redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }

    redirect(`/login?message=Check email to continue sign in process`);
  }

  async function signInWithGoogle() {
    "use server";
    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get("origin") ?? "";
    const { data } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/callback?next=${nextUrl}`,
      },
    });

    if (data.url) {
      redirect(data.url);
    }
  }

  async function signInWithGithub() {
    "use server";
    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get("origin") ?? "";
    const { data } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${origin}/callback?next=${nextUrl}`,
      },
    });

    if (data.url) {
      redirect(data.url);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {searchParams.error && (
            <div className="mb-4 text-sm text-red-500 bg-red-50 p-2 rounded">
              {searchParams.error}
            </div>
          )}
          {searchParams.message && (
            <div className="mb-4 text-sm text-green-600 bg-green-50 p-2 rounded">
              {searchParams.message}
            </div>
          )}
          <form action={login} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full">
                Login
              </Button>
              <Button formAction={signup} type="submit" variant="outline" className="w-full">
                Sign Up
              </Button>
            </div>
          </form>
          
          <div className="mt-4 flex flex-col gap-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <form action={signInWithGoogle}>
              <Button variant="outline" className="w-full" type="submit">
                Google
              </Button>
            </form>
            <form action={signInWithGithub}>
              <Button variant="outline" className="w-full" type="submit">
                GitHub
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
