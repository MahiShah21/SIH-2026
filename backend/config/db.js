import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // fallback to default cwd if present

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL?.trim();
let pool = null;
let useFallback = false;

// In-memory persistent state store when running without DATABASE_URL
export const memoryStore = {
  users: [],
  university_users: [],
  industry_users: [],
  problems: [],
  challenges: [],
  projects: [],
  project_documents: [],
  project_teams: [],
  proposals: [],
  collaborations: [],
  feedback: [],
  communications: [],
  conversations: [],
  chat_messages: [],
  notifications: []
};

if (connectionString) {
  try {
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('⚠️ Unexpected Neon Database Pool error:', err.message);
    });

    console.log('🔗 Neon PostgreSQL Pool configured with SSL mode.');
  } catch (err) {
    console.warn('⚠️ Error initializing PG pool, falling back to memory store:', err.message);
    useFallback = true;
  }
} else {
  console.log('ℹ️ No DATABASE_URL provided in backend/.env. Running with fast memory-backed store. (Add your Neon DATABASE_URL anytime to switch seamlessly!)');
  useFallback = true;
}

/**
 * Execute a parameterized SQL query on Neon PostgreSQL or fallback store
 */
export async function query(text, params = []) {
  if (pool && !useFallback) {
    const client = await pool.connect();
    try {
      const res = await client.query(text, params);
      return res;
    } catch (err) {
      // If table doesn't exist or connection drops, log cleanly
      console.error('❌ Database Query Error:', err.message);
      throw err;
    } finally {
      client.release();
    }
  }

  // Fallback memory executor for testing without active DB URL
  return executeFallbackQuery(text, params);
}

/**
 * Basic in-memory query handler for queries when DB URL is not yet populated
 */
function executeFallbackQuery(text, params) {
  const normalized = text.trim().toLowerCase();
  
  if (normalized.startsWith('select')) {
    if (normalized.includes('from users')) {
      if (params.length > 0) {
        const val = params[0];
        const match = memoryStore.users.find(u => u.email === val || u.id === val || u.phone === val);
        return { rows: match ? [match] : [], rowCount: match ? 1 : 0 };
      }
      return { rows: [...memoryStore.users], rowCount: memoryStore.users.length };
    }
    if (normalized.includes('from university_users')) {
      return { rows: [...memoryStore.university_users], rowCount: memoryStore.university_users.length };
    }
    if (normalized.includes('from industry_users')) {
      return { rows: [...memoryStore.industry_users], rowCount: memoryStore.industry_users.length };
    }
    if (normalized.includes('from problems')) {
      if (params.length > 0) {
        const val = params[0];
        const match = memoryStore.problems.find(p => p.id === val);
        return { rows: match ? [match] : [], rowCount: match ? 1 : 0 };
      }
      return { rows: [...memoryStore.problems], rowCount: memoryStore.problems.length };
    }
    if (normalized.includes('from projects')) {
      if (params.length > 0) {
        const val = params[0];
        const match = memoryStore.projects.find(p => p.id === val);
        return { rows: match ? [match] : [], rowCount: match ? 1 : 0 };
      }
      return { rows: [...memoryStore.projects], rowCount: memoryStore.projects.length };
    }
    if (normalized.includes('from challenges')) {
      return { rows: [...memoryStore.challenges], rowCount: memoryStore.challenges.length };
    }
    if (normalized.includes('from project_documents')) {
      const projId = params[0];
      const docs = projId ? memoryStore.project_documents.filter(d => d.project_id === projId) : memoryStore.project_documents;
      return { rows: docs, rowCount: docs.length };
    }
    if (normalized.includes('from project_teams')) {
      const projId = params[0];
      const members = projId ? memoryStore.project_teams.filter(m => m.project_id === projId) : memoryStore.project_teams;
      return { rows: members, rowCount: members.length };
    }
    if (normalized.includes('from proposals')) {
      return { rows: [...memoryStore.proposals], rowCount: memoryStore.proposals.length };
    }
    if (normalized.includes('from feedback')) {
      return { rows: [...memoryStore.feedback], rowCount: memoryStore.feedback.length };
    }
    if (normalized.includes('from collaborations')) {
      let collabs = [...memoryStore.collaborations];
      if (params.length > 0) {
        if (params.length === 1 && typeof params[0] === 'string' && params[0].startsWith('collab-')) {
          collabs = collabs.filter(c => c.id === params[0]);
        } else if (params[0]) {
          collabs = collabs.filter(c => c.project_id === params[0] || c.id === params[0]);
        }
      }
      return { rows: collabs, rowCount: collabs.length };
    }
    if (normalized.includes('from conversations')) {
      let convs = [...memoryStore.conversations];
      if (params.length > 0 && params[0]) {
        convs = convs.filter(c => c.project_id === params[0] || c.id === params[0]);
      }
      convs.sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0));
      return { rows: convs, rowCount: convs.length };
    }
    if (normalized.includes('from chat_messages')) {
      let msgs = [...memoryStore.chat_messages];
      if (params.length > 0 && params[0]) {
        msgs = msgs.filter(m => m.conversation_id === params[0]);
      }
      msgs.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
      return { rows: msgs, rowCount: msgs.length };
    }
    if (normalized.includes('from notifications')) {
      let notifs = [...memoryStore.notifications];
      if (params.length > 0 && params[0]) {
        notifs = notifs.filter(n => n.recipient_role?.toLowerCase() === params[0].toLowerCase());
      }
      notifs.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      return { rows: notifs, rowCount: notifs.length };
    }
  }

  return { rows: [], rowCount: 0 };
}

export function isNeonConnected() {
  return !!pool && !useFallback;
}

export default {
  pool,
  query,
  isNeonConnected,
  memoryStore
};
