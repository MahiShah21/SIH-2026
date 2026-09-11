import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { seedUsers } from '../db/seedData.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'jansetu_govtech_jwt_secret_key_2026_super_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT for an authenticated user
 */
export function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Compare plain password against bcrypt hash
 */
export async function verifyPassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

/**
 * Get one of the 4 demo users by role
 */
export function getDemoUserByRole(role) {
  const normalized = (role || 'citizen').toLowerCase();
  return seedUsers.find(u => u.role === normalized) || seedUsers[0];
}

export default {
  generateToken,
  verifyToken,
  verifyPassword,
  getDemoUserByRole
};
