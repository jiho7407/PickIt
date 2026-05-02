"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { LIFE_STAGE_OPTIONS, type LifeStageValue } from "@/features/onboarding/onboarding-trigger";
import { uploadDilemmaImage } from "@/lib/storage";
import type { CreateVoteActionState } from "./create-vote-actions";
import type { CreateVoteType } from "./create-vote-schema";
import { ChevronLeftIcon } from "./icons";

type CreateVoteFormProps = {
  action: (
    state: CreateVoteActionState,
    formData: FormData,
  ) => CreateVoteActionState | Promise<CreateVoteActionState>;
};

type Step = "type" | "image" | "details" | "situation";

const initialActionState: CreateVoteActionState = { status: "idle" };
const DEFAULT_PRICE = 50000;
const PRICE_STEP = 10000;
const MIN_SITUATION_LENGTH = 10;
const MAX_SITUATION_LENGTH = 200;

function formatKrwInput(price: number) {
  return new Intl.NumberFormat("ko-KR").format(price);
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function CreateCloseIcon() {
  return (
    <span aria-hidden="true" className="relative inline-block h-6 w-6">
      <span className="absolute left-[5px] top-[5px] h-3.5 w-3.5">
        <img alt="" className="h-full w-full max-w-none" src="/votes/create/close-stem-a.svg" />
      </span>
      <span className="absolute left-[5px] top-[5px] h-3.5 w-3.5 rotate-90">
        <img alt="" className="h-full w-full max-w-none" src="/votes/create/close-stem-b.svg" />
      </span>
    </span>
  );
}

function PriceIcon({ kind }: { kind: "minus" | "plus" }) {
  return (
    <span aria-hidden="true" className="relative inline-block h-6 w-6">
      <span className="absolute left-[2.1px] top-[2.1px] flex h-[19.8px] w-[19.8px] items-center justify-center">
        <span className="block h-3.5 w-3.5 -rotate-[135deg] scale-y-[-1]">
          <img alt="" className="h-full w-full max-w-none" src="/votes/create/price-line-b.svg" />
        </span>
      </span>
      {kind === "plus" ?
        <span className="absolute left-[2.1px] top-[2.1px] flex h-[19.8px] w-[19.8px] items-center justify-center">
          <span className="block h-3.5 w-3.5 rotate-45">
            <img alt="" className="h-full w-full max-w-none" src="/votes/create/price-line-a.svg" />
          </span>
        </span>
      : null}
    </span>
  );
}

function TypeIllustration({ type }: { type: CreateVoteType }) {
  if (type === "ab") {
    return (
      <span aria-hidden="true" className="relative block h-[88px] w-[130px]">
        <img
          alt=""
          className="absolute left-[11.88px] top-[11.28px] h-[32.516px] w-[41.95px]"
          src="/votes/create/type-ab-shirt-a.svg"
        />
        <img
          alt=""
          className="absolute left-[77.2px] top-[11.28px] h-[32.516px] w-[41.95px]"
          src="/votes/create/type-ab-shirt-b.svg"
        />
        <img
          alt=""
          className="absolute left-[19px] top-[50.48px] h-[27.317px] w-[27.317px]"
          src="/votes/create/type-ab-circle.svg"
        />
        <img
          alt=""
          className="absolute left-[84.33px] top-[50.48px] h-[27.317px] w-[27.317px]"
          src="/votes/create/type-ab-circle.svg"
        />
        <img
          alt=""
          className="absolute left-[27.05px] top-[60.96px] h-[7.932px] w-[10.954px] rotate-180"
          src="/votes/create/type-ab-check-a.svg"
        />
        <img
          alt=""
          className="absolute left-[92.38px] top-[60.96px] h-[7.932px] w-[10.954px] rotate-180"
          src="/votes/create/type-ab-check-b.svg"
        />
      </span>
    );
  }

  return (
    <span aria-hidden="true" className="relative block h-[88px] w-[130px]">
      <img
        alt=""
        className="absolute left-[44.4px] top-[11.28px] h-[32.516px] w-[41.95px]"
        src="/votes/create/type-buy-shirt.svg"
      />
      <img
        alt=""
        className="absolute left-[32.07px] top-[50.48px] h-[27.317px] w-[27.317px]"
        src="/votes/create/type-buy-circle-left.svg"
      />
      <img
        alt=""
        className="absolute left-[71.26px] top-[50.48px] h-[27.317px] w-[27.317px]"
        src="/votes/create/type-buy-circle-right.svg"
      />
    </span>
  );
}

function SuccessIcon() {
  return (
    <span aria-hidden="true" className="relative inline-block h-[54px] w-[54px] -rotate-[15deg]">
      <img
        alt=""
        className="absolute left-[5px] top-[5px] h-[36.375px] w-[36.375px]"
        src="/votes/create/success-body.svg"
      />
      <img
        alt=""
        className="absolute left-[28.58px] top-[28.57px] h-[12.791px] w-[12.791px]"
        src="/votes/create/success-check.svg"
      />
    </span>
  );
}

function TopBar({ onBack, isFirstStep }: { onBack: () => void; isFirstStep: boolean }) {
  return (
    <header className="h-[94px] bg-white">
      <div className="flex h-full items-end justify-between px-5 pb-[10px]">
        {isFirstStep ?
          <span className="h-6 w-6" aria-hidden="true" />
        : <button
            type="button"
            aria-label="이전 단계"
            className="-ml-1 grid h-8 w-8 place-items-center rounded-full text-[#94a3b8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
            onClick={onBack}
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>}
        <h1 className="text-center text-lg font-semibold leading-[1.3] text-[#334155]">
          투표 만들기
        </h1>
        {isFirstStep ?
          <Link
            href="/"
            aria-label="투표 만들기 닫기"
            className="grid h-8 w-8 place-items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
          >
            <CreateCloseIcon />
          </Link>
        : <span className="h-6 w-6" aria-hidden="true" />}
      </div>
    </header>
  );
}

function ProgressIndicator({ step }: { step: Step }) {
  if (step === "type") {
    return null;
  }

  const activeIndex = step === "image" ? 0 : step === "details" ? 1 : 2;

  return (
    <div className="mx-5 flex h-1.5 gap-3">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={`h-1.5 min-w-0 flex-1 rounded-xl ${
            activeIndex === index ? "bg-[#32cfc6]" : "bg-[#dfe5ed]"
          }`}
        />
      ))}
    </div>
  );
}

