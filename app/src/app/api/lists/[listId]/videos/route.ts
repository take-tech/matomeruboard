import { NextResponse } from "next/server";

import { getReferenceShareRepository } from "../../../../../lib/db";
import {
  UnsupportedVideoUrlError,
  parseVideoUrl,
} from "../../../../../lib/video-url";

type AddVideoRequestBody = {
  videoUrl?: string;
  comment?: string;
};

type RouteContext = {
  params: Promise<{ listId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { listId } = await context.params;
  const body = (await request.json()) as AddVideoRequestBody;
  const repository = getReferenceShareRepository();

  if (!body.videoUrl?.trim()) {
    return NextResponse.json(
      { error: "videoUrl is required." },
      { status: 400 },
    );
  }

  const listMeta = await repository.getListMeta(listId);
  if (!listMeta) {
    return NextResponse.json({ error: "List not found." }, { status: 404 });
  }

  try {
    const parsedVideo = parseVideoUrl(body.videoUrl);
    const sortOrder = await repository.getNextSortOrder(listId);
    const created = await repository.addVideo(
      listId,
      parsedVideo,
      {
        videoUrl: body.videoUrl,
        comment: body.comment,
      },
      sortOrder,
    );

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (error) {
    if (error instanceof UnsupportedVideoUrlError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }
}
