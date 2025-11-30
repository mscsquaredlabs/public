import React, { useState } from 'react';
import { PostmanImporter } from './PostmanImporter';
import './PostmanImport.css';
import { toast } from 'react-toastify';

const PostmanImport = ({ projectManager, onImportComplete }) => {
const [importMethod, setImportMethod] = useState('paste');
const [jsonText, setJsonText] = useState('');
const [file, setFile] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [result, setResult] = useState(null);

const handleMethodChange = (method) => {
setImportMethod(method);
setResult(null);
};

const handleFileChange = (e) => {
if (e.target.files && e.target.files[0]) {
  setFile(e.target.files[0]);
  setResult(null);
}
};

const handleTextChange = (e) => {
setJsonText(e.target.value);
setResult(null);
};

const handleImport = async () => {
try {
  setIsLoading(true);
  setResult(null);

  let collectionJson = '';

  if (importMethod === 'paste') {
    collectionJson = jsonText;
  } else if (importMethod === 'file' && file) {
    collectionJson = await readFileAsText(file);
  }

  if (!collectionJson) {
    setResult({
      success: false,
      message: 'No collection data provided',
      details: 'Please paste JSON or select a file to import.'
    });
    return;
  }

  // Create importer instance
  const importer = new PostmanImporter(projectManager);
  
  // Import collection
  const importResult = importer.importFromJson(collectionJson);
  
  setResult(importResult);
  
  // Call callback if provided and import was successful
  if (importResult.success && onImportComplete) {
    onImportComplete(importResult);
  }
  
} catch (error) {
  console.error('Import error:', error);
  setResult({
    success: false,
    message: 'Import failed',
    details: error.message
  });
} finally {
  setIsLoading(false);
}
};

// Helper to read file content
const readFileAsText = (file) => {
return new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (event) => resolve(event.target.result);
  reader.onerror = (error) => reject(error);
  reader.readAsText(file);
});
};

return (
<div className="postman-import">
  <h2 className="postman-import-title">Import Postman Collection</h2>
  
  <div className="import-method-selector">
    <button 
      className={`method-button ${importMethod === 'paste' ? 'active' : ''}`}
      onClick={() => handleMethodChange('paste')}
    >
      Paste JSON
    </button>
    <button 
      className={`method-button ${importMethod === 'file' ? 'active' : ''}`}
      onClick={() => handleMethodChange('file')}
    >
      Upload File
    </button>
  </div>
  
  <div className="import-content">
    {importMethod === 'paste' && (
      <div className="paste-container">
        <textarea 
          className="json-textarea"
          placeholder="Paste Postman collection JSON here..."
          value={jsonText}
          onChange={handleTextChange}
        />
      </div>
    )}
    
    {importMethod === 'file' && (
      <div className="file-container">
        <div className="file-drop-area">
          <input 
            type="file" 
            id="collection-file" 
            accept=".json,application/json"
            onChange={handleFileChange}
          />
          <label htmlFor="collection-file">
            {file ? file.name : 'Select or drop Postman collection file'}
          </label>
        </div>
      </div>
    )}
    
    <button 
      className="import-button"
      onClick={handleImport}
      disabled={isLoading || (importMethod === 'file' && !file) || (importMethod === 'paste' && !jsonText.trim())}
    >
      {isLoading ? 'Importing...' : 'Import Collection'}
    </button>
  </div>
  
  {result && (
    <div className={`import-result ${result.success ? 'success' : 'error'}`}>
      <div className="result-header">
        {result.success ? (
          <span className="success-icon">✓</span>
        ) : (
          <span className="error-icon">✗</span>
        )}
        <h3>{result.message}</h3>
      </div>
      
      <div className="result-details">
        {result.details}
        
        {result.success && (
          <div className="import-summary">
            <p>
              <strong>Project:</strong> {result.name}<br />
              <strong>Requests imported:</strong> {result.requestCount}
            </p>
          </div>
        )}
      </div>
    </div>
  )}
  
  <div className="import-help">
    <h3>How to export a Postman collection</h3>
    <ol>
      <li>Open Postman and select the collection you want to export</li>
      <li>Click on the collection's three-dot menu (...)</li>
      <li>Select "Export"</li>
      <li>Choose Collection v2.1 format</li>
      <li>Save the JSON file or copy its contents</li>
    </ol>
  </div>
</div>
);
};

export default PostmanImport;