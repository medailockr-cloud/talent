import { Queue, Worker } from 'bullmq';
import { convertToHLS } from './ffmpeg';

// Re-use connection from the local redis url
const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const videoQueue = new Queue('video-transcoding', { connection });

// In a massive enterprise app, this Worker would actually live on a completely separate server!
// But for now, we'll run it here.
export const videoWorker = new Worker('video-transcoding', async (job) => {
  const { inputPath, videoId } = job.data;
  console.log(`[BullMQ Worker] Processing video ${videoId}...`);
  try {
    await convertToHLS(inputPath, videoId);
    console.log(`[BullMQ Worker] Finished processing video ${videoId}`);
  } catch (error) {
    console.error(`[BullMQ Worker] Error processing video ${videoId}:`, error);
    throw error; // Tell BullMQ to retry or fail the job
  }
}, { connection });

videoWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error ${err.message}`);
});
