import { getGlossary, getSummary, getTags, getGrammarErrors } from "../utils/aiService";

export default function useAI() {
  // Expose all AI functions as hooks
  return {
    getGlossary,
    getSummary,
    getTags,
    getGrammarErrors,
  };
}