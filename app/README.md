# Matomeruboard App Skeleton

Minimal TypeScript foundation for the Next.js app layer.

## Included modules

- `src/lib/video-url/parse-video-url.ts`
- `src/lib/db/reference-share-repository.ts`
- `src/types/reference-share.ts`
- `src/app/api/`
- `src/app/page.tsx`
- `src/app/p/[listId]/page.tsx`

## Setup

```bash
npm install
npm run dev
npm run typecheck
```

## Notes

- `parseVideoUrl()` supports the MVP URL patterns documented in `docs/`
- `ReferenceShareRepository` targets the DynamoDB table created by CDK
- Route Handlers and minimal pages are scaffolded on top of this foundation
