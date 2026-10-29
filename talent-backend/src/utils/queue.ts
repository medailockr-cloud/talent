import { Queue, Worker } from 'bullmq';
import { convertToHLS } from './ffmpeg';
import { isCloudStorageEnabled } from './cloudStorage';
import fs from 'fs';

// Support REDIS_URL (Render/Upstash/Cloud Memorystore) or fallback to REDIS_HOST/REDIS_PORT
const connection = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL, maxRetriesPerRequest: null, enableOfflineQueue: false }
  : {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
  };

export const videoQueue = new Queue('video-transcoding', { connection });

videoQueue.on('error', () => {
  // Gracefully catch and suppress connection error spam if Redis is offline
});

export const videoWorker = new Worker('video-transcoding', async (job) => {
  const { inputPath, videoId } = job.data;
  console.log(`[BullMQ Worker] Processing video ${videoId}...`);
  try {
    const hlsUrl = await convertToHLS(inputPath, videoId);
    console.log(`[BullMQ Worker] Finished processing video ${videoId}, result: ${hlsUrl}`);

    // If cloud storage is enabled and the original local upload file still exists, clean it up to preserve container disk
    if (isCloudStorageEnabled() && inputPath && fs.existsSync(inputPath)) {
      fs.unlink(inputPath, () => { });
    }
  } catch (error) {
    console.error(`[BullMQ Worker] Error processing video ${videoId}:`, error);
    throw error;
  }
}, { connection });

videoWorker.on('error', () => {
  // Gracefully catch and suppress connection error spam if Redis is offline
});

videoWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error ${err?.message || err}`);
});
