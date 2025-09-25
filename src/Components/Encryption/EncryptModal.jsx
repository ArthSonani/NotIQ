import React, { useState } from "react";

export default function EncryptModal({ onEncrypt, onCancel }) {
  const [password, setPassword] = useState("");

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (pwd.length < 4) return 'weak';
    if (pwd.length < 8) return 'medium';
    if (pwd.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd)) return 'strong';
    if (pwd.length >= 8) return 'medium';
    return 'weak';
  };

  const passwordStrength = getPasswordStrength(password);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && password.trim()) {
      onEncrypt(password);
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>🔒 Encrypt Note</h3>
        <p>Create a password to secure your note. Make sure to remember it - there's no way to recover a forgotten password.</p>
        
        <input
          className="modal-input"
          type="password"
          placeholder="Enter a strong password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKeyPress}
          autoFocus
        />
        
        {password && (
          <div className={`password-strength password-strength-${passwordStrength}`}>
            <div className="password-strength-bar">
              <div className="password-strength-fill"></div>
            </div>
            <div className="password-strength-text">
              Password strength: {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
            </div>
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
            onClick={() => onEncrypt(password)} 
            disabled={!password.trim()}
          >
            🔒 Encrypt
          </button>
        </div>
      </div>
    </div>
  );
}