function BottomAction({
  children,
  disabled,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <div className="sticky bottom-0 z-20 bg-white px-5 py-[10px]">
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`h-14 w-full rounded-xl px-6 py-2 text-lg font-semibold leading-[1.3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6] ${
          disabled ? "bg-[#f1f5f9] text-[#64748b]" : "bg-[#32cfc6] text-[#f9f9f9]"
        }`}
      >
        {children}
      </button>
    </div>
  );
}

function TypeButton({
  active,
  label,
  onClick,
  type,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  type: CreateVoteType;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-[151px] w-[154px] flex-col items-start rounded-xl border bg-white px-3 py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6] ${
        active ? "border-[#32cfc6]" : "border-[#dfe5ed]"
      }`}
    >
      <span
        className={`w-full text-center text-base font-semibold leading-[1.3] ${
          active ? "text-[#1fa89f]" : "text-[#334155]"
        }`}
      >
        {label}
      </span>
      <span className="mt-2 flex w-full justify-center">
        <TypeIllustration type={type} />
      </span>
    </button>
  );
}

function TypeStep({
  selectedType,
  setSelectedType,
}: {
  selectedType: CreateVoteType | null;
  setSelectedType: (type: CreateVoteType) => void;
}) {
  return (
    <section className="px-5 pt-8">
      <h2 className="text-xl font-bold leading-[1.3] text-[#0f172a]">
        투표 종류를 선택해주세요
      </h2>
      <div className="mt-8 flex gap-3">
        <TypeButton
          active={selectedType === "buy_skip"}
          label="살까 말까 투표"
          type="buy_skip"
          onClick={() => setSelectedType("buy_skip")}
        />
        <TypeButton
          active={selectedType === "ab"}
          label="A/B 투표"
          type="ab"
          onClick={() => setSelectedType("ab")}
        />
      </div>
    </section>
  );
}

function ImageStep({
  imagePreviewUrl,
  isUploading,
  onImageChange,
  onRemoveImage,
}: {
  imagePreviewUrl: string | null;
  isUploading: boolean;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}) {
  const inputId = "create-vote-image";

  return (
    <section className="px-5 pt-[18px]">
      <h2 className="text-xl font-bold leading-[1.3] text-[#0f172a]">
        투표 내용을 입력해주세요
      </h2>
      <div className="mt-8 flex w-[153px] flex-col gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold leading-[1.3] text-[#334155]">사진 첨부</p>
          <p className="whitespace-nowrap text-xs leading-[1.3] text-[#64748b]">
            아직 1개의 사진만 첨부 가능해요
          </p>
        </div>
        <input
          id={inputId}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={onImageChange}
        />
        {imagePreviewUrl ?
          <div className="relative h-[100px] w-[100px] overflow-hidden rounded-lg border border-[#dfe5ed] bg-[#f1f5f9]">
            <img alt="" className="h-full w-full object-cover" src={imagePreviewUrl} />
            <button
              type="button"
              aria-label="첨부 이미지 삭제"
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/90 shadow-sm"
              onClick={onRemoveImage}
            >
              <CreateCloseIcon />
            </button>
          </div>
        : <label
            htmlFor={inputId}
            aria-label="이미지 업로드"
            className="relative grid h-[100px] w-[100px] cursor-pointer place-items-center rounded-lg border border-[#dfe5ed] bg-[#f1f5f9] focus-within:ring-2 focus-within:ring-[#32cfc6]"
          >
            <img alt="" className="h-5 w-5" src="/votes/create/upload-plus.svg" />
          </label>}
        {isUploading ?
          <p className="text-xs leading-[1.3] text-[#64748b]">업로드 중</p>
        : null}
      </div>
    </section>
  );
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold leading-[1.3] text-[#334155]">
      <span>{label}</span>
      {children}
    </label>
  );
}

function DetailsStep({
  price,
  productName,
  setPrice,
  setProductName,
}: {
  price: number;
  productName: string;
  setPrice: (price: number) => void;
  setProductName: (productName: string) => void;
}) {
  return (
    <section className="px-5 pt-[18px]">
      <h2 className="text-xl font-bold leading-[1.3] text-[#0f172a]">
        투표 내용을 입력해주세요
      </h2>
      <div className="mt-8 flex flex-col gap-[22px]">
        <Field label="제품명">
          <input
            value={productName}
            onChange={(event) => setProductName(event.target.value)}
            placeholder="제품명을 입력해주세요"
            className="h-[51px] rounded-xl border border-[#dfe5ed] bg-white px-3 py-4 text-base font-normal leading-[1.3] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#32cfc6]"
          />
        </Field>
        <div className="flex items-start gap-2">
          <div className="w-[202px]">
            <Field label="가격">
              <input
                value={formatKrwInput(price)}
                inputMode="numeric"
                onChange={(event) => {
                  const digits = onlyDigits(event.target.value);
                  setPrice(digits ? Number(digits) : 0);
                }}
                placeholder="가격을 입력해주세요"
                className="h-[51px] rounded-xl border border-[#dfe5ed] bg-white px-3 py-4 text-base font-normal leading-[1.3] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#32cfc6]"
              />
            </Field>
            <p className="mt-1 pl-3 text-xs leading-[1.3] text-[#64748b]">
              +,- 버튼을 통해 가격을 조정해보세요
            </p>
          </div>
          <div className="mt-[21px] flex gap-2">
            <button
              type="button"
              aria-label="가격 1만원 감소"
              className="grid h-[51px] w-[51px] place-items-center rounded-xl border border-[#dfe5ed] bg-[#f8faff] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
              onClick={() => setPrice(Math.max(0, price - PRICE_STEP))}
            >
              <PriceIcon kind="minus" />
            </button>
            <button
              type="button"
              aria-label="가격 1만원 증가"
              className="grid h-[51px] w-[51px] place-items-center rounded-xl border border-[#dfe5ed] bg-[#f8faff] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
              onClick={() => setPrice(price + PRICE_STEP)}
            >
              <PriceIcon kind="plus" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SituationStep({
  selectedCategories,
  setSelectedCategories,
  setSituation,
  situation,
}: {
  selectedCategories: LifeStageValue[];
  setSelectedCategories: (categories: LifeStageValue[]) => void;
  setSituation: (situation: string) => void;
  situation: string;
}) {
  function toggleCategory(value: LifeStageValue) {
    if (selectedCategories.includes(value)) {
      setSelectedCategories(selectedCategories.filter((category) => category !== value));
      return;
    }
    setSelectedCategories([...selectedCategories, value]);
  }

  const trimmedLength = situation.trim().length;
  const isSituationValid = trimmedLength >= MIN_SITUATION_LENGTH;
  const remaining = Math.max(0, MIN_SITUATION_LENGTH - trimmedLength);
  const hasCategory = selectedCategories.length > 0;

  return (
    <section className="px-5 pt-[18px]">
      <h2 className="text-xl font-bold leading-[1.3] text-[#0f172a]">
        투표 내용을 입력해주세요
      </h2>
      <div className="mt-8 flex flex-col gap-6">
        <label className="flex flex-col gap-1">
          <span className="flex items-center gap-2 text-sm font-semibold leading-[1.3] text-[#334155]">
            상황
            <span className="text-xs font-normal text-[#94a3b8]">
              {situation.length}/<span className="font-semibold">200</span>
            </span>
          </span>
          <textarea
            value={situation}
            maxLength={MAX_SITUATION_LENGTH}
            onChange={(event) => setSituation(event.target.value)}
            placeholder={"구매를 고민하게 된 상황을 알려주세요.\n구체적일수록 투표율이 높아져요!"}
            className="h-[260px] resize-none rounded-xl border border-[#dfe5ed] bg-white px-3 py-4 text-base font-normal leading-[1.3] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#32cfc6]"
          />
          <span
            className={`text-xs leading-[1.3] ${
              isSituationValid ? "text-[#64748b]" : "text-[#ff6842]"
            }`}
          >
            {isSituationValid ?
              "상황 입력이 완료됐어요"
            : `${MIN_SITUATION_LENGTH}자 이상 입력해주세요 (${remaining}자 남음)`}
          </span>
        </label>
        <div className="flex flex-col gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold leading-[1.3] text-[#334155]">태그</p>
            <p className="text-xs leading-[1.3] text-[#64748b]">
              투표를 보여줄 주요 대상을 선택해주세요 (중복 가능)
            </p>
          </div>
          <div className="flex gap-2">
            {LIFE_STAGE_OPTIONS.map((option) => {
              const active = selectedCategories.includes(option.value);
              return (
                <button
                  type="button"
                  key={option.value}
                  aria-pressed={active}
                  onClick={() => toggleCategory(option.value)}
                  className={`rounded-lg px-3 py-2 text-sm leading-[1.3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6] ${
                    active ?
                      "bg-[#64748b] font-semibold text-white"
                    : "border border-[#dfe5ed] bg-white font-normal text-[#64748b]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          {hasCategory ?
            null
          : <p className="text-xs leading-[1.3] text-[#ff6842]">
              태그를 1개 이상 선택해주세요
            </p>
          }
        </div>
      </div>
    </section>
  );
}

