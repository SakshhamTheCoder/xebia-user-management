// Centralized error handler. Keeps controllers free of repetitive try/catch noise.
export function notFound(req, res) {
  res.status(404).json({ message: 'Route not found' });
}

export function errorHandler(err, req, res, _next) {
  console.error(err);

  // Multer file-size / type errors.
  if (err.name === 'MulterError' || err.message === 'Only image files are allowed') {
    return res.status(400).json({ message: err.message });
  }

  // Duplicate key (unique username / email).
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    const message = `That ${field} is already in use`;
    return res.status(409).json({ message, errors: { [field]: message } });
  }

  // Mongoose validation.
  if (err.name === 'ValidationError') {
    const errors = {};
    Object.values(err.errors).forEach((e) => {
      errors[e.path] = e.message;
    });
    return res
      .status(400)
      .json({ message: 'Please fix the errors below', errors });
  }

  res.status(err.status || 500).json({ message: err.message || 'Server error' });
}
