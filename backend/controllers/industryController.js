import { query, memoryStore } from '../config/db.js';

/**
 * GET /api/industry
 * Fetch all industry partners / CSR funders
 */
export async function getIndustryPartners(req, res, next) {
  try {
    let partners = [];
    try {
      const resDb = await query('SELECT * FROM industry_users ORDER BY created_at DESC');
      partners = resDb.rows.map(p => ({
        ...p,
        expertise: typeof p.expertise === 'string' ? JSON.parse(p.expertise) : p.expertise,
        tech_stack: typeof p.tech_stack === 'string' ? JSON.parse(p.tech_stack) : p.tech_stack,
        support_types: typeof p.support_types === 'string' ? JSON.parse(p.support_types) : p.support_types
      }));
    } catch (e) {
      partners = [...memoryStore.industry_users];
    }

    return res.status(200).json({
      success: true,
      count: partners.length,
      partners
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/industry
 * Add a new Industry User / Partner so it immediately shows on University Industry Partners page
 */
export async function createIndustryPartner(req, res, next) {
  try {
    const company_name = req.body.company_name || req.body.name;
    const email = req.body.email || req.body.contact_email;
    const {
      contact_person,
      phone = '9876500000',
      sector = 'Technology & IoT',
      location = 'Ranchi, Jharkhand',
      partner_type = 'CSR & Innovation Partner',
      expertise = ['IoT', 'AI/ML'],
      tech_stack = ['Cloud Telemetry', 'Sensors'],
      support_types = ['Funding', 'Hardware', 'Mentorship'],
      grant_pool = '₹5,00,000 Innovation Fund',
      committed_amount = '₹2,50,000',
      mou_status = 'Active MOU',
      about = 'Industry collaboration partner accelerating field prototypes across Jharkhand.',
      logo_url = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      website = 'https://jharinnovate.gov.in'
    } = req.body;

    if (!company_name || !email) {
      return res.status(400).json({ success: false, message: 'Company name and email are required.' });
    }

    const newPartner = {
      id: `partner-${Date.now()}`,
      user_id: null,
      company_name,
      contact_person: contact_person || 'CSR Innovation Lead',
      email,
      phone,
      sector,
      location,
      partner_type,
      expertise,
      tech_stack,
      support_types,
      grant_pool,
      committed_amount,
      mou_status,
      about,
      logo_url,
      website,
      created_at: new Date().toISOString()
    };

    try {
      await query(
        `INSERT INTO industry_users (id, user_id, company_name, contact_person, email, phone, sector, location, partner_type, expertise, tech_stack, support_types, grant_pool, committed_amount, mou_status, about, logo_url, website)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [newPartner.id, newPartner.user_id, newPartner.company_name, newPartner.contact_person, newPartner.email, newPartner.phone, newPartner.sector, newPartner.location, newPartner.partner_type, JSON.stringify(newPartner.expertise), JSON.stringify(newPartner.tech_stack), JSON.stringify(newPartner.support_types), newPartner.grant_pool, newPartner.committed_amount, newPartner.mou_status, newPartner.about, newPartner.logo_url, newPartner.website]
      );
    } catch (e) {
      memoryStore.industry_users.unshift(newPartner);
    }

    return res.status(201).json({
      success: true,
      message: `Industry partner ${company_name} added successfully.`,
      partner: newPartner
    });
  } catch (err) {
    next(err);
  }
}
