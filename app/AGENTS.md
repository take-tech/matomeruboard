# AGENTS.md

このディレクトリは、将来の Next.js アプリに向けた TypeScript のアプリ層です。

## 役割

- ここではアプリケーションロジック、API ハンドラ、共通型を扱う
- AWS CDK のコードはこのディレクトリに置かない

## 現在の構成

- `src/types/`: 共通のドメイン型
- `src/lib/video-url/`: URL 解析と embed URL 生成
- `src/lib/db/`: DynamoDB repository 実装

## ルール

- `../docs/video-reference-share-mvp-design.md` にある MVP 仕様に従う
- YouTube とニコニコ動画の対応内容は、docs にある parser ルールと一致させる
- 未対応 URL は明確にエラーとして扱う
- 解析やマッピングのロジックは、小さな pure function を優先する
- DynamoDB のフィールド名は、デプロイ済みテーブル構成に合わせる:
  - `list_id`
  - `item_key`

## 永続化まわりを変更するとき

- `src/lib/db/reference-share-repository.ts` を更新する
- 関連する共通型を `src/types/` で更新する
- item 構造やアクセスパターンが変わる場合は docs も更新する

## 確認コマンド

```bash
cd app
npm install
npm run typecheck
```

## エージェント向けメモ

- この app 層はまだ土台段階であり、Next.js UI 全体は未実装
- 別構成へ置き換えるより、今ある土台を拡張することを優先する
