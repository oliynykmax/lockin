import type { Handler } from "./_lib/context";
import * as auth from "./api/auth/[[all]]";
import * as tasks from "./api/tasks";
import * as task from "./api/tasks/[id]";

const routes: Array<[URLPattern, Partial<Record<string, Handler>>]> = [
  [new URLPattern({ pathname: "/api/auth/*" }), { "*": auth.onRequest }],
  [
    new URLPattern({ pathname: "/api/tasks" }),
    { GET: tasks.onRequestGet, POST: tasks.onRequestPost, PUT: tasks.onRequestPut },
  ],
  [new URLPattern({ pathname: "/api/tasks/:id" }), { PATCH: task.onRequestPatch, DELETE: task.onRequestDelete }],
];

export default {
  async fetch(request, env) {
    for (const [pattern, methods] of routes) {
      const match = pattern.exec(request.url);
      if (!match) continue;
      const handler = methods[request.method] ?? methods["*"];
      if (!handler) return Response.json({ error: "Method not allowed" }, { status: 405 });
      return handler({ request, env, params: match.pathname.groups });
    }
    return Response.json({ error: "Not found" }, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
