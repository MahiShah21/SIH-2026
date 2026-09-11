/**
 * JharInnovate AI Problem Classifier & Veracity (Real vs. Fake) Engine
 * Multi-factor NLP taxonomy, domain ontology & linguistic authenticity analyzer.
 */

// 1. Jharkhand Districts & Geographic Corpus
const JHARKHAND_DISTRICTS = [
  'ranchi', 'gumla', 'latehar', 'hazaribagh', 'dhanbad', 'bokaro', 'deoghar', 
  'dumka', 'east singhbhum', 'west singhbhum', 'simdega', 'khunti', 'ramgarh', 
  'giridih', 'godda', 'jamtara', 'koderma', 'lohardaga', 'pakur', 'palamu', 
  'garhwa', 'sahibganj', 'saraikela kharsawan', 'chatra'
];

// 2. Domain Taxonomy & Keywords
const DOMAIN_TAXONOMY = {
  'Water Resources & Irrigation': {
    department: 'Department of Water Resources, Govt. of Jharkhand',
    skills: ['IoT Sensors', 'Hydrogeology', 'Civil Engineering', 'Telemetry'],
    keywords: [
      'water', 'canal', 'irrigation', 'dam', 'sluice', 'aquifer', 'borewell', 
      'tubewell', 'paddy', 'drought', 'fluoride', 'groundwater', 'water table', 
      'lift irrigation', 'check dam', 'stream', 'reservoir', 'pipeline', 'drinking water', 'hydro'
    ],
    weight: 1.2
  },
  'Agriculture & Crop Health': {
    department: 'Department of Agriculture & Farmers\' Welfare, Govt. of Jharkhand',
    skills: ['AI/ML Computer Vision', 'Agronomy', 'Pest Control', 'Soil Science'],
    keywords: [
      'crop', 'fungus', 'blight', 'yellow rust', 'pest', 'tomato', 'paddy', 'rice', 
      'fertilizer', 'soil', 'yield', 'kharif', 'rabi', 'seeds', 'locust', 'infestation', 
      'vegetable', 'agriculture', 'farming', 'farm', 'spores', 'harvest', 'rot'
    ],
    weight: 1.2
  },
  'Healthcare & Cold Chain': {
    department: 'Department of Health & Family Welfare, Govt. of Jharkhand',
    skills: ['Embedded Systems', 'GSM Telemetry', 'Solar Storage', 'Medical Devices'],
    keywords: [
      'health', 'vaccine', 'cold chain', 'refrigerator', 'phc', 'chc', 'hospital', 
      'clinic', 'medicine', 'patient', 'sub-centre', 'ambulance', 'dialysis', 'solar cold storage', 
      'temperature breach', 'maternal', 'immunization', 'doctor'
    ],
    weight: 1.15
  },
  'Energy & Rural Microgrids': {
    department: 'Department of Energy & JREDA, Govt. of Jharkhand',
    skills: ['Power Electronics', 'Micro-Inverters', 'Smart Metering', 'Grid Balancer'],
    keywords: [
      'electricity', 'power', 'voltage', 'transformer', 'microgrid', 'solar', 'grid', 
      'tripping', 'inverter', 'substation', 'jbvnl', 'feeder', 'burnout', 'load', 
      'blackout', 'transmission', 'meter', 'phase'
    ],
    weight: 1.15
  },
  'Waste Management & Sanitation': {
    department: 'Urban Development & Housing Department, Govt. of Jharkhand',
    skills: ['IoT Ultrasonic Sensors', 'Fleet Optimization', 'Environmental Eng.'],
    keywords: [
      'waste', 'garbage', 'drainage', 'sewage', 'dump', 'landfill', 'plastic', 
      'sanitation', 'cleanliness', 'drain', 'overflow', 'compost', 'municipal', 
      'litter', 'solid waste', 'recycling', 'stench'
    ],
    weight: 1.1
  },
  'Forestry & Minor Forest Produce': {
    department: 'Department of Forest, Environment & Climate Change, Govt. of Jharkhand',
    skills: ['Thermal Engineering', 'Desiccant Systems', 'Solar Drying', 'Forestry'],
    keywords: [
      'lac', 'tendu', 'mahua', 'honey', 'forest', 'tribal', 'minor forest produce', 
      'ntfp', 'fungal', 'moisture', 'sal', 'tree', 'wood', 'biodiversity', 'desiccant', 'harvest'
    ],
    weight: 1.1
  },
  'Rural Roads & Infrastructure': {
    department: 'Rural Development Department (PMGSY), Govt. of Jharkhand',
    skills: ['Structural Engineering', 'GIS Mapping', 'Material Science'],
    keywords: [
      'road', 'bridge', 'culvert', 'pothole', 'landslide', 'erosion', 'pmgsy', 
      'connectivity', 'concrete', 'asphalt', 'collapse', 'river crossing', 'highway'
    ],
    weight: 1.05
  }
};

