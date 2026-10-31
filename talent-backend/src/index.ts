import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import { cacheFeed, getCachedFeed, invalidateFeedCache, redis, setupSocketRedisAdapter } from './utils/redis';
import { isCloudStorageEnabled, uploadFileToStorage, deleteFileFromStorage, generateUploadSignedUrl } from './utils/cloudStorage';
import { cloudUpload } from './utils/cloudinary';
import { convertToHLS, trimVideoFile } from './utils/ffmpeg';
import { sendPushNotification } from './utils/notifications';
import { videoQueue } from './utils/queue';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

const prisma = new PrismaClient();
const app = express();

Sentry.init({
  dsn: process.env.SENTRY_DSN || "", // Default empty string to prevent crashes in dev
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
});
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});
setupSocketRedisAdapter(io);
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-development-only';
const PORT = process.env.PORT || 3000;
const CLOUD_RUN_BACKEND_URL = 'https://talent-git-186968698522.asia-south1.run.app';
const BASE_URL = (process.env.BASE_URL || '').replace(/\/$/, '') || (process.env.NODE_ENV === 'production' || process.env.K_SERVICE ? CLOUD_RUN_BACKEND_URL : `http://localhost:${PORT}`);

export const getRequestBaseUrl = (req?: Request): string => {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL.replace(/\/$/, '');
  }
  if (req) {
    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
    const host = req.get('host');
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      return `${proto}://${host}`;
    }
  }
  return BASE_URL;
};

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Talent App API',
      version: '1.0.0',
      description: 'API for short-video social platform'
    },
    servers: [{ url: BASE_URL }]
  },
  apis: ['./src/index.ts']
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

const allowedOrigins = process.env.CORS_ORIGIN
  ? (process.env.CORS_ORIGIN === '*' ? '*' : process.env.CORS_ORIGIN.split(',').map((o: string) => o.trim()))
  : '*';

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ extended: true, limit: '150mb' }));

// Container and service health check endpoints for Cloud Run / Docker
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Authentication Middleware
const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
  }
};


// Setup file uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: {
    fileSize: 150 * 1024 * 1024,
    fieldSize: 50 * 1024 * 1024,
  },
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadDir));

// Helper to check if a URL points to an image
export const isImageMedia = (url?: string | null): boolean => {
  if (!url) return false;
  return /\.(jpg|jpeg|png|webp|gif|bmp|heic)(\?.*)?$/i.test(url);
};

// API Route for Step 3 - Now using Prisma!
app.get('/api/feed', async (req, res) => {
  try {
    let userId: number | null = req.query.userId ? parseInt(req.query.userId as string) : null;
    const authHeader = req.headers.authorization;
    if (!userId && authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { userId: number };
        userId = decoded.userId;
      } catch (e) {}
    }
    if (!userId) {
      const defaultUser = await prisma.user.findFirst();
      if (defaultUser) {
        userId = defaultUser.id;
      }
    }
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = req.query.offset !== undefined ? parseInt(req.query.offset as string) : undefined;
    const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : undefined;
    
    // Check Cache
    const cacheKey = `feed_${limit}_${offset !== undefined ? offset : (cursor || 0)}_${userId}`;
    const cachedFeed = await getCachedFeed(cacheKey);
    if (cachedFeed) {
      console.log('Serving feed from Redis cache');
      const filteredCached = (cachedFeed.videos || cachedFeed).filter((v: any) => !isImageMedia(v.url));
      return res.json({ 
        videos: filteredCached, 
        hasMore: cachedFeed.hasMore !== undefined ? cachedFeed.hasMore : filteredCached.length >= limit 
      });
    }
    
    const totalVideos = await prisma.video.count({
      where: {
        AND: [
          { url: { not: { endsWith: '.jpg' } } },
          { url: { not: { endsWith: '.jpeg' } } },
          { url: { not: { endsWith: '.png' } } },
          { url: { not: { endsWith: '.webp' } } },
          { url: { not: { endsWith: '.gif' } } },
        ]
      }
    });

    const skipCount = offset !== undefined ? offset : (cursor ? 1 : 0);
    const cursorObj = (offset === undefined && cursor) ? { id: cursor } : undefined;

    // Fetch videos (take extra to ensure limit items remain after filtering out images)
    const rawVideos = await prisma.video.findMany({
      take: limit * 2,
      skip: skipCount,
      cursor: cursorObj,
      include: {
        author: true,
        likes: true,
        savedBy: true,
        hashtags: true,
        comments: {
          include: { user: true }
        },
        ratings: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Homepage feed is strictly for videos only. Images are excluded from the homepage and only shown on user profiles.
    const videos = rawVideos.filter(v => !isImageMedia(v.url)).slice(0, limit);

    // Format the response to match what the mobile app expects
    let formattedVideos = videos.map(v => ({
      id: v.id,
      title: v.title,
      description: v.description,
      category: v.category,
      subCategory: v.subCategory,
      purpose: v.purpose,
      location: v.location,
      allowJudging: !((v as any).allowJudging === false || (v as any).allowJudging === 'false' || (v as any).allowJudging === 0 || (v as any).allowJudging === '0'),
      allowComments: !((v as any).allowComments === false || (v as any).allowComments === 'false' || (v as any).allowComments === 0 || (v as any).allowComments === '0'),
      privacy: v.privacy || 'PUBLIC',
      filter: v.filter || null,
      filterIntensity: v.filterIntensity ?? null,
      author: v.author.name || v.author.username,
      authorAvatar: v.author.avatarUrl,
      authorId: v.author.id,
      url: v.url,
      views: v.views,
      hashtags: v.hashtags.map((h: any) => h.name),
      likesCount: v.likes.length,
      commentsCount: v.comments.length,
      comments: v.comments.map((c: any) => ({
        id: c.id,
        text: c.text,
        author: c.user.name || c.user.username,
        createdAt: c.createdAt
      })),
      isLiked: userId ? v.likes.some((l: any) => l.userId === userId) : false,
      isSaved: userId ? v.savedBy?.some((s: any) => s.userId === userId) : false,
      averageRating: v.ratings.length ? v.ratings.reduce((acc: any, r: any) => acc + r.score, 0) / v.ratings.length : 0,
      userRating: userId ? v.ratings.find((r: any) => r.userId === userId)?.score || null : null
    }));
    
    // Personalized Feed Sorting
    // Score = views + (likes * 5) + (comments * 10) + (avgRating * 20)
    formattedVideos = formattedVideos.sort((a, b) => {
      const scoreA = a.views + (a.likesCount * 5) + (a.commentsCount * 10) + (a.averageRating * 20);
      const scoreB = b.views + (b.likesCount * 5) + (b.commentsCount * 10) + (b.averageRating * 20);
      return scoreB - scoreA;
    });

    const currentOffset = offset !== undefined ? offset : 0;
    const hasMore = currentOffset + videos.length < totalVideos;

    const payload = { videos: formattedVideos, hasMore, total: totalVideos };

    // Save to Cache
    await cacheFeed(cacheKey, payload);

    res.json(payload);
  } catch (error: any) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: error?.message || 'Failed to fetch videos', stack: error?.stack });
  }
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, name } = req.body;
    
    // Validation
    if (!username || username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one uppercase letter' });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one lowercase letter' });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one number' });
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, name }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, name: user.name, avatarUrl: user.avatarUrl, title: user.title, location: user.location, quote: user.quote } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to register' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, name: user.name, avatarUrl: user.avatarUrl, title: user.title, location: user.location, quote: user.quote } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Upload a new Video/Media (Protected)
const uploadFields = [
  { name: 'video', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'media', maxCount: 1 },
  { name: 'file', maxCount: 1 }
];
const uploadMiddleware = cloudUpload ? cloudUpload.fields(uploadFields) : upload.fields(uploadFields);

