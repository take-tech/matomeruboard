"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { ReferenceShareList } from "../../../types/reference-share";

type EditorPageProps = {
  params: Promise<{ listId: string }>;
};

export default function EditListPage({ params }: EditorPageProps) {
  const [listId, setListId] = useState("");
  const [list, setList] = useState<ReferenceShareList | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function resolveParamsAndLoad() {
      const resolved = await params;
      setListId(resolved.listId);
      await fetchList(resolved.listId);
    }

    void resolveParamsAndLoad();
  }, [params]);

  async function fetchList(targetListId: string) {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/lists/${targetListId}`, {
        cache: "no-store",
      });

      const data = (await response.json()) as
        | ReferenceShareList
        | { error?: string };

      if (!response.ok || !("id" in data)) {
        const nextErrorMessage =
          "error" in data ? data.error : "リスト取得に失敗しました。";
        throw new Error(nextErrorMessage || "リスト取得に失敗しました。");
      }

      setList(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "リスト取得に失敗しました。";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddVideo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!listId) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/lists/${listId}/videos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl,
          comment,
        }),
      });

      const data = (await response.json()) as
        | { id: string }
        | { error?: string };

      if (!response.ok || !("id" in data)) {
        const nextErrorMessage =
          "error" in data ? data.error : "動画追加に失敗しました。";
        throw new Error(nextErrorMessage || "動画追加に失敗しました。");
      }

      setVideoUrl("");
      setComment("");
      setSuccessMessage("動画を追加しました。");
      await fetchList(listId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "動画追加に失敗しました。";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="actions spread">
          <div className="summary">
            <p className="eyebrow">Editor</p>
            <h1 className="title">{list?.title ?? "読み込み中..."}</h1>
            {list?.description ? <p className="lead">{list.description}</p> : null}
          </div>
          {listId ? (
            <div className="actions">
              <Link className="link-button secondary" href={`/p/${listId}`}>
                Viewer を開く
              </Link>
              <Link className="link-button secondary" href="/edit">
                新しいリストを作る
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <div className="split">
        <section className="section">
          <h2 className="section-title">動画を追加する</h2>
          <form className="stack" onSubmit={handleAddVideo}>
            <div className="field">
              <label htmlFor="video-url">動画 URL</label>
              <input
                id="video-url"
                onChange={(event) => setVideoUrl(event.target.value)}
                placeholder="https://youtu.be/... または https://www.nicovideo.jp/watch/..."
                required
                value={videoUrl}
              />
            </div>

            <div className="field">
              <label htmlFor="comment">コメント</label>
              <textarea
                id="comment"
                onChange={(event) => setComment(event.target.value)}
                placeholder="イントロの雰囲気が理想"
                value={comment}
              />
            </div>

            {errorMessage ? <div className="status error">{errorMessage}</div> : null}
            {successMessage ? (
              <div className="status success">{successMessage}</div>
            ) : null}

            <div className="actions">
              <button className="button" disabled={isSubmitting} type="submit">
                {isSubmitting ? "追加中..." : "動画を追加"}
              </button>
            </div>
          </form>
        </section>

        <section className="section">
          <h2 className="section-title">現在の動画一覧</h2>
          {isLoading ? (
            <div className="empty">読み込み中...</div>
          ) : list && list.videos.length > 0 ? (
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
          ) : (
            <div className="empty">まだ動画は登録されていません。</div>
          )}
        </section>
      </div>
    </main>
  );
}
