// Symptom Normalization Controller
// Converts multilingual symptom input (Hindi, Hinglish, Marathi, etc.)
// into standardized English medical symptoms using dictionary + AI fallback
// AI fallback uses Groq API — no local Ollama dependency

// ========================
// SYMPTOM DICTIONARY (Multilingual → English)
// ========================
const symptomMap = {
  // Hindi / Hinglish
  "sir dard": "headache",
  "sar dard": "headache",
  "sar me dard": "headache",
  "sir me dard": "headache",
  "sardard": "headache",
  "sirdard": "headache",
  "bukhar": "fever",
  "bukhaar": "fever",
  "tez bukhar": "high_fever",
  "tej bukhar": "high_fever",
  "halka bukhar": "mild_fever",
  "khansi": "cough",
  "khaansi": "cough",
  "pet dard": "stomach_pain",
  "pet me dard": "stomach_pain",
  "peyt dard": "stomach_pain",
  "gala kharab": "sore_throat",
  "gale me dard": "sore_throat",
  "gala dard": "sore_throat",
  "chakkar": "dizziness",
  "chakkar aana": "dizziness",
  "ulti": "vomiting",
  "ultiyaan": "vomiting",
  "ji machlana": "nausea",
  "ji michlaana": "nausea",
  "matli": "nausea",
  "thakan": "fatigue",
  "kamzori": "fatigue",
  "kamjori": "fatigue",
  "saans lene me takleef": "breathlessness",
  "saans phoolna": "breathlessness",
  "seene me dard": "chest_pain",
  "chhati me dard": "chest_pain",
  "dast": "diarrhoea",
  "loose motion": "diarrhoea",
  "kabz": "constipation",
  "qabz": "constipation",
  "jukaam": "congestion",
  "zukam": "congestion",
  "nazla": "congestion",
  "naak bahna": "runny_nose",
  "naak band": "congestion",
  "cheenk": "continuous_sneezing",
  "cheenkna": "continuous_sneezing",
  "aankhon me dard": "pain_behind_the_eyes",
  "ankho me dard": "pain_behind_the_eyes",
  "kamar dard": "back_pain",
  "peeth dard": "back_pain",
  "jodon me dard": "joint_pain",
  "gathiya": "joint_pain",
  "ghutne me dard": "knee_pain",
  "gardan dard": "neck_pain",
  "gardan me dard": "neck_pain",
  "wajan badna": "weight_gain",
  "wajan kam hona": "weight_loss",
  "bhook na lagna": "loss_of_appetite",
  "bhookh zyada lagna": "excessive_hunger",
  "zyada bhookh": "excessive_hunger",
  "khujli": "itching",
  "kharish": "itching",
  "daane": "skin_rash",
  "dane": "skin_rash",
  "jaldi jaldi peshab": "polyuria",
  "baar baar peshab": "polyuria",
  "peshab me jalan": "burning_micturition",
  "nind na aana": "restlessness",
  "bechain": "restlessness",
  "pasina": "sweating",
  "zyada pasina": "sweating",
  "dhundla dikhai dena": "blurred_and_distorted_vision",
  "nazar kamzor": "blurred_and_distorted_vision",
  "dil ki dhadkan tez": "fast_heart_rate",
  "ghabrahat": "anxiety",
  "chinta": "anxiety",
  "udaasi": "depression",
  "depression": "depression",
  "mood swings": "mood_swings",
  "thandi": "chills",
  "thand lagana": "chills",
  "kaanpna": "shivering",

  // Devanagari (Hindi Script)
  "सिर दर्द": "headache",
  "सर दर्द": "headache",
  "बुखार": "fever",
  "तेज़ बुखार": "high_fever",
  "तेज बुखार": "high_fever",
  "खांसी": "cough",
  "पेट दर्द": "stomach_pain",
  "उल्टी": "vomiting",
  "चक्कर": "dizziness",
  "थकान": "fatigue",
  "सीने में दर्द": "chest_pain",
  "दस्त": "diarrhoea",
  "जुकाम": "congestion",
  "गला खराब": "sore_throat",
  "गले में खराश": "sore_throat",

  // Marathi
  "dokedukhi": "headache",
  "doke dukhi": "headache",
  "taap": "fever",
  "khokhla": "cough",
  "potdukhi": "stomach_pain",
  "pot dukhi": "stomach_pain",
  "ghasa kharab": "sore_throat",
  "ulti": "vomiting",
  "thakva": "fatigue",
  "shvas ghenyas tras": "breathlessness",
  "chhatit dukhi": "chest_pain",

  // Common English misspellings / colloquial
  "head pain": "headache",
  "body ache": "muscle_pain",
  "body pain": "muscle_pain",
  "stomach ache": "stomach_pain",
  "tummy ache": "stomach_pain",
  "belly ache": "belly_pain",
  "throat pain": "sore_throat",
  "sore throat": "throat_irritation",
  "running nose": "runny_nose",
  "stuffy nose": "congestion",
  "blocked nose": "congestion",
  "throwing up": "vomiting",
  "feeling dizzy": "dizziness",
  "feeling tired": "fatigue",
  "feeling weak": "fatigue",
  "short of breath": "breathlessness",
  "can't breathe": "breathlessness",
  "eye pain": "pain_behind_the_eyes",
  "back ache": "back_pain",
  "skin rash": "skin_rash",
  "high temperature": "high_fever",
  "loose stools": "diarrhoea",
  "no appetite": "loss_of_appetite",
  "acidity": "acidity",
  "gas": "passage_of_gases",
  "bloating": "swelling_of_stomach",
  "indigestion": "indigestion",
  "pimples": "pus_filled_pimples",
  "acne": "skin_rash",
};

