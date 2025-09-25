// Mock data for AI services - used as fallbacks when API fails

export const getMockGlossary = (content) => {
  const words = content.toLowerCase().split(/\s+/);
  const mockTerms = [];
  
  // Business/Company terms
  if (words.includes('product-based') || words.includes('company')) mockTerms.push({term: 'Product-Based Company', definition: 'Companies that build and sell their own products, such as software, platforms, tools, apps, or hardware.'});
  if (words.includes('software')) mockTerms.push({term: 'software', definition: 'Computer programs and applications'});
  if (words.includes('platforms')) mockTerms.push({term: 'platforms', definition: 'Digital foundations that enable other software to run'});
  if (words.includes('revenue')) mockTerms.push({term: 'revenue', definition: 'Income generated from business operations'});
  if (words.includes('services')) mockTerms.push({term: 'services', definition: 'Work performed for clients or customers'});
  
  // Tech company examples
  if (words.includes('microsoft')) mockTerms.push({term: 'Microsoft', definition: 'Technology company known for Windows and Office'});
  if (words.includes('google')) mockTerms.push({term: 'Google', definition: 'Search engine and technology company'});
  if (words.includes('adobe')) mockTerms.push({term: 'Adobe', definition: 'Software company specializing in creative tools'});
  
  // General tech terms
  if (words.includes('react')) mockTerms.push({term: 'React', definition: 'A JavaScript library for building user interfaces'});
  if (words.includes('javascript')) mockTerms.push({term: 'JavaScript', definition: 'A high-level programming language'});
  if (words.includes('api')) mockTerms.push({term: 'API', definition: 'Application Programming Interface'});
  
  // Daily life terms
  if (words.includes('market')) mockTerms.push({term: 'market', definition: 'A place where goods are bought and sold'});
  if (words.includes('vegetables')) mockTerms.push({term: 'vegetables', definition: 'Edible plants or parts of plants, typically used in cooking'});
  if (words.includes('snacks')) mockTerms.push({term: 'snacks', definition: 'Light meals or food eaten between regular meals'});
  if (words.includes('park')) mockTerms.push({term: 'park', definition: 'A public area of land for recreation and enjoyment'});
  if (words.includes('football')) mockTerms.push({term: 'football', definition: 'A team sport played with a spherical ball'});
  
  return mockTerms.slice(0, 5);
};

export const getMockGrammarErrors = (content) => {
  const errors = [];
  
  // Common grammar mistakes
  // Subject-verb disagreement: "I goes" should be "I go"
  const iGoesMatch = content.match(/\bI goes\b/gi);
  if (iGoesMatch) {
    const index = content.indexOf(iGoesMatch[0]);
    errors.push({start: index, end: index + iGoesMatch[0].length, suggestion: 'I go'});
  }
  
  // "We was" should be "We were"
  const weWasMatch = content.match(/\bWe was\b/gi);
  if (weWasMatch) {
    const index = content.indexOf(weWasMatch[0]);
    errors.push({start: index, end: index + weWasMatch[0].length, suggestion: 'We were'});
  }
  return errors;
};