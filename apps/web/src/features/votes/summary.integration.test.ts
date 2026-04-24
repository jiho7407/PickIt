import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/lib/database.types";

type Supabase = SupabaseClient<Database>;

const runIntegration = process.env.PICKIT_SUPABASE_INTEGRATION === "1";
const password = "Password-1234!";
const createdUserIds: string[] = [];
const createdAnonymousSessionIds: string[] = [];

const __dirname = dirname(fileURLToPath(import.meta.url));

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
  const testEnv = readEnvFile(join(__dirname, "../../../.env.test"));
  const localEnv = readEnvFile(join(__dirname, "../../../.env.local"));
  const env = { ...localEnv, ...testEnv, ...process.env };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error("Missing local Supabase env vars for integration tests.");
  }

  if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/.test(url)) {
    throw new Error("Refusing to run write-heavy integration tests outside local Supabase.");
  }

  return { anonKey, serviceRoleKey, url };
}

function getAuthOptions(name: string) {
  return {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
      storageKey: `pickit-summary-${name}-${crypto.randomUUID()}`,
    },
  };
}

async function createUser(service: Supabase, nickname: string) {
  const email = `pickit-${Date.now()}-${crypto.randomUUID()}@example.test`;
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nickname },
  });

  if (error || !data.user) {
    throw error ?? new Error("Failed to create test user.");
  }

  createdUserIds.push(data.user.id);
  return { email, id: data.user.id };
}

async function signIn(url: string, anonKey: string, email: string) {
  const client = createClient<Database>(url, anonKey, getAuthOptions(email));
  const { error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    throw error;
  }

  return client;
}

