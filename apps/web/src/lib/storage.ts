import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export const DILEMMA_IMAGES_BUCKET = "dilemma-images";
export const VOTE_OPTION_IMAGES_BUCKET = "vote-option-images";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const IMAGE_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type AllowedImageType = keyof typeof IMAGE_EXTENSIONS;

type StorageClient = {
  auth: {
    getUser: () => Promise<{
      data: { user: { id: string } | null };
      error: Error | null;
    }>;
  };
  storage: {
    from: (bucket: string) => {
      upload: (
        path: string,
        file: File,
        options: { contentType: string; upsert: boolean },
      ) => Promise<{ data: unknown; error: Error | null }>;
      getPublicUrl: (path: string) => { data: { publicUrl: string } };
    };
  };
};

function createBrowserStorageClient(): StorageClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase browser env is not configured");
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

function assertAllowedImage(file: File): asserts file is File & { type: AllowedImageType } {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be 5MB or smaller");
  }

  if (!(file.type in IMAGE_EXTENSIONS)) {
    throw new Error("Unsupported image type");
  }
}

function createStoragePath(userId: string, file: File & { type: AllowedImageType }) {
  return `${userId}/${crypto.randomUUID()}.${IMAGE_EXTENSIONS[file.type]}`;
}

export async function uploadDilemmaImage(
  file: File,
  client: StorageClient = createBrowserStorageClient(),
): Promise<{ path: string }> {
  assertAllowedImage(file);

  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be signed in to upload an image");
  }

  const path = createStoragePath(user.id, file);
  const { error } = await client.storage.from(DILEMMA_IMAGES_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw error;
  }

  return { path };
}

export function getPublicUrl(
  path: string,
  client: StorageClient = createBrowserStorageClient(),
): string {
  return client.storage.from(DILEMMA_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}
