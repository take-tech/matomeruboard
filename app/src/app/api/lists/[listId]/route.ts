import { NextResponse } from "next/server";

import { getReferenceShareRepository } from "../../../../lib/db";

type RouteContext = {
  params: Promise<{ listId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { listId } = await context.params;
  const repository = getReferenceShareRepository();
  const list = await repository.getList(listId);

  if (!list) {
    return NextResponse.json({ error: "List not found." }, { status: 404 });
  }

  return NextResponse.json(list);
}