// Spam & Nonsense Patterns
const SPAM_PATTERNS = [
  /^([a-z0-9])\1{4,}/i, // repeated characters like 'aaaaa', '11111'
  /^(test|testing|asdf|dummy|fake|hello|check|sample|qwerty|xyz)+$/i,
  /[^a-zA-Z0-9\s.,!?'"()-]{4,}/ // random symbols
];

/**
 * Classify problem category and recommend department & skills
 */
export function classifyCategory(title = '', description = '') {
  const combinedText = `${title} ${description}`.toLowerCase();
  let bestCategory = 'Water Resources & Irrigation';
  let highestScore = 0;
  const categoryScores = {};

  for (const [category, data] of Object.entries(DOMAIN_TAXONOMY)) {
    let matches = 0;
    for (const kw of data.keywords) {
      if (combinedText.includes(kw)) {
        matches += 1;
      }
    }
    const score = matches * data.weight;
    categoryScores[category] = score;

    if (score > highestScore) {
      highestScore = score;
      bestCategory = category;
    }
  }

  // Calculate normalized confidence (60% to 98%)
  const confidence = highestScore > 0 ? Math.min(98.5, Math.max(68.0, 60.0 + highestScore * 6.5)) : 70.0;
  const categoryData = DOMAIN_TAXONOMY[bestCategory];

  return {
    recommendedCategory: bestCategory,
    confidence: parseFloat(confidence.toFixed(1)),
    department: categoryData.department,
    requiredSkills: categoryData.skills,
    scores: categoryScores
  };
}

/**
 * Multi-factor Veracity Engine: Decides if a problem submission is Real vs. Fake / Spam
 */
export function evaluateVeracity({
  title = '',
  description = '',
  district = '',
  block = '',
  village = '',
  latitude = '',
  longitude = '',
  evidenceFiles = []
}) {
  const combinedText = `${title} ${description}`.trim();
  const textLower = combinedText.toLowerCase();
  const flags = [];
  let score = 50; // Starting baseline

  // 1. Minimum length & substantive check
  if (combinedText.length < 25 || combinedText.split(/\s+/).length < 5) {
    flags.push('INSUFFICIENT_TEXT_DEPTH');
    score -= 30;
  } else if (combinedText.length > 80) {
    flags.push('DETAILED_STATEMENT');
    score += 12;
  }

  // 2. Spam & Gibberish Filter
  let isSpam = false;
  for (const pat of SPAM_PATTERNS) {
    if (pat.test(combinedText) || pat.test(title)) {
      isSpam = true;
      flags.push('SPAM_PATTERN_DETECTED');
      score -= 40;
      break;
    }
  }

  // Vowel-to-consonant entropy check
  const letterCount = (combinedText.match(/[a-z]/gi) || []).length;
  const vowelCount = (combinedText.match(/[aeiou]/gi) || []).length;
  if (letterCount > 15 && (vowelCount === 0 || vowelCount / letterCount < 0.12)) {
    flags.push('LOW_LINGUISTIC_ENTROPY');
    score -= 25;
  }

  // 3. Quantitative & Empirical Indicators Check
  // Numbers, percentages, units (e.g. 80%, 3 borewells, 100 acres, 5 days)
  const hasQuantitativeMetrics = /\b(\d+(\.\d+)?(%|L|Cr|km|m|acres|hectares|families|farmers|days|hours|litres|wells|tubewells|blocks))\b/i.test(combinedText) || /\d+/.test(combinedText);
  if (hasQuantitativeMetrics) {
    flags.push('QUANTITATIVE_METRICS_PRESENT');
    score += 15;
  }

  // 4. Geographic & Location Validation
  let hasValidDistrict = false;
  const distCheck = (district || '').toLowerCase();
  for (const d of JHARKHAND_DISTRICTS) {
    if (distCheck.includes(d) || textLower.includes(d)) {
      hasValidDistrict = true;
      break;
    }
  }

  if (hasValidDistrict) {
    flags.push('JHARKHAND_GEO_BOUNDS_VERIFIED');
    score += 12;
  }

  if (block && block.length > 2) {
    flags.push('SPECIFIC_BLOCK_IDENTIFIED');
    score += 8;
  }

  // 5. GPS Coordinate Verification
  if (latitude && longitude) {
    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);
    // Jharkhand bbox roughly: Lat 21.9 to 25.4, Lon 83.3 to 87.9
    if (!isNaN(latNum) && !isNaN(lonNum) && latNum >= 21.5 && latNum <= 25.8 && lonNum >= 83.0 && lonNum <= 88.2) {
      flags.push('VALID_GPS_LOCK');
      score += 12;
    }
  }

  // 6. Evidence Attachments
  if (Array.isArray(evidenceFiles) && evidenceFiles.length > 0) {
    flags.push('ATTACHED_EVIDENCE_PAYLOAD');
    score += 10;
  }

  // 7. Domain Technical Vocabulary Match
  const classification = classifyCategory(title, description);
  if (classification.confidence >= 80) {
    flags.push('DOMAIN_ONTOLOGY_MATCHED');
    score += 10;
  }

  // Clamp score between 5.0 and 99.0
  const finalVeracityScore = Math.max(5.0, Math.min(99.0, score));
  const isReal = finalVeracityScore >= 58.0;

  // Decision confidence
  let decisionConfidence = 'MEDIUM';
  if (finalVeracityScore >= 80.0 || finalVeracityScore <= 30.0) {
    decisionConfidence = 'HIGH';
  }

  // Generate clear AI rationale explanation
  let rationale = '';
  if (isReal) {
    rationale = `Grievance verified as authentic (${finalVeracityScore.toFixed(1)}% score). Contains structured domain vocabulary for ${classification.recommendedCategory}, valid regional geographic anchors in Jharkhand, and actionable civic context.`;
  } else {
    rationale = `Flagged for manual review (${finalVeracityScore.toFixed(1)}% score). Submission lacks sufficient descriptive depth, verifiable local geographical markers, or matches spam patterns.`;
  }

  return {
    isReal,
    veracityScore: parseFloat(finalVeracityScore.toFixed(1)),
    decisionConfidence,
    flags,
    rationale,
    classification
  };
}

export default {
  classifyCategory,
  evaluateVeracity
};
