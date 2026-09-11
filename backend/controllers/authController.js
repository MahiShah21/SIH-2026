import bcrypt from 'bcryptjs';
import { query, memoryStore } from '../config/db.js';
import { generateToken, verifyPassword, getDemoUserByRole } from '../services/authService.js';
import { seedUsers } from '../db/seedData.js';

/**
 * POST /api/auth/register
 * Create a new user account with custom credentials
 */
export async function register(req, res, next) {
  try {
    const { name, email, phone, password, role = 'citizen', title, organization_or_district } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const reqRole = (role || 'citizen').toLowerCase();

    // STRICT CONFIDENTIALITY GUARD: Disallow public registration for Government / Admin role
    if (reqRole === 'admin' || reqRole === 'government' || reqRole === 'officer' || normalizedEmail.includes('admin@') || normalizedEmail.includes('gov.in')) {
      return res.status(403).json({
        success: false,
        message: 'Government Officer & IAS credentials are strictly confidential and pre-authorized by the State Innovation Directorate. Public sign-up is disabled for administrative roles.'
      });
    }

    const validRoles = ['citizen', 'university', 'industry'];
    const userRole = validRoles.includes(reqRole) ? reqRole : 'citizen';

    // 1. Check if user already exists
    let existingUser = null;
    try {
      const check = await query('SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1', [normalizedEmail]);
      if (check.rows && check.rows.length > 0) existingUser = check.rows[0];
    } catch (e) {
      existingUser = memoryStore.users.find(u => u.email.toLowerCase() === normalizedEmail);
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in.'
      });
    }

    // 2. Hash password & prepare record
    const passwordHash = bcrypt.hashSync(password, 10);
    const userId = `usr_${userRole}_${Date.now()}`;
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    const newUser = {
      id: userId,
      email: normalizedEmail,
      phone: phone || '',
      password_hash: passwordHash,
      role: userRole,
      name: name.trim(),
      title: title || (userRole === 'citizen' ? 'Citizen Innovator' : userRole === 'university' ? 'Academic Researcher' : userRole === 'industry' ? 'CSR Partner' : 'GovTech Admin'),
      organization_or_district: organization_or_district || 'Jharkhand',
      avatar_url: avatarUrl,
      karma_points: 0,
      created_at: new Date().toISOString()
    };

    // 3. Persist to Neon DB or Memory Store
    try {
      await query(
        `INSERT INTO users (id, email, phone, password_hash, role, name, title, organization_or_district, avatar_url, karma_points, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)`,
        [newUser.id, newUser.email, newUser.phone, newUser.password_hash, newUser.role, newUser.name, newUser.title, newUser.organization_or_district, newUser.avatar_url, newUser.karma_points]
      );
    } catch (e) {
      memoryStore.users.push(newUser);
    }

    // 4. Generate JWT & respond
    const token = generateToken(newUser);
    const { password_hash, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: `Account created successfully! Welcome to JanSetu, ${newUser.name}.`,
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Log in with email/password or mobile/OTP
 */
export async function login(req, res, next) {
  try {
    const { identifier, email, phone, password, otp, role } = req.body;
    const searchVal = (identifier || email || phone || '').trim().toLowerCase();

    // 1. Query for user by email or phone
    let user = null;
    try {
      const userRes = await query(
        'SELECT * FROM users WHERE LOWER(email) = $1 OR phone = $2 LIMIT 1',
        [searchVal, searchVal]
      );
      if (userRes.rows && userRes.rows.length > 0) {
        user = userRes.rows[0];
      }
    } catch (e) {
      // In-memory fallback lookup
      user = memoryStore.users.find(u => u.email.toLowerCase() === searchVal || u.phone === searchVal);
    }

    // If no user match but role was passed (e.g. demo mode form)
    if (!user && role) {
      user = getDemoUserByRole(role);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email / phone. Try one of the 4 demo accounts below or create a new account.'
      });
    }

    // 2. Validate Password or OTP
    if (password) {
      const isMatch = await verifyPassword(password, user.password_hash);
      if (!isMatch && password !== 'Password@123') {
        return res.status(401).json({
          success: false,
          message: 'Invalid password. (Hint: Demo password is Password@123)'
        });
      }
    } else if (otp) {
      // Demo OTP check
      if (otp !== '123456' && otp.length !== 6) {
        return res.status(401).json({
          success: false,
          message: 'Invalid OTP code. (Demo OTP is 123456)'
        });
      }
    }

    // 3. Issue Token
    const token = generateToken(user);
    const { password_hash, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/quick-demo
 * Instant 1-click login for any of the 4 roles
 */
export async function quickDemoLogin(req, res, next) {
  try {
    const { role } = req.body;
    const user = getDemoUserByRole(role);
    const token = generateToken(user);
    const { password_hash, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: `Authenticated as ${user.name} (${user.role.toUpperCase()})`,
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Return currently authenticated user profile
 */
export async function getCurrentUser(req, res, next) {
  try {
    const { password_hash, ...safeUser } = req.user;
    return res.status(200).json({
      success: true,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/demo-credentials
 * List 4 available demo accounts
 */
export function getDemoCredentials(req, res) {
  const credentials = seedUsers.map(u => ({
    role: u.role,
    name: u.name,
    title: u.title,
    organization: u.organization_or_district,
    email: u.email,
    phone: u.phone,
    defaultPassword: 'Password@123',
    demoOtp: '123456'
  }));

  return res.status(200).json({
    success: true,
    count: credentials.length,
    credentials
  });
}
