import express, { Express, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
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
  if (!fs.existsSync(tempUploadsPath)) {
    fs.mkdirSync(tempUploadsPath, { recursive: true });
    console.log('Created temp-uploads directory');
  }
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
  limits: { fileSize: 100 * 1024 * 1024 }, // Increased to 100MB max file size
  fileFilter: (_req, file, cb) => {
    // Accept only video files
    const filetypes = /mp4|mov|avi|webm|mkv/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Only video files are allowed'));
  }
});

export function registerUploadRoutes(app: Express) {
  // Serve static files from uploads directory
  const projectRoot = path.resolve(__dirname, '..');
  const uploadsPath = path.join(projectRoot, 'uploads');
  console.log('Setting up uploads directory for static serving at:', uploadsPath);
  
  try {
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
      console.log('Created uploads directory');
    }
    
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
      
      // Performance optimization: Start processing but don't await the result
      // This allows the server to respond quickly with a "processing" status
      // which is much faster from a user experience perspective
      if (req.file.size < 1024 * 1024) { // Less than 1MB, process synchronously
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
        
        // Return a quick response to the client with placeholder data
        // Client will show processing state while actual processing continues on server
        return res.status(200).json({
          message: 'Video uploaded, processing in background',
          videoPath: `/uploads/videos/${req.file.filename || 'processing.mp4'}`,
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