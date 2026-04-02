import Link from "next/link";

const sampleListPayload = `{
  "title": "参考曲まとめ",
  "description": "サビの抜け感を参考にしたい曲です"
}`;

const sampleVideoPayload = `{
  "videoUrl": "https://www.nicovideo.jp/watch/sm12345678",
  "comment": "間奏前の盛り上がり方を参考にしたい"
}`;

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">MatomeruBoard MVP</p>
        <h1 className="title">動画リファレンスを、文脈ごと共有する。</h1>
        <p className="lead">
          YouTube とニコニコ動画の URL をまとめ、コメント付きで 1 ページに集約する
          MVP の土台です。まずは API と Viewer を触れる状態まで整えています。
        </p>
        <div className="actions">
          <Link className="link-button" href="/edit">
            Editor を開く
          </Link>
        </div>
      </section>

      <section className="section">
        <h2>利用できる API</h2>
        <div className="stack">
          <div>
            <p className="hint">リスト作成</p>
            <p className="mono">POST /api/lists</p>
            <pre className="mono">{sampleListPayload}</pre>
          </div>
          <div>
            <p className="hint">動画追加</p>
            <p className="mono">POST /api/lists/:id/videos</p>
            <pre className="mono">{sampleVideoPayload}</pre>
          </div>
          <div>
            <p className="hint">リスト取得</p>
            <p className="mono">GET /api/lists/:id</p>
          </div>
        </div>
      </section>
    </main>
  );
}
