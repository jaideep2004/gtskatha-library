import mongoose from 'mongoose';

export class ValidationError extends Error {}

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError('Request body must be an object');
  }
  return value as UnknownRecord;
}

function stringField(
  source: UnknownRecord,
  key: string,
  options: { required?: boolean; max?: number } = {}
): string | undefined {
  const value = source[key];

  if (value === undefined || value === null || value === '') {
    if (options.required) throw new ValidationError(`${key} is required`);
    return undefined;
  }
  if (typeof value !== 'string') throw new ValidationError(`${key} must be a string`);

  const clean = value.trim();
  if (!clean && options.required) throw new ValidationError(`${key} is required`);
  if (options.max && clean.length > options.max) {
    throw new ValidationError(`${key} is too long`);
  }
  return clean || undefined;
}

function booleanField(source: UnknownRecord, key: string): boolean | undefined {
  const value = source[key];
  if (value === undefined) return undefined;
  if (typeof value !== 'boolean') throw new ValidationError(`${key} must be a boolean`);
  return value;
}

function numberField(
  source: UnknownRecord,
  key: string,
  options: { min?: number; max?: number } = {}
): number | undefined {
  const value = source[key];
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new ValidationError(`${key} must be a valid number`);
  }
  if (options.min !== undefined && value < options.min) {
    throw new ValidationError(`${key} is below minimum`);
  }
  if (options.max !== undefined && value > options.max) {
    throw new ValidationError(`${key} exceeds maximum`);
  }
  return value;
}

function objectIdField(source: UnknownRecord, key: string): string | null | undefined {
  if (!(key in source)) return undefined;
  if (source[key] === null || source[key] === '') return null;
  const value = stringField(source, key);
  if (!value) return null;
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ValidationError(`${key} is invalid`);
  }
  return value;
}

function stringArrayField(
  source: UnknownRecord,
  key: string,
  maxItems = 50,
  maxLength = 300
): string[] | undefined {
  const value = source[key];
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > maxItems) {
    throw new ValidationError(`${key} is invalid`);
  }
  const result = value.map((item) => {
    if (typeof item !== 'string') throw new ValidationError(`${key} is invalid`);
    const clean = item.trim();
    if (!clean || clean.length > maxLength) throw new ValidationError(`${key} is invalid`);
    return clean;
  });
  return [...new Set(result)];
}

function chaptersField(source: UnknownRecord) {
  const value = source.chapters;
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > 200) {
    throw new ValidationError('chapters is invalid');
  }

  return value.map((item, index) => {
    const chapter = asRecord(item);
    const title = stringField(chapter, 'title', { required: true, max: 240 });
    const id = stringField(chapter, 'id', { max: 100 }) || `chapter-${index + 1}`;
    const startTime = numberField(chapter, 'startTime', { min: 0, max: 604_800 });
    const duration = numberField(chapter, 'duration', { min: 0, max: 604_800 });
    if (startTime === undefined || duration === undefined) {
      throw new ValidationError('Each chapter requires startTime and duration');
    }
    return { id, title: title!, startTime, duration };
  });
}

export function validateKathaInput(value: unknown, partial = false) {
  const source = asRecord(value);
  const type = stringField(source, 'type', { required: !partial, max: 10 });
  const status = stringField(source, 'status', { max: 20 });

  if (type && type !== 'audio' && type !== 'video') {
    throw new ValidationError('type must be audio or video');
  }
  if (status && !['draft', 'published', 'archived'].includes(status)) {
    throw new ValidationError('status is invalid');
  }

  const output = {
    title: stringField(source, 'title', { required: !partial, max: 180 }),
    slug: stringField(source, 'slug', { max: 180 }),
    description: stringField(source, 'description', { max: 10_000 }),
    type,
    thumbnail: stringField(source, 'thumbnail', { max: 500 }),
    audioUrl: stringField(source, 'audioUrl', { max: 500 }),
    videoUrl: stringField(source, 'videoUrl', { max: 500 }),
    duration: numberField(source, 'duration', { min: 0, max: 604_800 }),
    categoryId: objectIdField(source, 'categoryId'),
    seriesId: objectIdField(source, 'seriesId'),
    tags: stringArrayField(source, 'tags', 50, 80),
    featured: booleanField(source, 'featured'),
    published: booleanField(source, 'published'),
    allowDownload: booleanField(source, 'allowDownload'),
    status,
    authorName: stringField(source, 'authorName', { max: 180 }),
    sortOrder: numberField(source, 'sortOrder', { min: 0, max: 100_000 }),
    keyTakeaways: stringArrayField(source, 'keyTakeaways', 30, 500),
    references: stringArrayField(source, 'references', 50, 1_000),
    chapters: chaptersField(source),
  };

  return Object.fromEntries(
    Object.entries(output).filter(([, fieldValue]) => fieldValue !== undefined)
  );
}

