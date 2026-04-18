import { createAuth } from "../_lib/auth";
import { createDB, taskRowToClient } from "../_lib/db";

export const onRequestGet: PagesFunction = async (context) => {
  const auth = createAuth(context.env as any);
  const session = await auth.api.getSession({ headers: context.request.headers });
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const db = createDB(context.env.DB as D1Database);
  const rows = await db
    .selectFrom("task")
    .selectAll()
    .where("user_id", "=", session.user.id)
    .orderBy("sort_order", "asc")
    .orderBy("created_at", "asc")
    .execute();

  return new Response(
    JSON.stringify(rows.map(taskRowToClient)),
    { headers: { "Content-Type": "application/json" } },
  );
};

export const onRequestPost: PagesFunction = async (context) => {
  const auth = createAuth(context.env as any);
  const session = await auth.api.getSession({ headers: context.request.headers });
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const body = await context.request.json() as {
    title: string;
    deadline?: string | null;
    id?: string;
  };

  const db = createDB(context.env.DB as D1Database);
  const now = Date.now();
  const id = body.id ?? now.toString(36) + Math.random().toString(36).slice(2, 7);

  // Get next sort order
  const maxOrder = await db
    .selectFrom("task")
    .select(db.fn.max("sort_order").as("max_order"))
    .where("user_id", "=", session.user.id)
    .execute();
  const sortOrder = (Number(maxOrder[0]?.max_order ?? 0) ?? 0) + 1;

  const row = {
    id,
    user_id: session.user.id,
    title: body.title.trim(),
    deadline: body.deadline ?? null,
    completed: 0,
    subtasks: "[]",
    created_at: now,
    locked_in_at: null as number | null,
    time_spent_ms: 0,
    sort_order: sortOrder,
    updated_at: now,
  };

  await db.insertInto("task").values(row).execute();

  return new Response(
    JSON.stringify(taskRowToClient(row as any)),
    { headers: { "Content-Type": "application/json" }, status: 201 },
  );
};

// Bulk sync: reconcile local changes with server
export const onRequestPut: PagesFunction = async (context) => {
  const auth = createAuth(context.env as any);
  const session = await auth.api.getSession({ headers: context.request.headers });
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const body = await context.request.json() as {
    tasks: Array<{
      id: string;
      title: string;
      deadline: string | null;
      completed: boolean;
      subtasks: Array<{ text: string; done: boolean }>;
      createdAt: number;
      lockedInAt: number | null;
      timeSpentMs: number;
      updatedAt: number;
    }>;
  };

  const db = createDB(context.env.DB as D1Database);

  // Get existing server tasks
  const existing = await db
    .selectFrom("task")
    .select(["id", "updated_at"])
    .where("user_id", "=", session.user.id)
    .execute();

  const existingMap = new Map(existing.map((r) => [r.id, r.updated_at]));

  const toInsert: any[] = [];
  const toUpdate: any[] = [];

  for (let i = 0; i < body.tasks.length; i++) {
    const task = body.tasks[i]!;
    const serverUpdatedAt = existingMap.get(task.id);
    const row = {
      id: task.id,
      user_id: session.user.id,
      title: task.title,
      deadline: task.deadline,
      completed: task.completed ? 1 : 0,
      subtasks: JSON.stringify(task.subtasks),
      created_at: task.createdAt,
      locked_in_at: task.lockedInAt,
      time_spent_ms: task.timeSpentMs,
      sort_order: i,
      updated_at: task.updatedAt,
    };

    if (serverUpdatedAt === undefined) {
      // New task — insert
      toInsert.push(row);
    } else if (task.updatedAt > serverUpdatedAt) {
      // Client has newer version — update
      toUpdate.push(row);
    }
    // else: server is newer, skip (server wins)
  }

  // Find tasks on server that client doesn't have (deleted locally)
  const clientIds = new Set(body.tasks.map((t) => t.id));
  const toDelete = existing.filter((r) => !clientIds.has(r.id));

  // Execute in sequence to avoid D1 concurrency issues
  for (const row of toInsert) {
    await db.insertInto("task").values(row).execute();
  }
  for (const row of toUpdate) {
    await db
      .updateTable("task")
      .set({
        title: row.title,
        deadline: row.deadline,
        completed: row.completed,
        subtasks: row.subtasks,
        locked_in_at: row.locked_in_at,
        time_spent_ms: row.time_spent_ms,
        sort_order: row.sort_order,
        updated_at: row.updated_at,
      })
      .where("id", "=", row.id)
      .where("user_id", "=", session.user.id)
      .execute();
  }
  for (const row of toDelete) {
    await db
      .deleteFrom("task")
      .where("id", "=", row.id)
      .where("user_id", "=", session.user.id)
      .execute();
  }

  // Return the server's full task list after sync
  const rows = await db
    .selectFrom("task")
    .selectAll()
    .where("user_id", "=", session.user.id)
    .orderBy("sort_order", "asc")
    .orderBy("created_at", "asc")
    .execute();

  return new Response(
    JSON.stringify(rows.map(taskRowToClient)),
    { headers: { "Content-Type": "application/json" } },
  );
};
