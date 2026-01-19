import { Express } from "express";
import { upload } from "../middleware/upload";
import { AuthRequest } from "../middleware/authMiddleware";
import { getUser } from "./utils";
import verifyToken from "../middleware/authMiddleware";
import path from "path";
import { existsSync, unlinkSync, readFileSync } from "fs";

const API = '/api/upload';

// Magic numbers (file signatures) for image validation
const IMAGE_SIGNATURES: { [key: string]: Buffer[] } = {
  'image/jpeg': [Buffer.from([0xFF, 0xD8, 0xFF])],
  'image/png': [Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])],
  'image/gif': [Buffer.from([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]), Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])],
  'image/webp': [Buffer.from([0x52, 0x49, 0x46, 0x46])], // RIFF header, WebP has RIFF...WEBP
  'image/bmp': [Buffer.from([0x42, 0x4D])],
};

/**
 * Validates file content by checking magic numbers (file signatures)
 * This prevents files with spoofed extensions/MIME types from being uploaded
 * 
 * We only read the first 12 bytes (file signature) - no need for streams
 */
function validateFileContent(filePath: string, expectedMimeType: string): boolean {
  try {
    const signatures = IMAGE_SIGNATURES[expectedMimeType];
    if (!signatures) {
      return false;
    }

    // Read only the first 12 bytes (enough for all image signatures)
    const buffer = readFileSync(filePath, { flag: 'r' }).slice(0, 12);
    
    // Check if buffer matches any of the expected signatures
    const matches = signatures.some(sig => buffer.slice(0, sig.length).equals(sig));
    
    // Special check for WebP (RIFF...WEBP)
    if (expectedMimeType === 'image/webp' && buffer.length >= 12) {
      const hasRiff = buffer.slice(0, 4).equals(Buffer.from([0x52, 0x49, 0x46, 0x46]));
      const hasWebp = buffer.slice(8, 12).equals(Buffer.from([0x57, 0x45, 0x42, 0x50]));
      return hasRiff && hasWebp;
    }
    
    return matches;
  } catch (error) {
    console.error('Error validating file content:', error);
    return false;
  }
}

/**
 * Sanitizes filename to prevent path traversal attacks
 */
function sanitizeFilename(filename: string): string {
  // Remove any path components (../, ./, etc.)
  const basename = path.basename(filename);
  // Remove any non-alphanumeric characters except dots, hyphens, and underscores
  return basename.replace(/[^a-zA-Z0-9._-]/g, '');
}

export const registerUploadController = (app: Express) => {
  // Upload image endpoint
  app.post(
    `${API}/image`,
    verifyToken,
    upload.single('image'),
    async (req: AuthRequest, res) => {
      const user = getUser(req, res);
      if (!user) return;

      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Additional security: Validate file content using magic numbers
      const isValidContent = validateFileContent(req.file.path, req.file.mimetype);
      if (!isValidContent) {
        // Delete the uploaded file if content validation fails
        try {
          if (existsSync(req.file.path)) {
            unlinkSync(req.file.path);
          }
        } catch (error) {
          console.error('Error deleting invalid file:', error);
        }
        return res.status(400).json({ 
          error: 'Invalid image file. File content does not match the declared file type.' 
        });
      }

      // Return the URL path to access the image
      // The image will be served from /uploads/images/filename
      const imageUrl = `/uploads/images/${req.file.filename}`;
      
      res.status(200).json({
        success: true,
        imageUrl: imageUrl,
        filename: req.file.filename
      });
    }
  );

  // Delete image endpoint (optional - for cleanup)
  app.delete(
    `${API}/image/:filename`,
    verifyToken,
    async (req: AuthRequest, res) => {
      const user = getUser(req, res);
      if (!user) return;

      // Sanitize filename to prevent path traversal attacks
      const filename = sanitizeFilename(req.params.filename);
      
      // Use path.join and resolve to prevent path traversal
      const uploadsDir = path.join(process.cwd(), 'uploads', 'images');
      const filePath = path.resolve(uploadsDir, filename);
      
      // Ensure the resolved path is still within the uploads directory
      const resolvedDir = path.resolve(uploadsDir);
      if (!filePath.startsWith(resolvedDir)) {
        return res.status(400).json({ error: 'Invalid file path' });
      }

      try {
        // Check if file exists and delete it
        if (existsSync(filePath)) {
          unlinkSync(filePath);
          res.status(200).json({ success: true, message: 'Image deleted' });
        } else {
          res.status(404).json({ error: 'Image not found' });
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Failed to delete image' });
      }
    }
  );
};
