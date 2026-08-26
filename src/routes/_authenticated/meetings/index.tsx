import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { Plus, Search, Users } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/meetings/")({
  head: () => ({
    meta: [
      { title: "Meetings — MinuteFlow" },
      { name: "description", content: "Browse every captured meeting, transcript and AI summary." },
      { property: "og:title", content: "Meetings — MinuteFlow" },
      { property: "og:description", content: "Browse every captured meeting and its AI minutes." },
    ],
  }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("id,title,meeting_type,meeting_date,status,participants,transcript")
        .order("meeting_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const meetings = (data ?? []).filter((m) => {
    const matchesStatus = status === "all" || m.status === status;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      m.title.toLowerCase().includes(q) ||
      (m.participants ?? []).some((p) => p.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  return (
    <AppShell
      title="Meetings"
      description="Every note, transcript and AI-generated minute in one place."
      actions={
        <Button asChild>
          <Link to="/meetings/new">
            <Plus className="mr-1.5 size-4" /> New meeting
          </Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search meetings or participants"
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)
        ) : meetings.length === 0 ? (
          <Card className="card-surface border-0 md:col-span-2 xl:col-span-3">
            <CardContent className="py-14 text-center">
              <p className="font-medium">No meetings yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Capture notes or paste a transcript to get AI minutes in seconds.
              </p>
              <Button asChild className="mt-4">
                <Link to="/meetings/new">Create your first meeting</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          meetings.map((m) => (
            <Link key={m.id} to="/meetings/$id" params={{ id: m.id }} className="group">
              <Card className="card-surface h-full border-0 transition-transform group-hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">{m.title}</CardTitle>
                    <Badge variant={m.status === "processed" ? "default" : "secondary"}>
                      {m.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {format(parseISO(m.meeting_date), "PPp")} · {m.meeting_type}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {m.transcript?.trim() || "No transcript captured yet."}
                  </p>
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="size-3.5" />
                    {(m.participants ?? []).length} participants
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </AppShell>
  );
}
