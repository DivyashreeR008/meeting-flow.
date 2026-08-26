import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, MailCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your MinuteFlow password" },
      {
        name: "description",
        content: "Request a password reset link for your MinuteFlow account.",
      },
      { property: "og:title", content: "Reset your MinuteFlow password" },
      { property: "og:description", content: "Request a password reset link." },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("Reset link sent");
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
            <CardTitle className="text-xl">Forgot your password?</CardTitle>
            <CardDescription>
              We'll email you a secure link to choose a new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-4 text-sm">
                <p className="flex gap-3 rounded-xl bg-accent p-4 text-accent-foreground">
                  <MailCheck className="mt-0.5 size-4 shrink-0" />
                  <span>
                    If an account exists for <strong>{email}</strong>, a reset link is on its way.
                  </span>
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/auth">Back to sign in</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Send reset link
                </Button>
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/auth">Back to sign in</Link>
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
