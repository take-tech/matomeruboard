"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CreateListResponse = {
  id: string;
  share_url: string;
};

export default function CreateEditorPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });

      const data = (await response.json()) as
        | CreateListResponse
        | { error?: string };

      if (!response.ok || !("id" in data)) {
        const errorMessage =
          "error" in data ? data.error : "リスト作成に失敗しました。";
        throw new Error(errorMessage || "リスト作成に失敗しました。");
      }

      router.push(`/edit/${data.id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "リスト作成に失敗しました。";
      setErrorMessage(message);
      setIsSubmitting(false);
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Editor</p>
        <h1 className="title">共有リストを作成する</h1>
        <p className="lead">
          タイトルと説明を登録すると、動画追加用の Editor ページへ進みます。
        </p>
      </section>

      <section className="section">
        <form className="stack" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="title">リスト名</label>
            <input
              id="title"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="参考曲まとめ"
              required
              value={title}
            />
          </div>

          <div className="field">
            <label htmlFor="description">説明文</label>
            <textarea
              id="description"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="サビの抜け感を参考にしたい曲です"
              value={description}
            />
          </div>

          {errorMessage ? (
            <div className="status error">{errorMessage}</div>
          ) : null}

          <div className="actions">
            <button className="button" disabled={isSubmitting} type="submit">
              {isSubmitting ? "作成中..." : "Editor を作成"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
