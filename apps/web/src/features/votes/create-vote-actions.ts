"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buildDilemmaTitle, createVoteSchema, type CreateVoteInput } from "./create-vote-schema";

export type CreateVoteActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  dilemmaId?: string;
};

function readOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function inputFromFormData(formData: FormData): Record<string, unknown> {
  return {
    voteType: readOptionalString(formData, "voteType"),
    title: readOptionalString(formData, "title"),
    productName: readOptionalString(formData, "productName"),
    price: readOptionalString(formData, "price"),
    category: readOptionalString(formData, "category"),
    situation: readOptionalString(formData, "situation"),
    imagePath: readOptionalString(formData, "imagePath"),
    optionAName: readOptionalString(formData, "optionAName"),
    optionBName: readOptionalString(formData, "optionBName"),
    optionAPrice: readOptionalString(formData, "optionAPrice"),
    optionBPrice: readOptionalString(formData, "optionBPrice"),
    optionAImagePath: readOptionalString(formData, "optionAImagePath"),
    optionBImagePath: readOptionalString(formData, "optionBImagePath"),
  };
}

function validationErrorState(): CreateVoteActionState {
  return {
    status: "error",
    message: "필수 정보를 확인해주세요.",
  };
}

function createDilemmaPayload(input: CreateVoteInput, authorId: string) {
  if (input.voteType === "ab") {
    return {
      author_id: authorId,
      category: "comparison",
      image_path: input.optionAImagePath ?? null,
      price: input.optionAPrice,
      product_name: input.optionAName,
      situation: input.situation,
      status: "open",
      title: buildDilemmaTitle(input),
      vote_type: "ab",
    };
  }

  return {
    author_id: authorId,
    category: input.category,
    image_path: input.imagePath ?? null,
    price: input.price,
    product_name: input.productName,
    situation: input.situation,
    status: "open",
    title: buildDilemmaTitle(input),
    vote_type: "buy_skip",
  };
}

export async function createVote(
  _state: CreateVoteActionState,
  formData: FormData,
): Promise<CreateVoteActionState> {
  const parsed = createVoteSchema.safeParse(inputFromFormData(formData));

  if (!parsed.success) {
    return validationErrorState();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.info("[createVote]", {
    voteType: parsed.data.voteType,
    authorMode: user ? "authenticated" : "unauthenticated",
  });

  if (!user) {
    return {
      status: "error",
      message: "로그인 후 투표를 만들 수 있어요.",
    };
  }

  const input = parsed.data;
  const { data: dilemma, error: dilemmaError } = await supabase
    .from("dilemmas")
    .insert(createDilemmaPayload(input, user.id))
    .select("id")
    .single();

  if (dilemmaError || !dilemma) {
    return {
      status: "error",
      message: "투표를 생성하지 못했어요. 잠시 후 다시 시도해주세요.",
    };
  }

  if (input.voteType === "ab") {
    const { error: optionsError } = await supabase.from("vote_options").insert([
      {
        dilemma_id: dilemma.id,
        image_path: input.optionAImagePath ?? null,
        label: input.optionAName,
        position: 1,
        price: input.optionAPrice,
      },
      {
        dilemma_id: dilemma.id,
        image_path: input.optionBImagePath ?? null,
        label: input.optionBName,
        position: 2,
        price: input.optionBPrice,
      },
    ]);

    if (optionsError) {
      await supabase.from("dilemmas").delete().eq("id", dilemma.id);
      return {
        status: "error",
        message: "투표 옵션을 생성하지 못했어요. 잠시 후 다시 시도해주세요.",
      };
    }
  }

  revalidatePath("/");
  revalidatePath(`/votes/${dilemma.id}`);

  return {
    status: "success",
    dilemmaId: dilemma.id,
    message: "투표를 생성했습니다.",
  };
}
