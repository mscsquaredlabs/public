// Improved DetachedNotepadModal component with Draggable functionality
import { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable'; // Make sure to import react-draggable

const DetachedNotepadModal = ({
  children,
  onClose,
  initialPosition,
  initialSize,
  title
}) => {
  const [size, setSize] = useState(initialSize || { width: 500, height: 400 });
  const nodeRef = useRef(null);
  
  // Create escape key handler
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Handle manual resizing
  const startResizeRef = useRef(null);
  
  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;
    
    const handleResizeMouseMove = (moveEvent) => {
      setSize({
        width: Math.max(250, startWidth + (moveEvent.clientX - startX)),
        height: Math.max(200, startHeight + (moveEvent.clientY - startY))
      });
    };
    
    const handleResizeMouseUp = () => {
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
    };
    
    document.addEventListener('mousemove', handleResizeMouseMove);
    document.addEventListener('mouseup', handleResizeMouseUp);
  };

  return (
    <div className="detached-modal-overlay">
      <Draggable
        nodeRef={nodeRef}
        handle=".detached-modal-header"
        defaultPosition={initialPosition || { x: 100, y: 100 }}
        bounds="parent"
      >
        <div 
          ref={nodeRef}
          className="detached-modal"
          style={{
            width: size.width,
            height: size.height
          }}
        >
          <div className="detached-modal-header">
            <div className="detached-modal-title">{title}</div>
            <button className="detached-modal-close" onClick={onClose}>×</button>
          </div>
          <div className="detached-modal-content">
            {children}
          </div>
          <div 
            className="detached-modal-resize-handle"
            onMouseDown={handleResizeMouseDown}
          />
        </div>
      </Draggable>
    </div>
  );
};

export default DetachedNotepadModal;