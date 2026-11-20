import type { Handler } from "../../_lib/context";
import { createAuth } from "../../_lib/auth";
import { createDB, taskRowToClient, type TaskRow } from "../../_lib/db";

export const onRequestPatch: Handler = async (context) => {
  const auth = createAuth(context.env);
  const session = await auth.api.getSession({ headers: context.request.headers });
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const id = context.params.id ?? "";
  const body = (await context.request.json()) as Partial<{
    title: string;
    deadline: string | null;
    completed: boolean;
    subtasks: Array<{ text: string; done: boolean }>;
    lockedInAt: number | null;
    timeSpentMs: number;
    updatedAt: number;
  }>;

  const db = createDB(context.env.DB);

  const updates: Partial<TaskRow> = { updated_at: body.updatedAt ?? Date.now() };
  if (body.title !== undefined) updates.title = body.title;
  if (body.deadline !== undefined) updates.deadline = body.deadline;
  if (body.completed !== undefined) updates.completed = body.completed ? 1 : 0;
  if (body.subtasks !== undefined) updates.subtasks = JSON.stringify(body.subtasks);
  if (body.lockedInAt !== undefined) updates.locked_in_at = body.lockedInAt;
  if (body.timeSpentMs !== undefined) updates.time_spent_ms = body.timeSpentMs;

  await db.updateTable("task").set(updates).where("id", "=", id).where("user_id", "=", session.user.id).execute();

  const updated = await db
    .selectFrom("task")
    .selectAll()
    .where("id", "=", id)
    .where("user_id", "=", session.user.id)
    .execute();

  if (updated.length === 0) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  return new Response(JSON.stringify(taskRowToClient(updated[0]!)), {
    headers: { "Content-Type": "application/json" },
  });
};

export const onRequestDelete: Handler = async (context) => {
  const auth = createAuth(context.env);
  const session = await auth.api.getSession({ headers: context.request.headers });
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const id = context.params.id ?? "";
  const db = createDB(context.env.DB);

  await db.deleteFrom("task").where("id", "=", id).where("user_id", "=", session.user.id).execute();

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
