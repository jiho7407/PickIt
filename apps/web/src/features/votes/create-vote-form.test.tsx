import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { uploadDilemmaImage } from "@/lib/storage";
import { CreateVoteForm } from "./create-vote-form";

vi.mock("@/lib/storage", () => ({
  uploadDilemmaImage: vi.fn(),
}));

describe("CreateVoteForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "URL",
      Object.assign(URL, {
        createObjectURL: vi.fn(() => "blob:preview"),
        revokeObjectURL: vi.fn(),
      }),
    );
    vi.mocked(uploadDilemmaImage).mockResolvedValue({ path: "user-1/coat.jpg" });
  });

  it("keeps the type CTA disabled until a buy/skip type is selected", async () => {
    const user = userEvent.setup();
    render(<CreateVoteForm action={vi.fn()} />);

    expect(screen.getByRole("button", { name: "선택 완료" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /살까 말까 투표/ }));

    expect(screen.getByRole("button", { name: "선택 완료" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "선택 완료" }));
    expect(screen.getByText("사진 첨부")).toBeInTheDocument();
  });

  it("requires one uploaded image before moving to product details", async () => {
    const user = userEvent.setup();
    render(<CreateVoteForm action={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /살까 말까 투표/ }));
    await user.click(screen.getByRole("button", { name: "선택 완료" }));

    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();

    const file = new File(["image"], "coat.png", { type: "image/png" });
    await user.upload(screen.getByLabelText("이미지 업로드"), file);

    await waitFor(() => expect(uploadDilemmaImage).toHaveBeenCalledWith(file));
    await waitFor(() => expect(screen.getByRole("button", { name: "다음" })).toBeEnabled());
  });

  it("surfaces an error and blocks the next step when storage upload fails", async () => {
    const user = userEvent.setup();
    vi.mocked(uploadDilemmaImage).mockRejectedValue(new Error("not signed in"));
    render(<CreateVoteForm action={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /살까 말까 투표/ }));
    await user.click(screen.getByRole("button", { name: "선택 완료" }));

    const file = new File(["image"], "coat.png", { type: "image/png" });
    await user.upload(screen.getByLabelText("이미지 업로드"), file);

    await waitFor(() => expect(uploadDilemmaImage).toHaveBeenCalledWith(file));
    await waitFor(() =>
      expect(screen.getByText(/이미지를 업로드하지 못했어요/)).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  });

  it("sets price to 50,000 won and changes it by 10,000 won", async () => {
    const user = userEvent.setup();
    render(<CreateVoteForm action={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /살까 말까 투표/ }));
    await user.click(screen.getByRole("button", { name: "선택 완료" }));
    const file = new File(["image"], "coat.png", { type: "image/png" });
    await user.upload(screen.getByLabelText("이미지 업로드"), file);
    await waitFor(() => expect(screen.getByRole("button", { name: "다음" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "다음" }));

    expect(screen.getByDisplayValue("50,000")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "가격 1만원 증가" }));
    expect(screen.getByDisplayValue("60,000")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "가격 1만원 감소" }));
    expect(screen.getByDisplayValue("50,000")).toBeInTheDocument();
  });
});
