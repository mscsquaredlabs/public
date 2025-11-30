/**
 * Utility functions to toggle the visibility of the results area
 * Used by Mems to hide the results area and maximize the workspace
 */

// Store the original state of the results area for restoration
let originalResultsDisplay = null;
let originalResizeHandleDisplay = null;

/**
 * Hide the results area and resize handle to maximize available space for Mems
 */
export const hideResultsArea = () => {
  // Get the results area and resize handle elements
  const resultsArea = document.querySelector('.results-area');
  const resizeHandle = document.querySelector('.resize-handle');
  
  if (resultsArea) {
    // Store original display value for restoration
    originalResultsDisplay = resultsArea.style.display;
    
    // Hide the results area
    resultsArea.style.display = 'none';
  }
  
  if (resizeHandle) {
    // Store original display value for restoration
    originalResizeHandleDisplay = resizeHandle.style.display;
    
    // Hide the resize handle
    resizeHandle.style.display = 'none';
  }
  
  // Add a class to the main-panel to indicate it's in full-height mode
  const mainPanel = document.querySelector('.main-panel');
  if (mainPanel) {
    mainPanel.classList.add('full-height');
  }
};

/**
 * Restore the results area and resize handle to their original state
 */
export const restoreResultsArea = () => {
  // Get the results area and resize handle elements
  const resultsArea = document.querySelector('.results-area');
  const resizeHandle = document.querySelector('.resize-handle');
  
  if (resultsArea) {
    // Restore original display value or default to 'block'
    resultsArea.style.display = originalResultsDisplay || 'block';
  }
  
  if (resizeHandle) {
    // Restore original display value or default to 'block'
    resizeHandle.style.display = originalResizeHandleDisplay || 'block';
  }
  
  // Remove the full-height class from main-panel
  const mainPanel = document.querySelector('.main-panel');
  if (mainPanel) {
    mainPanel.classList.remove('full-height');
  }
};