import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";

export interface DatabaseSchema {
  user: {
    id: string;
    name: string;
    email: string;
    email_verified: number;
    image: string | null;
    created_at: number;
    updated_at: number;
  };
  session: {
    id: string;
    user_id: string;
    token: string;
    expires_at: number;
    ip_address: string | null;
    user_agent: string | null;
    created_at: number;
    updated_at: number;
  };
  account: {
    id: string;
    user_id: string;
    account_id: string;
    provider_id: string;
    access_token: string | null;
    refresh_token: string | null;
    id_token: string | null;
    access_token_expires_at: number | null;
    refresh_token_expires_at: number | null;
    scope: string | null;
    password: string | null;
    created_at: number;
    updated_at: number;
  };
  verification: {
    id: string;
    identifier: string;
    value: string;
    expires_at: number;
    created_at: number | null;
    updated_at: number | null;
  };
  task: {
    id: string;
    user_id: string;
    title: string;
    deadline: string | null;
    completed: number;
    subtasks: string;
    created_at: number;
    locked_in_at: number | null;
    time_spent_ms: number;
    sort_order: number;
    updated_at: number;
  };
}

export function createDB(d1: D1Database): Kysely<DatabaseSchema> {
  return new Kysely<DatabaseSchema>({
    dialect: new D1Dialect({ database: d1 }),
  });
}

export interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  deadline: string | null;
  completed: number;
  subtasks: string;
  created_at: number;
  locked_in_at: number | null;
  time_spent_ms: number;
  sort_order: number;
  updated_at: number;
}

export function taskRowToClient(row: TaskRow) {
  return {
    id: row.id,
    title: row.title,
    deadline: row.deadline,
    completed: row.completed === 1,
    subtasks: JSON.parse(row.subtasks) as Array<{ text: string; done: boolean }>,
    createdAt: row.created_at,
    lockedInAt: row.locked_in_at,
    timeSpentMs: row.time_spent_ms,
    updatedAt: row.updated_at,
  };
}

