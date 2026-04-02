# AGENTS.md

このディレクトリは、インフラ用の Python AWS CDK プロジェクトです。

## 役割

- AWS インフラのコードはこのディレクトリ内で扱う
- アプリ実行時のロジックを CDK の construct に混ぜない

## 現在の構成

- `app.py`: CDK のエントリーポイント
- `infra/stacks/`: Stack 定義
- `infra/constructs/`: 再利用可能な CDK construct
- `tests/unit/`: インフラ用テスト

## ルール

- Python CDK の慣習に従う
- MVP 規模に合う低コストなサーバーレス構成を優先する
- DynamoDB テーブル設計は app と docs に揃える:
  - `list_id = LIST#{list_id}`
  - `item_key = META`
  - `item_key = VIDEO#{sort_order}#{video_block_id}`
- テーブル構造の前提を変える場合は、`../docs/` と `../app/` を同じ変更で更新する

## 注意点

- 明示的に本番向け強化を求められていない限り、開発しやすいインフラ設定を優先する
- DynamoDB の置き換えが発生する変更には注意する
- テーブルキー、テーブル名、`RemovalPolicy` を変える場合は、破壊的影響を説明する

## 確認コマンド

```bash
cd infra
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
pytest
cdk synth
cdk diff
```

## エージェント向けメモ

- 再利用可能なリソースは、stack を増やす前に `infra/constructs/` への切り出しを検討する
- Stack 名と Output 名は、人が見て分かりやすいものにする
