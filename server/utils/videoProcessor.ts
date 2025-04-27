import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';

// Get the current file path in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
const videosDir = path.join(uploadsDir, 'videos');
const thumbnailsDir = path.join(uploadsDir, 'thumbnails');

fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(videosDir);
fs.ensureDirSync(thumbnailsDir);

export interface VideoProcessingResult {
  videoPath: string;
  thumbnailPath: string;
  duration: number;
}

export async function processVideo(
  videoFile: Express.Multer.File
): Promise<VideoProcessingResult> {
  return new Promise((resolve, reject) => {
    // Generate unique filenames
    const timestamp = Date.now();
    const videoFileName = `video_${timestamp}${path.extname(videoFile.originalname)}`;
    const thumbnailFileName = `thumbnail_${timestamp}.jpg`;
    
    const videoPath = path.join(videosDir, videoFileName);
    const thumbnailPath = path.join(thumbnailsDir, thumbnailFileName);
    
    // Save the uploaded video
    fs.writeFileSync(videoPath, videoFile.buffer);
    
    // Get video information
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(new Error(`Failed to probe video: ${err.message}`));
        return;
      }
      
      const duration = metadata.format.duration || 0;
      
      // Check if video is under 1 minute and 30 seconds (90 seconds)
      if (duration > 90) {
        fs.unlinkSync(videoPath); // Delete the uploaded video
        reject(new Error('Video exceeds the maximum allowed duration of 1 minute and 30 seconds'));
        return;
      }
      
      // Generate thumbnail from the middle of the video
      ffmpeg(videoPath)
        .screenshots({
          timestamps: ['50%'],
          filename: thumbnailFileName,
          folder: thumbnailsDir,
          size: '320x240'
        })
        .on('end', () => {
          resolve({
            videoPath: `/uploads/videos/${videoFileName}`,
            thumbnailPath: `/uploads/thumbnails/${thumbnailFileName}`,
            duration
          });
        })
        .on('error', (err) => {
          fs.unlinkSync(videoPath); // Delete the uploaded video on error
          reject(new Error(`Failed to generate thumbnail: ${err.message}`));
        });
    });
  });
}