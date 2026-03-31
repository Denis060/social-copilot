export interface PostData {
  content: string;
  mediaUrls: string[];
}

export interface PublishResult {
  success: boolean;
  externalId?: string;
  error?: string;
}

export interface PlatformAdapter {
  publish(token: string, postData: PostData): Promise<PublishResult>;
}
