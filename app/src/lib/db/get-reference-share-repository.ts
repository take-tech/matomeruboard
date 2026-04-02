import { ReferenceShareRepository } from "./reference-share-repository";

export function getReferenceShareRepository(): ReferenceShareRepository {
  const tableName = process.env.REFERENCE_SHARE_TABLE_NAME;

  if (!tableName) {
    throw new Error("REFERENCE_SHARE_TABLE_NAME is not configured.");
  }

  return new ReferenceShareRepository({ tableName });
}
