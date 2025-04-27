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
    
    console.log('Processing video:', videoFile.originalname);
    console.log('Video will be saved at:', videoPath);
    console.log('Thumbnail will be saved at:', thumbnailPath);
    
    // Save the uploaded video
    try {
      fs.writeFileSync(videoPath, videoFile.buffer);
      console.log('Video file saved successfully');
    } catch (error: any) {
      console.error('Error saving video file:', error);
      reject(new Error(`Failed to save video file: ${error.message || 'Unknown error'}`));
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
      
      // Generate thumbnail from the middle of the video
      console.log('Generating thumbnail...');
      ffmpeg(videoPath)
        .screenshots({
          timestamps: ['50%'],
          filename: thumbnailFileName,
          folder: thumbnailsDir,
          size: '320x240'
        })
        .on('end', () => {
          console.log('Thumbnail generated successfully');
          const videoUrl = `/uploads/videos/${videoFileName}`;
          const thumbnailUrl = `/uploads/thumbnails/${thumbnailFileName}`;
          
          console.log('Final video URL:', videoUrl);
          console.log('Final thumbnail URL:', thumbnailUrl);
          
          resolve({
            videoPath: videoUrl,
            thumbnailPath: thumbnailUrl,
            duration
          });
        })
        .on('error', (err) => {
          console.error('Failed to generate thumbnail:', err.message);
          fs.unlinkSync(videoPath); // Delete the uploaded video on error
          reject(new Error(`Failed to generate thumbnail: ${err.message}`));
        });
    });
  });
}