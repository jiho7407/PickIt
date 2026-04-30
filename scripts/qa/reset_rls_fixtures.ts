import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DILEMMA_IMAGES_BUCKET = "dilemma-images";
const VOTE_OPTION_IMAGES_BUCKET = "vote-option-images";
const TEST_NICKNAMES = ["Author A", "Author B", "Operator"];

const __dirname = dirname(fileURLToPath(import.meta.url));
const requireFromWeb = createRequire(join(__dirname, "../../apps/web/package.json"));
const { createClient } = requireFromWeb("@supabase/supabase-js");

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
  const appDir = join(__dirname, "../../apps/web");
  const testEnv = readEnvFile(join(appDir, ".env.test"));
  const localEnv = readEnvFile(join(appDir, ".env.local"));
  const env = { ...localEnv, ...testEnv, ...process.env };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing local Supabase env vars for RLS fixture reset.");
  }

  if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/.test(url)) {
    throw new Error("Refusing to reset RLS fixtures outside local Supabase.");
  }

  return { serviceRoleKey, url };
}

async function removeStoragePrefix(
  client: ReturnType<typeof createClient>,
  bucket: string,
  prefix: string,
) {
  const { data, error } = await client.storage.from(bucket).list(prefix);

  if (error) {
    throw error;
  }

  const paths = (data ?? []).map((object) => `${prefix}/${object.name}`);

  if (paths.length === 0) {
    return;
  }

  const { error: removeError } = await client.storage.from(bucket).remove(paths);

  if (removeError) {
    throw removeError;
  }
}

async function main() {
  const { serviceRoleKey, url } = getSupabaseConfig();
  const client = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await client
    .from("profiles")
    .select("id")
    .in("nickname", TEST_NICKNAMES);

  if (error) {
    throw error;
  }

  const testUserIds = (data ?? []).map((user) => user.id);

  for (const userId of testUserIds) {
    await removeStoragePrefix(client, DILEMMA_IMAGES_BUCKET, userId);
    await removeStoragePrefix(client, VOTE_OPTION_IMAGES_BUCKET, userId);

    const { error: deleteError } = await client.auth.admin.deleteUser(userId);

    if (deleteError) {
      throw deleteError;
    }
  }

  const { error: sessionError } = await client
    .from("anonymous_sessions")
    .delete()
    .or("session_hash.like.test-%,session_hash.like.service-%,session_hash.like.chosen-%");

  if (sessionError) {
    throw sessionError;
  }

  console.log(`Removed ${testUserIds.length} RLS fixture user(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
