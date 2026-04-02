import Link from "next/link";
import { notFound } from "next/navigation";

import { getReferenceShareRepository } from "../../../lib/db";

type ViewerPageProps = {
  params: Promise<{ listId: string }>;
};

export default async function ViewerPage({ params }: ViewerPageProps) {
  const { listId } = await params;
  const repository = getReferenceShareRepository();
  const loadedList = await repository.getList(listId);

  if (!loadedList) {
    notFound();
  }
  const list = loadedList;

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Viewer</p>
        <h1 className="title">{list.title}</h1>
        {list.description ? <p className="lead">{list.description}</p> : null}
        <div className="actions">
          <Link className="link-button secondary" href="/">
            トップへ戻る
          </Link>
        </div>
      </section>

      <section className="section">
        <h2>動画一覧</h2>
        {list.videos.length === 0 ? (
          <div className="empty">まだ動画は登録されていません。</div>
        ) : (
          <div className="card-list">
            {list.videos.map((video) => (
              <article className="video-card" key={video.id}>
                <iframe
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  src={video.embedUrl}
                  title={`${video.platform}-${video.id}`}
                />
                <div className="meta">
                  <span>{video.platform}</span>
                  <span>#{video.sortOrder}</span>
                </div>
                {video.comment ? <p>{video.comment}</p> : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
