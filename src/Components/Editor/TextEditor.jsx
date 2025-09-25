import React, { useRef, useEffect, useState } from "react";
import Toolbar from "./Toolbar";
import { getGlossary, getGrammarErrors, getSummary, getTags } from "../../utils/aiService";
import { highlightGlossaryInHTML } from "../../utils/glossaryUtils";
import { markGrammarErrorsInHTML } from "../../utils/grammarUtils";
import EncryptModal from "../Encryption/EncryptModal";
import DecryptModal from "../Encryption/DecryptModal";
import { encryptNote, decryptNote } from "../../utils/encryption";

export default function TextEditor({ note, onSave }) {
  const [content, setContent] = useState(""); // Raw content for saving (no AI highlights)
  const [displayContent, setDisplayContent] = useState(""); // Content with highlights for display
  const [title, setTitle] = useState(note.title || "");
  const [isLocked, setIsLocked] = useState(note.encrypted || false);
  const [showEncrypt, setShowEncrypt] = useState(false);
  const [showDecrypt, setShowDecrypt] = useState(false);
  
  // AI-related state
  const [glossary, setGlossary] = useState([]);
  const [grammarErrors, setGrammarErrors] = useState([]);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [plainTextContent, setPlainTextContent] = useState(""); // For AI Summary and Tags
  const [showAIFeatures, setShowAIFeatures] = useState(false); // Control AI features visibility
  const [aiResults, setAiResults] = useState({ summary: "", tags: [] }); // Store AI results

  const editorRef = useRef();
  const aiTimeoutRef = useRef();
  const typingTimeoutRef = useRef();
  const currentNoteRef = useRef(note); // Track current note for cleanup

  // Function to remove AI highlights from HTML content
  const removeAIHighlights = (htmlContent) => {
    if (!htmlContent || typeof htmlContent !== 'string') {
      return '';
    }
    
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      
      // Remove highlighted-term spans but keep their text content
      const highlightedTerms = tempDiv.querySelectorAll('.highlighted-term');
      highlightedTerms.forEach(span => {
        span.replaceWith(...span.childNodes);
      });
      
      // Remove grammar-error spans but keep their text content
      const grammarErrors = tempDiv.querySelectorAll('.grammar-error');
      grammarErrors.forEach(span => {
        span.replaceWith(...span.childNodes);
      });
      
      // Additional cleanup: remove any orphaned span tags with AI-related classes
      const orphanedSpans = tempDiv.querySelectorAll('span[class*="highlighted"], span[class*="grammar"], span[title*="Suggestion"], span[title*="definition"]');
      orphanedSpans.forEach(span => {
        span.replaceWith(...span.childNodes);
      });
      
      return tempDiv.innerHTML;
    } catch (e) {
      // Fallback: try to clean with simple string replacement
      return htmlContent
        .replace(/<span[^>]*class="highlighted-term"[^>]*>/gi, '')
        .replace(/<span[^>]*class="grammar-error"[^>]*>/gi, '')
        .replace(/<\/span>/gi, '');
    }
  };

  // Load note content
  useEffect(() => {
    // Save clean content from previous note before switching (only if we actually have previous content)
    if (currentNoteRef.current && currentNoteRef.current.id !== note.id) {
      if (editorRef.current && editorRef.current.innerHTML.trim()) {
        const currentCleanContent = removeAIHighlights(editorRef.current.innerHTML);
        const prevNote = currentNoteRef.current;
        
        // Only save if there's actual content
        if (currentCleanContent.trim()) {
          if (!prevNote.encrypted) {
            onSave({ ...prevNote, content: currentCleanContent });
          } else if (prevNote.tempUnlocked) {
            onSave({ ...prevNote, tempDecryptedContent: currentCleanContent });
          }
        }
      }
    }

    // Update the current note reference
    currentNoteRef.current = note;

    // Update states
    setTitle(note.title || "");

    // Clear AI features when switching to a different note
    setShowAIFeatures(false);
    setGlossary([]);
    setGrammarErrors([]);
    setAiResults({ summary: "", tags: [] });
    setAiProcessing(false);

    // Clear encryption modal states when switching to a different note
    setShowEncrypt(false);
    setShowDecrypt(false);

    // Determine if this note should be locked
    const shouldBeLocked = note.encrypted && !note.tempUnlocked;
    setIsLocked(shouldBeLocked);

    // Load the content for this note
    let noteContent = "";
    
    if (shouldBeLocked) {
      // Encrypted and locked - show nothing
      noteContent = "";
      setContent("");
      setDisplayContent("");
      setPlainTextContent("");
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    } else {
      // Note is either unencrypted or temporarily unlocked
      if (note.tempUnlocked && note.tempDecryptedContent) {
        // Temporarily unlocked encrypted note
        noteContent = note.tempDecryptedContent;
      } else {
        // Regular note or permanently decrypted
        noteContent = note.content || "";
      }

      // Clean the content and set it
      const cleanContent = removeAIHighlights(noteContent);
      
      setContent(cleanContent);
      setDisplayContent(cleanContent);
      
      // Update the editor with the content - use setTimeout to ensure DOM is ready
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = cleanContent;
          setPlainTextContent(editorRef.current.textContent || "");
        }
      }, 0);
    }
  }, [note]);

  // Manual AI processing when user clicks the button
  const processAIFeatures = async () => {
    // Get text content directly from editor with multiple fallbacks
    let textToProcess = '';
    
    if (editorRef.current) {
      const editorTextContent = editorRef.current.textContent || '';
      const editorInnerText = editorRef.current.innerText || '';
      textToProcess = editorTextContent || editorInnerText;
    }
    
    // If still empty, try from state
    if (!textToProcess.trim()) {
      textToProcess = plainTextContent || content || '';
      
      // If content is HTML, extract text from it
      if (textToProcess.includes('<') && textToProcess.includes('>')) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = textToProcess;
        textToProcess = tempDiv.textContent || tempDiv.innerText || '';
      }
    }
    
    if (!textToProcess.trim()) {
      alert('Please write some content first!');
      return;
    }

    setAiProcessing(true);
    try {
      // Update plainTextContent to current text
      setPlainTextContent(textToProcess);
      
      // Process all AI features in parallel with individual error handling
      let glossaryData = [];
      let grammarData = [];
      let summaryData = "";
      let tagsData = [];
      
      try {
        [glossaryData, grammarData, summaryData, tagsData] = await Promise.all([
          getGlossary(textToProcess).catch(() => []),
          getGrammarErrors(textToProcess).catch(() => []),
          getSummary(textToProcess).catch(() => ""),
          getTags(textToProcess).catch(() => [])
        ]);
      } catch (error) {
        console.error('AI processing failed:', error);
      }
      
      // Ensure data is valid arrays/strings
      const validGlossaryData = Array.isArray(glossaryData) ? glossaryData : [];
      const validGrammarData = Array.isArray(grammarData) ? grammarData : [];
      const validSummaryData = typeof summaryData === 'string' ? summaryData : "";
      const validTagsData = Array.isArray(tagsData) ? tagsData : [];
      
      setGlossary(validGlossaryData);
      setGrammarErrors(validGrammarData);
      setAiResults({ summary: validSummaryData, tags: validTagsData });
      setShowAIFeatures(true);
      
      // Apply highlights immediately with the fresh data
      if (validGlossaryData.length > 0 || validGrammarData.length > 0) {
        applyHighlightsWithData(validGlossaryData, validGrammarData);
      }
      
    } catch (error) {
      console.error('AI processing failed:', error);
      alert('AI processing failed. Please try again.');
    } finally {
      setAiProcessing(false);
    }
  };

  // Apply highlights with simple approach
  const applyHighlights = () => {
    if (!editorRef.current) {
      return;
    }

    if (glossary.length === 0 && grammarErrors.length === 0) {
      return;
    }

    // Get current content
    const currentHTML = editorRef.current.innerHTML || '';
    
    // Remove any existing highlights first
    const cleanHTML = removeAIHighlights(currentHTML);

    // Apply glossary highlights
    let highlightedHTML = cleanHTML;
    if (glossary.length > 0) {
      highlightedHTML = highlightGlossaryInHTML(highlightedHTML, glossary);
    }

    // Apply grammar highlights
    if (grammarErrors.length > 0) {
      highlightedHTML = markGrammarErrorsInHTML(highlightedHTML, grammarErrors);
    }

    // Update the editor if content changed
    if (highlightedHTML !== currentHTML) {
      editorRef.current.innerHTML = highlightedHTML;
      
      // Place cursor at end
      try {
        const selection = window.getSelection();
        if (selection && editorRef.current) {
          const range = document.createRange();
          range.selectNodeContents(editorRef.current);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } catch (e) {
        console.log('Cursor restoration failed:', e);
      }
    } else {
      console.log('No changes needed, HTML is the same');
    }
  };

  // Apply highlights with data passed directly (to avoid state timing issues)
  const applyHighlightsWithData = (glossaryData, grammarData) => {
    if (!editorRef.current) {
      return;
    }

    if (glossaryData.length === 0 && grammarData.length === 0) {
      return;
    }

    try {
      // Get current content
      const currentHTML = editorRef.current.innerHTML || '';
      const currentText = editorRef.current.textContent || '';

      // Remove any existing highlights first
      const cleanHTML = removeAIHighlights(currentHTML);

      // Apply glossary highlights
      let highlightedHTML = cleanHTML;
      if (glossaryData.length > 0) {
        try {
          const beforeGlossary = highlightedHTML;
          highlightedHTML = highlightGlossaryInHTML(highlightedHTML, glossaryData);
        } catch (error) {
          console.error('Glossary highlighting failed:', error);
        }
      }

      // Apply grammar highlights
      if (grammarData.length > 0) {
        try {
          const beforeGrammar = highlightedHTML;
          highlightedHTML = markGrammarErrorsInHTML(highlightedHTML, grammarData);
        } catch (error) {
          console.error('Grammar highlighting failed:', error);
        }
      }

      // Update the editor if content changed
      if (highlightedHTML !== currentHTML) {
        editorRef.current.innerHTML = highlightedHTML;
        
        // Place cursor at end
        try {
          const selection = window.getSelection();
          if (selection && editorRef.current) {
            const range = document.createRange();
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        } catch (e) {
          console.log('Cursor restoration failed:', e);
        }
      } else {
        console.log('No changes needed, HTML is the same');
      }
      
    } catch (error) {
      console.error('applyHighlightsWithData failed:', error);
      alert('Failed to apply highlights. Please check the console for details.');
    }
  };

  // Function to clear AI features
  const clearAIFeatures = () => {
    setShowAIFeatures(false);
    setGlossary([]);
    setGrammarErrors([]);
    setAiResults({ summary: "", tags: [] });
    
    // Remove highlights from editor
    if (editorRef.current) {
      const cleanContent = removeAIHighlights(editorRef.current.innerHTML);
      editorRef.current.innerHTML = cleanContent;
    }
  };

  // Handle editor input
  const handleInput = (e) => {
    const newHtmlContent = e.currentTarget.innerHTML;
    const plainText = e.currentTarget.textContent || '';
    
    // Mark as typing to prevent highlights during input
    setIsTyping(true);
    
    // Remove any existing AI highlights to get clean content for saving
    const cleanContent = removeAIHighlights(newHtmlContent);
    
    setContent(cleanContent); // Save clean content without highlights
    setDisplayContent(newHtmlContent); // Keep display content with highlights
    setPlainTextContent(plainText); // Update plain text for AI features

    if (!note.encrypted) {
      onSave({ ...note, content: cleanContent }); // Save clean content
    } else if (note.tempUnlocked) {
      onSave({ ...note, tempDecryptedContent: cleanContent }); // Save clean content
    }

    // Hide AI features when user starts editing
    if (showAIFeatures) {
      setShowAIFeatures(false);
      // Clear AI states 
      setGlossary([]);
      setGrammarErrors([]);
      setAiResults({ summary: "", tags: [] });
      
      // Ensure editor shows clean content
      if (cleanContent !== newHtmlContent) {
        editorRef.current.innerHTML = cleanContent;
      }
    }
  };

  // Formatting
  const format = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    const newHtmlContent = editorRef.current.innerHTML;
    const cleanContent = removeAIHighlights(newHtmlContent);
    
    setContent(cleanContent); // Save clean content
    setDisplayContent(newHtmlContent); // Update display content
    setPlainTextContent(editorRef.current.textContent || ''); // Update plain text

    if (!note.encrypted) {
      onSave({ ...note, content: cleanContent });
    } else if (note.tempUnlocked) {
      onSave({ ...note, tempDecryptedContent: cleanContent });
    }
  };

  // Encryption
  const handleEncrypt = (password) => {
    if (!password?.trim()) return alert("Please enter a password!");
    
    // Get current content from editor and ensure it's clean (no AI highlights)
    let contentToEncrypt = '';
    if (editorRef.current && editorRef.current.innerHTML) {
      contentToEncrypt = removeAIHighlights(editorRef.current.innerHTML);
    } else if (note.tempUnlocked) {
      contentToEncrypt = note.tempDecryptedContent || content;
    } else {
      contentToEncrypt = content;
    }
    
    if (!contentToEncrypt?.trim()) return alert("Cannot encrypt empty content!");

    const encryptedContent = encryptNote(contentToEncrypt, password);

    onSave({
      ...note,
      content: encryptedContent,
      encrypted: true,
      tempUnlocked: false,
      tempDecryptedContent: undefined
    });

    setContent("");
    setIsLocked(true);
    setShowEncrypt(false);
  };

  // Decryption
  const handleDecrypt = (password) => {
    if (!password?.trim()) return alert("Please enter a password!");
    try {
      const decryptedContent = decryptNote(note.content, password);

      if (!decryptedContent?.trim() || decryptedContent.includes("U2FsdGVkX1")) {
        throw new Error("Decryption failed");
      }

      setContent(decryptedContent);
      setIsLocked(false);
      setShowDecrypt(false);

      onSave({
        ...note,
        tempDecryptedContent: decryptedContent,
        tempUnlocked: true
      });

      if (editorRef.current && editorRef.current.innerHTML !== decryptedContent) {
        editorRef.current.innerHTML = decryptedContent;
      }
    } catch (error) {
      console.error("Decryption failed:", error);
      alert("Incorrect password! Please try again.");
    }
  };

  // Lock
  const handleLock = () => {
    const updatedNote = {
      ...note,
      tempUnlocked: false,
      tempDecryptedContent: undefined
    };
    onSave(updatedNote);
    setContent("");
    setIsLocked(true);
    if (editorRef.current) editorRef.current.innerHTML = "";
  };

  // Render locked note
  if (isLocked)
    return (
      <div className="editor-container">
        <div className="locked-note-message">
          <h3>🔒 This note is encrypted</h3>
          <p>This note is protected with end-to-end encryption. Enter your password below to unlock and view the content.</p>
          <div className="unlock-prompt">
            <div className="encryption-status locked">
              🔒 Encrypted & Locked
            </div>
            <button 
              className="encryption-btn unlock-btn" 
              onClick={() => setShowDecrypt(true)}
              style={{ width: '100%', marginTop: '16px' }}
            >
              🔓 Unlock Note
            </button>
          </div>
        </div>
        {showDecrypt && <DecryptModal onDecrypt={handleDecrypt} onCancel={() => setShowDecrypt(false)} />}
      </div>
    );

  // Render unlocked editor with AI panel
  return (
    <div className="editor-container" style={{ display: "flex", flexDirection: "column" }}>
      {/* Note title */}
      <input
        className="title-input"
        value={title}
        onChange={e => {
          setTitle(e.target.value);
          
          // Get current content from editor to preserve it when updating title
          let currentContent = content;
          if (editorRef.current && editorRef.current.innerHTML) {
            currentContent = removeAIHighlights(editorRef.current.innerHTML);
          }
          
          // Save both title and current content
          if (!note.encrypted) {
            onSave({ ...note, title: e.target.value, content: currentContent });
          } else if (note.tempUnlocked) {
            onSave({ ...note, title: e.target.value, tempDecryptedContent: currentContent });
          } else {
            onSave({ ...note, title: e.target.value });
          }
        }}
        placeholder="Note title..."
      />

      <Toolbar format={format} />

      {/* Editor */}
      <div
        className="editor"
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        spellCheck={true}
      />

      {/* AI Control Buttons */}
      <div className="ai-controls">
        <button 
          onClick={() => {
            
            // Fallback: get text from editor if plainTextContent is empty
            const currentText = plainTextContent || (editorRef.current?.textContent || '');
            
            if (!currentText.trim()) {
              alert('Please write some content first!');
              return;
            }
            
            // Update plainTextContent if it was empty
            if (!plainTextContent && currentText) {
              setPlainTextContent(currentText);
            }
            
            processAIFeatures();
          }}
          disabled={aiProcessing}
          className="analyze-ai-btn"
        >
          {aiProcessing ? "🤖 Processing..." : "🤖 Analyze with AI"}
        </button>
        
        {showAIFeatures && (
          <button 
            onClick={clearAIFeatures}
            className="clear-ai-btn"
          >
            🧹 Clear AI Features
          </button>
        )}
      </div>

      {/* AI Results */}
      {showAIFeatures && (
        <div className="ai-results" style={{ marginTop: "1rem" }}>
          {/* Summary */}
          {aiResults.summary && (
            <div className="ai-summary" style={{
              background: "#f8f9fa",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "10px",
              borderLeft: "3px solid #007bff"
            }}>
              <strong style={{ color: "#007bff" }}>Summary:</strong> {aiResults.summary}
            </div>
          )}
          
          {/* Tags */}
          {aiResults.tags.length > 0 && (
            <div className="ai-tags" style={{
              background: "#f8f9fa",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "10px",
              borderLeft: "3px solid #007bff"
            }}>
              <strong style={{ color: "#007bff" }}>Suggested Tags:</strong>{" "}
              {aiResults.tags.map((tag) => (
                <span 
                  key={tag}
                  className="tag"
                  style={{
                    background: "#e1ecf4",
                    color: "#39739d",
                    padding: "2px 6px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    marginRight: "5px",
                    display: "inline-block"
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Feature Count */}
          <div style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
            Found {glossary.length} glossary terms and {grammarErrors.length} grammar suggestions
          </div>
        </div>
      )}

      {/* Encryption controls */}
      <div className="encryption-controls">
        {note.encrypted && !isLocked ? (
          <>
            <div className="encryption-status unlocked">
              🔓 Note is temporarily unlocked
            </div>
            <button className="encryption-btn lock-btn" onClick={handleLock}>
              🔒 Lock Note
            </button>
          </>
        ) : !note.encrypted ? (
          <button className="encryption-btn" onClick={() => setShowEncrypt(true)}>
            🔒 Encrypt Note
          </button>
        ) : null}
      </div>

      {/* Encrypt/Decrypt Modals */}
      {showEncrypt && <EncryptModal onEncrypt={handleEncrypt} onCancel={() => setShowEncrypt(false)} />}
    </div>
  );
}
