-- ==========================================================
-- JharInnovate Database Schema (Neon PostgreSQL DDL)
-- State Innovation & Civic Problem-Resolution Network
-- ==========================================================

-- 1. Users Table (4 Personas: citizen, university, industry, admin)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(32),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('citizen', 'university', 'industry', 'admin')),
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    organization_or_district VARCHAR(255),
    avatar_url TEXT,
    karma_points INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. University Faculty & Researchers Profile Table
CREATE TABLE IF NOT EXISTS university_users (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    institution VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    designation VARCHAR(255),
    phone VARCHAR(32),
    specialization VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Industry Partners & CSR Funders Table
CREATE TABLE IF NOT EXISTS industry_users (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(32),
    sector VARCHAR(128),
    location VARCHAR(255),
    partner_type VARCHAR(128),
    expertise JSONB DEFAULT '[]'::jsonb,
    tech_stack JSONB DEFAULT '[]'::jsonb,
    support_types JSONB DEFAULT '[]'::jsonb,
    grant_pool VARCHAR(64),
    committed_amount VARCHAR(64),
    mou_status VARCHAR(64) DEFAULT 'Active MOU',
    about TEXT,
    logo_url TEXT,
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Citizen Problems / Grievances Table
CREATE TABLE IF NOT EXISTS problems (
    id VARCHAR(64) PRIMARY KEY,
    citizen_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(128) NOT NULL,
    district VARCHAR(128) NOT NULL,
    block VARCHAR(128),
    village VARCHAR(128),
    latitude VARCHAR(64),
    longitude VARCHAR(64),
    priority VARCHAR(32) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    status VARCHAR(64) DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'AI_VERIFIED', 'EVALUATING', 'ACCEPTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED_FLAGGED')),
    urgency BOOLEAN DEFAULT false,
    
    -- AI Decision & Veracity Fields
    is_real BOOLEAN DEFAULT true,
    veracity_score NUMERIC(5, 2) DEFAULT 85.00,
    ai_category VARCHAR(128),
    ai_confidence NUMERIC(5, 2) DEFAULT 90.00,
    ai_rationale TEXT,
    authenticity_flags JSONB DEFAULT '[]'::jsonb,
    
    evidence_files JSONB DEFAULT '[]'::jsonb,
    upvotes_count INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Academic Grand Challenges Table (Derived / Matched from Grievances)
CREATE TABLE IF NOT EXISTS challenges (
    id VARCHAR(64) PRIMARY KEY,
    problem_id VARCHAR(64) REFERENCES problems(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    domain VARCHAR(128) NOT NULL,
    domain_label VARCHAR(128),
    district VARCHAR(128) NOT NULL,
    priority VARCHAR(32) DEFAULT 'high',
    priority_label VARCHAR(64),
    status VARCHAR(64) DEFAULT 'EVALUATING',
    population_impact VARCHAR(255),
    focus_area VARCHAR(255),
    required_skills JSONB DEFAULT '[]'::jsonb,
    ai_match_score VARCHAR(32) DEFAULT '90%',
    match_rationale TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. University Active R&D Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    challenge_id VARCHAR(64) REFERENCES challenges(id) ON DELETE SET NULL,
    lead_institution VARCHAR(255) NOT NULL,
    lead_faculty VARCHAR(255),
    lead_mentor_dept VARCHAR(255),
    lab_location VARCHAR(255),
    department VARCHAR(255),
    domain VARCHAR(128),
    location VARCHAR(255),
    description TEXT,
    status VARCHAR(64) DEFAULT 'IN_PROGRESS',
    status_label VARCHAR(64),
    stage VARCHAR(64) DEFAULT 'Proposal',
    next_stage VARCHAR(64),
    phase VARCHAR(255),
    progress_percent INT DEFAULT 0,
    total_budget VARCHAR(64),
    disbursed_amount VARCHAR(64),
    sanctioned_grant VARCHAR(64),
    industry_partner VARCHAR(255),
    is_accepted_by_university BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Project Documents Vault Table
CREATE TABLE IF NOT EXISTS project_documents (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    file_url TEXT NOT NULL,
    file_size VARCHAR(64) DEFAULT '1.2 MB',
    format VARCHAR(32) DEFAULT 'PDF',
    status VARCHAR(64) DEFAULT 'Verified',
    uploaded_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Research Project Teams Table
CREATE TABLE IF NOT EXISTS project_teams (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    member_name VARCHAR(255) NOT NULL,
    role_title VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    email VARCHAR(255),
    status VARCHAR(64),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Grant Proposals & State Grants Table
CREATE TABLE IF NOT EXISTS proposals (
    id VARCHAR(64) PRIMARY KEY,
    challenge_id VARCHAR(64) REFERENCES challenges(id) ON DELETE SET NULL,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE SET NULL,
    university_name VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    grant_code VARCHAR(128),
    sanctioned_by VARCHAR(255),
    csr_match_partner VARCHAR(255),
    csr_contribution VARCHAR(64),
    govt_contribution VARCHAR(64),
    grant_amount VARCHAR(64),
    utilization_percentage INT DEFAULT 0,
    duration_months INT DEFAULT 12,
    abstract TEXT,
    status VARCHAR(64) DEFAULT 'SANCTIONED',
    tranches JSONB DEFAULT '[]'::jsonb,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Industry CSR & Tech Collaborations Table
CREATE TABLE IF NOT EXISTS collaborations (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    partner_type VARCHAR(255) NOT NULL,
    status VARCHAR(64) DEFAULT 'Active MOU',
    committed_amount VARCHAR(64),
    details TEXT,
    mou_status VARCHAR(64) DEFAULT 'Active MOU',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Citizen Resolution Feedback & Impact Verification Table
CREATE TABLE IF NOT EXISTS feedback (
    id VARCHAR(64) PRIMARY KEY,
    problem_id VARCHAR(64) REFERENCES problems(id) ON DELETE SET NULL,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE SET NULL,
    citizen_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    solution_status VARCHAR(64),
    rating INT DEFAULT 5,
    notes TEXT,
    beneficiaries_reached INT DEFAULT 250,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Real-Time Chat Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64),
    title VARCHAR(255) NOT NULL,
    participant_university VARCHAR(255),
    participant_industry VARCHAR(255),
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Real-Time Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(64) PRIMARY KEY,
    conversation_id VARCHAR(64) REFERENCES conversations(id) ON DELETE CASCADE,
    sender_role VARCHAR(64) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    recipient_role VARCHAR(64),
    text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Real-Time Automatic Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    recipient_role VARCHAR(64) NOT NULL,
    recipient_id VARCHAR(64),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(64) DEFAULT 'COLLABORATION',
    reference_id VARCHAR(64),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_problems_district ON problems(district);
CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category);
CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);
CREATE INDEX IF NOT EXISTS idx_challenges_domain ON challenges(domain);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_accepted ON projects(is_accepted_by_university);
CREATE INDEX IF NOT EXISTS idx_feedback_project ON feedback(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_role ON notifications(recipient_role);

