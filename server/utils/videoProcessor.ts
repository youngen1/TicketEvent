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
  processing?: boolean; // Flag to indicate if video is still being processed in background
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
      // Make sure directories exist
      fs.ensureDirSync(videosDir);
      fs.ensureDirSync(thumbnailsDir);
      
      // Directly use fs.copyFile with promises for more reliable copying
      console.log('Copying video from', tempFilePath, 'to', videoPath);
      fs.copyFileSync(tempFilePath, videoPath);
      
      console.log('Video file copied to final location successfully, size:', fs.statSync(videoPath).size);
      
      // Verify the file exists before removing the source
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(tempFilePath);
        console.log('Temp file removed successfully');
      } else {
        console.error('Target file does not exist after copy!');
        reject(new Error('File copy verification failed'));
        return;
      }
    } catch (error: any) {
      console.error('Error moving video file:', error);
      // Don't delete temp file on error so we can debug
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
      
      // First, initiate thumbnail generation with faster settings
      ffmpeg(videoPath)
        .screenshots({
          timestamps: ['50%'],
          filename: thumbnailFileName,
          folder: thumbnailsDir,
          size: '320x240',
          fastSeek: true // Use fast seek for thumbnails
        })
        .outputOptions(['-preset ultrafast', '-threads 4']) // Use ultrafast preset and multithreading
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
      
      // Ultra-Fast path ALL videos for immediate response
      // Prioritize rapid response for better user experience
      console.log('Hyper-fast-tracking video response');
      const videoUrl = `/uploads/videos/${videoFileName}`;
      optimizedVideoPath = videoUrl;
      
      // Check if thumbnail already completed (rare but possible for small videos)
      if (thumbnailGenerated && thumbnailUrl) {
        console.log('Thumbnail already generated, using it for immediate response');
        resolve({
          videoPath: optimizedVideoPath,
          thumbnailPath: thumbnailUrl,
          duration,
          processing: false
        });
      } else {
        // Maximum speed optimization: Return immediately with placeholder
        // Don't wait for anything - file is already saved
        console.log('Returning immediate response for maximum speed');
        
        // Set a short timeout to allow for very fast thumbnails
        setTimeout(() => {
          if (!thumbnailGenerated) {
            resolve({
              videoPath: optimizedVideoPath,
              thumbnailPath: `/uploads/thumbnails/default_processing.jpg`,
              duration,
              processing: true
            });
          }
        }, 100); // Short timeout to see if thumbnail completes super fast
        
        // Continue thumbnail generation in the background
        // This happens after the response is already sent back
        console.log('Continuing processing in background for better user experience');
      }
    });
  });
}