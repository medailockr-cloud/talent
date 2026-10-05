import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const prisma = new PrismaClient();
const app = express();
const JWT_SECRET = 'super-secret-jwt-key-for-development-only';
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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
    
    const videos = await prisma.video.findMany({
      include: {
        author: true,
        likes: true,
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
        include: { author: true, likes: true, comments: { include: { user: true } }, ratings: true },
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
    const formattedVideos = videos.map(v => ({
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
      isLiked: userId ? v.likes.some((l: any) => l.userId === userId) : false,
      averageRating: v.ratings.length ? v.ratings.reduce((acc: any, r: any) => acc + r.score, 0) / v.ratings.length : 0,
      userRating: userId ? v.ratings.find((r: any) => r.userId === userId)?.score || null : null
    }));

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

// Upload a new Video
app.post('/api/videos', upload.single('video'), async (req, res) => {
  try {
    const { title, description, authorId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const url = `http://localhost:${PORT}/uploads/${req.file.filename}`;

    const video = await prisma.video.create({
      data: { 
        title, 
        description: description || '', 
        url, 
        authorId: parseInt(authorId) 
      }
    });
    res.json(video);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create video' });
  }
});

// Like a Video
app.post('/api/videos/:id/like', async (req, res) => {
  try {
    const videoId = parseInt(req.params.id);
    const { userId } = req.body;

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
      return res.json({ liked: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// Comment on a Video
app.post('/api/videos/:id/comment', async (req, res) => {
  try {
    const videoId = parseInt(req.params.id);
    const { userId, text } = req.body;
    
    const comment = await prisma.comment.create({
      data: { text, userId, videoId },
      include: { user: true }
    });
    
    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Rate a Video
app.post('/api/videos/:id/rate', async (req, res) => {
  try {
    const videoId = parseInt(req.params.id);
    const { userId, score } = req.body;
    
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

// Get User Profile
app.get('/api/profile/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        videos: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { videos: true }
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
      followers: 0, // Mocked for now
      following: 0, // Mocked for now
      videosCount: user._count.videos,
      videos: user.videos
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});
