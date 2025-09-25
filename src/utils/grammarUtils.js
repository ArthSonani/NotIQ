// Utility to mark grammar errors with red underline (returns HTML string)
export function markGrammarErrors(content, errors = []) {
  if (!errors.length) return content;
  let result = "";
  let lastIndex = 0;
  errors.forEach(({ start, end, suggestion }, i) => {
    // Properly escape the suggestion for HTML attribute
    const escapedSuggestion = suggestion
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    result += content.slice(lastIndex, start);
    result += `<span class="grammar-error" title="Suggestion: ${escapedSuggestion}" style="text-decoration: red wavy underline;">${content.slice(start, end)}</span>`;
    lastIndex = end;
  });
  result += content.slice(lastIndex);
  return result;
}

// Utility to mark grammar errors in HTML content while preserving existing formatting
export function markGrammarErrorsInHTML(htmlContent, errors = []) {
  if (!errors.length) {
    return htmlContent;
  }
  
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const plainText = tempDiv.textContent || '';
    
    // Sort errors by start position in descending order to avoid offset issues
    const sortedErrors = [...errors].sort((a, b) => b.start - a.start);
    
    // Function to mark errors in text nodes only
    const markErrorsInTextNodes = (node, textOffset = 0) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const nodeText = node.textContent;
        let hasChanges = false;
        let modifiedText = nodeText;
        
        sortedErrors.forEach(({ start, end, suggestion }) => {
          const errorStart = start - textOffset;
          const errorEnd = end - textOffset;
          
          // Check if this error falls within this text node
          if (errorStart >= 0 && errorEnd <= nodeText.length && errorStart < errorEnd) {
            const errorText = nodeText.substring(errorStart, errorEnd);
            
            if (errorText.trim()) {
              // Properly escape the suggestion for HTML attribute
              const escapedSuggestion = (suggestion || '')
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
              
              const before = modifiedText.substring(0, errorStart);
              const after = modifiedText.substring(errorEnd);
              modifiedText = before + `<span class="grammar-error" title="Suggestion: ${escapedSuggestion}">${errorText}</span>` + after;
              hasChanges = true;
            }
          }
        });
        
        if (hasChanges) {
          const wrapper = document.createElement('div');
          wrapper.innerHTML = modifiedText;
          while (wrapper.firstChild) {
            node.parentNode.insertBefore(wrapper.firstChild, node);
          }
          node.parentNode.removeChild(node);
        }
        
        return textOffset + nodeText.length;
      } else if (node.nodeType === Node.ELEMENT_NODE && node.className !== 'grammar-error') {
        // Don't process already marked errors
        let currentOffset = textOffset;
        const children = Array.from(node.childNodes);
        children.forEach(child => {
          currentOffset = markErrorsInTextNodes(child, currentOffset);
        });
        return currentOffset;
      }
      
      return textOffset;
    };
    
    markErrorsInTextNodes(tempDiv);
    return tempDiv.innerHTML;
  } catch (e) {
    console.error('Error in markGrammarErrorsInHTML:', e);
    return htmlContent; // Return original content if marking fails
  }
}