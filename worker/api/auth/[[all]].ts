import type { Handler } from "../../_lib/context";
import { createAuth } from "../../_lib/auth";

export const onRequest: Handler = async (context) => {
  const auth = createAuth(context.env);
  return auth.handler(context.request);
};
