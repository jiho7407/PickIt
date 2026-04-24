import { describe, expect, it, vi } from "vitest";
import {
  DILEMMA_IMAGES_BUCKET,
  MAX_IMAGE_BYTES,
  getPublicUrl,
  uploadDilemmaImage,
} from "./storage";

const userId = "11111111-1111-4111-8111-111111111111";

function makeFile(size: number, type: string, name = "image.jpg") {
  return new File([new Uint8Array(size)], name, { type });
}

function makeClient() {
  const upload = vi.fn().mockResolvedValue({ data: { path: "unused" }, error: null });
  const getPublicUrlMock = vi.fn().mockReturnValue({
    data: { publicUrl: "http://127.0.0.1:54321/storage/v1/object/public/dilemma-images/path.jpg" },
  });
  const from = vi.fn().mockReturnValue({ upload, getPublicUrl: getPublicUrlMock });

  return {
    client: {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: userId } },
          error: null,
        }),
      },
      storage: { from },
    },
    upload,
    from,
    getPublicUrlMock,
  };
}

describe("uploadDilemmaImage", () => {
  it("uploads a valid image under the signed-in user's path", async () => {
    const { client, from, upload } = makeClient();
    const file = makeFile(2 * 1024 * 1024, "image/jpeg");

    const result = await uploadDilemmaImage(file, client);

    expect(result.path).toMatch(new RegExp(`^${userId}/[0-9a-f-]{36}\\.jpg$`));
    expect(from).toHaveBeenCalledWith(DILEMMA_IMAGES_BUCKET);
    expect(upload).toHaveBeenCalledWith(result.path, file, {
      contentType: "image/jpeg",
      upsert: false,
    });
  });

  it("rejects images over 5MB before upload", async () => {
    const { client, upload } = makeClient();
    const file = makeFile(MAX_IMAGE_BYTES + 1, "image/jpeg");

    await expect(uploadDilemmaImage(file, client)).rejects.toThrow("5MB");
    expect(upload).not.toHaveBeenCalled();
  });

  it("rejects non-image MIME types before upload", async () => {
    const { client, upload } = makeClient();
    const file = makeFile(1024, "application/pdf", "document.pdf");

    await expect(uploadDilemmaImage(file, client)).rejects.toThrow("Unsupported image type");
    expect(upload).not.toHaveBeenCalled();
  });
});

describe("getPublicUrl", () => {
  it("returns the Supabase public URL for a stored path", () => {
    const { client, getPublicUrlMock } = makeClient();

    const url = getPublicUrl("user-id/image.jpg", client);

    expect(url).toBe("http://127.0.0.1:54321/storage/v1/object/public/dilemma-images/path.jpg");
    expect(getPublicUrlMock).toHaveBeenCalledWith("user-id/image.jpg");
  });
});
