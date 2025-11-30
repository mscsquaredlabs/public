// PostmanImportButton.jsx
import React, { useState } from 'react';
import PostmanImportModal from './PostmanImportModal';
import './PostmanImportButton.css';

const PostmanImportButton = ({ projectManager, onImportComplete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleImportComplete = (result) => {
    if (onImportComplete) {
      onImportComplete(result);
    }
    
    // Close the modal after a short delay to allow user to see the success message
    if (result.success) {
      setTimeout(() => {
        closeModal();
      }, 1500);
    }
  };

  return (
    <>
      <button 
        className="import-postman-button" 
        onClick={openModal}
        title="Import Postman Collection"
      >
        <span className="button-icon">📥</span>
        <span className="button-text">Import Postman</span>
      </button>

      {isModalOpen && (
        <PostmanImportModal 
          projectManager={projectManager}
          onClose={closeModal}
          onImportComplete={handleImportComplete}
        />
      )}
    </>
  );
};

export default PostmanImportButton;