// Direct Signed URL Generation Endpoint (Bypasses Cloud Run 32MB limit)
app.post('/api/upload/signed-url', requireAuth, async (req, res) => {
  try {
    const { filename, contentType, folder } = req.body;
    if (!filename) {
      return res.status(400).json({ error: 'filename is required' });
    }

    const targetFolder = folder === 'avatars' ? 'avatars' : folder === 'images' ? 'images' : 'videos';
    const mime = contentType || (targetFolder === 'images' ? 'image/jpeg' : 'video/mp4');

    const result = await generateUploadSignedUrl(filename, mime, targetFolder);
    res.json(result);
  } catch (error: any) {
    console.error('Error generating signed upload URL:', error);
    res.status(500).json({ error: error.message || 'Failed to generate signed upload URL' });
  }
});

app.post('/api/videos', requireAuth, uploadMiddleware, async (req, res) => {
  try {
    const { title, description, category, subCategory, purpose, location, allowJudging, allowComments, privacy, trimStart, trimEnd, url: directUrl, filter, filterIntensity } = req.body;
    
    // Resolve valid authorId
    let authorId = req.userId!;
    const author = await prisma.user.findUnique({ where: { id: authorId } });
    if (!author) {
      const fallbackUser = await prisma.user.findFirst();
      if (!fallbackUser) {
        return res.status(401).json({ error: 'User does not exist in database. Please log in again.' });
      }
      authorId = fallbackUser.id;
    }

    // Extract uploaded file from either req.file or req.files dictionary
    const uploadedFile: any = req.file || 
      (req.files && !Array.isArray(req.files) ? (
        (req.files as any)['video']?.[0] || 
        (req.files as any)['image']?.[0] || 
        (req.files as any)['media']?.[0] || 
        (req.files as any)['file']?.[0]
      ) : (Array.isArray(req.files) ? req.files[0] : null));
    
    if (!uploadedFile && !directUrl) {
      return res.status(400).json({ error: 'No media file or direct URL provided' });
    }

    // Apply trimming if requested on local video upload
    const isImageFile = uploadedFile
      ? (uploadedFile.mimetype?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(uploadedFile.filename || ''))
      : isImageMedia(directUrl);
    const startSec = trimStart ? parseFloat(trimStart) : 0;
    const endSec = trimEnd ? parseFloat(trimEnd) : 0;

    if (uploadedFile && !cloudUpload && uploadedFile.path && !isImageFile && (startSec > 0 || (endSec > 0 && endSec > startSec))) {
      try {
        const trimmedPath = `${uploadedFile.path}_trimmed.mp4`;
        await trimVideoFile(uploadedFile.path, trimmedPath, startSec, endSec);
        if (fs.existsSync(trimmedPath)) {
          let unlinked = false;
          for (let attempt = 0; attempt < 5; attempt++) {
            try {
              fs.unlinkSync(uploadedFile.path);
              unlinked = true;
              break;
            } catch (unlinkErr) {
              await new Promise(res => setTimeout(res, 120));
            }
          }
          if (unlinked) {
            fs.renameSync(trimmedPath, uploadedFile.path);
            console.log(`[Upload] Successfully applied trim (${startSec}s - ${endSec}s) to ${uploadedFile.path}`);
          }
        }
      } catch (trimErr) {
        console.warn('[Upload] Trim failed, proceeding with original file:', trimErr);
      }
    }

    // Determine final media URL
    const effectiveBase = getRequestBaseUrl(req);
    let url: string;
    if (directUrl) {
      url = directUrl;
    } else if (cloudUpload) {
      url = uploadedFile.path;
    } else if (isCloudStorageEnabled()) {
      try {
        const destFolder = isImageFile ? 'images' : 'videos';
        const destPath = `${destFolder}/${uploadedFile.filename}`;
        url = await uploadFileToStorage(uploadedFile.path, destPath, uploadedFile.mimetype);
        if (uploadedFile.path && fs.existsSync(uploadedFile.path)) { fs.unlink(uploadedFile.path, () => {}); }
      } catch (storageErr) {
        console.warn('Google Cloud Storage upload failed, falling back to local storage URL:', storageErr);
        url = `${effectiveBase}/uploads/${uploadedFile.filename}`;
      }
    } else {
      url = `${effectiveBase}/uploads/${uploadedFile.filename}`;
    }

    // Extract hashtags from title or description
    const textToParse = `${title || ''} ${description || ''}`;
    const hashtagRegex = /#[\w]+/g;
    const extractedTags = textToParse.match(hashtagRegex) || [];
    // Remove the '#' character
    const tags = Array.from(new Set(extractedTags.map((t: string) => t.slice(1).toLowerCase())));

    const video = await prisma.video.create({
      data: { 
        title: (title && title.trim()) || 'Untitled Performance', 
        description: description || '', 
        url, 
        category: category || null,
        subCategory: subCategory || null,
        purpose: purpose || null,
        location: location || null,
        allowJudging: !(allowJudging === false || allowJudging === 'false' || allowJudging === 0 || allowJudging === '0'),
        allowComments: !(allowComments === false || allowComments === 'false' || allowComments === 0 || allowComments === '0'),
        privacy: privacy ? String(privacy).toUpperCase() : 'PUBLIC',
        filter: filter ? String(filter) : null,
        filterIntensity: (filterIntensity !== undefined && filterIntensity !== null) ? parseFloat(String(filterIntensity)) : null,
        authorId,
        hashtags: {
          connectOrCreate: tags.map(tag => ({
            where: { name: tag },
            create: { name: tag }
          }))
        }
      }
    });

    // Invalidate Redis feed cache
    try {
      if (redis.status === 'ready') {
        const feedKeys = await redis.keys('feed_*');
        if (feedKeys.length > 0) {
          await redis.del(...feedKeys);
        }
      }
    } catch (e) {}
    
    // Trigger HLS Transcoding via BullMQ Background Worker if it's a local video upload (skip images and direct storage uploads)
    if (!cloudUpload && uploadedFile?.path && !isImageFile) {
      try {
        videoQueue.add('transcode', { inputPath: uploadedFile.path, videoId: video.id }).catch((err: any) => {
          console.error('[BullMQ Worker] Transcoding queue error:', err);
        });
      } catch (err) {
        console.error('[BullMQ Worker] Transcoding queue error:', err);
      }
    }
    
    res.json(video);
  } catch (error: any) {
    console.error('Error creating video:', error);
    res.status(500).json({ error: error?.message || 'Failed to create video' });
  }
});