// ========================
// NORMALIZATION FUNCTION
// ========================

/**
 * Normalize symptom text using dictionary matching + AI fallback
 * @param {string} inputText - Raw user input (any language)
 * @returns {Promise<string[]>} - Array of standardized English symptoms
 */
const normalizeSymptoms = async (inputText) => {
  if (!inputText || typeof inputText !== 'string' || inputText.trim().length === 0) {
    return [];
  }

  const lowerInput = inputText.toLowerCase().trim();
  const matchedSymptoms = new Set();

  // ── Strategy 1: Dictionary Matching ──
  // Sort keys by length (longest first) for greedy matching
  const sortedKeys = Object.keys(symptomMap).sort((a, b) => b.length - a.length);

  let remaining = lowerInput;

  for (const key of sortedKeys) {
    if (remaining.includes(key)) {
      matchedSymptoms.add(symptomMap[key]);
      // Remove matched portion to avoid double-matching
      remaining = remaining.replace(key, ' ').trim();
    }
  }

  // ── Strategy 2: AI Fallback (if no dictionary match found) ──
  if (matchedSymptoms.size === 0) {
    console.log(`  📖 No dictionary match for: "${inputText}" → using Groq AI fallback`);
    try {
      const aiSymptoms = await groqFallback(inputText);
      aiSymptoms.forEach(s => matchedSymptoms.add(s));
    } catch (err) {
      console.error('  ❌ Groq AI fallback failed:', err.message);
      // Return empty — caller should handle gracefully
    }
  }

  return [...matchedSymptoms];
};

/**
 * AI Fallback: Use Groq API (LLaMA 3.3 70B) to convert free-text to medical symptoms
 */
const groqFallback = async (userInput) => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const prompt = `You are a medical assistant. Convert the following sentence into standard medical symptoms in English. Return ONLY a valid JSON array of symptom strings, nothing else. Use snake_case for multi-word symptoms (e.g., "stomach_pain", "high_fever").

Input: "${userInput}"

Output:`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a medical symptom extraction assistant. Always respond with ONLY a valid JSON array of symptom strings in snake_case English. No explanation, no markdown.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 256,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API returned status ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '[]';

  // Extract JSON array from response (handle potential wrapping text)
  const jsonMatch = content.match(/\[[\s\S]*?\]/);
  if (!jsonMatch) {
    console.warn('  ⚠️ Could not parse Groq AI response:', content);
    return [];
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (Array.isArray(parsed)) {
      return parsed.map(s => String(s).toLowerCase().trim().replace(/\s+/g, '_'));
    }
  } catch (e) {
    console.warn('  ⚠️ JSON parse failed:', e.message);
  }

  return [];
};

// ========================
// API CONTROLLER
// ========================

// @desc    Normalize multilingual symptom input to standard English
// @route   POST /api/symptoms/normalize
// @access  Public
const normalizeInput = async (req, res) => {
  try {
    const { input } = req.body;

    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide symptom input text.',
      });
    }

    console.log(`🔤 Normalizing: "${input}"`);

    const normalized = await normalizeSymptoms(input);

    console.log(`  ✅ Normalized: [${normalized.join(', ')}]`);

    res.status(200).json({
      success: true,
      rawInput: input,
      normalized,
      method: normalized.length > 0 ? 'dictionary+ai' : 'none',
    });
  } catch (error) {
    console.error('❌ Normalization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to normalize symptoms.',
    });
  }
};

module.exports = {
  normalizeInput,
  normalizeSymptoms,
  symptomMap,
};
