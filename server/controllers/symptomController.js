// Symptom Checker Controller
// Uses Groq API (LLaMA 3.3 70B) to predict diseases from symptoms
// Cloud-based — no local Ollama dependency

// Disease to doctor type mapping (kept for specialist routing)
const diseaseToDoctorMapping = {
  "Fungal Infection": "Dermatologist",
  "Acne": "Dermatologist",
  "Psoriasis": "Dermatologist",
  "Impetigo": "Dermatologist",
  "Eczema": "Dermatologist",
  "Allergy": "Allergist",
  "Drug Reaction": "Allergist",
  "GERD": "Gastroenterologist",
  "Peptic Ulcer Disease": "Gastroenterologist",
  "Gastroenteritis": "Gastroenterologist",
  "Chronic Cholestasis": "Gastroenterologist",
  "Irritable Bowel Syndrome": "Gastroenterologist",
  "Food Poisoning": "Gastroenterologist",
  "Hepatitis A": "Hepatologist",
  "Hepatitis B": "Hepatologist",
  "Hepatitis C": "Hepatologist",
  "Hepatitis D": "Hepatologist",
  "Hepatitis E": "Hepatologist",
  "Alcoholic Hepatitis": "Hepatologist",
  "Jaundice": "Hepatologist",
  "Migraine": "Neurologist",
  "Paralysis (brain hemorrhage)": "Neurologist",
  "Cervical Spondylosis": "Neurologist",
  "Vertigo": "Neurologist",
  "Heart Attack": "Cardiologist",
  "Hypertension": "Cardiologist",
  "Varicose Veins": "Cardiologist",
  "Diabetes": "Endocrinologist",
  "Hyperthyroidism": "Endocrinologist",
  "Hypothyroidism": "Endocrinologist",
  "Hypoglycemia": "Endocrinologist",
  "Arthritis": "Orthopedic",
  "Osteoarthritis": "Orthopedic",
  "Malaria": "General Physician",
  "Dengue": "General Physician",
  "Typhoid": "General Physician",
  "Common Cold": "General Physician",
  "Chickenpox": "General Physician",
  "Viral Fever": "General Physician",
  "Influenza": "General Physician",
  "Pneumonia": "Pulmonologist",
  "Bronchial Asthma": "Pulmonologist",
  "Tuberculosis": "Pulmonologist",
  "Bronchitis": "Pulmonologist",
  "Dimorphic Hemmorhoids (piles)": "Proctologist",
  "Urinary Tract Infection": "Urologist",
  "Kidney Stones": "Urologist",
  "AIDS": "Infectious Disease Specialist",
};

// ========================
// GROQ API PREDICTION
// ========================

/**
 * Build a structured medical prompt for the LLM
 * @param {string[]} symptoms - Array of normalized symptom strings
 * @returns {string} - The formatted prompt
 */
const buildPrompt = (symptoms) => {
  const symptomList = symptoms.map(s => s.replace(/_/g, ' ')).join(', ');

  return `You are a medical assistant AI. A patient reports the following symptoms: ${symptomList}

Based on these symptoms, suggest the top 2 most likely medical conditions.

RULES:
- Prefer common diseases over rare ones
- Do NOT suggest extreme diseases (e.g., Paralysis, AIDS, Heart Attack) unless the symptoms strongly indicate them
- Do NOT provide an exact diagnosis — only suggest likely conditions
- Be medically safe and conservative
- Consider symptom combinations, not individual symptoms in isolation
- Each condition must have a clear clinical reason tied to the reported symptoms

Return your answer STRICTLY as a JSON array with exactly 2 objects. No explanation, no markdown, no extra text.

Format:
[
  {
    "disease": "Disease Name",
    "confidence": "low or medium or high",
    "reason": "Brief clinical reason connecting symptoms to this condition"
  },
  {
    "disease": "Disease Name",
    "confidence": "low or medium or high",
    "reason": "Brief clinical reason connecting symptoms to this condition"
  }
]

IMPORTANT: Return ONLY the JSON array. No other text before or after it.`;
};

/**
 * Extract JSON array from LLM response text (handles wrapping text, markdown fences, etc.)
 * @param {string} text - Raw LLM response
 * @returns {Array|null} - Parsed array or null
 */