// Like a Video (Protected)
app.post('/api/videos/:id/like', requireAuth, async (req, res) => {
  try {
    const videoId = parseInt(req.params.id as string);
    const userId = req.userId!;

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId
        }
      }
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      return res.json({ liked: false });
    } else {
      await prisma.like.create({
        data: { userId, videoId }
      });
      
      // Generate Notification
      const video = await prisma.video.findUnique({ where: { id: videoId } });
      if (video && video.authorId !== userId) {
        await prisma.notification.create({
          data: {
            type: 'LIKE',
            userId: video.authorId,
            actorId: userId,
            videoId: videoId
          }
        });
      }

      return res.json({ liked: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// Comment on a Video (Protected with Dev Fallback)
app.post('/api/videos/:id/comment', async (req, res) => {
  try {
    const videoId = parseInt(req.params.id as string);
    let userId: number | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { userId: number };
        userId = decoded.userId;
      } catch (e) {}
    }
    if (!userId && process.env.NODE_ENV !== 'production') {
      const defaultUser = await prisma.user.findFirst();
      userId = defaultUser?.id || 1;
    }
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const video = await prisma.video.findUnique({ 
      where: { id: videoId },
      include: { author: true }
    });
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const allowComm = (video as any).allowComments;
    if (allowComm === false || allowComm === 'false' || allowComm === 0 || allowComm === '0') {
      return res.status(403).json({ error: 'Comments are disabled for this performance' });
    }

    const comment = await prisma.comment.create({
      data: { text, userId, videoId },
      include: { 
        user: { 
          select: { id: true, username: true, name: true, avatarUrl: true } 
        } 
      }
    });

    await invalidateFeedCache();
    
    // Generate Notification
    if (video.authorId !== userId) {
      await prisma.notification.create({
        data: {
          type: 'COMMENT',
          userId: video.authorId,
          actorId: userId,
          videoId: videoId
        }
      });
      
      // Send real push notification if user has a token
      if (video.author.pushToken) {
        await sendPushNotification(
          video.author.pushToken,
          `Someone commented on your video!`,
          { videoId }
        );
      }
    }
    
    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Rate a Video (Protected with Dev Fallback)
app.post('/api/videos/:id/rate', async (req, res) => {
  try {
    const videoId = parseInt(req.params.id as string);
    let userId: number | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { userId: number };
        userId = decoded.userId;
      } catch (e) {}
    }
    if (!userId && process.env.NODE_ENV !== 'production') {
      const defaultUser = await prisma.user.findFirst();
      userId = defaultUser?.id || 1;
    }
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const { score } = req.body;
    
    if (score < 1 || score > 10) {
      return res.status(400).json({ error: 'Score must be between 1 and 10' });
    }

    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const allowJudge = (video as any).allowJudging;
    if (allowJudge === false || allowJudge === 'false' || allowJudge === 0 || allowJudge === '0') {
      return res.status(403).json({ error: 'Judging is disabled for this performance' });
    }

    const rating = await prisma.rating.upsert({
      where: {
        userId_videoId: {
          userId,
          videoId
        }
      },
      update: { score },
      create: { userId, videoId, score }
    });
    
    // Calculate new average
    const ratings = await prisma.rating.findMany({ where: { videoId } });
    const averageRating = ratings.reduce((acc, r) => acc + r.score, 0) / ratings.length;
    
    res.json({ rating, averageRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// Get Current User Profile (Protected)
app.get('/api/profile/me', requireAuth, async (req, res) => {
  try {
    const userId = req.userId!;
    
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        videos: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { videos: true, followers: true, following: true }
        }
      }
    });

    if (!user) {
      const fallbackUser = await prisma.user.findFirst({
        include: {
          videos: {
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: { videos: true, followers: true, following: true }
          }
        }
      });
      if (!fallbackUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      user = fallbackUser;
    }

    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      title: user.title,
      location: user.location,
      quote: user.quote,
      followers: user._count.followers,
      following: user._count.following,
      videosCount: user._count.videos,
      videos: user.videos.map((v: any) => ({
        ...v,
        allowJudging: !(v.allowJudging === false || v.allowJudging === 'false' || v.allowJudging === 0 || v.allowJudging === '0'),
        allowComments: !(v.allowComments === false || v.allowComments === 'false' || v.allowComments === 0 || v.allowComments === '0'),
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get User Profile by ID
app.get('/api/profile/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id as string);
    
    // Check optional auth
    let requesterId: number | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { userId: number };
        requesterId = decoded.userId;
      } catch (e) {}
    }

    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        videos: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { videos: true, followers: true, following: true }
        }
      }
    });

    if (!user) {
      const fallbackUser = await prisma.user.findFirst({
        include: {
          videos: {
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: { videos: true, followers: true, following: true }
          }
        }
      });
      if (!fallbackUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      user = fallbackUser;
    }

    let isFollowing = false;
    if (requesterId) {
      const follow = await prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: requesterId,
            followingId: userId
          }
        }
      });
      isFollowing = !!follow;
    }

    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      title: user.title,
      location: user.location,
      quote: user.quote,
      followers: user._count.followers,
      following: user._count.following,
      videosCount: user._count.videos,
      videos: user.videos.map((v: any) => ({
        ...v,
        allowJudging: !(v.allowJudging === false || v.allowJudging === 'false' || v.allowJudging === 0 || v.allowJudging === '0'),
        allowComments: !(v.allowComments === false || v.allowComments === 'false' || v.allowComments === 0 || v.allowComments === '0'),
      })),
      isFollowing
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});


// Update Profile
app.put('/api/profile/me', requireAuth, upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.userId!;
    const { name, bio, title, location, quote } = req.body;
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (title !== undefined) updateData.title = title;
    if (location !== undefined) updateData.location = location;
    if (quote !== undefined) updateData.quote = quote;
    if (req.body.avatarUrl) updateData.avatarUrl = req.body.avatarUrl;
    
    if (req.file) {
      const effectiveBase = getRequestBaseUrl(req);
      if (isCloudStorageEnabled()) {
        try {
          const destPath = `avatars/${req.file.filename}`;
          updateData.avatarUrl = await uploadFileToStorage(req.file.path, destPath, req.file.mimetype);
          if (req.file.path && fs.existsSync(req.file.path)) { fs.unlink(req.file.path, () => {}); }
        } catch (storageErr) {
          console.warn('Google Cloud Storage avatar upload failed, falling back to local storage URL:', storageErr);
          updateData.avatarUrl = `${effectiveBase}/uploads/${req.file.filename}`;
        }
      } else {
        updateData.avatarUrl = `${effectiveBase}/uploads/${req.file.filename}`;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });
    
    res.json({
      id: updatedUser.id,
      username: updatedUser.username,
      name: updatedUser.name,
      bio: updatedUser.bio,
      avatarUrl: updatedUser.avatarUrl,
      title: updatedUser.title,
      location: updatedUser.location,
      quote: updatedUser.quote
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Search Endpoint
app.get('/api/search', requireAuth, async (req, res) => {
  try {
    const query = (req.query.q as string) || '';
    if (!query) return res.json({ users: [], videos: [] });

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query } },
          { name: { contains: query } }
        ]
      },
      select: { id: true, username: true, name: true, avatarUrl: true },
      take: 10
    });

    const videos = await prisma.video.findMany({
      where: {
        description: { contains: query }
      },
      include: { author: { select: { username: true, name: true, avatarUrl: true } } },
      take: 10
    });

    res.json({ users, videos });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Follow/Unfollow a User
app.post('/api/users/:id/follow', requireAuth, async (req, res) => {
  try {
    const followingId = parseInt(req.params.id as string);
    const followerId = req.userId!;
    
    if (followingId === followerId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: { followerId, followingId }
      }
    });

    let isFollowing = false;
    if (existingFollow) {
      await prisma.follows.delete({ where: { id: existingFollow.id } });
      isFollowing = false;
    } else {
      await prisma.follows.create({ data: { followerId, followingId } });
      isFollowing = true;
      
      // Generate Notification
      await prisma.notification.create({
        data: {
          type: 'FOLLOW',
          userId: followingId,
          actorId: followerId
        }
      });
    }

    // Calculate real-time updated counts from DB
    const [targetFollowersCount, myFollowingCount] = await Promise.all([
      prisma.follows.count({ where: { followingId } }),
      prisma.follows.count({ where: { followerId } })
    ]);

    // Live WebSocket emission to the user followed
    io.to(`user_${followingId}`).emit('follower_count_updated', {
      userId: followingId,
      followersCount: targetFollowersCount,
      actorId: followerId,
      isFollowing
    });

    // Live broadcast to any active profile viewers
    io.to(`profile_${followingId}`).emit('follower_count_updated', {
      userId: followingId,
      followersCount: targetFollowersCount,
      actorId: followerId,
      isFollowing
    });

    // Live WebSocket emission to the follower
    io.to(`user_${followerId}`).emit('following_count_updated', {
      userId: followerId,
      followingCount: myFollowingCount,
      targetUserId: followingId,
      isFollowing
    });

    return res.json({ following: isFollowing, followersCount: targetFollowersCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to toggle follow' });
  }
});

