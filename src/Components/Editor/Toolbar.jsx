import React from "react";

export default function Toolbar({ format }) {
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={() => format("bold")} title="Bold">
          <strong>B</strong>
        </button>
        <button className="toolbar-btn" onClick={() => format("italic")} title="Italic">
          <em>I</em>
        </button> 
        <button className="toolbar-btn" onClick={() => format("underline")} title="Underline">
          <u>U</u>
        </button>
      </div>
      
      <div className="toolbar-separator"></div>
      
      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={() => format("justifyLeft")} title="Align Left">
          ⬅️
        </button>
        <button className="toolbar-btn" onClick={() => format("justifyCenter")} title="Align Center">
          ⬆️
        </button>
        <button className="toolbar-btn" onClick={() => format("justifyRight")} title="Align Right">
          ➡️
        </button>
      </div>
      
      <div className="toolbar-separator"></div>
      
      <div className="toolbar-group">
        <select className="toolbar-select" onChange={e => format("fontSize", e.target.value)} title="Font Size">
          <option value="">Size</option>
          {[1,2,3,4,5,6,7].map(size =>
            <option key={size} value={size}>
              {size === 1 ? "Small" : size === 3 ? "Normal" : size === 5 ? "Large" : size === 7 ? "XLarge" : `Size ${size}`}
            </option>
          )}
        </select>
      </div>
    </div>
  );
}

// 𝐼