const extractJSON = (text) => {
  if (!text) return null;

  // Try direct parse first
  try {
    const parsed = JSON.parse(text.trim());
    if (Array.isArray(parsed)) return parsed;
  } catch (_) {
    // Continue to regex extraction
  }

  // Remove markdown code fences if present
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '');

  // Find JSON array pattern
  const match = cleaned.match(/\[[\s\S]*?\]/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {
      // Fall through
    }
  }

  return null;
};

/**
 * Call Groq API to predict diseases from symptoms
 * Uses LLaMA 3.3 70B model for accurate medical reasoning
 * @param {string[]} symptoms - Array of normalized symptom strings
 * @returns {Promise<Array>} - Array of prediction objects
 */
const callGroqPredict = async (symptoms) => {
  const prompt = buildPrompt(symptoms);

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured in environment variables');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a medical assistant AI that provides structured disease predictions in JSON format. Always respond with ONLY valid JSON arrays. No markdown, no explanation.'
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,       // Low temperature for consistent medical output
      max_tokens: 512,         // Limit output length for speed
      top_p: 1,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API returned status ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const rawResponse = data.choices?.[0]?.message?.content || '';

  console.log('  🧠 LLM raw response:', rawResponse.substring(0, 300));

  const parsed = extractJSON(rawResponse);

  if (!parsed || parsed.length === 0) {
    console.warn('  ⚠️ Could not parse LLM response into valid JSON');
    return [];
  }

  // Validate and sanitize each prediction
  return parsed
    .filter(item => item.disease && item.confidence && item.reason)
    .map(item => ({
      disease: String(item.disease).trim(),
      confidence: ['low', 'medium', 'high'].includes(String(item.confidence).toLowerCase())
        ? String(item.confidence).toLowerCase()
        : 'medium',
      reason: String(item.reason).trim(),
    }));
};

/**
 * Look up doctor type for a disease name.
 * Uses exact match first, then fuzzy substring match as fallback.
 * @param {string} disease - Disease name from LLM
 * @returns {string} - Doctor specialization
 */
const getDoctorType = (disease) => {
  // Exact match
  if (diseaseToDoctorMapping[disease]) {
    return diseaseToDoctorMapping[disease];
  }

  // Case-insensitive match
  const lowerDisease = disease.toLowerCase();
  for (const [key, value] of Object.entries(diseaseToDoctorMapping)) {
    if (key.toLowerCase() === lowerDisease) {
      return value;
    }
  }

  // Fuzzy substring match (e.g., "Viral Fever" matches if LLM says "Acute Viral Fever")
  for (const [key, value] of Object.entries(diseaseToDoctorMapping)) {
    if (lowerDisease.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerDisease)) {
      return value;
    }
  }

  // Keyword-based fallback
  const keywordMap = {
    'skin': 'Dermatologist',
    'heart': 'Cardiologist',
    'liver': 'Hepatologist',
    'kidney': 'Urologist',
    'brain': 'Neurologist',
    'lung': 'Pulmonologist',
    'bone': 'Orthopedic',
    'joint': 'Orthopedic',
    'stomach': 'Gastroenterologist',
    'gastro': 'Gastroenterologist',
    'thyroid': 'Endocrinologist',
    'diabetes': 'Endocrinologist',
    'allerg': 'Allergist',
    'infect': 'Infectious Disease Specialist',
    'urin': 'Urologist',
    'respiratory': 'Pulmonologist',
    'asthma': 'Pulmonologist',
  };

  for (const [keyword, doctorType] of Object.entries(keywordMap)) {
    if (lowerDisease.includes(keyword)) {
      return doctorType;
    }
  }

  return 'General Physician';
};


// ========================
// API CONTROLLERS
// ========================

