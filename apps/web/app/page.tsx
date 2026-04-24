export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-screen-sm flex-col justify-center px-6 py-12">
      <section className="space-y-5">
        <p className="text-sm font-semibold text-emerald-700">PickIt</p>
        <h1 className="text-4xl font-bold tracking-normal text-neutral-950">
          사도 될지, 함께 판단해요.
        </h1>
        <p className="text-base leading-7 text-neutral-700">
          구매 직전의 고민을 올리고 짧은 투표와 한마디로 소비 결정을 검증하는
          모바일 웹 MVP입니다.
        </p>
      </section>
    </main>
  );
}