// Get Notifications
app.get('/api/notifications', requireAuth, async (req, res) => {
  try {
    const userId = req.userId!;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      include: {
        actor: { select: { id: true, username: true, name: true, avatarUrl: true } },
        video: { select: { id: true, title: true, url: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark Notifications as Read
app.put('/api/notifications/read', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId!;
    const { notificationId } = req.body;
    if (notificationId) {
      await prisma.notification.updateMany({
        where: { id: parseInt(notificationId), userId },
        data: { isRead: true }
      });
    } else {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });
    }
    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Get User Followers List
app.get('/api/users/:id/followers', async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.id);
    let currentUserId: number | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { userId: number };
        currentUserId = decoded.userId;
      } catch (e) {}
    }

    const followers = await prisma.follows.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: { id: true, username: true, name: true, avatarUrl: true, title: true, location: true }
        }
      }
    });

    const mapped = await Promise.all(followers.map(async (f: any) => {
      let isFollowing = false;
      if (currentUserId && currentUserId !== f.follower.id) {
        const check = await prisma.follows.findUnique({
          where: {
            followerId_followingId: { followerId: currentUserId, followingId: f.follower.id }
          }
        });
        isFollowing = !!check;
      }
      return {
        ...f.follower,
        isFollowing
      };
    }));

    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

// Get User Following List
app.get('/api/users/:id/following', async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.id);
    let currentUserId: number | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { userId: number };
        currentUserId = decoded.userId;
      } catch (e) {}
    }

    const following = await prisma.follows.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: { id: true, username: true, name: true, avatarUrl: true, title: true, location: true }
        }
      }
    });

    const mapped = await Promise.all(following.map(async (f: any) => {
      let isFollowing = false;
      if (currentUserId && currentUserId !== f.following.id) {
        const check = await prisma.follows.findUnique({
          where: {
            followerId_followingId: { followerId: currentUserId, followingId: f.following.id }
          }
        });
        isFollowing = !!check;
      }
      return {
        ...f.following,
        isFollowing
      };
    }));

    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

