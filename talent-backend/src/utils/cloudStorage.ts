import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';

const bucketName = process.env.GCS_BUCKET_NAME || 'talent-media-production';
const cdnBaseUrl = (process.env.CDN_BASE_URL || '').replace(/\/$/, '');

let storageClient: Storage | null = null;

export const isCloudStorageEnabled = (): boolean => {
  return Boolean(bucketName);
};

export const getStorageClient = (): Storage | null => {
  if (!isCloudStorageEnabled()) {
    return null;
  }
  if (!storageClient) {
    // If running on Google Cloud Run, it automatically picks up the workload identity/default service account.
    // If GOOGLE_APPLICATION_CREDENTIALS is provided (e.g. locally or via secret), it uses that.
    storageClient = new Storage();
  }
  return storageClient;
};

export const getPublicStorageUrl = (destinationPath: string): string => {
  const cleanPath = destinationPath.replace(/^\//, '');
  if (cdnBaseUrl) {
    return `${cdnBaseUrl}/${cleanPath}`;
  }
  if (bucketName) {
    return `https://storage.googleapis.com/${bucketName}/${cleanPath}`;
  }
  return `/uploads/${cleanPath}`;
};

export const uploadFileToStorage = async (
  localFilePath: string,
  destinationPath: string,
  contentType?: string
): Promise<string> => {
  if (!isCloudStorageEnabled()) {
    return getPublicStorageUrl(destinationPath);
  }

  const client = getStorageClient();
  if (!client) {
    throw new Error('Cloud storage client is unavailable');
  }

  const cleanDestination = destinationPath.replace(/^\//, '');
  const bucket = client.bucket(bucketName);

  await bucket.upload(localFilePath, {
    destination: cleanDestination,
    metadata: { contentType: contentType || undefined, cacheControl: 'public, max-age=31536000' },
    resumable: false,
  });

  return getPublicStorageUrl(cleanDestination);
};

export const uploadBufferToStorage = async (
  buffer: Buffer,
  destinationPath: string,
  contentType?: string
): Promise<string> => {
  if (!isCloudStorageEnabled()) {
    return getPublicStorageUrl(destinationPath);
  }

  const client = getStorageClient();
  if (!client) {
    throw new Error('Cloud storage client is unavailable');
  }

  const cleanDestination = destinationPath.replace(/^\//, '');
  const bucket = client.bucket(bucketName);
  const file = bucket.file(cleanDestination);

  await file.save(buffer, {
    metadata: contentType ? { contentType } : undefined,
    resumable: false,
  });

  return getPublicStorageUrl(cleanDestination);
};

export const uploadHlsDirectoryToStorage = async (
  localHlsDir: string,
  videoId: number
): Promise<string> => {
  if (!fs.existsSync(localHlsDir)) {
    throw new Error(`HLS directory does not exist: ${localHlsDir}`);
  }

  if (!isCloudStorageEnabled()) {
    return `/uploads/hls/${videoId}/index.m3u8`;
  }

  const files = fs.readdirSync(localHlsDir);
  const client = getStorageClient();
  if (!client) {
    throw new Error('Cloud storage client is unavailable');
  }

  const bucket = client.bucket(bucketName);

  for (const file of files) {
    const fullPath = path.join(localHlsDir, file);
    const destination = `hls/${videoId}/${file}`;
    const contentType = file.endsWith('.m3u8')
      ? 'application/vnd.apple.mpegurl'
      : file.endsWith('.ts')
        ? 'video/MP2T'
        : undefined;

    await bucket.upload(fullPath, {
      destination,
      metadata: contentType ? { contentType } : undefined,
      resumable: false,
    });
  }

  return getPublicStorageUrl(`hls/${videoId}/index.m3u8`);
};


export const deleteFileFromStorage = async (fileUrl: string): Promise<boolean> => {
  if (!fileUrl) return false;

  try {
    // 1. If it's a Google Cloud Storage URL for our bucket:
    if (bucketName && (fileUrl.includes(`storage.googleapis.com/${bucketName}`) || (cdnBaseUrl && fileUrl.startsWith(cdnBaseUrl)))) {
      const client = getStorageClient();
      if (!client) return false;

      let relativePath = '';
      if (cdnBaseUrl && fileUrl.startsWith(cdnBaseUrl)) {
        relativePath = fileUrl.replace(cdnBaseUrl, '').replace(/^\//, '');
      } else {
        const marker = `storage.googleapis.com/${bucketName}/`;
        const idx = fileUrl.indexOf(marker);
        if (idx !== -1) {
          relativePath = fileUrl.substring(idx + marker.length);
        }
      }

      if (relativePath) {
        const bucket = client.bucket(bucketName);
        if (relativePath.includes('hls/')) {
          const hlsPrefix = relativePath.substring(0, relativePath.lastIndexOf('/') + 1);
          await bucket.deleteFiles({ prefix: hlsPrefix });
        } else {
          await bucket.file(relativePath).delete({ ignoreNotFound: true });
        }
        return true;
      }
    }

    // 2. If it's a local container /uploads file:
    const uploadsMatch = fileUrl.match(/\/uploads\/([^?#]+)/);
    if (uploadsMatch) {
      const localFilename = uploadsMatch[1];
      const localFilePath = path.join(__dirname, '../../uploads', localFilename);
      if (fs.existsSync(localFilePath)) {
        fs.unlink(localFilePath, () => {});
        return true;
      }
    }
  } catch (err) {
    console.warn('Failed to delete file from storage:', err);
  }

  return false;
};
