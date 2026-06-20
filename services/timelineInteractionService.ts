import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import InteractionSettings, { CommentAccess } from '@/models/InteractionSettings';
import Katha from '@/models/Katha';
import KathaLike from '@/models/KathaLike';
import TimelineComment from '@/models/TimelineComment';
import User from '@/models/User';

const DEFAULT_ACCESS: CommentAccess = 'authenticated';

async function getPublishedKatha(kathaId: string) {
  if (!mongoose.Types.ObjectId.isValid(kathaId)) return null;
  return Katha.findOne({
    _id: kathaId,
    status: { $ne: 'archived' },
    $or: [{ status: 'published' }, { status: { $exists: false }, published: true }],
  })
    .select('_id type duration')
    .lean();
}

export async function getInteractionSettings() {
  await connectDB();
  const settings = await InteractionSettings.findOne({ key: 'global' }).lean();
  return {
    audioCommentAccess: settings?.audioCommentAccess ?? DEFAULT_ACCESS,
    videoCommentAccess: settings?.videoCommentAccess ?? DEFAULT_ACCESS,
  };
}

export async function updateInteractionSettings(input: {
  audioCommentAccess: CommentAccess;
  videoCommentAccess: CommentAccess;
  actorId: string;
}) {
  await connectDB();
  return InteractionSettings.findOneAndUpdate(
    { key: 'global' },
    {
      $set: {
        audioCommentAccess: input.audioCommentAccess,
        videoCommentAccess: input.videoCommentAccess,
        updatedBy: input.actorId,
      },
      $setOnInsert: { key: 'global' },
    },
    { new: true, upsert: true, runValidators: true }
  ).lean();
}

export async function getInteractionSnapshot(kathaId: string, userId?: string) {
  await connectDB();
  const katha = await getPublishedKatha(kathaId);
  if (!katha) return null;

  const settings = await getInteractionSettings();
  const commentAccess =
    katha.type === 'audio'
      ? settings.audioCommentAccess
      : settings.videoCommentAccess;

  const [comments, likeCount, likedByViewer] = await Promise.all([
    TimelineComment.find({ kathaId, status: 'active' })
      .sort({ timestampSeconds: 1, createdAt: 1 })
      .limit(500)
      .populate('userId', 'name avatar')
      .lean(),
    KathaLike.countDocuments({ kathaId }),
    userId ? KathaLike.exists({ kathaId, userId }) : null,
  ]);

  return {
    comments: comments.map((comment) => {
      const user = comment.userId as unknown as
        | { name?: string; avatar?: string }
        | null;
      return {
        _id: String(comment._id),
        kathaId: String(comment.kathaId),
        content: comment.content,
        timestampSeconds: comment.timestampSeconds,
        author: {
          name: user?.name || comment.guestName || 'Guest listener',
          avatar: user?.avatar,
          isGuest: !user,
        },
        createdAt: comment.createdAt.toISOString(),
      };
    }),
    likeCount,
    likedByViewer: Boolean(likedByViewer),
    isAuthenticated: Boolean(userId),
    commentAccess,
    canComment:
      commentAccess === 'everyone' ||
      (commentAccess === 'authenticated' && Boolean(userId)),
  };
}

export async function createTimelineComment(input: {
  kathaId: string;
  content: string;
  timestampSeconds: number;
  userId?: string;
  guestKeyHash?: string;
  guestName?: string;
}) {
  await connectDB();
  const katha = await getPublishedKatha(input.kathaId);
  if (!katha) return { error: 'Katha not found', status: 404 } as const;

  const settings = await getInteractionSettings();
  const access =
    katha.type === 'audio'
      ? settings.audioCommentAccess
      : settings.videoCommentAccess;

  if (access === 'disabled') {
    return { error: 'Comments are disabled for this media type', status: 403 } as const;
  }
  if (access === 'authenticated' && !input.userId) {
    return { error: 'Sign in to comment', status: 401 } as const;
  }
  if (!input.userId && !input.guestKeyHash) {
    return { error: 'Guest identity is required', status: 400 } as const;
  }

  const knownDuration = Number(katha.duration || 0);
  if (knownDuration > 0 && input.timestampSeconds > knownDuration + 2) {
    return { error: 'Comment timestamp exceeds media duration', status: 400 } as const;
  }

  const comment = await TimelineComment.create({
    kathaId: input.kathaId,
    userId: input.userId,
    guestKeyHash: input.userId ? undefined : input.guestKeyHash,
    guestName: input.userId ? undefined : input.guestName || 'Guest listener',
    content: input.content,
    timestampSeconds: Math.round(input.timestampSeconds * 10) / 10,
  });

  const user = input.userId
    ? await User.findById(input.userId).select('name avatar').lean()
    : null;

  return {
    data: {
      _id: String(comment._id),
      kathaId: String(comment.kathaId),
      content: comment.content,
      timestampSeconds: comment.timestampSeconds,
      author: {
        name: user?.name || comment.guestName || 'Guest listener',
        avatar: user?.avatar,
        isGuest: !user,
      },
      createdAt: comment.createdAt.toISOString(),
    },
  } as const;
}

export async function setKathaLike(kathaId: string, userId: string, liked: boolean) {
  await connectDB();
  const katha = await getPublishedKatha(kathaId);
  if (!katha) return null;

  if (liked) {
    await KathaLike.updateOne(
      { kathaId, userId },
      { $setOnInsert: { kathaId, userId } },
      { upsert: true }
    );
  } else {
    await KathaLike.deleteOne({ kathaId, userId });
  }

  const likeCount = await KathaLike.countDocuments({ kathaId });
  return { likedByViewer: liked, likeCount };
}
