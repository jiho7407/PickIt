import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Database } from "@/lib/database.types";

export type Supabase = SupabaseClient<Database>;

type TestUser = {
  accessToken: string;
  client: Supabase;
  email: string;
  id: string;
  password: string;
};

export type RlsContext = {
  anon: Supabase;
  anonKey: string;
  anonymousSessionIds: string[];
  service: Supabase;
  storagePaths: Array<{ bucket: string; path: string }>;
  url: string;
  users: {
    authorA: TestUser;
    authorB: TestUser;
    operator: TestUser;
  };
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const password = "Password-1234!";

function readEnvFile(path: string) {
  if (!existsSync(path)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const [key, ...valueParts] = line.split("=");
        return [key, valueParts.join("=").replace(/^["']|["']$/g, "")];
      }),
  );
}

function getSupabaseConfig() {
  const testEnv = readEnvFile(join(__dirname, "../../.env.test"));
  const localEnv = readEnvFile(join(__dirname, "../../.env.local"));
  const env = { ...localEnv, ...testEnv, ...process.env };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error("Missing local Supabase env vars for RLS tests.");
  }

  if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/.test(url)) {
    throw new Error("Refusing to run RLS tests outside local Supabase.");
  }

  return { anonKey, serviceRoleKey, url };
}

function getAuthOptions(name: string) {
  return {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
      storageKey: `pickit-rls-${name}-${crypto.randomUUID()}`,
    },
  };
}

async function createUser(service: Supabase, url: string, anonKey: string, nickname: string) {
  const email = `pickit-rls-${Date.now()}-${crypto.randomUUID()}@example.test`;
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nickname },
  });

  if (error || !data.user) {
    throw error ?? new Error("Failed to create test user.");
  }

  const client = createClient<Database>(url, anonKey, getAuthOptions(nickname));
  const signIn = await client.auth.signInWithPassword({ email, password });

  if (signIn.error || !signIn.data.session) {
    throw signIn.error;
  }

  return { accessToken: signIn.data.session.access_token, client, email, id: data.user.id, password };
}

export async function createRlsContext(): Promise<RlsContext> {
  const config = getSupabaseConfig();
  const service = createClient<Database>(
    config.url,
    config.serviceRoleKey,
    getAuthOptions("service"),
  );
  const anon = createClient<Database>(config.url, config.anonKey, getAuthOptions("anon"));

  const authorA = await createUser(service, config.url, config.anonKey, "Author A");
  const authorB = await createUser(service, config.url, config.anonKey, "Author B");
  const operator = await createUser(service, config.url, config.anonKey, "Operator");

  const { error: operatorError } = await service
    .from("profiles")
    .update({ role: "operator" })
    .eq("id", operator.id);

  if (operatorError) {
    throw operatorError;
  }

  return {
    anon,
    anonKey: config.anonKey,
    anonymousSessionIds: [],
    service,
    storagePaths: [],
    url: config.url,
    users: { authorA, authorB, operator },
  };
}

export async function cleanupRlsContext(ctx: RlsContext | undefined) {
  if (!ctx) {
    return;
  }

  for (const object of ctx.storagePaths) {
    await ctx.service.storage.from(object.bucket).remove([object.path]);
  }

  if (ctx.anonymousSessionIds.length > 0) {
    await ctx.service.from("anonymous_sessions").delete().in("id", ctx.anonymousSessionIds);
  }

  for (const user of Object.values(ctx.users)) {
    await ctx.service.auth.admin.deleteUser(user.id);
  }
}

export async function insertDilemma(
  ctx: RlsContext,
  authorId = ctx.users.authorA.id,
  overrides: Partial<Database["public"]["Tables"]["dilemmas"]["Insert"]> = {},
) {
  const { data, error } = await ctx.service
    .from("dilemmas")
    .insert({
      author_id: authorId,
      category: "test",
      price: 10000,
      product_name: "테스트 상품",
      situation: "RLS 통합 테스트에서 생성한 충분히 긴 상황 설명입니다.",
      status: "open",
      title: "테스트 고민",
      vote_type: "buy_skip",
      ...overrides,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

export async function createAnonymousSession(ctx: RlsContext) {
  const id = crypto.randomUUID();
  const { error } = await ctx.anon.from("anonymous_sessions").insert({
    id,
    session_hash: `test-${crypto.randomUUID()}-${crypto.randomUUID()}`,
  });

  if (error) {
    throw error;
  }

  ctx.anonymousSessionIds.push(id);
  return id;
}

export async function insertAnonymousVote(
  ctx: RlsContext,
  dilemmaId: string,
  choice: "buy" | "skip" = "buy",
) {
  const sessionId = await createAnonymousSession(ctx);
  const { error } = await ctx.anon.from("votes").insert({
    anonymous_session_id: sessionId,
    choice,
    dilemma_id: dilemmaId,
  });

  if (error) {
    throw error;
  }

  const { data: vote, error: voteError } = await ctx.service
    .from("votes")
    .select("id")
    .eq("dilemma_id", dilemmaId)
    .eq("anonymous_session_id", sessionId)
    .single();

  if (voteError) {
    throw voteError;
  }

  return { sessionId, voteId: vote.id };
}

export async function insertAuthenticatedVote(
  ctx: RlsContext,
  voter: TestUser,
  dilemmaId: string,
  choice: "buy" | "skip" = "buy",
) {
  const { data, error } = await voter.client
    .from("votes")
    .insert({
      choice,
      dilemma_id: dilemmaId,
      voter_id: voter.id,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

export function makeStoragePath(userId: string, extension = "png") {
  return `${userId}/${crypto.randomUUID()}.${extension}`;
}
