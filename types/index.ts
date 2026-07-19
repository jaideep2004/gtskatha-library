export type UserRole = 'user' | 'admin';
export type KathaType = 'audio' | 'video';
export type KathaStatus = 'draft' | 'published' | 'archived';
export type NotificationType = 'info' | 'warning' | 'success' | 'announcement';
export type CommentAccess = 'everyone' | 'authenticated' | 'disabled';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  role: UserRole;
  sessionVersion?: number;
  createdAt: Date;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  archived?: boolean;
  audioCount?: number;
  videoCount?: number;
  kathaCount?: number;
}

export interface ISeries {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  featured: boolean;
  sortOrder: number;
  archived?: boolean;
}

export interface IKatha {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  type: KathaType;
  thumbnail?: string;
  audioUrl?: string;
  videoUrl?: string;
  duration?: number;
  categoryId?: string | ICategory;
  seriesId?: string | ISeries;
  tags: string[];
  featured: boolean;
  published: boolean;
  status?: KathaStatus;
  allowDownload?: boolean;
  archivedAt?: Date;
  views: number;
  sortOrder: number;
  createdAt: Date;
  authorName?: string;
  chapters?: Chapter[];
  keyTakeaways?: string[];
  references?: string[];
}

export interface IFavorite {
  _id: string;
  userId: string;
  kathaId: string | IKatha;
  createdAt: Date;
}

export interface IContinueListening {
  _id: string;
  userId: string;
  kathaId: string | IKatha;
  currentTime: number;
  duration: number;
  lastPlayedAt: Date;
  completed?: boolean;
}

export interface INotification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: Date;
}

export interface IUserNotification {
  _id: string;
  userId: string;
  notificationId: string | INotification;
  isRead: boolean;
}

export interface IHomepageConfig {
  _id: string;
  heroKatha?: string | IKatha;
  featuredSeries?: string | ISeries;
  featuredKatha?: string | IKatha;
  quote?: string;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Player state
export interface PlayerState {
  katha: IKatha | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isMinimized: boolean;
}

// Chapter for katha detail pages
export interface Chapter {
  id: string;
  title: string;
  startTime: number;
  duration: number;
}

// Search params
export interface KathaSearchParams {
  q?: string;
  type?: KathaType;
  category?: string;
  series?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'popular' | 'featured' | 'manual';
  includeUnpublished?: boolean;
}

export interface ITimelineComment {
  _id: string;
  kathaId: string;
  content: string;
  timestampSeconds: number;
  author: {
    name: string;
    avatar?: string;
    isGuest: boolean;
  };
  createdAt: string;
}

export interface IInteractionSnapshot {
  comments: ITimelineComment[];
  likeCount: number;
  likedByViewer: boolean;
  isAuthenticated: boolean;
  commentAccess: CommentAccess;
  canComment: boolean;
}