function SuccessScreen({ dilemmaId }: { dilemmaId: string }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[360px] flex-col bg-white text-[#0f172a] shadow-[0_0_0_1px_rgba(15,23,42,0.04)]">
      <div className="flex flex-1 flex-col items-center px-5 pt-[275px]">
        <SuccessIcon />
        <h1 className="mt-3 text-center text-xl font-bold leading-[1.3] text-[#0f172a]">
          투표를 생성했습니다
        </h1>
      </div>
      <div className="sticky bottom-0 bg-white px-5 py-[10px]">
        <Link
          href={`/votes/${dilemmaId}`}
          className="flex h-14 w-full items-center justify-center rounded-xl bg-[#32cfc6] px-6 py-2 text-lg font-semibold leading-[1.3] text-[#f9f9f9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
        >
          내가 만든 투표 보기
        </Link>
      </div>
    </main>
  );
}

export function CreateVoteForm({ action }: CreateVoteFormProps) {
  const [state, formAction] = useActionState(action, initialActionState);
  const [step, setStep] = useState<Step>("type");
  const [selectedType, setSelectedType] = useState<CreateVoteType | null>(null);
  const [imagePath, setImagePath] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState(DEFAULT_PRICE);
  const [situation, setSituation] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<LifeStageValue[]>([]);
  const previousObjectUrl = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previousObjectUrl.current) {
        URL.revokeObjectURL(previousObjectUrl.current);
      }
    };
  }, []);

  const hasImage = imagePreviewUrl !== null && imagePath.length > 0;
  const hasDetails = productName.trim().length > 0 && price > 0;
  const hasSituation =
    situation.trim().length >= MIN_SITUATION_LENGTH && selectedCategories.length > 0;
  const primaryCategory = selectedCategories[0] ?? "";
  const isBuySkip = selectedType === "buy_skip";
  const canSubmit = isBuySkip && hasImage && hasDetails && hasSituation;

  const hiddenTitle = useMemo(() => situation.trim().slice(0, 80), [situation]);

  function goBack() {
    if (step === "image") {
      setStep("type");
    } else if (step === "details") {
      setStep("image");
    } else if (step === "situation") {
      setStep("details");
    }
  }

  async function onImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (previousObjectUrl.current) {
      URL.revokeObjectURL(previousObjectUrl.current);
    }

    const objectUrl = URL.createObjectURL(file);
    previousObjectUrl.current = objectUrl;
    setImagePreviewUrl(objectUrl);
    setUploadError(null);
    setIsUploading(true);

    try {
      const result = await uploadDilemmaImage(file);
      setImagePath(result.path);
    } catch (error) {
      const fallback =
        "이미지를 업로드하지 못했어요. 로그인 상태를 확인하고 다시 시도해주세요.";
      const message = error instanceof Error && error.message ? error.message : fallback;
      console.error("[uploadDilemmaImage] failed", message);
      setImagePath("");
      setImagePreviewUrl(null);
      if (previousObjectUrl.current) {
        URL.revokeObjectURL(previousObjectUrl.current);
        previousObjectUrl.current = null;
      }
      setUploadError(fallback);
      event.target.value = "";
    } finally {
      setIsUploading(false);
    }
  }

  function onRemoveImage() {
    if (previousObjectUrl.current) {
      URL.revokeObjectURL(previousObjectUrl.current);
      previousObjectUrl.current = null;
    }
    setImagePath("");
    setImagePreviewUrl(null);
    setUploadError(null);
  }

  if (state.status === "success" && state.dilemmaId) {
    return <SuccessScreen dilemmaId={state.dilemmaId} />;
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[360px] flex-col bg-white text-[#0f172a] shadow-[0_0_0_1px_rgba(15,23,42,0.04)]">
      <TopBar isFirstStep={step === "type"} onBack={goBack} />
      <ProgressIndicator step={step} />
      <form className="flex flex-1 flex-col" action={formAction}>
        <input type="hidden" name="voteType" value={selectedType ?? ""} />
        <input type="hidden" name="title" value={hiddenTitle} />
        <input type="hidden" name="productName" value={productName} />
        <input type="hidden" name="price" value={price} />
        <input type="hidden" name="category" value={primaryCategory} />
        <input type="hidden" name="situation" value={situation} />
        <input type="hidden" name="imagePath" value={imagePath} />

        <div className="flex-1">
          {step === "type" ?
            <TypeStep selectedType={selectedType} setSelectedType={setSelectedType} />
          : null}
          {step === "image" ?
            <ImageStep
              imagePreviewUrl={imagePreviewUrl}
              isUploading={isUploading}
              onImageChange={onImageChange}
              onRemoveImage={onRemoveImage}
            />
          : null}
          {step === "details" ?
            <DetailsStep
              price={price}
              productName={productName}
              setPrice={setPrice}
              setProductName={setProductName}
            />
          : null}
          {step === "situation" ?
            <SituationStep
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              setSituation={setSituation}
              situation={situation}
            />
          : null}
        </div>

        {uploadError ?
          <p className="px-5 pb-2 text-sm leading-[1.3] text-[#ff6842]">{uploadError}</p>
        : null}
        {state.status === "error" && state.message ?
          <p className="px-5 pb-2 text-sm leading-[1.3] text-[#ff6842]">{state.message}</p>
        : null}

        {step === "type" ?
          <BottomAction
            disabled={!selectedType || selectedType !== "buy_skip"}
            onClick={() => setStep("image")}
          >
            선택 완료
          </BottomAction>
        : null}
        {step === "image" ?
          <BottomAction disabled={!hasImage || isUploading} onClick={() => setStep("details")}>
            다음
          </BottomAction>
        : null}
        {step === "details" ?
          <BottomAction disabled={!hasDetails} onClick={() => setStep("situation")}>
            다음
          </BottomAction>
        : null}
        {step === "situation" ?
          <BottomAction disabled={!canSubmit} type="submit">
            투표 업로드하기
          </BottomAction>
        : null}
      </form>
    </main>
  );
}
