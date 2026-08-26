import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const generateMeetingInsights = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ meetingId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: meeting, error } = await supabase
      .from("meetings")
      .select("id,title,meeting_type,participants,transcript")
      .eq("id", data.meetingId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!meeting) throw new Error("Meeting not found.");
    if (!meeting.transcript || meeting.transcript.trim().length < 40) {
      throw new Error("Add a longer transcript before generating minutes.");
    }

    const { generateInsights } = await import("./ai.server");
    const insights = await generateInsights({
      title: meeting.title,
      meetingType: meeting.meeting_type,
      participants: meeting.participants ?? [],
      transcript: meeting.transcript,
    });

    const { error: upsertError } = await supabase.from("meeting_insights").upsert(
      {
        meeting_id: meeting.id,
        owner_id: userId,
        executive_summary: insights.executive_summary,
        key_points: insights.key_points,
        decisions: insights.decisions,
        risks: insights.risks,
        follow_up_questions: insights.follow_up_questions,
      },
      { onConflict: "meeting_id" },
    );
    if (upsertError) throw new Error(upsertError.message);

    if (insights.action_items.length > 0) {
      const { error: actionError } = await supabase.from("action_items").insert(
        insights.action_items.map((a) => ({
          owner_id: userId,
          meeting_id: meeting.id,
          task: a.task,
          assignee: a.assignee ?? null,
          due_date: a.due_date ?? null,
          priority: a.priority ?? "medium",
          status: "todo",
          progress: 0,
        })),
      );
      if (actionError) throw new Error(actionError.message);
    }

    await supabase.from("meetings").update({ status: "processed" }).eq("id", meeting.id);
    await supabase.from("notifications").insert({
      user_id: userId,
      title: "AI minutes ready",
      body: `${meeting.title} has a fresh summary and ${insights.action_items.length} action items.`,
    });

    return { actionsCreated: insights.action_items.length };
  });
