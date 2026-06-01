import { Router } from 'express';
import {
  listUsers,
  approveUser,
  rejectUser,
  activateUser,
  deactivateUser,
  promoteUser,
  demoteAdmin,
  listAdmins,
  createAdmin,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

// Every admin route requires a valid admin token.
router.use(protect, adminOnly);

router.get('/users', listUsers);
router.patch('/users/:id/approve', approveUser);
router.patch('/users/:id/reject', rejectUser);
router.patch('/users/:id/activate', activateUser);
router.patch('/users/:id/deactivate', deactivateUser);
router.patch('/users/:id/promote', promoteUser);

router.get('/admins', listAdmins);
router.post('/admins', createAdmin);
router.patch('/admins/:id/demote', demoteAdmin);

export default router;
