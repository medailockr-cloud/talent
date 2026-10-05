import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

const prisma = new PrismaClient();
const app = express();
const JWT_SECRET = 'super-secret-jwt-key-for-development-only';
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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
const upload = multer({ storage });

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadDir));

// API Route for Step 3 - Now using Prisma!
app.get('/api/feed', async (req, res) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : null;
    const limit = parseInt(req.query.limit as string) || 10;
    const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : undefined;
    
    const videos = await prisma.video.findMany({
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        author: true,
        likes: true,
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

    // If the database is empty, let's auto-seed some data so the mobile app isn't blank
    if (videos.length === 0) {
      console.log('🌱 Database is empty! Auto-seeding some initial videos...');
      
      const hashedSeedPassword = await bcrypt.hash('password123', 10);
      
      await prisma.user.create({
        data: {
          username: 'janedoe',
          password: hashedSeedPassword,
          name: 'Jane Doe',
          videos: {
            create: [
              { title: 'Awesome Singing Performance', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
            ]
          }
        }
      });
      
      await prisma.user.create({
        data: {
          username: 'johnsmith',
          password: hashedSeedPassword,
          name: 'John Smith',
          videos: {
            create: [
              { title: 'Crazy Dance Moves', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
            ]
          }
        }
      });
      
      // Fetch again after seeding
      const seededVideos = await prisma.video.findMany({
        include: { author: true, likes: true, hashtags: true, comments: { include: { user: true } }, ratings: true },
        orderBy: { createdAt: 'desc' }
      });
      
      return res.json({ 
        videos: seededVideos.map(v => ({
          id: v.id,
          title: v.title,
          author: v.author.name || v.author.username,
          url: v.url,
          likesCount: v.likes.length,
          commentsCount: v.comments.length,
          comments: v.comments.map((c: any) => ({
            id: c.id,
            text: c.text,
            author: c.user.name || c.user.username,
            createdAt: c.createdAt
          })),
          isLiked: userId ? v.likes.some(l => l.userId === userId) : false,
          averageRating: v.ratings.length ? v.ratings.reduce((acc: any, r: any) => acc + r.score, 0) / v.ratings.length : 0,
          userRating: userId ? v.ratings.find((r: any) => r.userId === userId)?.score || null : null
        })) 
      });
    }

    // Format the response to match what the mobile app expects
    let formattedVideos = videos.map(v => ({
      id: v.id,
      title: v.title,
      author: v.author.name || v.author.username,
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

    res.json({ videos: formattedVideos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch videos' });
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
    res.json({ token, user: { id: user.id, username: user.username, name: user.name } });
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
    res.json({ token, user: { id: user.id, username: user.username, name: user.name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Upload a new Video (Protected)
app.post('/api/videos', requireAuth, upload.single('video'), async (req, res) => {
  try {
    const { title, description, category, subCategory, purpose, location, allowJudging } = req.body;
    const authorId = req.userId!;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const url = `http://localhost:${PORT}/uploads/${req.file.filename}`;

    // Extract hashtags from title or description
    const textToParse = `${title} ${description || ''}`;
    const hashtagRegex = /#[\w]+/g;
    const extractedTags = textToParse.match(hashtagRegex) || [];
    // Remove the '#' character
    const tags = Array.from(new Set(extractedTags.map((t: string) => t.slice(1).toLowerCase())));

    const video = await prisma.video.create({
      data: { 
        title, 
        description: description || '', 
        url, 
        category: category || null,
        subCategory: subCategory || null,
        purpose: purpose || null,
        location: location || null,
        allowJudging: allowJudging === 'false' ? false : true,
        authorId,
        hashtags: {
          connectOrCreate: tags.map(tag => ({
            where: { name: tag },
            create: { name: tag }
          }))
        }
      }
    });
    res.json(video);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create video' });
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

// Comment on a Video (Protected)
app.post('/api/videos/:id/comment', requireAuth, async (req, res) => {
  try {
    const videoId = parseInt(req.params.id as string);
    const userId = req.userId!;
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const comment = await prisma.comment.create({
      data: { text, userId, videoId },
      include: { user: true }
    });
    
    // Generate Notification
    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (video && video.authorId !== userId) {
      await prisma.notification.create({
        data: {
          type: 'COMMENT',
          userId: video.authorId,
          actorId: userId,
          videoId: videoId
        }
      });
    }
    
    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Rate a Video (Protected)
app.post('/api/videos/:id/rate', requireAuth, async (req, res) => {
  try {
    const videoId = parseInt(req.params.id as string);
    const userId = req.userId!;
    const { score } = req.body;
    
    if (score < 1 || score > 10) {
      return res.status(400).json({ error: 'Score must be between 1 and 10' });
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
    
    const user = await prisma.user.findUnique({
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
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      followers: user._count.followers,
      following: user._count.following,
      videosCount: user._count.videos,
      videos: user.videos
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
    
    const user = await prisma.user.findUnique({
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
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      followers: user._count.followers,
      following: user._count.following,
      videosCount: user._count.videos,
      videos: user.videos
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
    const { name, bio } = req.body;
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (req.file) {
      updateData.avatarUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
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
      avatarUrl: updatedUser.avatarUrl
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
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

    if (existingFollow) {
      await prisma.follows.delete({ where: { id: existingFollow.id } });
      return res.json({ following: false });
    } else {
      await prisma.follows.create({ data: { followerId, followingId } });
      
      // Generate Notification
      await prisma.notification.create({
        data: {
          type: 'FOLLOW',
          userId: followingId,
          actorId: followerId
        }
      });
      
      return res.json({ following: true });
    }
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

// Search and Discovery API
app.get('/api/search', async (req, res) => {
  try {
    const { q, category } = req.query;
    
    const videos = await prisma.video.findMany({
      where: {
        AND: [
          q ? { title: { contains: q as string } } : {},
          category ? { category: category as string } : {}
        ]
      },
      include: {
        author: { select: { id: true, username: true, name: true, avatarUrl: true } },
        likes: true,
        comments: true,
        ratings: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const formattedVideos = videos.map(v => ({
      id: v.id,
      title: v.title,
      author: v.author.name || v.author.username,
      authorAvatar: v.author.avatarUrl,
      url: v.url,
      likesCount: v.likes.length,
      commentsCount: v.comments.length,
      averageRating: v.ratings.length ? v.ratings.reduce((acc, r) => acc + r.score, 0) / v.ratings.length : 0
    }));

    res.json({ videos: formattedVideos });
  } catch (error) {
    console.error(error);
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

// Direct Messaging (DMs)
app.post('/api/messages', requireAuth, async (req, res) => {
  try {
    const senderId = req.userId!;
    const { receiverId, text } = req.body;
    
    if (!receiverId || !text) return res.status(400).json({ error: 'Missing receiverId or text' });

    const message = await prisma.message.create({
      data: {
        text,
        senderId,
        receiverId: parseInt(receiverId)
      }
    });
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.get('/api/messages/:id', requireAuth, async (req, res) => {
  try {
    const userId1 = req.userId!;
    const userId2 = parseInt(req.params.id as string);
    
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Live Streaming (Placeholder)
app.post('/api/livestream/start', requireAuth, async (req, res) => {
  try {
    const hostId = req.userId!;
    const { title } = req.body;
    
    const streamKey = `live_${hostId}_${Date.now()}`;
    
    const stream = await prisma.liveStream.upsert({
      where: { hostId },
      update: { title, streamKey, isActive: true, startedAt: new Date(), endedAt: null },
      create: { title: title || 'My Stream', streamKey, hostId, isActive: true, startedAt: new Date() }
    });
    
    res.json({ streamUrl: `rtmp://localhost/live/${streamKey}`, stream });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start livestream' });
  }
});

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
app.post('/api/videos/:id/save', requireAuth, async (req, res) => {
  try {
    const videoId = parseInt(req.params.id as string);
    const userId = req.userId!;
    
    const existing = await prisma.savedVideo.findUnique({
      where: { userId_videoId: { userId, videoId } }
    });
    
    if (existing) {
      await prisma.savedVideo.delete({ where: { id: existing.id } });
      res.json({ saved: false });
    } else {
      await prisma.savedVideo.create({ data: { userId, videoId } });
      res.json({ saved: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle save' });
  }
});

app.get('/api/videos/saved', requireAuth, async (req, res) => {
  try {
    const userId = req.userId!;
    const saved = await prisma.savedVideo.findMany({
      where: { userId },
      include: {
        video: {
          include: {
            author: true, likes: true, comments: true, ratings: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ videos: saved.map(s => s.video) });
  } catch (error) {
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
    
    const videos = await prisma.video.findMany({
      where: { authorId: { in: followingIds } },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: true, likes: true, hashtags: true,
        comments: { include: { user: true } }, ratings: true
      }
    });
    
    res.json({ videos });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch following feed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});
