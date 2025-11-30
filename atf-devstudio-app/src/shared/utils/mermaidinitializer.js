/**
 * Mermaid diagram initializer utility
 * Ensures Mermaid diagrams are properly rendered when they are dynamically added to the DOM
 */

/**
 * Initialize Mermaid diagrams in the DOM
 * Should be called after a new Mermaid diagram is added to the page
 */
export const initializeMermaidDiagrams = () => {
    // Check if mermaid is available globally
    if (typeof window.mermaid !== 'undefined') {
      try {
        // Reset any existing configurations to prevent conflicts
        if (typeof window.mermaid.reset === 'function') {
          window.mermaid.reset();
        }
        
        // Configure mermaid with appropriate settings for ER diagrams
        window.mermaid.initialize({
          startOnLoad: true,
          theme: 'default',
          securityLevel: 'loose', // Required for dynamic rendering
          er: {
            diagramPadding: 20,
            layoutDirection: 'TB', // Top to Bottom
            minEntityWidth: 100,
            minEntityHeight: 75,
            entityPadding: 15,
            useMaxWidth: true
          }
        });
        
        // Force re-render any unprocessed diagrams
        document.querySelectorAll('.mermaid:not(.mermaid-processed)').forEach(el => {
          // Store the original content
          const content = el.textContent || el.innerHTML;
          
          // Only process if it contains actual mermaid content
          if (content.trim() && !content.includes('mermaid-error')) {
            // Mark as processed to avoid duplicate processing
            el.classList.add('mermaid-processed');
            
            // Give mermaid a unique ID if it doesn't have one
            if (!el.id) {
              el.id = 'mermaid-' + Math.random().toString(36).substring(2);
            }
          }
        });
        
        // Use the mermaid API to render the diagrams
        window.mermaid.init(undefined, '.mermaid:not(.mermaid-rendered)');
        
        // Mark rendered diagrams
        document.querySelectorAll('.mermaid').forEach(el => {
          el.classList.add('mermaid-rendered');
        });
        
        return true;
      } catch (error) {
        console.error('Error initializing Mermaid diagrams:', error);
        
        // Fallback rendering in case of error
        document.querySelectorAll('.mermaid:not(.mermaid-error)').forEach(el => {
          const content = el.textContent || el.innerHTML;
          // Add a visual error indicator
          el.innerHTML = `
            <div class="diagram-error" style="color: red; padding: 1rem; border: 1px solid red; margin: 1rem 0;">
              Error rendering diagram. Mermaid code:
              <pre style="background: #f5f5f5; padding: 0.5rem; margin-top: 0.5rem; overflow: auto;">${content}</pre>
            </div>
          `;
          el.classList.add('mermaid-error');
        });
        
        return false;
      }
    } else {
      console.warn('Mermaid library not found. Ensure it is properly loaded.');
      
      // Visual indication that Mermaid is missing
      document.querySelectorAll('.mermaid:not(.mermaid-missing-library)').forEach(el => {
        el.innerHTML = `
          <div style="color: #856404; background-color: #fff3cd; border: 1px solid #ffeeba; padding: 1rem; border-radius: 0.25rem;">
            <strong>Mermaid library not loaded</strong>
            <p>Please ensure the Mermaid library is included in your project to render diagrams.</p>
          </div>
        `;
        el.classList.add('mermaid-missing-library');
      });
      
      return false;
    }
  };
  
  /**
   * Manually render Mermaid diagram from code
   * @param {string} code - The Mermaid code to render
   * @param {HTMLElement} container - Container element to render into
   */
  export const renderMermaidDiagram = (code, container) => {
    if (!container) {
      console.error('No container provided for Mermaid rendering');
      return false;
    }
    
    if (!code || typeof code !== 'string') {
      container.innerHTML = '<div class="error">No diagram code provided</div>';
      return false;
    }
    
    if (typeof window.mermaid === 'undefined') {
      container.innerHTML = `
        <div style="color: #856404; background-color: #fff3cd; border: 1px solid #ffeeba; padding: 1rem; border-radius: 0.25rem;">
          <strong>Mermaid library not loaded</strong>
          <p>Please ensure the Mermaid library is included in your project to render diagrams.</p>
        </div>
      `;
      return false;
    }
    
    try {
      // Generate a unique ID for the container
      const id = 'mermaid-' + Math.random().toString(36).substring(2);
      container.id = id;
      
      // Clear any existing content
      container.innerHTML = '';
      
      // Add the mermaid class
      container.classList.add('mermaid');
      
      // Set the diagram code
      container.textContent = code;
      
      // Initialize mermaid
      window.mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        er: {
          diagramPadding: 20,
          layoutDirection: 'TB',
          minEntityWidth: 100,
          entityPadding: 15
        }
      });
      
      // Render the diagram
      window.mermaid.init(undefined, container);
      
      return true;
    } catch (error) {
      console.error('Error rendering Mermaid diagram:', error);
      container.innerHTML = `
        <div class="diagram-error" style="color: red; padding: 1rem; border: 1px solid red; margin: 1rem 0;">
          Error rendering diagram: ${error.message}
          <pre style="background: #f5f5f5; padding: 0.5rem; margin-top: 0.5rem; overflow: auto;">${code}</pre>
        </div>
      `;
      return false;
    }
  };
  
  /**
   * Setup function that should be called once when the application loads
   * Initializes existing diagrams and sets up the observer for future diagrams
   */
  export const setupMermaidDiagrams = () => {
    // Initialize any existing diagrams
    initializeMermaidDiagrams();
    
    // Create observer for future diagram additions
    if (window.MutationObserver) {
      const observer = new MutationObserver((mutations) => {
        let shouldRender = false;
        
        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            // Check if any new nodes contain mermaid diagrams
            const mermaidNodes = document.querySelectorAll('.mermaid:not(.mermaid-processed)');
            if (mermaidNodes.length > 0) {
              shouldRender = true;
            }
          }
        });
        
        if (shouldRender) {
          // Small timeout to ensure DOM is fully updated
          setTimeout(initializeMermaidDiagrams, 100);
        }
      });
      
      // Start observing the document body for DOM changes
      observer.observe(document.body, { 
        childList: true,
        subtree: true 
      });
      
      return observer;
    }
    
    return null;
  };