// @desc    Predict diseases from symptoms using Groq LLM
// @route   POST /api/symptoms/predict
// @access  Public
const predictDisease = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a symptoms array.',
      });
    }

    // Safety layer: require at least 2 symptoms for meaningful prediction
    if (symptoms.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least 2 symptoms for an accurate prediction.',
      });
    }

    const inputSymptoms = symptoms.map(s => s.toLowerCase().trim());

    console.log(`🔍 Groq LLM Prediction for: [${inputSymptoms.join(', ')}]`);

    // Call Groq API
    const llmPredictions = await callGroqPredict(inputSymptoms);

    if (llmPredictions.length === 0) {
      return res.status(200).json({
        success: true,
        predictions: [],
        message: 'Could not determine conditions from the given symptoms. Please try adding more symptoms or consult a doctor.',
      });
    }

    // Map each prediction to a doctor specialist
    const predictions = llmPredictions.map(pred => ({
      disease: pred.disease,
      confidence: pred.confidence,
      reason: pred.reason,
      doctorType: getDoctorType(pred.disease),
    }));

    console.log(`  ✅ Predictions: ${predictions.map(p => `${p.disease} (${p.confidence})`).join(', ')}`);

    res.status(200).json({
      success: true,
      predictions,
    });
  } catch (error) {
    console.error('❌ LLM Prediction error:', error);

    // If Groq API key is missing
    if (error.message && error.message.includes('GROQ_API_KEY')) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured. Please set the GROQ_API_KEY environment variable.',
      });
    }

    // If Groq API is unreachable
    if (error.message && (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed'))) {
      return res.status(503).json({
        success: false,
        message: 'AI service is currently unavailable. Please try again later.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Prediction failed. Please try again.',
    });
  }
};

// @desc    Get all available symptoms (kept for search/autocomplete)
// @route   GET /api/symptoms/list
// @access  Public
const getSymptomsList = async (req, res) => {
  try {
    // Common symptoms list for the autocomplete search UI
    const commonSymptoms = [
      "abdominal_pain", "acidity", "anxiety", "back_pain", "belly_pain",
      "blackheads", "bladder_discomfort", "blister", "bloody_stool",
      "blurred_and_distorted_vision", "breathlessness", "brittle_nails",
      "bruising", "burning_micturition", "chest_pain", "chills",
      "cold_hands_and_feets", "congestion", "constipation", "continuous_feel_of_urine",
      "continuous_sneezing", "cough", "cramps", "dark_urine", "dehydration",
      "depression", "diarrhoea", "dischromic_patches", "dizziness",
      "drying_and_tingling_lips", "enlarged_thyroid", "excessive_hunger",
      "extra_marital_contacts", "family_history", "fast_heart_rate", "fatigue",
      "foul_smell_of_urine", "headache", "high_fever", "hip_joint_pain",
      "increased_appetite", "indigestion", "inflammatory_nails",
      "internal_itching", "irregular_sugar_level", "irritability",
      "irritation_in_anus", "itching", "joint_pain", "knee_pain",
      "lack_of_concentration", "lethargy", "loss_of_appetite", "loss_of_balance",
      "loss_of_smell", "malaise", "mild_fever", "mood_swings", "movement_stiffness",
      "mucoid_sputum", "muscle_pain", "muscle_wasting", "muscle_weakness",
      "nausea", "neck_pain", "nodal_skin_eruptions", "obesity",
      "pain_behind_the_eyes", "pain_during_bowel_movements", "pain_in_anal_region",
      "palpitations", "passage_of_gases", "patches_in_throat", "phlegm",
      "polyuria", "puffy_face_and_eyes", "pus_filled_pimples",
      "receiving_blood_transfusion", "receiving_unsterile_injections",
      "red_sore_around_nose", "red_spots_over_body", "redness_of_eyes",
      "restlessness", "runny_nose", "scurring", "shivering",
      "silver_like_dusting", "sinus_pressure", "skin_peeling", "skin_rash",
      "slurred_speech", "small_dents_in_nails", "spinning_movements",
      "spotting_urination", "stiff_neck", "stomach_pain", "sunken_eyes",
      "sweating", "swelled_lymph_nodes", "swelling_joints", "swelling_of_stomach",
      "swollen_blood_vessels", "swollen_extremeties", "swollen_legs",
      "throat_irritation", "toxic_look_(typhos)", "ulcers_on_tongue",
      "unsteadiness", "visual_disturbances", "vomiting", "watering_from_eyes",
      "weakness_in_limbs", "weakness_of_one_body_side", "weight_gain",
      "weight_loss", "yellow_crust_ooze", "yellow_urine", "yellowing_of_eyes",
      "yellowish_skin", "fever", "sore_throat",
    ];

    res.status(200).json({
      success: true,
      data: commonSymptoms.sort(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch symptoms list.',
    });
  }
};

module.exports = {
  predictDisease,
  getSymptomsList,
  diseaseToDoctorMapping,
  getDoctorType,
  callGroqPredict,
};
