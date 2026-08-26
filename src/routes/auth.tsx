import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

const searchSchema = z.object({
  mode: z.enum(["login", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in to MinuteFlow" },
      {
        name: "description",
        content: "Log in or create your MinuteFlow account to capture meetings and track actions.",
      },
      { property: "og:title", content: "Sign in to MinuteFlow" },
      { property: "og:description", content: "Access your meeting workspace." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "signup">(mode === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          toast.success("Check your email to confirm your account.");
          return;
        }
        toast.success("Welcome to MinuteFlow!");
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setLoading(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="text-lg font-bold">MinuteFlow</span>
        </Link>

        <Card className="card-surface">
          <CardHeader>
            <CardTitle className="text-xl">
              {tab === "signup" ? "Create your account" : "Welcome back"}
            </CardTitle>
            <CardDescription>
              {tab === "signup"
                ? "Start turning meetings into clear action."
                : "Sign in to your meeting workspace."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {checkEmail ? (
              <div className="space-y-4 text-sm">
                <p className="rounded-xl bg-accent p-4 text-accent-foreground">
                  We sent a confirmation link to <strong>{email}</strong>. Click it to activate your
                  account, then sign in.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setCheckEmail(false);
                    setTab("login");
                  }}
                >
                  Back to sign in
                </Button>
              </div>
            ) : (
              <>
                <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Log in</TabsTrigger>
                    <TabsTrigger value="signup">Sign up</TabsTrigger>
                  </TabsList>
                </Tabs>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {tab === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Alex Morgan"
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {tab === "login" && (
                        <Link
                          to="/forgot-password"
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      )}
                    </div>
                    <Input
                      id="password"
                      type="password"
                      autoComplete={tab === "signup" ? "new-password" : "current-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {tab === "signup" ? "Create account" : "Log in"}
                  </Button>
                </form>

                <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  or
                  <span className="h-px flex-1 bg-border" />
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogle}
                  disabled={loading}
                >
                  Continue with Google
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
