import { askGroq } from "./groq";
import { getMockGlossary, getMockGrammarErrors } from "./mockData";

// Glossary
export async function getGlossary(content) {

  if (!content || content.trim().length === 0) {
    return [];
  }

  try {
    const prompt = `You are a helpful assistant that identifies important terms in text and provides definitions.

    Analyze the following text and extract 3-5 important terms that would benefit from definitions. For each term, provide a clear, concise definition.

    Text: "${content.slice(0, 800)}"

    Respond with ONLY valid JSON in this exact format:
    [{"term": "example term", "definition": "clear definition of the term"}]

    Important: 
    - Only include terms that actually appear in the text
    - Focus on technical terms, proper nouns, or concepts that might need explanation
    - Keep definitions under 50 words
    - Return valid JSON only, no other text`;

    const result = await askGroq(prompt);

    if (!result || !result.trim()) {
      throw new Error('Empty response from Groq');
    }

    // Clean up the response to extract just the JSON
    let cleanResult = result.trim();

    // Remove any markdown code blocks
    cleanResult = cleanResult.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    // Find JSON array in the response
    const jsonMatch = cleanResult.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      cleanResult = jsonMatch[0];
    }

    const parsed = JSON.parse(cleanResult);

    // Validate the structure
    if (Array.isArray(parsed) && parsed.every(item => item.term && item.definition)) {
      return parsed.slice(0, 5); // Limit to 5 terms
    } else {
      throw new Error('Invalid glossary format');
    }

  } catch (error) {
    console.log('getGlossary error, using fallback:', error);
    return getMockGlossary(content);
  }
}

// Summary
export async function getSummary(content) {

  if (!content || content.trim().length === 0) {
    return '';
  }

  try {
    const prompt = `Summarize the following text in 1-2 clear, concise sentences. Focus on the main topics and key points.

    Text: "${content.slice(0, 1000)}"

    Provide only the summary, no other text.`;

    const result = await askGroq(prompt);

    if (result && result.trim()) {
      return result.trim();
    }
    throw new Error('Empty response from Groq');

  } catch (error) {
    console.log('getSummary error, using fallback:', error);

    // Minimal fallback - just return first sentence or basic info
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length > 0) {
      return `This note starts with: "${sentences[0].trim()}..."`;
    }

    return `This note contains ${content.trim().split(/\s+/).length} words of content.`;
  }
}

export async function getTags(content) {
  if (!content || content.trim().length === 0) {
    return [];
  }

  try {
    const prompt = `Analyze the following text and suggest 3-5 relevant tags that categorize the content.

    Text: "${content.slice(0, 800)}"

    Respond with ONLY a valid JSON array of tags like:
    ["tag1", "tag2", "tag3"]

    Focus on:
    - Main topics or themes
    - Categories or subjects
    - Key concepts mentioned
    - Keep tags short (1-2 words)
    - Use lowercase

    Return only the JSON array, no other text.`;

    const result = await askGroq(prompt);

    if (!result || !result.trim()) {
      throw new Error('Empty response from Groq');
    }

    // Clean up the response
    let cleanResult = result.trim();

    // Remove any markdown code blocks
    cleanResult = cleanResult.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    // Find JSON array in the response
    const jsonMatch = cleanResult.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      cleanResult = jsonMatch[0];
    }

    const parsed = JSON.parse(cleanResult);

    if (Array.isArray(parsed) && parsed.every(tag => typeof tag === 'string')) {
      return parsed.slice(0, 5);
    } else {
      throw new Error('Invalid tags format');
    }
  } catch {
    return ['general'];
  }
}

export async function getGrammarErrors(content) {
  if (!content || content.trim().length === 0) {
    return [];
  }

  try {
    const prompt = `Analyze the following text for grammar errors and return ONLY a JSON array.

    Text: "${content.slice(0, 800)}"

    For each grammar error found, provide:
    - start: character position where error begins
    - end: character position where error ends  
    - suggestion: corrected text

    Respond with ONLY valid JSON in this format:
    [{"start": 10, "end": 15, "suggestion": "corrected text"}]

    Focus on:
    - Subject-verb agreement errors
    - Tense inconsistencies
    - Common grammar mistakes
    - Word choice errors

    If no errors found, return empty array: []

    Return only JSON, no other text.`;

    const result = await askGroq(prompt);

    if (!result || !result.trim()) {
      throw new Error('Empty response from Groq');
    }

    // Clean up the response
    let cleanResult = result.trim()
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '');

    // Find JSON array in the response
    const jsonMatch = cleanResult.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      cleanResult = jsonMatch[0];
    }

    const parsed = JSON.parse(cleanResult);

    // Validate the structure
    if (Array.isArray(parsed)) {
      const validErrors = parsed.filter(error =>
        typeof error.start === 'number' &&
        typeof error.end === 'number' &&
        typeof error.suggestion === 'string' &&
        error.start >= 0 && error.end > error.start
      );

      return validErrors.slice(0, 10);
    } else {
      throw new Error('Invalid grammar errors format');
    }

  } catch {
    return getMockGrammarErrors();
  }
}
