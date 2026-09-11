import bcrypt from 'bcryptjs';

// Pre-compute bcrypt hash for 'Password@123'
const defaultPasswordHash = bcrypt.hashSync('Password@123', 10);

export const seedUsers = [
  {
    id: 'usr_citizen_01',
    email: 'citizen@jansetu.gov.in',
    phone: '9876543210',
    password_hash: defaultPasswordHash,
    role: 'citizen',
    name: 'Citizen User',
    title: 'Citizen Innovator',
    organization_or_district: 'Ranchi, Jharkhand',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    karma_points: 0
  },
  {
    id: 'usr_univ_01',
    email: 'university@jansetu.gov.in',
    phone: '9876543211',
    password_hash: defaultPasswordHash,
    role: 'university',
    name: 'University Researcher',
    title: 'Dean (Research & Development)',
    organization_or_district: 'Birla Institute of Technology (BIT) Mesra',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    karma_points: 0
  },
  {
    id: 'usr_ind_01',
    email: 'industry@jansetu.gov.in',
    phone: '9876543212',
    password_hash: defaultPasswordHash,
    role: 'industry',
    name: 'Industry Partner',
    title: 'CSR & Sustainability Lead',
    organization_or_district: 'Industry CSR Division',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    karma_points: 0
  },
  {
    id: 'usr_admin_01',
    email: 'admin@jansetu.gov.in',
    phone: '9876543213',
    password_hash: defaultPasswordHash,
    role: 'admin',
    name: 'GovTech Admin',
    title: 'State Innovation Director',
    organization_or_district: 'Govt. of Jharkhand (State Innovation Directorate)',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    karma_points: 0
  },
  {
    id: 'usr_admin_02',
    email: 'nodal.rnd@jansetu.gov.in',
    phone: '9876543214',
    password_hash: defaultPasswordHash,
    role: 'admin',
    name: 'State R&D Nodal Officer',
    title: 'State R&D Nodal Officer',
    organization_or_district: 'Dept. of Higher & Technical Education, Jharkhand',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    karma_points: 0
  },
  {
    id: 'usr_admin_03',
    email: 'dc.gumla@jansetu.gov.in',
    phone: '9876543215',
    password_hash: defaultPasswordHash,
    role: 'admin',
    name: 'District Administration',
    title: 'District Collector & Magistrate',
    organization_or_district: 'District Administration',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    karma_points: 0
  }
];

export const seedUniversityUsers = [];
export const seedIndustryUsers = [];
export const seedProblems = [];
export const seedChallenges = [];
export const seedProjects = [];
export const seedDocuments = [];
export const seedTeams = [];
export const seedProposals = [];
export const seedFeedback = [];
export const seedCollaborations = [];
export const seedConversations = [];
export const seedChatMessages = [];
export const seedNotifications = [];
