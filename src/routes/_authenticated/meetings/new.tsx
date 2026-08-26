import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileUp, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/meetings/new")({
  head: () => ({
    meta: [
      { title: "New meeting — MinuteFlow" },
      { name: "description", content: "Capture notes, paste or upload a transcript for AI minutes." },
      { property: "og:title", content: "New meeting — MinuteFlow" },
      { property: "og:description", content: "Capture notes or upload a transcript for AI minutes." },
    ],
  }),
  component: NewMeetingPage,
});

function localDateTimeValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function NewMeetingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [meetingType, setMeetingType] = useState("general");
  const [participants, setParticipants] = useState("");
  const [meetingDate, setMeetingDate] = useState(localDateTimeValue(new Date()));
  const [transcript, setTranscript] = useState("");

  const createMeeting = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("You need to be signed in.");

      const { data, error } = await supabase
        .from("meetings")
        .insert({
          owner_id: userId,
          title: title.trim(),
          meeting_type: meetingType,
          meeting_date: new Date(meetingDate).toISOString(),
          participants: participants
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean),
          transcript: transcript.trim() || null,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Meeting saved");
      navigate({ to: "/meetings/$id", params: { id: data.id } });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 2_000_000) {
      toast.error("Transcript files must be under 2 MB.");
      return;
    }
    const text = await file.text();
    setTranscript(text);
    if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, ""));
    toast.success("Transcript loaded");
  }

  const canSave = title.trim().length > 1 && !createMeeting.isPending;

  return (
    <AppShell
      title="New meeting"
      description="Add the details, then paste or upload the transcript."
    >
      <form
        className="grid gap-4 lg:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSave) createMeeting.mutate();
        }}
      >
        <Card className="card-surface border-0 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
            <CardDescription>Who met, when and why.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Weekly product sync"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Meeting type</Label>
              <Select value={meetingType} onValueChange={setMeetingType}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="standup">Stand-up</SelectItem>
                  <SelectItem value="client">Client call</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="retro">Retrospective</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date &amp; time</Label>
              <Input
                id="date"
                type="datetime-local"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="participants">Participants</Label>
              <Input
                id="participants"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                placeholder="Ada, Grace, Alan"
              />
              <p className="text-xs text-muted-foreground">Separate names with commas.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-surface border-0 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Transcript</CardTitle>
            <CardDescription>
              Paste notes or upload a .txt/.md/.vtt transcript. AI minutes run after saving.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="paste">
              <TabsList>
                <TabsTrigger value="paste">Paste text</TabsTrigger>
                <TabsTrigger value="upload">Upload file</TabsTrigger>
              </TabsList>
              <TabsContent value="paste" className="mt-4">
                <Textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste the meeting transcript or your raw notes here…"
                  className="min-h-[320px]"
                />
              </TabsContent>
              <TabsContent value="upload" className="mt-4">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    void handleFile(e.dataTransfer.files[0]);
                  }}
                  className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center"
                >
                  <FileUp className="size-8 text-primary" />
                  <p className="mt-3 font-medium">Drop a transcript file here</p>
                  <p className="mt-1 text-sm text-muted-foreground">.txt, .md or .vtt up to 2 MB</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => fileRef.current?.click()}
                  >
                    Choose file
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".txt,.md,.vtt,text/plain"
                    className="hidden"
                    onChange={(e) => void handleFile(e.target.files?.[0])}
                  />
                  {transcript && (
                    <p className="mt-4 text-xs text-muted-foreground">
                      {transcript.length.toLocaleString()} characters loaded
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => navigate({ to: "/meetings" })}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSave}>
                <Sparkles className="mr-1.5 size-4" />
                {createMeeting.isPending ? "Saving…" : "Save meeting"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </AppShell>
  );
}
