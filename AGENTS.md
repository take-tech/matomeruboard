# AGENTS.md

このリポジトリは、動画リファレンス共有サービスの MVP を実装するためのものです。

## ディレクトリ構成

- `app/`: 将来の Next.js アプリに向けた TypeScript のアプリ層
- `infra/`: Python 製の AWS CDK プロジェクト
- `docs/`: 仕様書・設計書

## 現在のアーキテクチャ前提

- フロントエンド / API 実行基盤は `Next.js on Vercel`
- データベースは `DynamoDB`
- 対応動画プラットフォームは `YouTube` と `ニコニコ動画`
- DynamoDB のキー構成:
  - `list_id = LIST#{list_id}`
  - `item_key = META` はリスト本体
  - `item_key = VIDEO#{sort_order}#{video_block_id}` は動画アイテム

## 共通ルール

- 変更は小さく段階的に行うこと
- 挙動を変えたら、実装と docs を揃えること
- 明示的な依頼がない限り、MVP のスコープを広げないこと
- 認証、検索、その他の非MVP機能は、依頼されるまで追加しないこと

## App 側の方針

- 共通型は `app/src/types/` に置く
- URL 解析ロジックは `app/src/lib/video-url/` に置く
- 永続化ロジックは `app/src/lib/db/` に置く
- `parseVideoUrl()` は `docs/video-reference-share-mvp-design.md` に記載された URL パターンだけを受け付ける
- 未対応 URL は推測で補完せず、明確にエラーとして扱う

## Infra 側の方針

- Python CDK は `infra/` 配下でのみ扱う
- 再利用可能な CDK 部品は `infra/infra/constructs/` に置く
- Stack 定義は `infra/infra/stacks/` に置く
- MVP 規模に合う低コストなサーバーレス構成を優先する
- 特に指定がない限り、破壊的なインフラ設定は開発向けの安全な範囲に留める

## よく使うコマンド

### App

```bash
cd app
npm install
npm run typecheck
```

### Infra

```bash
cd infra
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
pytest
cdk synth
cdk diff
```

## 挙動変更時に確認する docs

- `docs/video-reference-share-mvp-design.md`
- `docs/video-reference-share-architecture.md`

## エージェント向けメモ

- このリポジトリはまだ土台段階の部分があるため、既存の構成を置き換えるより拡張を優先すること
- DynamoDB の item 構造を変える場合は、docs と app の repository 実装を同じ変更で更新すること
- 対応 URL パターンを追加する場合は、parser と docs を同じ変更で更新すること
