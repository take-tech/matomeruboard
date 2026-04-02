# Video Reference Share Service - MVPアーキテクチャ図

`docs/video-reference-share-mvp-design.md` をもとに、MVP 実装の責務分離とデータの流れを図式化したもの。

## 1. 全体アーキテクチャ

```mermaid
flowchart LR
    user[利用者]

    subgraph vercel[Vercel / Next.js Application]
        editor["Editor Page<br/>/edit/:list_id"]
        viewer["Viewer Page<br/>/p/:list_id"]
        api["Route Handlers / Server Actions<br/>/api/lists<br/>/api/lists/:id<br/>/api/lists/:id/videos"]
        domain["Domain Logic<br/>URL解析<br/>埋め込みURL生成<br/>入力バリデーション<br/>HTMLエスケープ"]
    end

    subgraph aws[AWS]
        db[(DynamoDB)]
    end

    subgraph external[外部動画プラットフォーム]
        youtube[YouTube Embed]
        niconico[ニコニコ動画 Embed]
    end

    user -->|リスト作成・編集| editor
    user -->|共有URLを閲覧| viewer

    editor --> api
    viewer --> api
    api --> domain
    domain --> db
    db --> domain
    domain --> api

    viewer -->|iframe埋め込み| youtube
    viewer -->|iframe埋め込み| niconico
    editor -->|プレビュー用iframe| youtube
    editor -->|プレビュー用iframe| niconico
```

## 2. 論理コンポーネント

```mermaid
flowchart TB
    subgraph presentation[Presentation Layer]
        editorUI["Editor UI<br/>- リスト名入力<br/>- 説明文入力<br/>- URL追加<br/>- コメント編集<br/>- 並び替え"]
        viewerUI["Viewer UI<br/>- タイトル表示<br/>- 説明文表示<br/>- 動画埋め込み<br/>- コメント表示"]
    end

    subgraph application[Application Layer]
        listService["List Service<br/>- リスト作成<br/>- リスト取得"]
        videoService["Video Service<br/>- 動画追加<br/>- 更新<br/>- 削除<br/>- sort_order管理"]
    end

    subgraph domain[Domain Rules]
        parser["Video URL Parser<br/>- YouTube URL判定<br/>- ニコニコURL判定<br/>- video_id抽出"]
        embedBuilder[Embed URL Builder]
        validator["Input Validator<br/>- 対応ドメイン制限<br/>- 必須項目検証"]
        sanitizer["Output Sanitizer<br/>- コメントのエスケープ"]
    end

    subgraph persistence[Persistence Layer]
        repo[List / Video Repository]
        dynamo[(DynamoDB)]
    end

    editorUI --> listService
    editorUI --> videoService
    viewerUI --> listService

    listService --> validator
    videoService --> parser
    videoService --> embedBuilder
    videoService --> validator
    listService --> sanitizer
    videoService --> sanitizer

    listService --> repo
    videoService --> repo
    repo --> dynamo
```

## 3. データモデル関係

```mermaid
erDiagram
    LIST ||--o{ VIDEO : contains

    LIST {
        string id PK
        string title
        string description
        string created_at
        string updated_at
    }

    VIDEO {
        string id PK
        string list_id FK
        string platform
        string video_url
        string video_id
        string embed_url
        string comment
        number sort_order
        string created_at
        string updated_at
    }
```

## 4. 主要フロー

### 4.1 リスト作成から共有まで

```mermaid
sequenceDiagram
    actor User as 利用者
    participant Editor as Editor Page
    participant API as Next.js API
    participant Logic as Domain Logic
    participant DB as DynamoDB

    User->>Editor: タイトル・説明文を入力
    Editor->>API: POST /api/lists
    API->>Logic: リスト作成
    Logic->>DB: List保存
    DB-->>Logic: list_id
    Logic-->>API: share_url
    API-->>Editor: 作成結果返却

    User->>Editor: 動画URLとコメントを追加
    Editor->>API: POST /api/lists/{id}/videos
    API->>Logic: URL解析・バリデーション
    Logic->>Logic: platform判定 / video_id抽出 / embed_url生成
    Logic->>DB: Video保存
    DB-->>Logic: 保存完了
    Logic-->>API: video_id返却
    API-->>Editor: 画面更新

    User->>Editor: 共有リンクをコピー
```

### 4.2 閲覧フロー

```mermaid
sequenceDiagram
    actor ViewerUser as 閲覧者
    participant Viewer as Viewer Page
    participant API as Next.js API
    participant DB as DynamoDB
    participant Platform as YouTube / ニコニコ動画

    ViewerUser->>Viewer: 共有URLにアクセス
    Viewer->>API: GET /api/lists/{id}
    API->>DB: List + Videos取得
    DB-->>API: タイトル・説明文・動画一覧
    API-->>Viewer: 表示データ返却
    Viewer->>Platform: iframeで埋め込み動画を読み込み
    Platform-->>Viewer: 動画プレイヤー表示
```

## 5. インフラ観点の補足

- フロントエンドと API は Next.js に同居させ、MVP の実装速度を優先する
- 永続化対象はメタデータのみで、動画ファイル自体は保持しない
- 外部動画プラットフォームは iframe 埋め込みのみ利用し、コンテンツ配信責務は持たない
- セキュリティ上の要点は URL 許可制、コメントのエスケープ、認証なし編集導線の暫定運用である

## 6. この図で表している前提

- 認証は未導入のため、MVP の編集権限は強くない
- API は REST ベースだが、Next.js の Route Handlers / Server Actions のどちらでも成立する粒度で表現している
- DynamoDB の物理テーブル設計までは踏み込まず、MVP に必要な論理関係を優先している
