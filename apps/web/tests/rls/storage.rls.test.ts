import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DILEMMA_IMAGES_BUCKET } from "@/lib/storage";
import {
  cleanupRlsContext,
  createRlsContext,
  makeStoragePath,
  type RlsContext,
} from "./fixtures";

async function uploadImage(ctx: RlsContext, accessToken: string, path: string) {
  return fetch(`${ctx.url}/storage/v1/object/${DILEMMA_IMAGES_BUCKET}/${path}`, {
    method: "POST",
    headers: {
      apikey: ctx.anonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "image/png",
      "x-upsert": "false",
    },
    body: new Uint8Array([1, 2, 3]),
    signal: AbortSignal.timeout(5000),
  });
}

async function downloadPublicImage(ctx: RlsContext, path: string) {
  return fetch(`${ctx.url}/storage/v1/object/public/${DILEMMA_IMAGES_BUCKET}/${path}`, {
    headers: {
      apikey: ctx.anonKey,
    },
    signal: AbortSignal.timeout(5000),
  });
}

describe("storage RLS", () => {
  let ctx: RlsContext;

  beforeAll(async () => {
    ctx = await createRlsContext();
  });

  afterAll(async () => {
    await cleanupRlsContext(ctx);
  });

  it("allows users to upload to their own image path and lets anon read public images", async () => {
    const path = makeStoragePath(ctx.users.authorA.id);
    const upload = await uploadImage(ctx, ctx.users.authorA.accessToken, path);

    expect(upload.ok).toBe(true);
    ctx.storagePaths.push({ bucket: DILEMMA_IMAGES_BUCKET, path });

    const download = await downloadPublicImage(ctx, path);

    expect(download.ok).toBe(true);
  });

  it("blocks uploads into another user's image path", async () => {
    const path = makeStoragePath(ctx.users.authorA.id);
    const upload = await uploadImage(ctx, ctx.users.authorB.accessToken, path);

    expect(upload.ok).toBe(false);
  });
});
