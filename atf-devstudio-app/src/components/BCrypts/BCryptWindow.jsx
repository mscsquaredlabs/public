// BCryptWindow.jsx
// Draggable BCrypt hash generator window

import { useState, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { generateBCryptHash, verifyBCryptHash } from '../../shared/utils/bcryptsUtils';

const BCryptWindow = ({
  bcrypt,
  updateBCrypt,
  deleteBCrypt,
  bringToFront,
  containerRef,
  setStatusMessage,
  darkMode,
  bcryptStyle = 'simple',
  headerColor = '#4f46e5',
}) => {
  const {
    id,
    title,
    text,
    hash,
    rounds,
    position,
    size,
    isMinimized,
    zIndex,
  } = bcrypt;

  const [inputText, setInputText] = useState(text || '');
  const [bcryptHash, setBCryptHash] = useState(hash || '');
  const [bcryptRounds, setBCryptRounds] = useState(rounds || 10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationText, setVerificationText] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  
  const rndRef = useRef(null);
  const textareaRef = useRef(null);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setStatusMessage?.('Please enter text to hash');
      return;
    }

    setIsGenerating(true);
    try {
      const generatedHash = await generateBCryptHash(inputText, bcryptRounds);
      setBCryptHash(generatedHash);
      updateBCrypt(id, {
        text: inputText,
        hash: generatedHash,
        rounds: bcryptRounds,
      });
      setStatusMessage?.(`BCrypt hash generated for "${title}"`);
    } catch (error) {
      console.error('Error generating BCrypt hash:', error);
      setStatusMessage?.(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationText.trim() || !bcryptHash) {
      setStatusMessage?.('Please enter text to verify and ensure a hash exists');
      return;
    }

    setIsVerifying(true);
    try {
      const match = await verifyBCryptHash(verificationText, bcryptHash);
      setVerificationResult(match);
      setStatusMessage?.(match ? 'Text matches hash!' : 'Text does not match hash');
    } catch (error) {
      console.error('Error verifying BCrypt hash:', error);
      setStatusMessage?.(`Error: ${error.message}`);
      setVerificationResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyHash = () => {
    if (bcryptHash) {
      navigator.clipboard.writeText(bcryptHash).then(
        () => setStatusMessage?.('Hash copied to clipboard'),
        () => setStatusMessage?.('Failed to copy hash')
      );
    }
  };

  const handleCopyText = () => {
    if (inputText) {
      navigator.clipboard.writeText(inputText).then(
        () => setStatusMessage?.('Text copied to clipboard'),
        () => setStatusMessage?.('Failed to copy text')
      );
    }
  };

  const WindowBody = (
    <div
      className={`bcrypt-window ${isMinimized ? 'minimized' : ''} ${darkMode ? 'dark-mode' : ''} ${bcryptStyle === 'modern' ? 'modern-style' : ''}`}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Header */}
      <div
        className={`bcrypt-header ${bcryptStyle === 'modern' ? 'modern-style' : 'simple-style'}`}
        style={{ backgroundColor: headerColor }}
        onDoubleClick={() => updateBCrypt(id, { isMinimized: !isMinimized })}
      >
        <div className="bcrypt-title">
          <span className="title-text">{title}</span>
        </div>
        <div className="bcrypt-controls">
          <button
            className="minimize-button"
            onClick={(e) => {
              e.stopPropagation();
              updateBCrypt(id, { isMinimized: !isMinimized });
            }}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? '□' : '−'}
          </button>
          <button
            className="close-button"
            onClick={(e) => {
              e.stopPropagation();
              deleteBCrypt(id);
            }}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="bcrypt-content">
          {/* Input Section */}
          <div className="bcrypt-section">
            <div className="section-header">
              <label className="section-label">Text to Hash</label>
              <button
                className="copy-button"
                onClick={handleCopyText}
                disabled={!inputText}
                title="Copy text"
              >
                📋
              </button>
            </div>
            <textarea
              ref={textareaRef}
              className="bcrypt-textarea"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                updateBCrypt(id, { text: e.target.value });
              }}
              placeholder="Enter text to generate BCrypt hash..."
              rows={4}
            />
          </div>

          {/* Rounds Selection */}
          <div className="bcrypt-section">
            <label className="section-label">
              Rounds: {bcryptRounds}
              <input
                type="range"
                min="4"
                max="15"
                value={bcryptRounds}
                onChange={(e) => {
                  const newRounds = parseInt(e.target.value, 10);
                  setBCryptRounds(newRounds);
                  updateBCrypt(id, { rounds: newRounds });
                }}
                className="rounds-slider"
              />
            </label>
            <div className="rounds-hint">
              Higher rounds = more secure but slower (recommended: 10-12)
            </div>
          </div>

          {/* Generate Button */}
          <div className="bcrypt-section generate-section">
            <button
              className="generate-button"
              onClick={handleGenerate}
              disabled={!inputText.trim() || isGenerating}
            >
              <span className="generate-icon">🔐</span>
              <span className="generate-text">
                {isGenerating ? 'Generating Hash...' : 'Generate BCrypt Hash'}
              </span>
              {!isGenerating && <span className="generate-arrow">→</span>}
            </button>
          </div>

          {/* Hash Output */}
          {bcryptHash && (
            <div className="bcrypt-section">
              <div className="section-header">
                <label className="section-label">BCrypt Hash</label>
                <button
                  className="copy-button"
                  onClick={handleCopyHash}
                  title="Copy hash"
                >
                  📋
                </button>
              </div>
              <div className="hash-output">
                {bcryptHash}
              </div>
            </div>
          )}

          {/* Verification Section */}
          {bcryptHash && (
            <div className="bcrypt-section">
              <label className="section-label">Verify Text Against Hash</label>
              <textarea
                className="bcrypt-textarea"
                value={verificationText}
                onChange={(e) => setVerificationText(e.target.value)}
                placeholder="Enter text to verify against the hash..."
                rows={3}
              />
              <button
                className="verify-button"
                onClick={handleVerify}
                disabled={!verificationText.trim() || isVerifying}
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </button>
              {verificationResult !== null && (
                <div className={`verification-result ${verificationResult ? 'match' : 'no-match'}`}>
                  {verificationResult ? '✓ Match!' : '✗ No Match'}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Rnd
      ref={rndRef}
      position={{ x: position.x, y: position.y }}
      size={{ width: size.width, height: isMinimized ? 40 : size.height }}
      style={{ zIndex, position: 'absolute' }}
      minWidth={400}
      minHeight={40}
      bounds="parent"
      enableResizing={!isMinimized}
      onMouseDown={() => bringToFront(id)}
      onDragStart={() => bringToFront(id)}
      onDragStop={(e, d) => updateBCrypt(id, { position: { x: d.x, y: d.y } })}
      onResizeStop={(e, dir, ref, delta, pos) => {
        updateBCrypt(id, {
          size: { width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) },
          position: { x: pos.x, y: pos.y },
        });
      }}
    >
      {WindowBody}
    </Rnd>
  );
};

export default BCryptWindow;

