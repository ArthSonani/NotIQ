import React, { useState } from "react";

export default function ChangePasswordModal({ onChangePassword, onCancel }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setError("");
    if (!oldPassword.trim()) return setError("Please enter your current password");
    if (!newPassword.trim()) return setError("Please enter a new password");
    if (newPassword !== confirmPassword) return setError("New passwords do not match");
    if (newPassword.length < 4) return setError("New password should be at least 4 characters");

    onChangePassword(oldPassword, newPassword);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>🔑 Change Password</h3>
        <p>Enter your current password and choose a new password to update encryption for this note.</p>

        {error && (
          <div style={{ color: '#ef4444', marginBottom: '8px' }}>{error}</div>
        )}

        <input
          className="modal-input"
          type="password"
          placeholder="Current password"
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />

        <input
          className="modal-input"
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <input
          className="modal-input"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="modal-buttons">
          <button className="modal-btn modal-btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="modal-btn modal-btn-primary" onClick={handleSubmit}>Change Password</button>
        </div>
      </div>
    </div>
  );
}
