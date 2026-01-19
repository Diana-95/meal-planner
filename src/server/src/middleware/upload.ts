import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Allowed image file extensions (whitelist approach)
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    // Store images in uploads/images directory
    const uploadPath = path.join(process.cwd(), 'uploads', 'images');
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Generate unique filename: timestamp-random.extension
    // Remove original filename to prevent path traversal and special character issues
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    // Sanitize extension - only allow whitelisted extensions
    const sanitizedExt = ALLOWED_EXTENSIONS.includes(ext) ? ext : '.jpg';
    cb(null, `img-${uniqueSuffix}${sanitizedExt}`);
  }
});

// File filter - validate both MIME type and file extension
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check MIME type
  if (!file.mimetype || !ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
    return cb(new Error('Invalid file type. Only image files (JPEG, PNG, GIF, WebP, BMP) are allowed.'));
  }

  // Check file extension (defense in depth - MIME types can be spoofed)
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error('Invalid file extension. Only image files (JPEG, PNG, GIF, WebP, BMP) are allowed.'));
  }

  cb(null, true);
};

// Configure multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});
