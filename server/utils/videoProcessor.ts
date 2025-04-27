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
  return new Promise<VideoProcessingResult>((resolve, reject) => {
    // Generate unique filenames
    const timestamp = Date.now();
    const videoFileName = `video_${timestamp}${path.extname(videoFile.originalname)}`;
    const thumbnailFileName = `thumbnail_${timestamp}.jpg`;
    
    const videoPath = path.join(videosDir, videoFileName);
    const thumbnailPath = path.join(thumbnailsDir, thumbnailFileName);
    const tempFilePath = videoFile.path; // The temporary file path from multer disk storage
    
    console.log('Processing video:', videoFile.originalname);
    console.log('Temp file path:', tempFilePath);
    console.log('Final video will be saved at:', videoPath);
    console.log('Thumbnail will be saved at:', thumbnailPath);
    
    // Move the uploaded file from temp location to final location
    try {
      fs.copyFileSync(tempFilePath, videoPath);
      console.log('Video file moved to final location successfully');
      // Remove the temp file after successful copy
      fs.unlinkSync(tempFilePath);
    } catch (error: any) {
      console.error('Error moving video file:', error);
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
      
      // Optimize video for web and generate thumbnail in parallel for speed
      console.log('Optimizing video and generating thumbnail in parallel...');
      
      let thumbnailGenerated = false;
      let optimizedVideoPath: string | null = null;
      let thumbnailUrl: string | null = null;
      
      // First, initiate thumbnail generation (faster task)
      ffmpeg(videoPath)
        .screenshots({
          timestamps: ['50%'],
          filename: thumbnailFileName,
          folder: thumbnailsDir,
          size: '320x240'
        })
        .on('end', () => {
          console.log('Thumbnail generated successfully');
          thumbnailGenerated = true;
          thumbnailUrl = `/uploads/thumbnails/${thumbnailFileName}`;
          
          // If both tasks are complete, resolve the promise
          if (optimizedVideoPath) {
            console.log('Both optimization and thumbnail generation complete');
            resolve({
              videoPath: optimizedVideoPath,
              thumbnailPath: thumbnailUrl,
              duration
            });
          }
        })
        .on('error', (err) => {
          console.error('Failed to generate thumbnail:', err.message);
          fs.unlinkSync(videoPath); // Delete the uploaded video on error
          reject(new Error(`Failed to generate thumbnail: ${err.message}`));
        });
      
      // Return immediately with just the video path if it's a small file
      // This speeds up the response for small videos
      if (fs.statSync(videoPath).size < 5 * 1024 * 1024) { // Less than 5MB
        console.log('Video is small, skipping optimization');
        const videoUrl = `/uploads/videos/${videoFileName}`;
        optimizedVideoPath = videoUrl;
        
        // If thumbnail is already done, resolve now
        if (thumbnailGenerated) {
          resolve({
            videoPath: optimizedVideoPath,
            thumbnailPath: thumbnailUrl!,
            duration
          });
        }
      } else {
        console.log('Video is larger, optimizing for web playback...');
        // Otherwise, start optimizing the video (can be done in parallel with thumbnail generation)
        const videoUrl = `/uploads/videos/${videoFileName}`;
        optimizedVideoPath = videoUrl;
        
        if (thumbnailGenerated) {
          resolve({
            videoPath: optimizedVideoPath,
            thumbnailPath: thumbnailUrl!,
            duration
          });
        }
      }
    });
  });
}