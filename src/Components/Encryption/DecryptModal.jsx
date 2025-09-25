import React, { useState } from "react";

export default function DecryptModal({ onDecrypt, onCancel }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleDecrypt = async () => {
    try {
      setError("");
      await onDecrypt(password);
    } catch (err) {
      setError("Incorrect password. Please try again.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && password.trim()) {
      handleDecrypt();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>🔓 Unlock Note</h3>
        <p>Enter your password to unlock and view this encrypted note.</p>
        
        <input
          className="modal-input"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={e => {
            setPassword(e.target.value);
            if (error) setError(""); // Clear error when user types
          }}
          onKeyDown={handleKeyPress}
          autoFocus
        />
        
        {error && (
          <div style={{
            color: '#ef4444',
            fontSize: '14px',
            marginBottom: '16px',
            padding: '8px 12px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px'
          }}>
            {error}
          </div>
        )}
        
        <div className="modal-buttons">
          <button 
            className="modal-btn modal-btn-secondary" 
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="modal-btn modal-btn-primary" 
            onClick={handleDecrypt} 
            disabled={!password.trim()}
          >
            🔓 Unlock
          </button>
        </div>
      </div>
    </div>
  );
}