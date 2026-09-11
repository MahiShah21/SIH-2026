import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Check if a valid Gemini API key is configured (AIzaSy standard format or valid length)
 */
export function isGeminiConfigured() {
  return Boolean(
    GEMINI_API_KEY && 
    GEMINI_API_KEY.length > 20 && 
    !GEMINI_API_KEY.includes('your_key_here') &&
    (GEMINI_API_KEY.startsWith('AIzaSy') || GEMINI_API_KEY.length >= 35)
  );
}

/**
 * Low-level call to Google Gemini Generate Content API
 */
async function callGeminiApi(prompt, systemInstruction = '', model = GEMINI_MODEL) {
  if (!isGeminiConfigured()) {
    return null;
  }

  const candidateModels = [model, 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  const uniqueModels = [...new Set(candidateModels)];

  for (const currentModel of uniqueModels) {
    const endpoint = `${GEMINI_API_BASE}/${currentModel}:generateContent?key=${GEMINI_API_KEY}`;
    
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    };

    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000)
      });

      if (!res.ok) {
        continue;
      }

      const data = await res.json();
      const candidate = data.candidates?.[0];
      const responseText = candidate?.content?.parts?.[0]?.text || '';
      if (responseText.trim()) {
        return responseText.trim();
      }
    } catch (e) {
      // try next model or timeout
    }
  }

  return null;
}

/**
 * Gemini Chat / Copilot Assistant
 */
export async function geminiChatCopilot(message, role = 'general', context = {}) {
  const systemInstruction = `You are JanSetu AI Copilot, the intelligent assistant for the JanSetu platform (Government of Jharkhand State Innovation, Citizen Grievance & Academic-Industry CSR Collaboration Network).
You help citizens, university researchers (BIT Mesra, IIT Dhanbad, NIT Jamshedpur), industry CSR partners (Tata Steel, TechNova, AgriTech India), and government officials.
You answer questions on:
1. Civic grievances, veracity evaluation, status tracking.
2. University research proposals, TRL levels (Technology Readiness Level), lab grants, and milestone tranches.
3. Industry CSR matching funds (1:1 ratio, 100% tax incentives), bilateral MoUs, and partnership agreements.
4. Technical problem solutions (IoT telemetry, solar irrigation, AI crop disease detection, water sanitation).
Provide clear, authoritative, and actionable responses. Use bold highlights, bullet points, and concise structure.`;

  const contextStr = context ? `\nContext details: ${JSON.stringify(context)}` : '';
  const prompt = `User Role: ${role}\nUser Query: "${message}"${contextStr}\n\nPlease generate a helpful, knowledgeable response and 3 suggested follow-up actions as short pills.`;

  try {
    const rawResponse = await callGeminiApi(prompt, systemInstruction);
    if (!rawResponse || !rawResponse.trim()) {
      return null;
    }
    return {
      success: true,
      provider: 'Google Gemini AI',
      reply: rawResponse.trim(),
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.warn('⚠️ Gemini Copilot fallback triggered:', err.message);
    return null;
  }
}

/**
 * Gemini Problem Classifier & Veracity Assessment
 */
export async function geminiClassProblem(problemData) {
  return geminiClassifyProblem(problemData);
}

export async function geminiClassifyProblem(problemData) {
  const { title, description, district, block, village, latitude, longitude, evidenceFiles } = problemData;

  const systemInstruction = `You are the JanSetu Real vs. Fake Civic Grievance & Multi-Factor Veracity AI Engine.
Evaluate the reported issue and return a valid JSON object strictly matching this schema:
{
  "isReal": true/false,
  "veracityScore": number (0 to 100),
  "decisionConfidence": number (0 to 100),
  "recommendedCategory": "Water & Irrigation" | "Sanitation & Solid Waste" | "Agriculture & Crop Disease" | "Renewable Energy & Grid" | "Roads & Infrastructure" | "Healthcare & Telemedicine" | "Education & Skill",
  "categoryConfidence": number (0 to 100),
  "department": "Department name",
  "requiredSkills": ["Skill 1", "Skill 2", "Skill 3"],
  "authenticityFlags": ["Flag 1", "Flag 2"],
  "aiRationale": "Clear 2-sentence rationale for the veracity score and department routing."
}
Only output raw JSON without markdown code fences or backticks.`;

  const prompt = `Analyze this citizen report:
Title: "${title || ''}"
Description: "${description || ''}"
Location: District: ${district || 'Jharkhand'}, Block: ${block || 'N/A'}, Village/Ward: ${village || 'N/A'}
GPS: ${latitude || 'N/A'}, ${longitude || 'N/A'}
Evidence Attachments Count: ${evidenceFiles?.length || 0}
`;

  try {
    const rawResponse = await callGeminiApi(prompt, systemInstruction);
    if (!rawResponse || !rawResponse.trim()) {
      return null;
    }
    const cleaned = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      ...parsed,
      provider: 'Google Gemini AI'
    };
  } catch (err) {
    console.warn('⚠️ Gemini Problem Classifier fallback triggered:', err.message);
    return null;
  }
}

/**
 * Gemini Bilateral MoU & Agreement Clause Generator
 */
export async function geminiGenerateMoUClause(projectTitle, universityName, industryName, committedAmount) {
  const prompt = `Draft a standard legal clause for a Tripartite Industry-University MoU on the JanSetu platform:
Project: "${projectTitle}"
University Partner: "${universityName || 'BIT Mesra'}"
Industry CSR Partner: "${industryName || 'Tata Steel CSR Innovation Desk'}"
Grant Amount: "${committedAmount || '₹2,50,000'}"

Provide a concise, formal MoU clause covering IP sharing (open for public welfare), CSR tranche disbursement milestones, and lab validation deliverables.`;

  try {
    const raw = await callGeminiApi(prompt, 'You are JanSetu Legal & Innovation Policy Specialist.');
    if (!raw || !raw.trim()) return null;
    return raw.trim();
  } catch (err) {
    console.warn('⚠️ Gemini MoU Generator fallback:', err.message);
    return null;
  }
}
