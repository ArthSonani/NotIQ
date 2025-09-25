// Utility to highlight glossary terms (returns HTML string)
export function highlightGlossary(content, glossary = []) {
  if (!glossary.length) return content;
  let html = content;
  glossary.forEach(({ term, definition }) => {
    const regex = new RegExp(`\\b(${term})\\b`, "gi");
    html = html.replace(
      regex,
      `<span class="highlighted-term" title="${definition}">$1</span>`
    );
  });
  return html;
}

// Utility to highlight glossary terms in HTML content while preserving existing formatting
export function highlightGlossaryInHTML(htmlContent, glossary = []) {
  if (!glossary.length) {
    return htmlContent;
  }
  
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Function to highlight text in text nodes only
    const highlightInTextNodes = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        let text = node.textContent;
        let hasChanges = false;
        
        glossary.forEach(({ term, definition }) => {
          // Properly escape the definition for HTML attribute
          const escapedDefinition = (definition || '')
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          
          const regex = new RegExp(`\\b(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
          if (regex.test(text)) {
            text = text.replace(regex, `<span class="highlighted-term" title="${escapedDefinition}">$1</span>`);
            hasChanges = true;
          }
        });
        
        if (hasChanges) {
          const wrapper = document.createElement('div');
          wrapper.innerHTML = text;
          while (wrapper.firstChild) {
            node.parentNode.insertBefore(wrapper.firstChild, node);
          }
          node.parentNode.removeChild(node);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE && node.className !== 'highlighted-term') {
        // Don't process already highlighted terms
        const children = Array.from(node.childNodes);
        children.forEach(child => highlightInTextNodes(child));
      }
    };
    
    highlightInTextNodes(tempDiv);
    return tempDiv.innerHTML;
  } catch (e) {
    console.error('Error in highlightGlossaryInHTML:', e);
    return htmlContent; // Return original content if highlighting fails
  }
}