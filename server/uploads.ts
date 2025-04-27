import express, { Express, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { processVideo } from './utils/videoProcessor';

// Get the current file path in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up multer for disk storage for better performance with large files
const projectRoot = path.resolve(__dirname, '..');
const uploadsPath = path.join(projectRoot, 'uploads');
const tempUploadsPath = path.join(projectRoot, 'temp-uploads');

// Ensure temp uploads directory exists
try {
  fs.ensureDirSync(tempUploadsPath);
  console.log('Ensured temp-uploads directory exists');
} catch (error) {
  console.error('Error creating temp-uploads directory:', error);
}

// Use disk storage for better performance with larger files
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, tempUploadsPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { 
    fileSize: 100 * 1024 * 1024, // Increased to 100MB max file size
    files: 1 // Limit to one file per request for better performance
  },
  fileFilter: (_req, file, cb) => {
    // Super-fast acceptance of common video types without deep validation
    // This speeds up the initial upload part significantly
    const filetypes = /mp4|mov|avi|webm|mkv/;
    const extname = path.extname(file.originalname).toLowerCase();
    
    // Fast path for MP4 files (most common format, fastest processing)
    if (extname === '.mp4') {
      console.log('Fast-path processing for MP4 file');
      return cb(null, true);
    }
    
    // Fast path for other accepted video types
    if (filetypes.test(extname)) {
      console.log('Standard processing path for video file:', extname);
      return cb(null, true);
    }
    
    console.log('Rejected file with extension:', extname);
    cb(new Error('Only video files (MP4, MOV, AVI, WEBM, MKV) are allowed'));
  }
});

export function registerUploadRoutes(app: Express) {
  // Serve static files from uploads directory
  const projectRoot = path.resolve(__dirname, '..');
  const uploadsPath = path.join(projectRoot, 'uploads');
  console.log('Setting up uploads directory for static serving at:', uploadsPath);
  
  try {
    // Ensure all required directories exist
    fs.ensureDirSync(uploadsPath);
    fs.ensureDirSync(path.join(uploadsPath, 'videos'));
    fs.ensureDirSync(path.join(uploadsPath, 'thumbnails'));
    console.log('Ensured all uploads directories exist');
    
    // Test write permissions
    const testFile = path.join(uploadsPath, 'test-access.txt');
    fs.writeFileSync(testFile, 'Testing write access');
    console.log('Successfully wrote test file to uploads directory');
    
    // Use absolute path for static serving
    app.use('/uploads', express.static(uploadsPath));
    console.log('Static file serving configured for uploads directory');
  } catch (error) {
    console.error('Error setting up uploads directory:', error);
  }
  
  app.post('/api/upload/video', upload.single('video'), async (req: Request, res: Response) => {
    try {
      console.log('Video upload received:', req.file?.originalname);
      
      if (!req.file) {
        console.log('No video file provided in request');
        return res.status(400).json({ message: 'No video file provided' });
      }
      
      console.log('Processing video file with size:', req.file.size);
      
      // Check if it's an MP4 file for super-fast-path processing
      const isMp4 = req.file.originalname.toLowerCase().endsWith('.mp4') || 
                   req.file.mimetype === 'video/mp4';
                   
      if (isMp4) {
        console.log('Fast-path processing for MP4 file');
        
        // Generate filenames
        const timestamp = Date.now();
        const videoFileName = `video_${timestamp}.mp4`;
        const tempFilePath = req.file.path;
        
        // Ensure directories exist
        const videosDir = path.join(projectRoot, 'uploads', 'videos');
        fs.ensureDirSync(videosDir);
        
        // Copy file directly without processing for maximum speed
        const videoPath = path.join(videosDir, videoFileName);
        fs.copyFileSync(tempFilePath, videoPath);
        
        // For small files, we'll get a quick response
        // For larger files, we'll process in background but already have the file
        if (req.file.size < 3 * 1024 * 1024) { // Less than 3MB
          // Start background thumbnail processing
          processVideo(req.file)
            .then(result => {
              console.log('Background processing completed for MP4 fast-path');
            })
            .catch(err => {
              console.error('Background processing error for MP4 fast-path:', err);
            });
          
          return res.status(200).json({
            message: 'Video uploaded successfully (fast path)',
            videoPath: `/uploads/videos/${videoFileName}`,
            thumbnailPath: `/uploads/thumbnails/default_processing.jpg`,
            duration: 30, // Default estimate
            processing: false
          });
        }
      }
      
      // Performance optimization: Start processing but don't await the result
      // This allows the server to respond quickly with a "processing" status
      if (req.file.size < 3 * 1024 * 1024) { // Increased threshold to 3MB for synchronous processing
        const result = await processVideo(req.file);
        console.log('Video processing result (small file):', result);
        
        return res.status(200).json({
          message: 'Video uploaded and processed successfully',
          ...result
        });
      } else {
        // For larger files, process asynchronously and return immediately
        // This makes uploads feel much faster to the user
        processVideo(req.file)
          .then(result => {
            console.log('Async video processing completed:', result);
          })
          .catch(err => {
            console.error('Async video processing error:', err);
          });
        
        // Save original filename for debugging
        console.log('Original filename:', req.file.originalname);
        console.log('Temp filename:', req.file.filename);
        
        // Generate a deterministic output filename based on the temp filename
        const safeFilename = req.file.filename || `video_${Date.now()}.mp4`;
        console.log('Safe filename to use:', safeFilename);
        
        // Return a quick response to the client with placeholder data
        // Client will show processing state while actual processing continues on server
        return res.status(200).json({
          message: 'Video uploaded, processing in background',
          videoPath: `/uploads/videos/${safeFilename}`,
          thumbnailPath: `/uploads/thumbnails/default_processing.jpg`,
          duration: 30, // Default duration estimate
          processing: true
        });
      }
    } catch (error: any) {
      console.error('Error during video upload:', error.message);
      return res.status(400).json({ message: error.message });
    }
  });
}