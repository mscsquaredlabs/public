import React, { useRef, useCallback, useEffect } from 'react';
import { formatFileSize } from './serverUtils';

/**
 * Component for handling WAR file upload
 */
const FileUpload = ({ 
  selectedFile, 
  setSelectedFile, 
  updateResults, 
  isDeploying,
  fileInputRef
}) => {
  const localFileInputRef = useRef(null);
  
  // Use the provided ref or create a local one if not provided
  const inputRef = fileInputRef || localFileInputRef;
  
  // Check for redeployment info when component mounts
  useEffect(() => {
    const redeployInfo = localStorage.getItem('atf-dev-studio-redeploy-info');
    if (redeployInfo) {
      try {
        const deploymentInfo = JSON.parse(redeployInfo);
        updateResults({
          status: 'info',
          message: `Preparing to redeploy "${deploymentInfo.file.name}"`,
          details: 'Please select the WAR file to deploy again.',
          content: ''
        });
      } catch (e) {
        console.error('Failed to parse redeploy info', e);
      }
    }
  }, [updateResults]);
  
  // Handle file selection from input
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.war')) {
      updateResults({
        status: 'error',
        message: 'Invalid file type',
        details: 'Please select a valid .war file for deployment.',
        content: ''
      });
      return;
    }
    
    setSelectedFile(file);
    // Save file details to restore later
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    };
    localStorage.setItem('atf-dev-studio-selected-file-info', JSON.stringify(fileInfo));
    
    // Check if this is a redeployment
    const redeployInfo = localStorage.getItem('atf-dev-studio-redeploy-info');
    if (redeployInfo) {
      try {
        const deploymentInfo = JSON.parse(redeployInfo);
        updateResults({
          status: 'info',
          message: `Ready to redeploy "${file.name}"`,
          details: `${formatFileSize(file.size)} ready for redeployment to replace ${deploymentInfo.file.name}.`,
          content: ''
        });
        // Clear the redeployment info after it's used
        localStorage.removeItem('atf-dev-studio-redeploy-info');
      } catch (e) {
        console.error('Failed to parse redeploy info', e);
        updateResults({
          status: 'info',
          message: `Selected "${file.name}"`,
          details: `${formatFileSize(file.size)} ready for deployment.`,
          content: ''
        });
      }
    } else {
      updateResults({
        status: 'info',
        message: `Selected "${file.name}"`,
        details: `${formatFileSize(file.size)} ready for deployment.`,
        content: ''
      });
    }
  }, [setSelectedFile, updateResults]);
  
  // Handle drag and drop events
  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('drag-active');
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drag-active');
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drag-active');
    
    const files = event.dataTransfer.files;
    if (files.length === 0) return;
    
    const file = files[0];
    if (!file.name.endsWith('.war')) {
      updateResults({
        status: 'error',
        message: 'Invalid file type',
        details: 'Please select a valid .war file for deployment.',
        content: ''
      });
      return;
    }
    
    setSelectedFile(file);
    // Save file details to restore later
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    };
    localStorage.setItem('atf-dev-studio-selected-file-info', JSON.stringify(fileInfo));
    
    // Check if this is a redeployment
    const redeployInfo = localStorage.getItem('atf-dev-studio-redeploy-info');
    if (redeployInfo) {
      try {
        const deploymentInfo = JSON.parse(redeployInfo);
        updateResults({
          status: 'info',
          message: `Ready to redeploy "${file.name}"`,
          details: `${formatFileSize(file.size)} ready for redeployment to replace ${deploymentInfo.file.name}.`,
          content: ''
        });
        // Clear the redeployment info after it's used
        localStorage.removeItem('atf-dev-studio-redeploy-info');
      } catch (e) {
        console.error('Failed to parse redeploy info', e);
        updateResults({
          status: 'info',
          message: `Selected "${file.name}"`,
          details: `${formatFileSize(file.size)} ready for deployment.`,
          content: ''
        });
      }
    } else {
      updateResults({
        status: 'info',
        message: `Selected "${file.name}"`,
        details: `${formatFileSize(file.size)} ready for deployment.`,
        content: ''
      });
    }
  }, [setSelectedFile, updateResults]);

  // Clear selected file
  const clearSelectedFile = useCallback(() => {
    setSelectedFile(null);
    localStorage.removeItem('atf-dev-studio-selected-file-info');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    updateResults({
      status: '',
      message: '',
      details: '',
      content: ''
    });
  }, [setSelectedFile, updateResults, inputRef]);

  // If no file is selected, render the upload area
  if (!selectedFile) {
    return (
      <div 
        className="file-upload-area"
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <path d="M12 18v-6"></path>
          <path d="M9 15h6"></path>
        </svg>
        <p>Drag and drop a .war file here, or click to select</p>
        <input
          type="file"
          accept=".war"
          onChange={handleFileSelect}
          ref={inputRef}
          id="war-file-upload"
        />
        <button 
          className="btn-select-file"
          onClick={() => inputRef.current && inputRef.current.click()}
          type="button"
        >
          Select WAR File
        </button>
      </div>
    );
  }
  
  // If a file is selected, show the file info
  return (
    <div className="selected-file-info">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </svg>
      <div className="file-details">
        <p className="filename">{selectedFile.name}</p>
        <p className="filesize">{formatFileSize(selectedFile.size)}</p>
      </div>
      <button 
        className="btn-clear-file"
        onClick={clearSelectedFile}
        disabled={isDeploying}
        type="button"
      >
        ×
      </button>
    </div>
  );
};

export default FileUpload;