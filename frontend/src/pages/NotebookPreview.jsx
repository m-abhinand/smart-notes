import React from 'react';
import './NotebookPreview.css';

export default function NotebookPreview() {
  return (
    <div className="notebook-preview">
      {/* Background decoration cards */}
      <div className="preview-card">
        <div className="line title"></div>
        <div className="line"></div>
        <div className="line short"></div>
      </div>
      <div className="preview-card">
        <div className="line title"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line short"></div>
      </div>
      <div className="preview-card">
        <div className="line title"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </div>
    </div>
  );
}
