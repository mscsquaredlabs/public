// RunExecutable.jsx
// Component for running batch files and executables
import { useState } from 'react';
import { runExecutable } from '../../shared/services/terminalWS';
import FileBrowser from './FileBrowser';
import './RunExecutable.css';

const RunExecutable = ({ darkMode, onClose, onRun }) => {
  const [filePath, setFilePath] = useState('');
  const [args, setArgs] = useState('');
  const [cwd, setCwd] = useState('');
  const [showBrowser, setShowBrowser] = useState(false);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState(null);

  const handleBrowseFile = () => {
    setShowBrowser(true);
  };

  const handleSelectFile = (path) => {
    setFilePath(path);
    setShowBrowser(false);
    // Set default working directory to file's directory
    const pathParts = path.split(/[/\\]/);
    pathParts.pop();
    setCwd(pathParts.join(process.platform === 'win32' ? '\\' : '/'));
  };

  const handleBrowseDirectory = () => {
    setShowBrowser(true);
  };

  const handleSelectDirectory = (path) => {
    setCwd(path);
    setShowBrowser(false);
  };

  const handleRun = async () => {
    if (!filePath.trim()) {
      alert('Please select a file to run');
      return;
    }

    setRunning(true);
    setOutput(null);

    try {
      const argsArray = args.trim() ? args.trim().split(/\s+/) : [];
      const result = await runExecutable(filePath, argsArray, cwd || undefined);
      
      setOutput(result);
      
      if (onRun) {
        onRun(result);
      }
    } catch (error) {
      setOutput({
        success: false,
        error: error.message,
        stdout: '',
        stderr: ''
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <div className={`run-executable ${darkMode ? 'dark-mode' : ''}`}>
        <div className="run-executable-header">
          <h3>Run Executable / Batch File</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="run-executable-content">
          <div className="form-group">
            <label>File Path:</label>
            <div className="input-with-button">
              <input
                type="text"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="C:\path\to\file.exe or /path/to/file.sh"
                className="file-path-input"
              />
              <button onClick={handleBrowseFile} title="Browse for file">Browse</button>
            </div>
          </div>

          <div className="form-group">
            <label>Arguments (space-separated):</label>
            <input
              type="text"
              value={args}
              onChange={(e) => setArgs(e.target.value)}
              placeholder="arg1 arg2 arg3"
              className="args-input"
            />
          </div>

          <div className="form-group">
            <label>Working Directory:</label>
            <div className="input-with-button">
              <input
                type="text"
                value={cwd}
                onChange={(e) => setCwd(e.target.value)}
                placeholder="Leave empty to use file's directory"
                className="cwd-input"
              />
              <button onClick={handleBrowseDirectory} title="Browse for directory">Browse</button>
            </div>
          </div>

          {output && (
            <div className={`output-section ${output.success ? 'success' : 'error'}`}>
              <h4>Output:</h4>
              {output.stdout && (
                <div className="output-stdout">
                  <strong>Stdout:</strong>
                  <pre>{output.stdout}</pre>
                </div>
              )}
              {output.stderr && (
                <div className="output-stderr">
                  <strong>Stderr:</strong>
                  <pre>{output.stderr}</pre>
                </div>
              )}
              {output.error && (
                <div className="output-error">
                  <strong>Error:</strong>
                  <pre>{output.error}</pre>
                </div>
              )}
              <div className="output-exit-code">
                Exit Code: {output.code}
              </div>
            </div>
          )}
        </div>

        <div className="run-executable-footer">
          <button 
            onClick={handleRun} 
            disabled={running || !filePath.trim()}
            className="run-button"
          >
            {running ? 'Running...' : 'Run'}
          </button>
          <button onClick={onClose} className="cancel-button">Cancel</button>
        </div>
      </div>

      {showBrowser && (
        <FileBrowser
          onSelectFile={handleSelectFile}
          onSelectDirectory={handleSelectDirectory}
          darkMode={darkMode}
          onClose={() => setShowBrowser(false)}
        />
      )}
    </>
  );
};

export default RunExecutable;



