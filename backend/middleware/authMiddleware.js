import { verifyToken } from '../services/authService.js';
import { query } from '../config/db.js';

/**
 * Protect routes by requiring a valid JWT Bearer token
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token required. Please log in.'
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.'
    });
  }

  try {
    const userResult = await query('SELECT id, email, phone, role, name, title, organization_or_district, avatar_url, karma_points FROM users WHERE id = $1', [decoded.id]);
    if (userResult.rows.length === 0) {
      req.user = decoded; // Fallback to token payload if user row check is transient
    } else {
      req.user = userResult.rows[0];
    }
    next();
  } catch (err) {
    req.user = decoded;
    next();
  }
}

/**
 * Role-based authorization middleware
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to ${allowedRoles.join(' / ')} role(s).`
      });
    }
    next();
  };
}
