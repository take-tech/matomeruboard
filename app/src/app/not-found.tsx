import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Not Found</p>
        <h1 className="title">ページが見つかりませんでした</h1>
        <p className="lead">
          URL が間違っているか、対象のリストがまだ作成されていない可能性があります。
        </p>
        <div className="actions">
          <Link className="link-button" href="/">
            トップへ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
