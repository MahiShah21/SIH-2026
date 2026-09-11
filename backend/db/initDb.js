import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, isNeonConnected, memoryStore } from '../config/db.js';
import { 
  seedUsers, 
  seedUniversityUsers, 
  seedIndustryUsers, 
  seedProblems, 
  seedChallenges, 
  seedProjects, 
  seedDocuments, 
  seedTeams, 
  seedProposals, 
  seedFeedback,
  seedCollaborations,
  seedConversations,
  seedChatMessages,
  seedNotifications
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeDatabase() {
  console.log('🚀 Initializing JanSetu Database (Prisma & Neon PostgreSQL)...');

  // 1. Populate In-Memory Store with clean user credentials & empty datasets
  memoryStore.users = [...seedUsers];
  memoryStore.university_users = [];
  memoryStore.industry_users = [];
  memoryStore.problems = [];
  memoryStore.challenges = [];
  memoryStore.projects = [];
  memoryStore.project_documents = [];
  memoryStore.project_teams = [];
  memoryStore.proposals = [];
  memoryStore.feedback = [];
  memoryStore.collaborations = [];
  memoryStore.conversations = [];
  memoryStore.chat_messages = [];
  memoryStore.notifications = [];

  // 2. If Neon PostgreSQL is connected, verify schema & clean dummy clutter
  if (isNeonConnected()) {
    try {
      try {
        await query('ALTER TABLE IF EXISTS projects ADD COLUMN IF NOT EXISTS is_accepted_by_university BOOLEAN DEFAULT true;');
        await query('ALTER TABLE IF EXISTS projects ADD COLUMN IF NOT EXISTS lead_faculty VARCHAR(255);');
        await query('ALTER TABLE IF EXISTS projects ADD COLUMN IF NOT EXISTS lead_mentor_dept VARCHAR(255);');
        await query('ALTER TABLE IF EXISTS projects ADD COLUMN IF NOT EXISTS lab_location VARCHAR(255);');
        await query('ALTER TABLE IF EXISTS projects ADD COLUMN IF NOT EXISTS next_stage VARCHAR(64);');
        await query('ALTER TABLE IF EXISTS projects ADD COLUMN IF NOT EXISTS phase VARCHAR(255);');
        await query('ALTER TABLE IF EXISTS projects ADD COLUMN IF NOT EXISTS progress_percent INT DEFAULT 0;');
        await query('ALTER TABLE IF EXISTS projects ADD COLUMN IF NOT EXISTS total_budget VARCHAR(64);');
        await query('ALTER TABLE IF EXISTS projects ADD COLUMN IF NOT EXISTS disbursed_amount VARCHAR(64);');
        await query('ALTER TABLE IF EXISTS projects ADD COLUMN IF NOT EXISTS sanctioned_grant VARCHAR(64);');
        await query('ALTER TABLE IF EXISTS projects ADD COLUMN IF NOT EXISTS industry_partner VARCHAR(255);');
        await query('ALTER TABLE IF EXISTS projects DROP CONSTRAINT IF EXISTS projects_challenge_id_fkey;');
        await query('ALTER TABLE IF EXISTS collaborations ADD COLUMN IF NOT EXISTS mou_status VARCHAR(64) DEFAULT \'Active MOU\';');
        await query('ALTER TABLE IF EXISTS collaborations ADD COLUMN IF NOT EXISTS committed_amount VARCHAR(64);');
        await query('ALTER TABLE IF EXISTS collaborations ADD COLUMN IF NOT EXISTS details TEXT;');
      } catch (altErr) {
        // Table may not exist yet, ignore
      }

      const schemaPath = path.join(__dirname, 'schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');

      console.log('📦 Executing schema DDL on Neon PostgreSQL...');
      await query(schemaSql);
      console.log('✅ Neon PostgreSQL tables verified/created successfully!');

      // Clear legacy dummy records from previous seeds so new & existing accounts start clean
      try {
        console.log('🧹 Purging old mock clutter from Neon tables...');
        await query('DELETE FROM feedback WHERE id LIKE \'fb-%\'');
        await query('DELETE FROM chat_messages WHERE id LIKE \'msg-%\'');
        await query('DELETE FROM conversations WHERE id LIKE \'conv-%\'');
        await query('DELETE FROM collaborations WHERE id LIKE \'collab-%\'');
        await query('DELETE FROM project_documents WHERE id LIKE \'doc-%\'');
        await query('DELETE FROM project_teams WHERE id LIKE \'team-%\'');
        await query('DELETE FROM proposals WHERE id LIKE \'prop-%\'');
        await query('DELETE FROM projects WHERE id LIKE \'PRJ-%\'');
        await query('DELETE FROM challenges WHERE id LIKE \'CHAL-%\'');
        await query('DELETE FROM problems WHERE id IN (\'JH-315\', \'JH-925\', \'JH-1042\', \'JH-408\', \'JH-512\', \'JH-601\', \'JH-702\', \'JH-805\', \'JH-914\')');
        await query('DELETE FROM industry_users WHERE id LIKE \'partner-%\'');
        await query('DELETE FROM university_users WHERE id LIKE \'u-user-%\'');
        await query('DELETE FROM notifications WHERE id LIKE \'notif-%\'');
      } catch (cleanErr) {
        console.warn('Clean notice:', cleanErr.message);
      }

      // Ensure all seedUsers are synced into Neon PostgreSQL with JanSetu credentials
      console.log('🌱 Verifying and syncing JanSetu login credentials in Neon...');
      for (const u of seedUsers) {
        await query(
          `INSERT INTO users (id, email, phone, password_hash, role, name, title, organization_or_district, avatar_url, karma_points, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO UPDATE 
           SET email = EXCLUDED.email, password_hash = EXCLUDED.password_hash, name = EXCLUDED.name, title = EXCLUDED.title, organization_or_district = EXCLUDED.organization_or_district, phone = EXCLUDED.phone, role = EXCLUDED.role, karma_points = EXCLUDED.karma_points`,
          [u.id, u.email, u.phone, u.password_hash, u.role, u.name, u.title, u.organization_or_district, u.avatar_url, u.karma_points]
        );
      }

      console.log('✨ Neon database initialized cleanly with only authentic login accounts!');
    } catch (err) {
      console.error('⚠️ Neon initialization notice:', err.message);
    }
  } else {
    console.log('✅ In-memory database initialized with clean auth accounts.');
  }
}

// Allow direct CLI invocation: node backend/db/initDb.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Database initialization complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Database initialization error:', err);
      process.exit(1);
    });
}
