import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';

// Get the current file path in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const projectRoot = path.resolve(__dirname, '../..');
const uploadsDir = path.join(projectRoot, 'uploads');
const videosDir = path.join(uploadsDir, 'videos');
const thumbnailsDir = path.join(uploadsDir, 'thumbnails');

console.log('Project root directory:', projectRoot);
console.log('Uploads directory:', uploadsDir);
console.log('Videos directory:', videosDir);
console.log('Thumbnails directory:', thumbnailsDir);

try {
  fs.ensureDirSync(uploadsDir);
  fs.ensureDirSync(videosDir);
  fs.ensureDirSync(thumbnailsDir);
  console.log('Successfully ensured all directories exist');
  fs.writeFileSync(path.join(uploadsDir, 'test.txt'), 'This is a test file to verify write permissions');
  console.log('Successfully wrote test file to uploads directory');
} catch (error: any) {
  console.error('Error ensuring directories exist:', error.message);
}

export interface VideoProcessingResult {
  videoPath: string;
  duration: number;
  processing?: boolean; // Flag to indicate if video is still being processed in background
}

export async function processVideo(
  videoFile: Express.Multer.File
): Promise<VideoProcessingResult> {
  return new Promise<VideoProcessingResult>((resolve, reject) => {
    // Generate unique filenames
    const timestamp = Date.now();
    const videoFileName = `video_${timestamp}${path.extname(videoFile.originalname)}`;
    
    const videoPath = path.join(videosDir, videoFileName);
    const tempFilePath = videoFile.path; // The temporary file path from multer disk storage
    
    console.log('Processing video:', videoFile.originalname);
    console.log('Temp file path:', tempFilePath);
    console.log('Final video will be saved at:', videoPath);
    
    // Handle file from multer memory storage
    try {
      // Make sure directories exist
      fs.ensureDirSync(videosDir);
      
      // Write buffer to disk since we're using memory storage
      if (videoFile.buffer) {
        console.log('Writing file buffer to disk:', videoPath);
        fs.writeFileSync(videoPath, videoFile.buffer);
        console.log('Video file written to disk successfully, size:', fs.statSync(videoPath).size);
      } else {
        console.error('Video file buffer is undefined!');
        reject(new Error('Video file buffer is undefined'));
        return;
      }
    } catch (error: any) {
      console.error('Error saving video file:', error);
      reject(new Error(`Failed to process video file: ${error.message || 'Unknown error'}`));
      return;
    }
    
    // Get video information
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.error('Failed to probe video:', err.message);
        reject(new Error(`Failed to probe video: ${err.message}`));
        return;
      }
      
      console.log('Video metadata:', metadata.format);
      const duration = metadata.format.duration || 0;
      console.log('Video duration:', duration, 'seconds');
      
      // Check if video is under 1 minute and 30 seconds (90 seconds)
      if (duration > 90) {
        console.log('Video too long:', duration, 'seconds (max: 90 seconds)');
        fs.unlinkSync(videoPath); // Delete the uploaded video
        reject(new Error('Video exceeds the maximum allowed duration of 1 minute and 30 seconds'));
        return;
      }
      
      // Ultra-Fast path ALL videos for immediate response
      // Prioritize rapid response for better user experience
      console.log('Fast-tracking video response');
      const videoUrl = `/uploads/videos/${videoFileName}`;
      
      // Return immediately, video is ready to serve
      resolve({
        videoPath: videoUrl,
        duration,
        processing: false
      });
    });
  });
}