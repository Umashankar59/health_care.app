const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey12345');

      // Find user or doctor
      if (decoded.role === 'patient') {
        req.user = await User.findById(decoded.id).select('-password');
        req.role = 'patient';
      } else if (decoded.role === 'doctor') {
        req.user = await Doctor.findById(decoded.id).select('-password');
        req.role = 'doctor';
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return res.status(403).json({
        message: `Role (${req.role}) is not allowed to access this resource`
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
