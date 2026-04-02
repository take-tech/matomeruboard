export type VideoPlatform = "youtube" | "niconico";

export type ListSummary = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type VideoReference = {
  id: string;
  listId: string;
  platform: VideoPlatform;
  videoUrl: string;
  videoId: string;
  embedUrl: string;
  comment?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ReferenceShareList = ListSummary & {
  videos: VideoReference[];
};

export type CreateListInput = {
  title: string;
  description?: string;
};

export type AddVideoInput = {
  videoUrl: string;
  comment?: string;
};

export type ParsedVideoUrl = {
  platform: VideoPlatform;
  videoId: string;
  videoUrl: string;
  embedUrl: string;
};
