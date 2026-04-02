import { NextResponse } from "next/server";

import { getReferenceShareRepository } from "../../../lib/db";

type CreateListRequestBody = {
  title?: string;
  description?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as CreateListRequestBody;
  const title = body.title?.trim();

  if (!title) {
    return NextResponse.json(
      { error: "title is required." },
      { status: 400 },
    );
  }

  const repository = getReferenceShareRepository();
  const created = await repository.createList({
    title,
    description: body.description,
  });

  return NextResponse.json(
    {
      id: created.id,
      share_url: `/p/${created.id}`,
    },
    { status: 201 },
  );
}
