import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken, publicUser } from '../utils/token.js';
import { validate } from '../utils/validators.js';

// POST /api/auth/register
// Creates a user in "pending" state, awaiting admin approval.
export const register = asyncHandler(async (req, res) => {
  const { username, email, phone, password } = req.body;

  const errors = validate(req.body, ['username', 'email', 'phone', 'password']);
  if (Object.keys(errors).length) {
    return res.status(400).json({ message: 'Please fix the errors below', errors });
  }

  const profilePic = req.file ? `/uploads/${req.file.filename}` : '';

  const user = await User.create({
    username,
    email,
    phone,
    password,
    profilePic,
    role: 'user',
    status: 'pending',
  });

  res.status(201).json({
    message: 'Registration successful. Your account is pending admin approval.',
    user: publicUser(user),
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Approval / activation gates (admins bypass these).
  if (user.role !== 'admin') {
    if (user.status === 'pending') {
      return res.status(403).json({ message: 'Your account is not approved yet' });
    }
    if (user.status === 'rejected') {
      const reason = user.rejectionReason ? `: ${user.rejectionReason}` : '';
      return res
        .status(403)
        .json({ message: `Your account request was rejected${reason}` });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated' });
    }
  }

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});
