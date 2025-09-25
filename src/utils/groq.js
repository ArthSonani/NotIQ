import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // only for dev
});

export async function askGroq(prompt) {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Correct Groq model name
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
    });
    const result = response.choices[0]?.message?.content?.trim() || "";
    return result;
  } catch (err) {
    console.error("Groq API error:", err);
    return "";
  }
}
