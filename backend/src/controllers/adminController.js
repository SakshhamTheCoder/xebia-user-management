import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { publicUser } from '../utils/token.js';
import { validate } from '../utils/validators.js';

// GET /api/admin/users?status=pending|approved|rejected
// Lists all registered users (excluding admins), newest first.
export const listUsers = asyncHandler(async (req, res) => {
  const filter = { role: 'user' };
  if (req.query.status) filter.status = req.query.status;

  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ users: users.map(publicUser) });
});

// Helper: load a non-admin target user, with self-protection.
async function findManagedUser(req, res) {
  const id = req.params.id;

  // Self-protection: an admin cannot act on their own account.
  if (id === String(req.user._id)) {
    res
      .status(400)
      .json({ message: 'You cannot perform this action on your own account' });
    return null;
  }

  const user = await User.findById(id);
  if (!user || user.role === 'admin') {
    res.status(404).json({ message: 'User not found' });
    return null;
  }
  return user;
}

// PATCH /api/admin/users/:id/approve
export const approveUser = asyncHandler(async (req, res) => {
  const user = await findManagedUser(req, res);
  if (!user) return;

  user.status = 'approved';
  user.isActive = true;
  user.rejectionReason = '';
  await user.save();
  res.json({ message: 'User approved', user: publicUser(user) });
});

// PATCH /api/admin/users/:id/reject
export const rejectUser = asyncHandler(async (req, res) => {
  const user = await findManagedUser(req, res);
  if (!user) return;

  user.status = 'rejected';
  user.rejectionReason = (req.body?.reason || '').trim();
  await user.save();
  res.json({ message: 'User rejected', user: publicUser(user) });
});

// PATCH /api/admin/users/:id/activate
export const activateUser = asyncHandler(async (req, res) => {
  const user = await findManagedUser(req, res);
  if (!user) return;

  if (user.status !== 'approved') {
    return res.status(400).json({ message: 'Only approved users can be activated' });
  }
  user.isActive = true;
  await user.save();
  res.json({ message: 'User activated', user: publicUser(user) });
});

// PATCH /api/admin/users/:id/deactivate
export const deactivateUser = asyncHandler(async (req, res) => {
  const user = await findManagedUser(req, res);
  if (!user) return;

  user.isActive = false;
  await user.save();
  res.json({ message: 'User deactivated', user: publicUser(user) });
});

// PATCH /api/admin/users/:id/promote  — promote an existing user to admin.
export const promoteUser = asyncHandler(async (req, res) => {
  const user = await findManagedUser(req, res);
  if (!user) return;

  user.role = 'admin';
  user.status = 'approved';
  user.isActive = true;
  await user.save();
  res.json({ message: 'User promoted to admin', user: publicUser(user) });
});

// PATCH /api/admin/admins/:id/demote  — demote an admin back to a regular user.
export const demoteAdmin = asyncHandler(async (req, res) => {
  const id = req.params.id;

  // Self-protection: an admin cannot demote themselves.
  if (id === String(req.user._id)) {
    return res
      .status(400)
      .json({ message: 'You cannot demote your own account' });
  }

  const user = await User.findById(id);
  if (!user || user.role !== 'admin') {
    return res.status(404).json({ message: 'Admin not found' });
  }

  user.role = 'user';
  user.status = 'approved';
  user.isActive = true;
  await user.save();
  res.json({ message: 'Admin demoted to user', user: publicUser(user) });
});

// GET /api/admin/admins  — list admin accounts.
export const listAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({ role: 'admin' }).sort({ createdAt: -1 });
  res.json({ admins: admins.map(publicUser) });
});

// POST /api/admin/admins  — create a new admin (pre-approved, active).
export const createAdmin = asyncHandler(async (req, res) => {
  const { username, email, phone, password } = req.body;

  const errors = validate(req.body, ['username', 'email', 'phone', 'password']);
  if (Object.keys(errors).length) {
    return res.status(400).json({ message: 'Please fix the errors below', errors });
  }

  const admin = await User.create({
    username,
    email,
    phone,
    password,
    role: 'admin',
    status: 'approved',
    isActive: true,
  });

  res.status(201).json({ message: 'Admin created', admin: publicUser(admin) });
});