export function validateSeriesInput(value: unknown, partial = false) {
  const source = asRecord(value);
  const output = {
    title: stringField(source, 'title', { required: !partial, max: 180 }),
    slug: stringField(source, 'slug', { max: 180 }),
    description: stringField(source, 'description', { max: 5_000 }),
    thumbnail: stringField(source, 'thumbnail', { max: 500 }),
    featured: booleanField(source, 'featured'),
    sortOrder: numberField(source, 'sortOrder', { min: 0, max: 100_000 }),
  };
  return Object.fromEntries(
    Object.entries(output).filter(([, fieldValue]) => fieldValue !== undefined)
  );
}

export function validateCategoryInput(value: unknown, partial = false) {
  const source = asRecord(value);
  const output = {
    name: stringField(source, 'name', { required: !partial, max: 120 }),
    slug: stringField(source, 'slug', { max: 180 }),
    description: stringField(source, 'description', { max: 3_000 }),
    thumbnail: stringField(source, 'thumbnail', { max: 500 }),
  };
  return Object.fromEntries(
    Object.entries(output).filter(([, fieldValue]) => fieldValue !== undefined)
  );
}

export function validateNotificationInput(value: unknown) {
  const source = asRecord(value);
  const type = stringField(source, 'type', { max: 20 }) ?? 'info';
  if (!['info', 'warning', 'success', 'announcement'].includes(type)) {
    throw new ValidationError('type is invalid');
  }
  return {
    title: stringField(source, 'title', { required: true, max: 180 })!,
    message: stringField(source, 'message', { required: true, max: 2_000 })!,
    type: type as 'info' | 'warning' | 'success' | 'announcement',
  };
}

export function validateHomepageInput(value: unknown) {
  const source = asRecord(value);
  return {
    heroKathaSlug: stringField(source, 'heroKathaSlug', { max: 180 }),
    featuredKathaSlug: stringField(source, 'featuredKathaSlug', { max: 180 }),
    featuredSeriesSlug: stringField(source, 'featuredSeriesSlug', { max: 180 }),
    quote: stringField(source, 'quote', { max: 2_000 }),
  };
}

export function validateTimelineCommentInput(value: unknown) {
  const source = asRecord(value);
  const kathaId = stringField(source, 'kathaId', { required: true, max: 40 })!;
  if (!mongoose.Types.ObjectId.isValid(kathaId)) {
    throw new ValidationError('kathaId is invalid');
  }
  const timestampSeconds = numberField(source, 'timestampSeconds', {
    min: 0,
    max: 604_800,
  });
  if (timestampSeconds === undefined) {
    throw new ValidationError('timestampSeconds is required');
  }
  return {
    kathaId,
    content: stringField(source, 'content', { required: true, max: 500 })!,
    guestName: stringField(source, 'guestName', { max: 60 }),
    timestampSeconds,
  };
}

export function validateInteractionSettingsInput(value: unknown) {
  const source = asRecord(value);
  const audioCommentAccess = stringField(source, 'audioCommentAccess', {
    required: true,
    max: 20,
  })!;
  const videoCommentAccess = stringField(source, 'videoCommentAccess', {
    required: true,
    max: 20,
  })!;
  const allowed = ['everyone', 'authenticated', 'disabled'];
  if (!allowed.includes(audioCommentAccess) || !allowed.includes(videoCommentAccess)) {
    throw new ValidationError('Comment access setting is invalid');
  }
  return {
    audioCommentAccess: audioCommentAccess as 'everyone' | 'authenticated' | 'disabled',
    videoCommentAccess: videoCommentAccess as 'everyone' | 'authenticated' | 'disabled',
  };
}
