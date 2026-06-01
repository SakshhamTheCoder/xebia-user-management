import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verifies the JWT and attaches the current user to req.user.
export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // Block access if the account was deactivated or its approval was revoked.
    if (user.role !== 'admin') {
      if (user.status !== 'approved') {
        return res.status(403).json({ message: 'Account is not approved' });
      }
      if (!user.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Restricts a route to admins.
export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}
