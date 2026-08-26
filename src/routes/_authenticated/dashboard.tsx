import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format, isAfter, parseISO } from "date-fns";
import { CalendarDays, CheckCircle2, Clock, FileText, ListChecks, Plus } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — MinuteFlow" },
      { name: "description", content: "Your meetings, AI minutes and open action items at a glance." },
      { property: "og:title", content: "MinuteFlow dashboard" },
      { property: "og:description", content: "Track meetings, minutes and action items in one view." },
    ],
  }),
  component: DashboardPage,
});

const STATUS_COLORS: Record<string, string> = {
  todo: "var(--color-chart-4)",
  in_progress: "var(--color-chart-2)",
  done: "var(--color-chart-3)",
};

function DashboardPage() {
  const { data: profile } = useProfile();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [meetings, actions] = await Promise.all([
        supabase
          .from("meetings")
          .select("id,title,meeting_type,meeting_date,status,participants")
          .order("meeting_date", { ascending: false })
          .limit(50),
        supabase
          .from("action_items")
          .select("id,task,assignee,due_date,status,priority,progress")
          .order("created_at", { ascending: false })
          .limit(100),
      ]);
      if (meetings.error) throw meetings.error;
      if (actions.error) throw actions.error;
      return { meetings: meetings.data, actions: actions.data };
    },
  });

  const meetings = data?.meetings ?? [];
  const actions = data?.actions ?? [];
  const now = new Date();
  const upcoming = meetings
    .filter((m) => isAfter(parseISO(m.meeting_date), now))
    .sort((a, b) => a.meeting_date.localeCompare(b.meeting_date))
    .slice(0, 4);
  const recent = meetings.filter((m) => !isAfter(parseISO(m.meeting_date), now)).slice(0, 5);
  const openActions = actions.filter((a) => a.status !== "done");
  const doneActions = actions.filter((a) => a.status === "done");

  const stats = [
    { label: "Meetings captured", value: meetings.length, icon: FileText },
    { label: "Open actions", value: openActions.length, icon: ListChecks },
    { label: "Completed", value: doneActions.length, icon: CheckCircle2 },
    { label: "Upcoming", value: upcoming.length, icon: CalendarDays },
  ];

  const byStatus = ["todo", "in_progress", "done"].map((status) => ({
    name: status === "in_progress" ? "In progress" : status === "todo" ? "To do" : "Done",
    value: actions.filter((a) => a.status === status).length,
    key: status,
  }));

  const byPriority = ["high", "medium", "low"].map((p) => ({
    name: p[0]!.toUpperCase() + p.slice(1),
    actions: actions.filter((a) => a.priority === p).length,
  }));

  return (
    <AppShell
      title={`Welcome back, ${(profile?.full_name || "").split(" ")[0] || "there"}`}
      description="Here's how your meetings and commitments are tracking."
      actions={
        <Button asChild>
          <Link to="/meetings/new">
            <Plus className="mr-1.5 size-4" /> New meeting
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="card-surface animate-float-up border-0">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>{label}</CardDescription>
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="size-4 text-primary" />
              </span>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-3xl font-bold">{value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="card-surface border-0 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Action items by priority</CardTitle>
            <CardDescription>Where your team's commitments sit right now</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byPriority}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      color: "var(--color-popover-foreground)",
                    }}
                  />
                  <Bar dataKey="actions" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="card-surface border-0">
          <CardHeader>
            <CardTitle className="text-base">Completion mix</CardTitle>
            <CardDescription>Status split across all actions</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : actions.length === 0 ? (
              <p className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                No action items yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78}>
                    {byStatus.map((entry) => (
                      <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      color: "var(--color-popover-foreground)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="card-surface border-0">
          <CardHeader>
            <CardTitle className="text-base">Upcoming meetings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing scheduled ahead. Create a meeting to plan one.
              </p>
            ) : (
              upcoming.map((m) => (
                <Link
                  key={m.id}
                  to="/meetings/$id"
                  params={{ id: m.id }}
                  className="block rounded-xl border p-3 transition-colors hover:bg-accent"
                >
                  <p className="truncate text-sm font-semibold">{m.title}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {format(parseISO(m.meeting_date), "PPp")}
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="card-surface border-0">
          <CardHeader>
            <CardTitle className="text-base">Recent notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">Your captured meetings will appear here.</p>
            ) : (
              recent.map((m) => (
                <Link
                  key={m.id}
                  to="/meetings/$id"
                  params={{ id: m.id }}
                  className="block rounded-xl border p-3 transition-colors hover:bg-accent"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{m.title}</p>
                    <Badge variant={m.status === "processed" ? "default" : "secondary"}>
                      {m.status}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {format(parseISO(m.meeting_date), "PP")} · {m.meeting_type}
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="card-surface border-0">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Action items</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/actions">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </>
            ) : openActions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No open actions. Great work.</p>
            ) : (
              openActions.slice(0, 4).map((a) => (
                <div key={a.id} className="rounded-xl border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{a.task}</p>
                    <Badge variant={a.priority === "high" ? "destructive" : "secondary"}>
                      {a.priority}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress value={a.progress} className="h-1.5" />
                    <span className="text-xs text-muted-foreground">{a.progress}%</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {a.assignee || "Unassigned"}
                    {a.due_date ? ` · due ${format(parseISO(a.due_date), "PP")}` : ""}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
