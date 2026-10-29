import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import path from 'path';
import fs from 'fs';
import { isCloudStorageEnabled, uploadHlsDirectoryToStorage } from './cloudStorage';

// Prefer system ffmpeg binary (e.g. in Docker / Linux container) or fallback to installer path
if (process.env.FFMPEG_PATH) {
  ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
} else if (ffmpegInstaller && ffmpegInstaller.path) {
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);
}

export const convertToHLS = (inputPath: string, videoId: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Generate HLS files in local temporary directory
    const hlsDir = path.join(__dirname, '../../uploads/hls', videoId.toString());

    if (!fs.existsSync(hlsDir)) {
      fs.mkdirSync(hlsDir, { recursive: true });
    }

    const outputPath = path.join(hlsDir, 'index.m3u8');

    ffmpeg(inputPath)
      .outputOptions([
        '-profile:v baseline',
        '-level 3.0',
        '-s 640x360',
        '-start_number 0',
        '-hls_time 10',
        '-hls_list_size 0',
        '-f hls'
      ])
      .output(outputPath)
      .on('end', async () => {
        console.log(`HLS conversion finished locally for video ${videoId}`);
        try {
          if (isCloudStorageEnabled()) {
            const cloudUrl = await uploadHlsDirectoryToStorage(hlsDir, videoId);
            // Clean up temporary local directory to preserve container storage
            fs.rmSync(hlsDir, { recursive: true, force: true });
            resolve(cloudUrl);
          } else {
            resolve(`/uploads/hls/${videoId}/index.m3u8`);
          }
        } catch (uploadError) {
          console.error(`Error uploading HLS files for video ${videoId}:`, uploadError);
          // Fallback to local path if cloud upload fails
          resolve(`/uploads/hls/${videoId}/index.m3u8`);
        }
      })
      .on('error', (err) => {
        console.error(`Error converting video ${videoId} to HLS:`, err);
        reject(err);
      })
      .run();
  });
};

export const trimVideoFile = (
  inputPath: string,
  outputPath: string,
  trimStart: number,
  trimEnd?: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    let cmd = ffmpeg(inputPath);
    if (trimStart > 0) {
      cmd = cmd.setStartTime(trimStart);
    }
    if (trimEnd && trimEnd > trimStart) {
      cmd = cmd.setDuration(trimEnd - trimStart);
    }
    cmd
      .outputOptions([
        '-c:v libx264',
        '-preset fast',
        '-crf 22',
        '-c:a aac',
        '-b:a 128k',
        '-movflags +faststart'
      ])
      .output(outputPath)
      .on('end', () => {
        console.log(`[FFmpeg] Trim finished from ${trimStart}s to ${trimEnd || 'end'}s`);
        resolve();
      })
      .on('error', (err) => {
        console.error('[FFmpeg] Error trimming video:', err);
        reject(err);
      })
      .run();
  });
};
