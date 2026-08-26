import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  CalendarDays,
  CheckCircle2,
  FileText,
  ListChecks,
  Quote,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import heroImage from "@/assets/hero-dashboard.jpg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MinuteFlow — Turn Every Meeting into Clear Action" },
      {
        name: "description",
        content:
          "Capture meeting notes, generate AI summaries and decisions, and track action items to completion with MinuteFlow.",
      },
      { property: "og:title", content: "MinuteFlow — Turn Every Meeting into Clear Action" },
      {
        property: "og:description",
        content:
          "AI meeting summaries, decisions, risks and action tracking in one calm workspace.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: FileText,
    title: "Capture anything",
    body: "Paste a transcript, upload a text file, or type notes as the meeting happens.",
  },
  {
    icon: Brain,
    title: "AI summaries",
    body: "Executive summary, key discussion points, decisions, risks and follow-up questions.",
  },
  {
    icon: ListChecks,
    title: "Action tracker",
    body: "Owners, due dates, priority and progress with drag-and-drop status columns.",
  },
  {
    icon: CalendarDays,
    title: "Calendar view",
    body: "See meetings and action deadlines together so nothing slips through.",
  },
  {
    icon: Users,
    title: "Team workspace",
    body: "Invite teammates, assign tasks, comment on meetings and share notes.",
  },
  {
    icon: ShieldCheck,
    title: "Exports & control",
    body: "Export notes as PDF, download action items as CSV, keep everything private by default.",
  },
];

const testimonials = [
  {
    name: "Priya Raman",
    role: "Head of Product, Northwind",
    quote:
      "Our weekly syncs used to end with a wall of text. Now everyone leaves with three owned actions.",
  },
  {
    name: "Marcus Cole",
    role: "Engineering Manager, Loopcraft",
    quote: "The risks section alone caught two blockers we would have discovered a sprint later.",
  },
  {
    name: "Elena Fischer",
    role: "COO, Brightline Studio",
    quote: "It reads like a great chief of staff wrote the minutes. Ten minutes of admin, gone.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    note: "For individuals getting organised",
    items: ["5 meetings / month", "AI summaries", "Action tracker", "CSV export"],
  },
  {
    name: "Team",
    price: "$18",
    note: "per user / month",
    highlight: true,
    items: [
      "Unlimited meetings",
      "Team workspace & comments",
      "Calendar view",
      "PDF & CSV export",
      "Priority AI processing",
    ],
  },
  {
    name: "Business",
    price: "$39",
    note: "per user / month",
    items: ["Everything in Team", "Admin panel & analytics", "Custom meeting types", "SSO ready"],
  },
];

const faqs = [
  {
    q: "How does MinuteFlow generate summaries?",
    a: "Paste or upload your transcript and MinuteFlow analyses it to produce an executive summary, key points, decisions, action items, risks and follow-up questions in seconds.",
  },
  {
    q: "Do I need a recording bot?",
    a: "No. MinuteFlow works with any transcript you already have, plus manual notes typed during the meeting.",
  },
  {
    q: "Can my team collaborate?",
    a: "Yes. Invite teammates to your workspace, assign action items, comment on meetings and share notes.",
  },
  {
    q: "Can I export my notes?",
    a: "Meeting notes export to PDF and action items download as CSV at any time.",
  },
  {
    q: "Is my data private?",
    a: "Every meeting is scoped to your account by default. Only people you invite can see shared items.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <span className="text-lg font-bold">MinuteFlow</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#testimonials" className="transition-colors hover:text-foreground">
              Customers
            </a>
            <a href="#pricing" className="transition-colors hover:text-foreground">
              Pricing
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth" search={{ mode: "signup" }}>
                Start free
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div className="animate-float-up">
            <Badge variant="secondary" className="mb-5 rounded-full px-3 py-1">
              <Sparkles className="mr-1.5 size-3.5" /> AI meeting intelligence
            </Badge>
            <h1 className="text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
              Turn Every Meeting into <span className="text-gradient">Clear Action</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              MinuteFlow captures your notes, writes the summary, surfaces the decisions and risks,
              and tracks every action item until it's done.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  Get started free <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#features">See how it works</a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="size-4 text-primary" /> No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="size-4 text-primary" /> Works with any transcript
              </span>
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="size-4 text-primary" /> Export anytime
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-elevated">
              <img
                src={heroImage}
                alt="MinuteFlow dashboard showing an AI meeting summary and action items"
                width={1600}
                height={1104}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Everything after the meeting, handled</h2>
          <p className="mt-3 text-muted-foreground">
            One workspace for notes, AI analysis and follow-through.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="card-surface transition-transform hover:-translate-y-1">
              <CardHeader>
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <f.icon className="size-5" />
                </span>
                <CardTitle className="mt-3 text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{f.body}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="testimonials" className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">Teams that stopped guessing</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="card-surface">
                <CardContent className="pt-6">
                  <Quote className="size-6 text-primary/60" />
                  <p className="mt-4 text-sm leading-relaxed">{t.quote}</p>
                  <div className="mt-5">
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Simple, predictable pricing</h2>
          <p className="mt-3 text-muted-foreground">Start free. Upgrade when your team grows.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {plans.map((p) => (
            <Card
              key={p.name}
              className={
                p.highlight
                  ? "card-surface relative border-primary/40 shadow-elevated"
                  : "card-surface"
              }
            >
              {p.highlight && (
                <Badge className="absolute -top-3 left-6 rounded-full">Most popular</Badge>
              )}
              <CardHeader>
                <CardTitle className="text-base font-semibold text-muted-foreground">
                  {p.name}
                </CardTitle>
                <div className="mt-2 flex items-end gap-1.5">
                  <span className="text-4xl font-extrabold">{p.price}</span>
                  <span className="pb-1 text-xs text-muted-foreground">{p.note}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 text-sm">
                  {p.items.map((i) => (
                    <li key={i} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{i}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6 w-full"
                  variant={p.highlight ? "default" : "outline"}
                  asChild
                >
                  <Link to="/auth" search={{ mode: "signup" }}>
                    Choose {p.name}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <footer className="border-t border-border/60 bg-secondary/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </span>
              <span className="font-bold">MinuteFlow</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Meeting notes, AI summaries and action tracking.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#pricing" className="hover:text-foreground">
              Pricing
            </a>
            <a href="#faq" className="hover:text-foreground">
              FAQ
            </a>
            <Link to="/auth" className="hover:text-foreground">
              Sign in
            </Link>
          </div>
        </div>
        <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} MinuteFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
