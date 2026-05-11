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

  it("creates an A/B vote with two images and two option detail steps", async () => {
    const user = userEvent.setup();
    const action = vi.fn(() => ({ status: "idle" as const }));
    vi.mocked(uploadDilemmaImage)
      .mockResolvedValueOnce({ path: "user-1/a.jpg" })
      .mockResolvedValueOnce({ path: "user-1/b.jpg" });

    render(<CreateVoteForm action={action} />);

    await user.click(screen.getByRole("button", { name: /A\/B 투표/ }));
    expect(screen.getByRole("button", { name: "선택 완료" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "선택 완료" }));

    await user.upload(
      screen.getByLabelText("선택지 A 이미지 업로드"),
      new File(["a"], "a.png", { type: "image/png" }),
    );
    await user.upload(
      screen.getByLabelText("선택지 B 이미지 업로드"),
      new File(["b"], "b.png", { type: "image/png" }),
    );

    await waitFor(() => expect(uploadDilemmaImage).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByRole("button", { name: "다음" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "다음" }));

    await user.type(screen.getByLabelText("선택지 A 제품명"), "A 코트");
    await user.click(screen.getByRole("button", { name: "다음" }));

    await user.type(screen.getByLabelText("선택지 B 제품명"), "B 코트");
    await user.click(screen.getByRole("button", { name: "가격 1만원 증가" }));
    await user.click(screen.getByRole("button", { name: "다음" }));

    await user.type(
      screen.getByLabelText(/상황/),
      "두 제품 중 어떤 걸 사야 할지 고민돼요.",
    );
    await user.click(screen.getByRole("button", { name: "대학생" }));
    await user.click(screen.getByRole("button", { name: "투표 업로드하기" }));

    await waitFor(() => expect(action).toHaveBeenCalled());
    const submittedFormData = action.mock.calls.at(-1)?.[1] as FormData;
    expect(Object.fromEntries(submittedFormData.entries())).toMatchObject({
      voteType: "ab",
      optionAName: "A 코트",
      optionBName: "B 코트",
      optionAPrice: "50000",
      optionBPrice: "60000",
      optionAImagePath: "user-1/a.jpg",
      optionBImagePath: "user-1/b.jpg",
      situation: "두 제품 중 어떤 걸 사야 할지 고민돼요.",
    });
  });

  it("does not invoke the action twice when the submit button is clicked rapidly", async () => {
    const user = userEvent.setup();
    const action = vi.fn(
      () => new Promise<{ status: "idle" }>(() => {}),
    );

    render(<CreateVoteForm action={action} />);

    await user.click(screen.getByRole("button", { name: /살까 말까 투표/ }));
    await user.click(screen.getByRole("button", { name: "선택 완료" }));

    await user.upload(
      screen.getByLabelText("이미지 업로드"),
      new File(["image"], "coat.png", { type: "image/png" }),
    );
    await waitFor(() => expect(screen.getByRole("button", { name: "다음" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "다음" }));

    await user.type(screen.getByLabelText("제품명"), "코트");
    await user.click(screen.getByRole("button", { name: "다음" }));

    await user.type(
      screen.getByLabelText(/상황/),
      "겨울 코트 살까 말까 고민됨.",
    );
    await user.click(screen.getByRole("button", { name: "대학생" }));

    const submitButton = screen.getByRole("button", { name: "투표 업로드하기" });
    await user.click(submitButton);
    await waitFor(() => expect(submitButton).toBeDisabled());
    await user.click(submitButton);
    await user.click(submitButton);

    expect(action).toHaveBeenCalledTimes(1);
  });
});
