import express, { Express, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { processVideo } from './utils/videoProcessor';

// Get the current file path in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
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
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
  
  app.post('/api/upload/video', upload.single('video'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No video file provided' });
      }
      
      const result = await processVideo(req.file);
      
      return res.status(200).json({
        message: 'Video uploaded and processed successfully',
        ...result
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });
}