// Talent Leaderboard Endpoint
app.get('/api/leaderboard', async (req: any, res: any) => {
  try {
    const category = (req.query.category as string) || 'All';
    const where: any = {};
    if (category && category !== 'All') {
      where.OR = [
        { category: { contains: category } },
        { subCategory: { contains: category } }
      ];
    }

    const videos = await prisma.video.findMany({
      where,
      include: {
        author: {
          select: { id: true, username: true, name: true, avatarUrl: true, title: true, location: true }
        },
        likes: true,
        comments: true,
        ratings: true
      },
      take: 50
    });

    const ranked = videos.map((v: any) => {
      const likesCount = v.likes.length;
      const commentsCount = v.comments.length;
      const ratingsCount = v.ratings.length;
      const avgRating = ratingsCount ? v.ratings.reduce((acc: number, r: any) => acc + r.score, 0) / ratingsCount : 0;
      const score = v.views + (likesCount * 5) + (commentsCount * 10) + Math.round(avgRating * 20);

      return {
        id: v.id,
        title: v.title,
        url: v.url,
        filter: v.filter || null,
        filterIntensity: v.filterIntensity ?? null,
        category: v.category || 'General',
        views: v.views,
        likesCount,
        commentsCount,
        averageRating: parseFloat(avgRating.toFixed(1)),
        rankScore: score,
        performer: v.author
      };
    });

    ranked.sort((a, b) => b.rankScore - a.rankScore);
    res.json(ranked);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Instagram Sounds / Music API
app.get('/api/sounds', async (req, res) => {
  try {
    const query = ((req.query.q as string) || '').toLowerCase().trim();
    const category = ((req.query.category as string) || '').trim();

    const sounds = [
      {
        id: "sound_1",
        title: "Golden Hour Glow",
        artist: "JVKE & Talent Records",
        category: "Trending",
        duration: 45,
        usesCount: 1420000,
        coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        waveform: [20, 35, 55, 80, 95, 70, 60, 85, 100, 90, 75, 45, 60, 80, 95, 70, 50, 40, 65, 85, 90, 70, 45, 30],
      },
      {
        id: "sound_2",
        title: "Midnight Tokyo Drift",
        artist: "Synthwave Collective",
        category: "Viral",
        duration: 30,
        usesCount: 890000,
        coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        waveform: [40, 60, 70, 90, 85, 60, 45, 80, 95, 100, 85, 65, 50, 75, 90, 80, 60, 70, 85, 95, 75, 50, 35, 20],
      },
      {
        id: "sound_3",
        title: "Acoustic Sunset Breeze",
        artist: "Maya Chen",
        category: "Acoustic",
        duration: 60,
        usesCount: 540000,
        coverUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=200&h=200&fit=crop",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        waveform: [15, 25, 40, 55, 65, 50, 40, 60, 75, 70, 60, 45, 35, 50, 65, 60, 45, 35, 55, 70, 65, 45, 30, 20],
      },
      {
        id: "sound_4",
        title: "Electric Pulse (Bass Boost)",
        artist: "Talent Beatmakers",
        category: "EDM",
        duration: 30,
        usesCount: 2150000,
        coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        waveform: [50, 75, 100, 90, 60, 40, 80, 100, 95, 70, 55, 85, 100, 90, 65, 45, 75, 95, 100, 85, 60, 40, 30, 15],
      },
      {
        id: "sound_5",
        title: "Summer Vibes & Ocean",
        artist: "Cal Tropical",
        category: "Pop",
        duration: 45,
        usesCount: 970000,
        coverUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=200&fit=crop",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        waveform: [30, 50, 65, 80, 75, 60, 50, 70, 85, 90, 80, 65, 55, 70, 85, 75, 60, 50, 70, 80, 75, 55, 40, 25],
      },
      {
        id: "sound_6",
        title: "Lo-Fi Coffee Rain",
        artist: "Chillhop Beats",
        category: "Trending",
        duration: 60,
        usesCount: 1680000,
        coverUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=200&h=200&fit=crop",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        waveform: [25, 40, 50, 65, 60, 45, 35, 55, 70, 65, 55, 40, 30, 45, 60, 55, 40, 30, 50, 65, 60, 40, 25, 15],
      },
      {
        id: "sound_7",
        title: "Street Freestyle Cypher",
        artist: "BK Metro",
        category: "Hip-Hop",
        duration: 45,
        usesCount: 780000,
        coverUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200&h=200&fit=crop",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        waveform: [60, 85, 95, 100, 80, 55, 70, 95, 100, 90, 70, 60, 80, 95, 100, 85, 65, 55, 80, 95, 90, 70, 50, 30],
      },
      {
        id: "sound_8",
        title: "Original Stage Audio",
        artist: "Live Performance",
        category: "Original",
        duration: 60,
        usesCount: 310000,
        coverUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=200&fit=crop",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        waveform: [30, 45, 60, 75, 70, 55, 40, 65, 80, 85, 70, 55, 45, 60, 75, 70, 55, 40, 60, 75, 70, 50, 35, 20],
      }
    ];

    let filtered = sounds;
    if (category && category !== "All" && category !== "For You") {
      filtered = filtered.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }
    if (query) {
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.artist.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query)
      );
    }

    res.json({ sounds: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching sounds:', error);
    res.status(500).json({ error: 'Failed to fetch sounds' });
  }
});

// Search and Discovery API
app.get('/api/discover', async (req, res) => {
  try {
    const rawQ = ((req.query.q as string) || '').trim();
    const category = ((req.query.category as string) || '').trim();

    // Build video search filter
    const videoConditions: any[] = [];

    // Helper to get category search variations and synonyms
    const getCategoryTerms = (cat: string) => {
      const lower = cat.toLowerCase().trim();
      const terms = new Set<string>([lower]);
      if (lower.startsWith('sing') || lower === 'singers') {
        terms.add('sing'); terms.add('song'); terms.add('vocal'); terms.add('music');
      } else if (lower.startsWith('danc') || lower === 'dancers') {
        terms.add('dance'); terms.add('dancing'); terms.add('choreograph');
      } else if (lower.startsWith('guitar') || lower === 'guitarists') {
        terms.add('guitar'); terms.add('music');
      } else if (lower.startsWith('comed') || lower === 'comedians') {
        terms.add('comedy'); terms.add('comedian');
      } else if (lower.startsWith('band') || lower === 'bands') {
        terms.add('band'); terms.add('music');
      } else if (lower.startsWith('music')) {
        terms.add('music'); terms.add('sing'); terms.add('song');
      } else if (lower.startsWith('beatbox')) {
        terms.add('beatbox');
      } else {
        const stem = lower.replace(/(ists|ers|ing|s)$/g, '');
        if (stem.length > 2) terms.add(stem);
      }
      return Array.from(terms).filter(t => t.length > 1);
    };

    if (rawQ) {
      const cleanTag = rawQ.replace(/^#/, '');
      videoConditions.push({
        OR: [
          { title: { contains: rawQ, mode: 'insensitive' } },
          { description: { contains: rawQ, mode: 'insensitive' } },
          { category: { contains: rawQ, mode: 'insensitive' } },
          { subCategory: { contains: rawQ, mode: 'insensitive' } },
          { author: { name: { contains: rawQ, mode: 'insensitive' } } },
          { author: { username: { contains: rawQ, mode: 'insensitive' } } },
          { author: { title: { contains: rawQ, mode: 'insensitive' } } },
          { hashtags: { some: { name: { contains: cleanTag, mode: 'insensitive' } } } }
        ]
      });
    }

    if (category && category !== 'All') {
      const catTerms = getCategoryTerms(category);
      videoConditions.push({
        OR: catTerms.flatMap(term => [
          { category: { contains: term, mode: 'insensitive' } },
          { subCategory: { contains: term, mode: 'insensitive' } },
          { title: { contains: term, mode: 'insensitive' } },
          { author: { title: { contains: term, mode: 'insensitive' } } },
          { hashtags: { some: { name: { contains: term, mode: 'insensitive' } } } }
        ])
      });
    }

    const videoWhere = videoConditions.length > 0 ? { AND: videoConditions } : {};

    // Also search matching Users / Talent
    let users: any[] = [];
    if (rawQ || (category && category !== 'All')) {
      const userTerms = rawQ ? [rawQ] : getCategoryTerms(category);
      users = await prisma.user.findMany({
        where: {
          OR: userTerms.flatMap(term => [
            { username: { contains: term, mode: 'insensitive' } },
            { name: { contains: term, mode: 'insensitive' } },
            { title: { contains: term, mode: 'insensitive' } },
            { location: { contains: term, mode: 'insensitive' } },
            { bio: { contains: term, mode: 'insensitive' } }
          ])
        },
        take: 12,
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
          title: true,
          location: true,
          _count: {
            select: { followers: true, videos: true }
          }
        }
      });
    }

    const videos = await prisma.video.findMany({
      where: videoWhere,
      include: {
        author: { select: { id: true, username: true, name: true, avatarUrl: true, title: true } },
        likes: true,
        comments: true,
        ratings: true
      },
      orderBy: { createdAt: 'desc' },
      take: 30
    });

    const formattedVideos = videos.map(v => ({
      id: v.id,
      title: v.title,
      description: v.description,
      category: v.category,
      subCategory: v.subCategory,
      filter: v.filter || null,
      filterIntensity: v.filterIntensity ?? null,
      authorId: v.author.id,
      author: v.author.name || v.author.username,
      authorUsername: v.author.username,
      authorAvatar: v.author.avatarUrl,
      authorTitle: v.author.title,
      url: v.url,
      likesCount: v.likes.length,
      commentsCount: v.comments.length,
      averageRating: v.ratings.length ? (v.ratings.reduce((acc, r) => acc + r.score, 0) / v.ratings.length).toFixed(1) : null
    }));

    const formattedUsers = users.map(u => ({
      id: u.id,
      username: u.username,
      name: u.name,
      avatarUrl: u.avatarUrl,
      title: u.title,
      location: u.location,
      followersCount: u._count.followers,
      videosCount: u._count.videos
    }));

    res.json({
      users: formattedUsers,
      videos: formattedVideos
    });
  } catch (error) {
    console.error('Discover error:', error);
    res.status(500).json({ error: 'Failed to search videos' });
  }
});


// Content Moderation / Reporting API
app.post('/api/reports', requireAuth, async (req, res) => {
  try {
    const userId = req.userId!;
    const { videoId, reason } = req.body;
    
    if (!videoId || !reason) {
      return res.status(400).json({ error: 'Missing videoId or reason' });
    }

    const report = await prisma.report.create({
      data: {
        reason,
        reporterId: userId,
        videoId: parseInt(videoId)
      }
    });
    
    res.json({ message: 'Report submitted successfully', report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// View Tracking API
app.post('/api/videos/:id/view', async (req, res) => {
  try {
    const videoId = parseInt(req.params.id as string);
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        views: { increment: 1 }
      }
    });
    res.json({ success: true, views: updatedVideo.views });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to record view' });
  }
});

// Admin Middleware
const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin only' });
  }
  next();
};

// Secure Admin wipe endpoint to reset all temporary data on deployed instances
app.post('/api/admin/system/wipe-all-data', async (req, res) => {
  const secret = req.headers['x-admin-secret'] || req.body?.secret;
  if (secret !== 'wipe-temp-data-2026') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  try {
    await prisma.booking.deleteMany();
    await prisma.show.deleteMany();
    await prisma.watchHistory.deleteMany();
    await prisma.savedVideo.deleteMany();
    await prisma.block.deleteMany();
    await prisma.message.deleteMany();
    await prisma.report.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.rating.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.like.deleteMany();
    await prisma.liveStream.deleteMany();
    await prisma.video.deleteMany();
    await prisma.hashtag.deleteMany();
    await prisma.follows.deleteMany();
    await prisma.user.deleteMany();
    return res.json({ success: true, message: 'All database records successfully wiped clean' });
  } catch (error: any) {
    console.error('Error wiping data:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Admin API - Get Users
app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Admin API - Ban User
app.put('/api/admin/users/:id/ban', requireAuth, requireAdmin, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id as string);
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: 'BANNED' }
    });
    res.json({ message: 'User banned', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

// User API - Delete Own Video / Performance Post
app.delete('/api/videos/:id', requireAuth, async (req, res) => {
  try {
    const videoId = parseInt(req.params.id as string);
    if (isNaN(videoId)) {
      return res.status(400).json({ error: 'Invalid video ID' });
    }
    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    const currentUserId = req.userId;
    const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });
    if (video.authorId !== currentUserId && currentUser?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to delete this video' });
    }

    // Delete media file permanently from Cloud Storage or container disk
    if (video.url) {
      deleteFileFromStorage(video.url).catch(() => {});
    }

    // Delete related records safely
    await prisma.$transaction([
      prisma.like.deleteMany({ where: { videoId } }),
      prisma.comment.deleteMany({ where: { videoId } }),
      prisma.rating.deleteMany({ where: { videoId } }),
      prisma.notification.deleteMany({ where: { videoId } }),
      prisma.report.deleteMany({ where: { videoId } }),
      prisma.savedVideo.deleteMany({ where: { videoId } }),
      prisma.watchHistory.deleteMany({ where: { videoId } }),
      prisma.video.delete({ where: { id: videoId } }),
    ]);

    res.json({ message: 'Performance deleted successfully', deletedId: videoId });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// User API - Update Own Video / Performance Post
app.put('/api/videos/:id', requireAuth, async (req, res) => {
  try {
    const videoId = parseInt(req.params.id as string);
    if (isNaN(videoId)) {
      return res.status(400).json({ error: 'Invalid video ID' });
    }
    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const currentUserId = req.userId;
    const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });
    if (video.authorId !== currentUserId && currentUser?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to update this video' });
    }
    const { title, description, privacy, allowJudging, allowComments } = req.body;
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (privacy !== undefined) updateData.privacy = privacy;
    if (allowJudging !== undefined) {
      updateData.allowJudging = !(allowJudging === false || allowJudging === 'false' || allowJudging === 0 || allowJudging === '0');
    }
    if (allowComments !== undefined) {
      updateData.allowComments = !(allowComments === false || allowComments === 'false' || allowComments === 0 || allowComments === '0');
    }
    const updated = await prisma.video.update({
      where: { id: videoId },
      data: updateData,
    });

    // Invalidate Redis feed cache
    try {
      if (redis.status === 'ready') {
        const feedKeys = await redis.keys('feed*');
        if (feedKeys.length > 0) {
          await redis.del(...feedKeys);
        }
      }
    } catch (e) {}
    res.json({ message: 'Performance updated successfully', video: updated });
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// Admin API - Delete Video
app.delete('/api/admin/videos/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const videoId = parseInt(req.params.id as string);
    await prisma.video.delete({ where: { id: videoId } });
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// Admin API - Resolve Report
app.put('/api/admin/reports/:id/resolve', requireAuth, requireAdmin, async (req, res) => {
  try {
    const reportId = parseInt(req.params.id as string);
    const report = await prisma.report.update({
      where: { id: reportId },
      data: { status: 'RESOLVED' }
    });
    res.json({ message: 'Report resolved', report });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve report' });
  }
});

// Direct Messaging (DMs) - Send Message
app.post('/api/messages', requireAuth, async (req, res) => {
  try {
    const senderId = req.userId!;
    const { receiverId, text, replyToId, replyToText, replyToSender } = req.body;
    
    if (!receiverId || !text || !text.trim()) {
      return res.status(400).json({ error: 'Missing receiverId or text' });
    }

    const recId = parseInt(receiverId);
    if (isNaN(recId)) {
      return res.status(400).json({ error: 'Invalid receiver ID' });
    }

    // Verify recipient exists
    const recipient = await prisma.user.findUnique({ where: { id: recId } });
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const message = await (prisma.message as any).create({
      data: {
        text: text.trim(),
        senderId,
        receiverId: recId,
        ...(replyToId ? { replyToId: Number(replyToId) } : {}),
        ...(replyToText ? { replyToText: String(replyToText).slice(0, 300) } : {}),
        ...(replyToSender ? { replyToSender: String(replyToSender) } : {}),
      }
    });

    // Real-time broadcast to chat room and recipient's notification channel
    const chatId = [senderId, recId].sort().join('_');
    io.to(`chat_${chatId}`).emit('receive_message', message);
    io.to(`user_${recId}`).emit('new_message_notification', { message, senderId });

    res.json(message);
  } catch (error) {
    console.error('Failed to send message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Search users for starting new chats / direct messages
app.get('/api/users/search', requireAuth, async (req: any, res: any) => {
  try {
    const currentUserId = req.userId!;
    const query = (req.query.q as string || '').trim();

    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        ...(query ? {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
            { title: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } }
          ]
        } : {})
      },
      take: 25,
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
        title: true,
        location: true
      },
      orderBy: { id: 'desc' }
    });

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Delete or Clear Conversation with another user
const handleClearConversation = async (req: any, res: any) => {
  try {
    const userId = req.userId!;
    const param = req.params?.otherUserId || req.params?.id || req.query?.otherUserId || req.body?.otherUserId;
    
    let otherUserId: number | null = null;
    if (param && param !== 'undefined' && param !== 'null' && param !== 'NaN') {
      const num = parseInt(param);
      if (!isNaN(num)) {
        otherUserId = num;
      } else {
        const found = await prisma.user.findFirst({ where: { username: String(param) } });
        if (found) otherUserId = found.id;
      }
    }

    if (otherUserId) {
      await prisma.message.deleteMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId }
          ]
        }
      });
    }

    res.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Failed to delete conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
};

// Delete an Individual Message by ID
app.delete('/api/messages/single/:id', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId!;
    const messageId = parseInt(req.params.id);
    if (isNaN(messageId)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      // Idempotent: message is already deleted or not in database
      return res.json({ success: true, messageId, alreadyDeleted: true });
    }

    // Only sender or receiver can delete the message
    if (message.senderId !== userId && message.receiverId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this message' });
    }

    try {
      await prisma.message.delete({
        where: { id: messageId }
      });
    } catch (delErr) {
      // If already deleted concurrently
    }

    const chatId = [message.senderId, message.receiverId].sort().join('_');
    // Real-time broadcast to chat room
    io.to(`chat_${chatId}`).emit('message_deleted', { messageId });

    res.json({ success: true, messageId });
  } catch (error) {
    console.error('Failed to delete individual message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Edit an Individual Message by ID (Only original author can edit)
app.patch('/api/messages/single/:id', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId!;
    const messageId = parseInt(req.params.id);
    const { text } = req.body;

    if (isNaN(messageId)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text cannot be empty' });
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({ error: 'Only the sender can edit this message' });
    }

    const updated = await (prisma.message as any).update({
      where: { id: messageId },
      data: {
        text: text.trim(),
        isEdited: true
      }
    });

    const chatId = [message.senderId, message.receiverId].sort().join('_');
    io.to(`chat_${chatId}`).emit('message_updated', updated);

    res.json({ success: true, message: updated });
  } catch (error) {
    console.error('Failed to edit message:', error);
    res.status(500).json({ error: 'Failed to edit message' });
  }
});

// Add or Toggle Emoji Reaction on a Message
app.post('/api/messages/single/:id/react', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId!;
    const messageId = parseInt(req.params.id);
    const { emoji } = req.body;

    if (isNaN(messageId) || !emoji) {
      return res.status(400).json({ error: 'Invalid message ID or emoji' });
    }

    const message = await (prisma.message as any).findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only chat participants can react
    if (message.senderId !== userId && message.receiverId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to react to this message' });
    }

    let reactionsMap: Record<string, number[]> = {};
    if (message.reactions) {
      try {
        reactionsMap = JSON.parse(message.reactions);
      } catch (e) {
        reactionsMap = {};
      }
    }

    const currentUsers: number[] = Array.isArray(reactionsMap[emoji]) ? reactionsMap[emoji] : [];
    if (currentUsers.includes(userId)) {
      // Toggle off
      reactionsMap[emoji] = currentUsers.filter((id) => id !== userId);
      if (reactionsMap[emoji].length === 0) {
        delete reactionsMap[emoji];
      }
    } else {
      // Toggle on
      reactionsMap[emoji] = [...currentUsers, userId];
    }

    const updatedReactionsStr = JSON.stringify(reactionsMap);
    await (prisma.message as any).update({
      where: { id: messageId },
      data: { reactions: updatedReactionsStr }
    });

    const chatId = [message.senderId, message.receiverId].sort().join('_');
    io.to(`chat_${chatId}`).emit('message_reaction', {
      messageId,
      reactions: updatedReactionsStr,
    });

    res.json({ success: true, messageId, reactions: updatedReactionsStr });
  } catch (error) {
    console.error('Failed to react to message:', error);
    res.status(500).json({ error: 'Failed to react to message' });
  }
});

app.delete('/api/messages/conversation/:otherUserId', requireAuth, handleClearConversation);
app.delete('/api/messages/conversation', requireAuth, handleClearConversation);
app.delete('/api/messages/:otherUserId', requireAuth, handleClearConversation);

// Get list of recent conversations for the logged in user (STATIC ROUTE MUST COME BEFORE PARAMETERIZED ROUTE)
app.get('/api/messages/conversations', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId!;
    // Find all users the current user has sent messages to or received messages from
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { sentMessages: { some: { receiverId: userId } } },
          { receivedMessages: { some: { senderId: userId } } }
        ]
      },
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true
      }
    });
    
    // For each user, get the last message and unread count between them
    const conversations = await Promise.all(users.map(async (u) => {
      const [lastMessage, unreadCount] = await Promise.all([
        prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: u.id },
              { senderId: u.id, receiverId: userId }
            ]
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.message.count({
          where: {
            senderId: u.id,
            receiverId: userId,
            isRead: false
          }
        })
      ]);

      return { user: u, lastMessage, unreadCount };
    }));
    
    // Sort conversations by latest message first
    conversations.sort((a, b) => {
      const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get chat history with a specific user (PARAMETERIZED ROUTE)
app.get('/api/messages/:id', requireAuth, async (req, res) => {
  try {
    const userId1 = req.userId!;
    const userId2 = parseInt(req.params.id as string);
    if (isNaN(userId2)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        senderId: userId2,
        receiverId: userId1,
        isRead: false
      },
      data: { isRead: true }
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Live Streaming (Removed - will build later)

// Creator Analytics
app.get('/api/analytics/me', requireAuth, async (req, res) => {
  try {
    const userId = req.userId!;
    
    const videos = await prisma.video.findMany({
      where: { authorId: userId },
      select: { views: true, likes: true }
    });
    
    const totalViews = videos.reduce((acc, v) => acc + v.views, 0);
    const totalLikes = videos.reduce((acc, v) => acc + v.likes.length, 0);
    
    res.json({
      totalVideos: videos.length,
      totalViews,
      totalLikes
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Bookmarks / Saved Videos
app.post('/api/videos/:id/save', async (req, res) => {
  try {
    const videoId = parseInt(req.params.id as string);
    if (isNaN(videoId)) {
      return res.status(400).json({ error: 'Invalid video ID' });
    }

    let userId: number | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { userId: number };
        userId = decoded.userId;
      } catch (e) {}
    }
    if (!userId && req.query.userId) {
      userId = parseInt(req.query.userId as string);
    }
    if (!userId && req.body?.userId) {
      userId = parseInt(req.body.userId as string);
    }

    if (!userId) {
      const defaultUser = await prisma.user.findFirst();
      if (defaultUser) {
        userId = defaultUser.id;
      } else {
        return res.status(401).json({ error: 'Unauthorized: Please log in to save videos' });
      }
    }
    
    const action = req.body?.action; // 'save' | 'unsave' | undefined (toggle)

    const existing = await prisma.savedVideo.findUnique({
      where: { userId_videoId: { userId, videoId } }
    });

    if (action === 'unsave') {
      if (existing) {
        await prisma.savedVideo.delete({ where: { id: existing.id } });
      }
      return res.json({ saved: false });
    }

    if (action === 'save') {
      if (!existing) {
        await prisma.savedVideo.create({ data: { userId, videoId } });
      }
      return res.json({ saved: true });
    }
    
    if (existing) {
      await prisma.savedVideo.delete({ where: { id: existing.id } });
      res.json({ saved: false });
    } else {
      await prisma.savedVideo.create({ data: { userId, videoId } });
      res.json({ saved: true });
    }
  } catch (error) {
    console.error('Failed to toggle save:', error);
    res.status(500).json({ error: 'Failed to toggle save' });
  }
});

app.get('/api/videos/saved', async (req, res) => {
  try {
    let userId: number | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { userId: number };
        userId = decoded.userId;
      } catch (e) {}
    }
    if (!userId && req.query.userId) {
      userId = parseInt(req.query.userId as string);
    }

    if (!userId) {
      const defaultUser = await prisma.user.findFirst();
      if (defaultUser) {
        userId = defaultUser.id;
      }
    }

    if (!userId) {
      return res.json({ videos: [] });
    }

    const saved = await prisma.savedVideo.findMany({
      where: { userId },
      include: {
        video: {
          include: {
            author: true,
            likes: true,
            savedBy: true,
            hashtags: true,
            comments: {
              include: { user: true }
            },
            ratings: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const formattedVideos = saved.filter(s => s.video != null).map(s => {
      const v = s.video;
      const authorObj = v.author;
      const authorName = authorObj ? (authorObj.name || authorObj.username || 'Artist') : 'Artist';
      return {
        id: v.id,
        title: v.title,
        description: v.description,
        category: v.category,
        subCategory: v.subCategory,
        purpose: v.purpose,
        location: v.location,
        allowJudging: (v as any).allowJudging ?? true,
        allowComments: (v as any).allowComments ?? true,
        privacy: v.privacy || 'PUBLIC',
        filter: v.filter || null,
        filterIntensity: v.filterIntensity ?? null,
        author: authorName,
        authorAvatar: authorObj?.avatarUrl || null,
        authorId: authorObj?.id || null,
        url: v.url,
        views: v.views,
        hashtags: v.hashtags ? v.hashtags.map((h: any) => h.name) : [],
        likesCount: v.likes.length,
        commentsCount: v.comments.length,
        comments: v.comments.map((c: any) => ({
          id: c.id,
          text: c.text,
          author: c.user.name || c.user.username,
          createdAt: c.createdAt
        })),
        isLiked: userId ? v.likes.some((l: any) => l.userId === userId) : false,
        isSaved: true,
        averageRating: v.ratings.length ? v.ratings.reduce((acc: any, r: any) => acc + r.score, 0) / v.ratings.length : 0,
        userRating: userId ? v.ratings.find((r: any) => r.userId === userId)?.score || null : null
      };
    });

    res.json({ videos: formattedVideos });
  } catch (error) {
    console.error('Failed to fetch saved videos:', error);
    res.status(500).json({ error: 'Failed to fetch saved videos' });
  }
});

// Video Sharing
app.post('/api/videos/:id/share', async (req, res) => {
  try {
    const videoId = parseInt(req.params.id as string);
    const updated = await prisma.video.update({
      where: { id: videoId },
      data: { shares: { increment: 1 } }
    });
    res.json({ shares: updated.shares });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track share' });
  }
});

// Trending Hashtags
app.get('/api/hashtags/trending', async (req, res) => {
  try {
    const tags = await prisma.hashtag.findMany({
      include: {
        _count: { select: { videos: true } }
      },
      orderBy: { videos: { _count: 'desc' } },
      take: 10
    });
    res.json({ hashtags: tags });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending hashtags' });
  }
});

// Following Feed
app.get('/api/feed/following', requireAuth, async (req, res) => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Find who this user follows
    const follows = await prisma.follows.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    });
    const followingIds = follows.map(f => f.followingId);
    
    if (followingIds.length === 0) {
      return res.json({ videos: [] });
    }
    
    const rawVideos = await prisma.video.findMany({
      where: { authorId: { in: followingIds } },
      take: limit * 2,
      orderBy: { createdAt: 'desc' },
      include: {
        author: true, likes: true, hashtags: true,
        comments: { include: { user: true } }, ratings: true
      }
    });
    
    // Homepage following feed is strictly for videos only
    const videos = rawVideos.filter(v => !isImageMedia(v.url)).slice(0, limit);
    res.json({ videos });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch following feed' });
  }
});

// Block a user
app.post('/api/users/:id/block', requireAuth, async (req, res) => {
  try {
    const blockedId = parseInt(req.params.id as string);
    const blockerId = req.userId!;
    if (blockedId === blockerId) return res.status(400).json({ error: 'Cannot block yourself' });
    
    await prisma.block.create({
      data: { blockerId, blockedId }
    });
    // Optional: Also unfollow them
    await prisma.follows.deleteMany({
      where: {
        OR: [
          { followerId: blockerId, followingId: blockedId },
          { followerId: blockedId, followingId: blockerId }
        ]
      }
    });
    res.json({ success: true, message: 'User blocked' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to block user' });
  }
});

// Fetch Paginated Comments
app.get('/api/videos/:id/comments', async (req, res) => {
  try {
    const videoId = parseInt(req.params.id as string);
    const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : undefined;
    const limit = 20;

    const comments = await prisma.comment.findMany({
      where: { videoId },
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, username: true, name: true, avatarUrl: true } } }
    });

    let nextCursor: number | null = null;
    if (comments.length > limit) {
      const nextItem = comments.pop();
      nextCursor = nextItem!.id;
    }

    res.json({ comments, nextCursor });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});



// Report Watch Time (Analytics)
app.post('/api/videos/:id/watch-time', requireAuth, async (req, res) => {
  try {
    const videoId = parseInt(req.params.id as string);
    const { watchTime } = req.body;
    
    if (typeof watchTime !== 'number') return res.status(400).json({ error: 'Invalid watch time' });
    
    await prisma.watchHistory.create({
      data: { userId: req.userId!, videoId, watchTime }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record watch time' });
  }
});




// WebSockets for Real-Time Chat
io.on('connection', (socket) => {
  console.log('A user connected via WebSocket:', socket.id);

  // Join private user room for cross-screen message notifications
  socket.on('join_user', (data) => {
    if (data?.userId) {
      socket.join(`user_${data.userId}`);
    }
  });

  // Join profile room for live follower count updates
  socket.on('join_profile', (data) => {
    if (data?.profileUserId) {
      socket.join(`profile_${data.profileUserId}`);
    }
  });

  socket.on('leave_profile', (data) => {
    if (data?.profileUserId) {
      socket.leave(`profile_${data.profileUserId}`);
    }
  });

  socket.on('join_chat', (data) => {
    if (data?.chatId) {
      socket.join(`chat_${data.chatId}`); // chatId could be "1_2" (user1 + user2)
    }
  });

  socket.on('typing', (data) => {
    if (data?.chatId) {
      socket.to(`chat_${data.chatId}`).emit('user_typing', { userId: data.userId });
    }
  });

  socket.on('stop_typing', (data) => {
    if (data?.chatId) {
      socket.to(`chat_${data.chatId}`).emit('user_stop_typing', { userId: data.userId });
    }
  });

  socket.on('send_message', async (data) => {
    try {
      if (!data?.text || !data?.senderId || !data?.receiverId) return;

      // Save to database
      const message = await prisma.message.create({
        data: {
          text: data.text.trim(),
          senderId: data.senderId,
          receiverId: data.receiverId
        }
      });
      
      const chatId = data.chatId || [data.senderId, data.receiverId].sort().join('_');

      // Broadcast the message to the chat room
      io.to(`chat_${chatId}`).emit('receive_message', message);
      // Also emit to the receiver's personal user room
      io.to(`user_${data.receiverId}`).emit('new_message_notification', { message, senderId: data.senderId });
    } catch (error) {
      console.error('Failed to save message via socket', error);
    }
  });

  // WebRTC Audio / Video Call Signaling Events (Removed - will build later)

  socket.on('disconnect', () => {
    // disconnected
  });
});

server.listen(PORT, () => {
  console.log(`Backend server is running on ${BASE_URL}`);
  console.log(`Swagger API Docs available at ${BASE_URL}/api-docs`);
});

// --- Shows Routes ---

// Get all shows across the platform (with city & status filtering, auto-seeded if empty)
app.get('/api/shows', async (req: any, res: any) => {
  try {
    const { city, status } = req.query;
    let requesterId: number | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { userId: number };
        requesterId = decoded.userId;
      } catch (e) {}
    }



    const where: any = {};
    if (city && city !== 'All Cities') {
      where.location = { contains: city as string };
    }
    const now = new Date();
    if (status === 'upcoming') {
      where.date = { gte: now };
    } else if (status === 'archive') {
      where.date = { lt: now };
    }

    const shows = await prisma.show.findMany({
      where,
      include: {
        host: {
          select: { id: true, username: true, name: true, avatarUrl: true, title: true }
        },
        bookings: {
          include: {
            user: { select: { id: true, username: true, name: true, avatarUrl: true } }
          }
        }
      },
      orderBy: { date: status === 'archive' ? 'desc' : 'asc' }
    });

    const mapped = shows.map((s: any) => ({
      ...s,
      visiting: s.bookings?.length || 0,
      isVisiting: requesterId ? s.bookings?.some((b: any) => b.userId === requesterId) : false,
      isBooked: requesterId ? s.bookings?.some((b: any) => b.userId === requesterId) : false,
      ticketCode: requesterId ? `PASS-${s.id}-${requesterId}` : null,
      attendees: s.bookings?.map((b: any) => b.user) || []
    }));

    res.json(mapped);
  } catch (error) {
    console.error('Error fetching global shows:', error);
    res.status(500).json({ error: 'Failed to fetch shows' });
  }
});

// Create a new show
app.post('/api/shows', requireAuth, async (req: any, res: any) => {
  try {
    const hostId = req.userId!;
    const { title, location, date, image } = req.body;
    if (!title || !location || !date) {
      return res.status(400).json({ error: 'Title, location, and date are required' });
    }

    const show = await prisma.show.create({
      data: {
        title,
        location,
        date: new Date(date),
        image: image || null,
        hostId
      },
      include: {
        host: { select: { id: true, username: true, name: true, avatarUrl: true } },
        bookings: true
      }
    });

    res.json(show);
  } catch (error) {
    console.error('Error creating show:', error);
    res.status(500).json({ error: 'Failed to create show' });
  }
});

// Get all shows for a specific user (host)
app.get('/api/shows/:userId', async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.userId);

    // Optional auth check
    let requesterId: number | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { userId: number };
        requesterId = decoded.userId;
      } catch (e) {}
    }

    const shows = await prisma.show.findMany({
      where: { hostId: userId },
      include: {
        bookings: true,
      },
      orderBy: { date: 'asc' },
    });

    const mappedShows = shows.map((s: any) => ({
      ...s,
      visiting: s.bookings?.length || 0,
      isVisiting: requesterId ? s.bookings?.some((b: any) => b.userId === requesterId) : false,
      isBooked: requesterId ? s.bookings?.some((b: any) => b.userId === requesterId) : false,
      ticketCode: requesterId ? `PASS-${s.id}-${requesterId}` : null,
    }));

    res.json(mappedShows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shows' });
  }
});

// Book a show (RSVP)
app.post('/api/shows/:showId/book', requireAuth, async (req: any, res: any) => {
  try {
    const showId = parseInt(req.params.showId);
    const userId = req.userId || req.user?.id;

    // Check if already booked
    const existing = await prisma.booking.findUnique({
      where: {
        userId_showId: { userId, showId }
      }
    });

    if (existing) {
      // Unbook
      await prisma.booking.delete({ where: { id: existing.id } });
      res.json({ message: 'Unbooked successfully', isBooked: false });
    } else {
      // Book
      await prisma.booking.create({
        data: { userId, showId }
      });
      res.json({ message: 'Booked successfully', isBooked: true, ticketCode: `PASS-${showId}-${userId}` });
    }
  } catch (error) {
    res.status(500).json({ error: 'Booking failed' });
  }
});

Sentry.setupExpressErrorHandler(app);

// Global error handler (handles Multer errors, boundary issues, etc.)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    console.error('Unhandled request error:', err);
    if (!res.headersSent) {
      const isMulter = err.name === 'MulterError' || (err.message && (err.message.includes('Multipart') || err.message.includes('file field')));
      const status = err.status || (isMulter ? 400 : 500);
      return res.status(status).json({ error: err.message || 'Internal server error' });
    }
  }
  next();
});


