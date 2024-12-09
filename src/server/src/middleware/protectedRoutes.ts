import express, { Request, Response } from 'express';
import verifyToken from '../middleware/authMiddleware';

const router = express.Router();

router.use(verifyToken);
// Protected route
router.get('/api', (req: Request, res: Response) => {
  console.log('router.get')
  res.status(200).json({ message: 'Protected route accessed' });
});
router.post('/api', (req: Request, res: Response) => {
  console.log('router.post')
  res.status(200).json({ message: 'Protected route accessed' });
});
export default router;
