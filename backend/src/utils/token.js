import jwt from 'jsonwebtoken';

export function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// Shape a user document into a safe object for API responses.
export function publicUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    profilePic: user.profilePic || '',
    role: user.role,
    status: user.status,
    isActive: user.isActive,
    rejectionReason: user.rejectionReason || '',
    createdAt: user.createdAt,
  };
}
