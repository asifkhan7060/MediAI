// Chatbot Controller
// Uses Mistral AI cloud API for conversational medical assistant
// Cloud-based — no local Ollama dependency

const systemPrompt = `You are MediAI, an intelligent medical assistant integrated into a doctor appointment system.

Your role is to:
1. Understand user symptoms
2. Suggest the appropriate medical department or doctor type
3. Help users book, reschedule, or cancel appointments
4. Answer basic hospital-related queries (timings, departments, availability)

IMPORTANT RULES:
- Do NOT provide medical diagnosis or prescribe medicines
- Always include a disclaimer: "This is not a medical diagnosis. Please consult a doctor."
- If symptoms are serious (chest pain, breathing issues, bleeding, unconsciousness), immediately suggest emergency help

CONVERSATION STYLE:
- Friendly, short, and clear
- Ask follow-up questions when needed
- Guide the user step-by-step

RESPONSE FORMAT:
Always structure your response like this:

1. Understanding:
- Briefly restate user problem

2. Suggestion:
- Recommend doctor type (e.g., General Physician, Dermatologist, Cardiologist)

3. Action:
- Ask user if they want to book an appointment
- If yes, ask for date/time

4. Disclaimer:
- Add: "This is not a medical diagnosis. Please consult a doctor."

EXAMPLES:

User: I have skin rashes
Response:
Understanding: You are experiencing skin rashes.
Suggestion: You should consult a Dermatologist.
Action: Would you like me to book an appointment with a Dermatologist?
Disclaimer: This is not a medical diagnosis. Please consult a doctor.

---

SPECIAL FEATURES:

- If user says "book appointment":
  Ask:
  - Preferred doctor/specialization
  - Date
  - Time

- If user provides symptoms:
  Map symptoms to departments:
  - Fever, cold → General Physician
  - Skin issues → Dermatologist
  - Heart/chest pain → Cardiologist
  - Eye issues → Ophthalmologist
  - Tooth pain → Dentist

- If user is confused:
  Ask clarifying questions

- If user asks non-medical questions:
  Answer politely and redirect to healthcare help

---

You are part of a healthcare system, so be safe, helpful, and structured.`;

const chatWithMistral = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
    if (!MISTRAL_API_KEY) {
      return res.status(503).json({
        error: "Chatbot service is not configured. Please set the MISTRAL_API_KEY environment variable.",
      });
    }

    const requestBody = {
      model: "mistral-small-latest",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      stream: true,
      max_tokens: 1024,
      temperature: 0.7,
    };

    // Make request to Mistral AI cloud API
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Mistral AI API Error:", response.status, errText);
      return res.status(500).json({ error: "Failed to communicate with AI chatbot service." });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Stream response from Mistral AI to client
    const body = response.body;
    for await (const chunk of body) {
      res.write(chunk);
    }
    res.end();

  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ error: "Internal Server Error related to Chatbot." });
  }
};

module.exports = {
  chatWithMistral,
};
