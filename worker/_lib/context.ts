export type Context = {
  request: Request;
  env: Env;
  params: Record<string, string | undefined>;
};

export type Handler = (context: Context) => Promise<Response>;
