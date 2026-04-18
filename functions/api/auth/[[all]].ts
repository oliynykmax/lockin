import { createAuth } from "../../_lib/auth";

export const onRequest: PagesFunction = async (context) => {
  const auth = createAuth(context.env as any);
  return auth.handler(context.request);
};