async function insertDilemma(
  service: Supabase,
  authorId: string,
  overrides: Partial<Database["public"]["Tables"]["dilemmas"]["Insert"]> = {},
) {
  const { data, error } = await service
    .from("dilemmas")
    .insert({
      author_id: authorId,
      category: "test",
      price: 10000,
      product_name: "테스트 상품",
      situation: "통합 테스트에서 생성한 충분히 긴 상황 설명입니다.",
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

async function addAnonymousVote(service: Supabase, dilemmaId: string, choice: "buy" | "skip") {
  const { data: session, error: sessionError } = await service
    .from("anonymous_sessions")
    .insert({ session_hash: `test-${crypto.randomUUID()}-${crypto.randomUUID()}` })
    .select("id")
    .single();

  if (sessionError) {
    throw sessionError;
  }

  createdAnonymousSessionIds.push(session.id);

  const { error: voteError } = await service.from("votes").insert({
    anonymous_session_id: session.id,
    choice,
    dilemma_id: dilemmaId,
  });

  if (voteError) {
    throw voteError;
  }
}

async function addAnonymousOptionVote(service: Supabase, dilemmaId: string, optionId: string) {
  const { data: session, error: sessionError } = await service
    .from("anonymous_sessions")
    .insert({ session_hash: `test-${crypto.randomUUID()}-${crypto.randomUUID()}` })
    .select("id")
    .single();

  if (sessionError) {
    throw sessionError;
  }

  createdAnonymousSessionIds.push(session.id);

  const { error: voteError } = await service.from("votes").insert({
    anonymous_session_id: session.id,
    dilemma_id: dilemmaId,
    option_id: optionId,
  });

  if (voteError) {
    throw voteError;
  }
}

async function addAnonymousVotes(
  service: Supabase,
  dilemmaId: string,
  choices: Array<"buy" | "skip">,
) {
  for (const choice of choices) {
    await addAnonymousVote(service, dilemmaId, choice);
  }
}

describe.skipIf(!runIntegration)("vote summary views and candidate RPCs", () => {
  let service: Supabase;
  let anon: Supabase;
  let authorA: Awaited<ReturnType<typeof createUser>>;
  let authorB: Awaited<ReturnType<typeof createUser>>;
  let operator: Awaited<ReturnType<typeof createUser>>;
  let authorAClient: Supabase;
  let authorBClient: Supabase;
  let operatorClient: Supabase;

  beforeAll(async () => {
    const config = getSupabaseConfig();
    service = createClient<Database>(config.url, config.serviceRoleKey, getAuthOptions("service"));
    anon = createClient<Database>(config.url, config.anonKey, getAuthOptions("anon"));

    authorA = await createUser(service, "Author A");
    authorB = await createUser(service, "Author B");
    operator = await createUser(service, "Operator");

    const { error: roleError } = await service
      .from("profiles")
      .update({ role: "operator" })
      .eq("id", operator.id);

    if (roleError) {
      throw roleError;
    }

    authorAClient = await signIn(config.url, config.anonKey, authorA.email);
    authorBClient = await signIn(config.url, config.anonKey, authorB.email);
    operatorClient = await signIn(config.url, config.anonKey, operator.email);
  });

  afterAll(async () => {
    if (createdAnonymousSessionIds.length > 0) {
      await service.from("anonymous_sessions").delete().in("id", createdAnonymousSessionIds);
    }

    for (const userId of createdUserIds) {
      await service.auth.admin.deleteUser(userId);
    }
  });

  it("returns 75/25 for three buy votes and one skip vote", async () => {
    const dilemmaId = await insertDilemma(service, authorA.id);
    await addAnonymousVotes(service, dilemmaId, ["buy", "buy", "buy", "skip"]);

    const { data, error } = await anon
      .from("dilemma_vote_summaries")
      .select("*")
      .eq("dilemma_id", dilemmaId)
      .single();

    expect(error).toBeNull();
    expect(data).toMatchObject({
      buy_count: 3,
      buy_ratio: 75,
      skip_count: 1,
      skip_ratio: 25,
      total_count: 4,
    });
  });

  it("returns zero counts and ratios when there are no votes", async () => {
    const dilemmaId = await insertDilemma(service, authorA.id);

    const { data, error } = await anon
      .from("dilemma_vote_summaries")
      .select("*")
      .eq("dilemma_id", dilemmaId)
      .single();

    expect(error).toBeNull();
    expect(data).toMatchObject({
      buy_count: 0,
      buy_ratio: 0,
      skip_count: 0,
      skip_ratio: 0,
      total_count: 0,
    });
  });

  it("counts A/B option votes by option position", async () => {
    const dilemmaId = await insertDilemma(service, authorA.id, { vote_type: "ab" });
    const { data: options, error: optionError } = await service
      .from("vote_options")
      .insert([
        { dilemma_id: dilemmaId, label: "A 옵션", position: 1 },
        { dilemma_id: dilemmaId, label: "B 옵션", position: 2 },
      ])
      .select("id, position");

    expect(optionError).toBeNull();

    const optionAId = options?.find((option) => option.position === 1)?.id;
    const optionBId = options?.find((option) => option.position === 2)?.id;

    if (!optionAId || !optionBId) {
      throw new Error("Failed to create A/B options.");
    }

    await addAnonymousOptionVote(service, dilemmaId, optionAId);
    await addAnonymousOptionVote(service, dilemmaId, optionAId);
    await addAnonymousOptionVote(service, dilemmaId, optionBId);

    const { data, error } = await anon
      .from("dilemma_vote_summaries")
      .select("*")
      .eq("dilemma_id", dilemmaId)
      .single();

    expect(error).toBeNull();
    expect(data).toMatchObject({
      buy_count: 0,
      option_a_count: 2,
      option_b_count: 1,
      skip_count: 0,
      total_count: 3,
    });
  });

  it("does not expose draft or archived dilemmas through the public summary view", async () => {
    const draftId = await insertDilemma(service, authorA.id, { status: "draft" });
    const archivedId = await insertDilemma(service, authorA.id, { status: "archived" });
    await addAnonymousVotes(service, draftId, ["buy", "buy"]);
    await addAnonymousVotes(service, archivedId, ["skip"]);

    const { data, error } = await anon
      .from("dilemma_vote_summaries")
      .select("dilemma_id")
      .in("dilemma_id", [draftId, archivedId]);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("returns only the current author's due followup candidates without existing followups", async () => {
    const now = new Date();
    const dueAt = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString();
    const authorDueId = await insertDilemma(service, authorA.id, { followup_due_at: dueAt });
    const otherAuthorDueId = await insertDilemma(service, authorB.id, { followup_due_at: dueAt });
    const followedUpId = await insertDilemma(service, authorA.id, { followup_due_at: dueAt });

    const { error: followupError } = await service.from("followups").insert({
      author_id: authorA.id,
      dilemma_id: followedUpId,
      outcome: "skipped",
    });

    expect(followupError).toBeNull();

    const { data, error } = await authorAClient.rpc("get_followup_candidates", {
      now_ts: now.toISOString(),
    });

    expect(error).toBeNull();
    expect(data?.map((candidate) => candidate.dilemma_id)).toContain(authorDueId);
    expect(data?.map((candidate) => candidate.dilemma_id)).not.toContain(otherAuthorDueId);
    expect(data?.map((candidate) => candidate.dilemma_id)).not.toContain(followedUpId);
    expect(data?.find((candidate) => candidate.dilemma_id === authorDueId)?.days_overdue).toBe(8);
  });

  it("returns current author notification candidates and hides other authors", async () => {
    const now = new Date();
    const dueAt = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const resultId = await insertDilemma(service, authorA.id);
    const otherResultId = await insertDilemma(service, authorB.id);
    const followupId = await insertDilemma(service, authorA.id, { followup_due_at: dueAt });

    await addAnonymousVotes(service, resultId, Array(10).fill("buy"));
    await addAnonymousVotes(service, otherResultId, Array(10).fill("buy"));

    const { data, error } = await authorAClient.rpc("get_my_notification_candidates");

    expect(error).toBeNull();
    expect(data).toEqual(
      expect.arrayContaining([
        { author_id: authorA.id, dilemma_id: resultId, kind: "result" },
        { author_id: authorA.id, dilemma_id: followupId, kind: "followup" },
      ]),
    );
    expect(data?.some((candidate) => candidate.dilemma_id === otherResultId)).toBe(false);
  });

  it("blocks non-operators and lets operators read global notification candidates", async () => {
    const resultId = await insertDilemma(service, authorB.id);
    await addAnonymousVotes(service, resultId, Array(10).fill("skip"));

    const { error: anonFollowupError } = await anon.rpc("get_followup_candidates");
    const { error: anonNotificationError } = await anon.rpc("get_my_notification_candidates");
    const { error: anonOperatorError } = await anon.rpc("get_operator_notification_candidates");
    const { error: userError } = await authorBClient.rpc("get_operator_notification_candidates");

    expect(anonFollowupError).not.toBeNull();
    expect(anonNotificationError).not.toBeNull();
    expect(anonOperatorError).not.toBeNull();
    expect(userError).not.toBeNull();

    const { data, error } = await operatorClient.rpc("get_operator_notification_candidates");

    expect(error).toBeNull();
    expect(data).toEqual(
      expect.arrayContaining([
        { author_id: authorB.id, dilemma_id: resultId, kind: "result" },
      ]),
    );
  });
});
