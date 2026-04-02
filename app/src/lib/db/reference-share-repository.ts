import {
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

import type {
  AddVideoInput,
  CreateListInput,
  ParsedVideoUrl,
  ReferenceShareList,
  VideoReference,
} from "../../types/reference-share";

type ReferenceShareRepositoryOptions = {
  tableName: string;
  client?: DynamoDBDocumentClient;
};

type ListMetaItem = {
  list_id: string;
  item_key: "META";
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

type VideoItem = {
  list_id: string;
  item_key: string;
  video_id: string;
  platform: "youtube" | "niconico";
  video_url: string;
  embed_url: string;
  comment?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type ReferenceShareItem = ListMetaItem | VideoItem;

export class ReferenceShareRepository {
  private readonly tableName: string;
  private readonly client: DynamoDBDocumentClient;

  constructor(options: ReferenceShareRepositoryOptions) {
    this.tableName = options.tableName;
    this.client =
      options.client ??
      DynamoDBDocumentClient.from(new DynamoDBClient({}));
  }

  async createList(input: CreateListInput): Promise<{ id: string }> {
    const now = new Date().toISOString();
    const listId = createListId();
    const item: ListMetaItem = {
      list_id: toListPartitionKey(listId),
      item_key: "META",
      title: input.title.trim(),
      description: input.description?.trim() || undefined,
      created_at: now,
      updated_at: now,
    };

    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: item,
        ConditionExpression:
          "attribute_not_exists(list_id) AND attribute_not_exists(item_key)",
      }),
    );

    return { id: listId };
  }

  async addVideo(
    listId: string,
    parsedVideo: ParsedVideoUrl,
    input: AddVideoInput,
    sortOrder: number,
  ): Promise<{ id: string }> {
    const now = new Date().toISOString();
    const videoId = createVideoBlockId(parsedVideo.videoId);
    const item: VideoItem = {
      list_id: toListPartitionKey(listId),
      item_key: toVideoSortKey(sortOrder, videoId),
      video_id: parsedVideo.videoId,
      platform: parsedVideo.platform,
      video_url: parsedVideo.videoUrl,
      embed_url: parsedVideo.embedUrl,
      comment: input.comment?.trim() || undefined,
      sort_order: sortOrder,
      created_at: now,
      updated_at: now,
    };

    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: item,
      }),
    );

    return { id: videoId };
  }

  async getNextSortOrder(listId: string): Promise<number> {
    const list = await this.getList(listId);
    if (!list) {
      throw new Error("List not found.");
    }

    const maxSortOrder = list.videos.reduce(
      (currentMax, video) => Math.max(currentMax, video.sortOrder),
      0,
    );

    return maxSortOrder + 1;
  }

  async getList(listId: string): Promise<ReferenceShareList | null> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "list_id = :listId",
        ExpressionAttributeValues: {
          ":listId": toListPartitionKey(listId),
        },
      }),
    );

    const items = (result.Items as ReferenceShareItem[] | undefined) ?? [];
    if (items.length === 0) {
      return null;
    }

    const metaItem = items.find(isListMetaItem);
    if (!metaItem) {
      return null;
    }

    const videos = items
      .filter(isVideoItem)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => mapVideoItem(listId, item));

    return {
      id: listId,
      title: metaItem.title,
      description: metaItem.description,
      createdAt: metaItem.created_at,
      updatedAt: metaItem.updated_at,
      videos,
    };
  }

  async getListMeta(listId: string): Promise<ListMetaItem | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          list_id: toListPartitionKey(listId),
          item_key: "META",
        },
      }),
    );

    const item = result.Item as ListMetaItem | undefined;
    return item ?? null;
  }
}

function isListMetaItem(item: ReferenceShareItem): item is ListMetaItem {
  return item.item_key === "META";
}

function isVideoItem(item: ReferenceShareItem): item is VideoItem {
  return item.item_key.startsWith("VIDEO#");
}

function mapVideoItem(listId: string, item: VideoItem): VideoReference {
  const itemSegments = item.item_key.split("#");
  const blockId = itemSegments[2] ?? item.video_id;

  return {
    id: blockId,
    listId,
    platform: item.platform,
    videoUrl: item.video_url,
    videoId: item.video_id,
    embedUrl: item.embed_url,
    comment: item.comment,
    sortOrder: item.sort_order,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function toListPartitionKey(listId: string): string {
  return `LIST#${listId}`;
}

function toVideoSortKey(sortOrder: number, videoId: string): string {
  return `VIDEO#${String(sortOrder).padStart(3, "0")}#${videoId}`;
}

function createListId(): string {
  return `list_${randomId()}`;
}

function createVideoBlockId(sourceVideoId: string): string {
  const sanitizedVideoId = sourceVideoId.replace(/[^a-zA-Z0-9_-]/g, "");
  return `video_${sanitizedVideoId || randomId()}`;
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}
