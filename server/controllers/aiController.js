const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');

const reportAnalysisPrompt = `You are a medical report analyzer assistant for MediAI. Analyze the following medical report text.

Provide your response in this EXACT format with these markdown headers:

## Simple Explanation
Explain what this report means in simple, patient-friendly language. Avoid complex medical jargon.

## Abnormal Values
List any abnormal or concerning values found in the report. For each one:
- **Value name**: measured value → normal range → what it means

If no abnormal values are found, say "All values appear to be within normal ranges."

## Recommended Specialist
Based on the findings, suggest which type of medical specialist the patient should consult (e.g., General Physician, Cardiologist, Hematologist, etc.) and briefly explain why.

## Disclaimer
⚠️ This is an AI-generated analysis and NOT a medical diagnosis. Please consult a qualified healthcare professional for proper interpretation and treatment.

---

Here is the medical report text to analyze:
`;

// @desc    Analyze a medical report (PDF/Image)
// @route   POST /api/ai/analyze-report
// @access  Protected (Patient)
const analyzeReport = async (req, res) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a medical report file (PDF, PNG, JPG).',
      });
    }

    filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    // Validate file type
    const allowedTypes = ['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.webp'];
    if (!allowedTypes.includes(fileExt)) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: `Unsupported file type: ${fileExt}. Supported: PNG, JPG, BMP, TIFF, WebP`,
      });
    }

    console.log(`📄 Processing report: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)}KB)`);

    // ── Step 1: OCR — Extract text from the image ──
    const { data: { text: extractedText } } = await Tesseract.recognize(filePath, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`  OCR Progress: ${(m.progress * 100).toFixed(0)}%`);
        }
      },
    });

    if (!extractedText || extractedText.trim().length < 10) {
      return res.status(422).json({
        success: false,
        message: 'Could not extract enough text from the report. Please upload a clearer image.',
        extractedText: extractedText?.trim() || '',
      });
    }

    console.log(`  ✅ OCR complete: ${extractedText.length} characters extracted`);

    // ── Step 2: AI Analysis — Send to Groq API (LLaMA 3.3 70B) ──
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured. Please set the GROQ_API_KEY environment variable.',
        extractedText: extractedText.trim(),
      });
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: reportAnalysisPrompt },
          { role: 'user', content: extractedText.trim() },
        ],
        temperature: 0.3,
        max_tokens: 2048,
        stream: false,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error('Groq API error:', groqResponse.status, errText);
      return res.status(500).json({
        success: false,
        message: 'AI analysis failed. Please try again later.',
        extractedText: extractedText.trim(),
      });
    }

    const groqData = await groqResponse.json();
    const analysis = groqData.choices?.[0]?.message?.content || 'Analysis could not be generated.';

    console.log('  🧠 AI analysis complete');

    // ── Step 3: Return results ──
    res.status(200).json({
      success: true,
      data: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        extractedText: extractedText.trim(),
        analysis,
      },
    });

  } catch (error) {
    console.error('❌ Report analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze report. Please try again.',
    });
  } finally {
    // Always clean up uploaded file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

module.exports = { analyzeReport };
