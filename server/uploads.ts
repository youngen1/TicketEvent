import express, { Express, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

// Get the current file path in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up multer for disk storage for better performance with large files
const projectRoot = path.resolve(__dirname, '..');
const uploadsPath = path.join(projectRoot, 'uploads');
const tempUploadsPath = path.join(projectRoot, 'temp-uploads');
const imagesPath = path.join(uploadsPath, 'images');

// Ensure temp uploads directory exists
try {
  fs.ensureDirSync(tempUploadsPath);
  fs.ensureDirSync(imagesPath);
  console.log('Ensured temp-uploads and images directories exist');
} catch (error) {
  console.error('Error creating upload directories:', error);
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
    fileSize: 10 * 1024 * 1024, // 10MB max file size for images
    files: 30 // Allow up to 30 files per request
  },
  fileFilter: (_req, file, cb) => {
    // Accept common image types
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    console.log('Rejected file with extension:', path.extname(file.originalname).toLowerCase());
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WEBP)'));
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
    fs.ensureDirSync(path.join(uploadsPath, 'images'));
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
  
  // Route for uploading multiple images
  app.post('/api/upload/images', upload.array('images', 30), async (req: Request, res: Response) => {
    try {
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        console.log('No image files provided in request');
        return res.status(400).json({ message: 'No image files provided' });
      }
      
      const files = req.files as Express.Multer.File[];
      console.log(`Received ${files.length} image files for upload`);
      
      if (files.length > 30) {
        return res.status(400).json({ message: 'Maximum 30 images allowed per event' });
      }
      
      if (files.length < 1) {
        return res.status(400).json({ message: 'At least 1 image is required' });
      }
      
      // Process all uploaded images
      const imageUrls: string[] = [];
      
      for (const file of files) {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const imageFileName = `image_${timestamp}_${randomStr}${path.extname(file.originalname)}`;
        const finalImagePath = path.join(imagesPath, imageFileName);
        
        // Copy from temp to final location
        await fs.copyFile(file.path, finalImagePath);
        
        // Add to image URLs array
        imageUrls.push(`/uploads/images/${imageFileName}`);
        
        // Clean up temp file
        await fs.remove(file.path);
      }
      
      return res.status(200).json({
        message: 'Images uploaded successfully',
        imageUrls: imageUrls
      });
    } catch (error: any) {
      console.error('Error during image upload:', error.message);
      return res.status(400).json({ message: error.message });
    }
  });
  
  // Single image upload route for thumbnail or profile picture
  app.post('/api/upload/image', upload.single('image'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        console.log('No image file provided in request');
        return res.status(400).json({ message: 'No image file provided' });
      }
      
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const imageFileName = `image_${timestamp}_${randomStr}${path.extname(req.file.originalname)}`;
      const finalImagePath = path.join(imagesPath, imageFileName);
      
      // Copy from temp to final location
      await fs.copyFile(req.file.path, finalImagePath);
      
      // Clean up temp file
      await fs.remove(req.file.path);
      
      return res.status(200).json({
        message: 'Image uploaded successfully',
        imageUrl: `/uploads/images/${imageFileName}`
      });
    } catch (error: any) {
      console.error('Error during image upload:', error.message);
      return res.status(400).json({ message: error.message });
    }
  });
}