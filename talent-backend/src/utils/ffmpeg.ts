import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import path from 'path';
import fs from 'fs';

// Set the path to the ffmpeg binary so it works automatically on Windows/Mac/Linux
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export const convertToHLS = (inputPath: string, videoId: number) => {
  return new Promise((resolve, reject) => {
    // We will save the HLS output inside the uploads/hls directory
    const hlsDir = path.join(__dirname, '../../uploads/hls', videoId.toString());
    
    if (!fs.existsSync(hlsDir)) {
      fs.mkdirSync(hlsDir, { recursive: true });
    }

    const outputPath = path.join(hlsDir, 'index.m3u8');

    ffmpeg(inputPath)
      .outputOptions([
        '-profile:v baseline', // baseline profile (level 3.0) for H.264 video codec
        '-level 3.0', 
        '-s 640x360',          // convert to 360p for adaptive streaming (can add more resolutions)
        '-start_number 0',     // start the first .ts segment at index 0
        '-hls_time 10',        // 10 second playlist length
        '-hls_list_size 0',    // Maxmimum number of playlist entries (0 means all entries/infinite)
        '-f hls'               // HLS format
      ])
      .output(outputPath)
      .on('end', () => {
        console.log(`HLS conversion finished for video ${videoId}`);
        resolve(`/uploads/hls/${videoId}/index.m3u8`);
      })
      .on('error', (err) => {
        console.error(`Error converting video ${videoId} to HLS:`, err);
        reject(err);
      })
      .run();
  });
};
