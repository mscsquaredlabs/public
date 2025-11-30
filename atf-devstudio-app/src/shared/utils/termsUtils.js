// Updated termsUtils.js with Windows path support and Command Prompt
// This is a simplified version showing only the modified functions

// Get the appropriate prompt string based on shell type and current directory
export const getPrompt = (directory, shellType) => {
  // Handle Windows Command Prompt
  if (shellType === 'cmd') {
    // If directory is still the default '~', use C:\ for Windows
    if (directory === '~') {
      return 'C:\\> ';
    }
    
    // Make sure Windows paths end with backslash for the prompt
    if (!directory.endsWith('\\') && !directory.endsWith(':')) {
      return `${directory}\\> `;
    } else if (directory.endsWith(':')) {
      return `${directory}\\> `;
    } else {
      return `${directory}> `;
    }
  }
  
  // Handle PowerShell
  if (shellType === 'powershell') {
    return `PS ${directory}> `;
  }
  
  // For Unix-like shells (bash, zsh, sh)
  let username = 'user';
  let hostname = 'localhost';
  
  if (shellType === 'zsh') {
    return `${username}@${hostname} ${directory} % `;
  } else {
    // Default bash/sh style
    return `${username}@${hostname}:${directory}$ `;
  }
};

// Simulate command execution with output and directory changes
// Fix for dir and ls commands in simulateCommand function
export const simulateCommand = (command, currentDir, shellType = 'bash') => {
  const isWindowsShell = shellType === 'cmd' || shellType === 'powershell';
  const pathSeparator = isWindowsShell ? '\\' : '/';

  // Split command into parts, handling spaces in arguments
  // First extract the first word (command) then the rest as args
  const firstSpaceIndex = command.indexOf(' ');
  const cmd = firstSpaceIndex > -1 
    ? command.substring(0, firstSpaceIndex).toLowerCase() 
    : command.toLowerCase();
  const argsString = firstSpaceIndex > -1 
    ? command.substring(firstSpaceIndex + 1) 
    : '';

  // Parse arguments, handling quoted strings and flags
  const args = [];
  let currentArg = '';
  let inQuotes = false;
  
  for (let i = 0; i < argsString.length; i++) {
    const char = argsString[i];
    
    if ((char === '"' || char === "'") && (i === 0 || argsString[i-1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (char === ' ' && !inQuotes) {
      if (currentArg) {
        args.push(currentArg);
        currentArg = '';
      }
    } else {
      currentArg += char;
    }
  }
  
  if (currentArg) {
    args.push(currentArg);
  }

  // Default response
  let response = {
    output: '',  // Start with empty output
    newDirectory: currentDir,
    backgroundProcesses: []
  };

  // --- CD command handling ---
  if (cmd === 'cd' || (isWindowsShell && cmd === 'chdir')) {
    if (args.length === 0) {
      // CD without args goes to home directory
      response.newDirectory = isWindowsShell ? 'C:\\Users\\user' : '~';
      response.output = '';
    } else {
      const targetPath = args[0];

      // Handle special directory cases
      if (targetPath === '~' && !isWindowsShell) {
        // Home directory (Unix only)
        response.newDirectory = '~';
        response.output = '';
      } else if (targetPath === '..') {
        // Parent directory
        if (isWindowsShell) {
          // Windows path handling
          const dirParts = currentDir.split('\\');
          // Handle drive root case (e.g., C:\)
          if (currentDir.match(/^[A-Za-z]:\\?$/) || dirParts.length <= 1) {
             response.output = ''; // Already at root or invalid path
             response.newDirectory = currentDir; // Stay here
          } else {
            response.newDirectory = dirParts.slice(0, -1).join('\\');
            // Ensure drive root like C: is kept as C:\ if needed, or handled by getPrompt
             if (response.newDirectory.endsWith(':')) {
                response.newDirectory += '\\';
             }
            response.output = '';
          }
        } else {
          // Unix path handling
          if (currentDir === '~' || currentDir === '/') {
            response.output = ''; // Already at root
            response.newDirectory = currentDir;
          } else {
            const dirParts = currentDir.split('/');
            response.newDirectory = dirParts.slice(0, -1).join('/') || '/';
            response.output = '';
          }
        }
      } else if (targetPath === '.') {
        // Current directory - no change
        response.output = '';
      } else if (isWindowsShell && targetPath.match(/^[A-Za-z]:\\?$/)) {
        // Drive change in Windows like "C:" or "C:\"
        const drive = targetPath.charAt(0).toUpperCase();
        response.newDirectory = `${drive}:\\`;
        response.output = '';
      } else if (targetPath.startsWith('/') || (isWindowsShell && targetPath.match(/^[A-Za-z]:\\/))) {
        // Absolute path
        response.newDirectory = targetPath;
         // Basic normalization for windows paths
         if (isWindowsShell) {
            response.newDirectory = response.newDirectory.replace(/\//g, '\\');
         }
        response.output = '';
      } else {
        // Relative path
        const separator = isWindowsShell ? '\\' : '/';
        // Avoid double separators
        const currentEndsWithSep = currentDir.endsWith(separator);
        const targetStartsWithSep = targetPath.startsWith(separator);

        if (currentEndsWithSep && targetStartsWithSep) {
             response.newDirectory = currentDir + targetPath.substring(1);
        } else if (!currentEndsWithSep && !targetStartsWithSep) {
            response.newDirectory = currentDir + separator + targetPath;
        } else {
             response.newDirectory = currentDir + targetPath;
        }

        // Basic normalization for windows paths
        if (isWindowsShell) {
           response.newDirectory = response.newDirectory.replace(/\//g, '\\');
        }

        response.output = '';
      }
       // Basic check if the directory exists (simulation)
       // In a real scenario, you'd check filesystem
       const simulatedDirs = ['C:\\Users', 'C:\\Windows', 'C:\\Program Files', '~', '/home/user', '/etc'];
       const simulatedFiles = ['C:\\Users\\user\\document.txt', '/home/user/script.sh'];
       const targetExists = simulatedDirs.some(dir => response.newDirectory.startsWith(dir)) ||
                            simulatedFiles.includes(response.newDirectory);

       if (!targetExists && response.output === '') {
           response.output = isWindowsShell
               ? `The system cannot find the path specified.`
               : `bash: cd: ${targetPath}: No such file or directory`;
           response.newDirectory = currentDir; // Revert if path doesn't "exist"
       }
    }
    return response;
  }

  // --- DIR/LS command ---
  else if (cmd === 'ls' || (isWindowsShell && cmd === 'dir')) {
    if (isWindowsShell) {
      // Check for the /w flag 
      const wideFormat = args.some(arg => arg.toLowerCase() === '/w');

      if (wideFormat) {
        // Simulate Windows WIDE directory listing
        response.output = ` Directory of ${currentDir}\n\n` +
          `[.]                    [..]                   [Program Files]\n` +
          `[Users]                [Windows]              pagefile.sys\n` +
          `hiberfil.sys           [Temp]                 [Documents]\n`;
      } else {
        // Simulate standard Windows directory listing (existing logic)
        response.output = ` Directory of ${currentDir}\n\n` +
          `05/01/2023  10:30 AM    <DIR>          .              \n` +
          `05/01/2023  10:30 AM    <DIR>          ..             \n` +
          `05/01/2023  10:30 AM    <DIR>          Program Files\n` +
          `05/01/2023  10:30 AM    <DIR>          Users\n` +
          `05/01/2023  10:30 AM    <DIR>          Windows\n` +
          `05/01/2023  10:30 AM           524,288 pagefile.sys\n` +
          `05/01/2023  10:30 AM         1,048,576 hiberfil.sys\n` +
          `               2 File(s)      1,572,864 bytes\n` +
          `               5 Dir(s)  123,456,789,012 bytes free\n`;
      }
    } else {
      // Simulate Unix directory listing (handle potential -l, -a flags if needed)
       let listAll = args.includes('-a');
       let longFormat = args.includes('-l');

       // Basic simulation
      response.output = `total 24\n`;
      if(listAll) {
          response.output += `${longFormat ? 'drwxr-xr-x  4 user staff  128B Apr 28 10:00 ' : ''}.\n`;
          response.output += `${longFormat ? 'drwxr-xr-x 10 root wheel  320B Apr 27 09:00 ' : ''}..\n`;
          response.output += `${longFormat ? '-rw-r--r--  1 user staff  512B May 1 2023 ' : ''}.bashrc\n`;
          response.output += `${longFormat ? '-rw-r--r--  1 user staff 1.0K May 1 2023 ' : ''}.profile\n`;
      }
       response.output += `${longFormat ? 'drwxr-xr-x  2 user staff   68B May 1 2023 ' : ''}Desktop\n`;
       response.output += `${longFormat ? 'drwxr-xr-x  3 user staff  102B Apr 28 09:15 ' : ''}Documents\n`;
       response.output += `${longFormat ? 'drwxr-xr-x  5 user staff  170B Apr 20 15:30 ' : ''}Downloads\n`;
        if(longFormat) {
            response.output += `-rw-rw-r--  1 user staff  1.2M Apr 28 10:15 report.docx\n`;
        } else {
             response.output += `report.docx\n`;
        }
    }
    return response;
  }

  // --- PWD/CD (without args) command ---
  else if (cmd === 'pwd' || (isWindowsShell && cmd === 'cd' && args.length === 0)) {
    response.output = currentDir;
    return response;
  }

  // --- ECHO command ---
  else if (cmd === 'echo') {
    response.output = args.join(' ');
    return response;
  }

  // --- CLEAR/CLS command ---
  else if (cmd === 'clear' || (isWindowsShell && cmd === 'cls')) {
    // This is handled directly in the TerminalWindow component by calling clearTerminal()
    response.output = ''; // Command itself produces no output
    return response;
  }

  // --- Handle non-existent commands ---
  else {
    // Check if it looks like a file path execution attempt (basic)
    const looksLikePath = command.includes('/') || command.includes('\\') || command.endsWith('.exe') || command.endsWith('.bat');

    if (isWindowsShell) {
        if(looksLikePath && cmd !== 'cd' && cmd !== 'chdir') {
             response.output = `The system cannot find the file specified.`;
        } else {
             response.output = `'${cmd}' is not recognized as an internal or external command,\noperable program or batch file.`;
        }
    } else {
         if(looksLikePath && cmd !== 'cd') {
              response.output = `bash: ${command}: No such file or directory`;
         } else {
             response.output = `bash: ${cmd}: command not found`;
         }
    }
    return response;
  }
};

// Add the updated Windows directories for tab completion
const windowsDirs = ['Program Files', 'Program Files (x86)', 'Users', 'Windows', 'Temp', 'Documents', 'Downloads', 'Pictures', 'Music', 'Videos'];
const windowsFiles = ['pagefile.sys', 'hiberfil.sys', 'bootmgr', 'config.sys', 'autoexec.bat'];

// Updated getTabCompletions function
export const getTabCompletions = (input, currentDir, shellType = 'bash') => {
  const isWindowsShell = shellType === 'cmd' || shellType === 'powershell';

  // Common commands for each shell type
  const commonCommands = {
    bash: ['ls', 'cd', 'pwd', 'echo', 'cat', 'grep', 'find', 'clear', 'mkdir', 'rm', 'cp', 'mv', 'touch', 'chmod', 'sudo'],
    sh: ['ls', 'cd', 'pwd', 'echo', 'cat', 'grep', 'find', 'clear', 'mkdir', 'rm', 'cp', 'mv', 'touch', 'chmod'],
    zsh: ['ls', 'cd', 'pwd', 'echo', 'cat', 'grep', 'find', 'clear', 'mkdir', 'rm', 'cp', 'mv', 'touch', 'chmod', 'sudo'],
    powershell: ['Get-ChildItem', 'Set-Location', 'Get-Location', 'Clear-Host', 'Copy-Item', 'Move-Item', 'New-Item', 'Remove-Item', 'Write-Output', 'Select-String', 'Get-Content', 'Measure-Object'],
    cmd: ['dir', 'cd', 'chdir', 'cls', 'copy', 'move', 'mkdir', 'md', 'rmdir', 'rd', 'del', 'echo', 'type', 'find', 'ren', 'attrib']
  };
  const commands = commonCommands[shellType] || commonCommands.bash;

  // Simulated directories and files
  const unixDirs = ['Desktop', 'Documents', 'Downloads', 'Pictures', 'Music', 'Videos', '.config', '.local', 'bin', 'lib', 'src'];
  const unixFiles = ['.bashrc', '.profile', 'README.md', 'script.sh', 'config.txt', 'Makefile'];
  // Use updated windowsDirs and add some files
  const directories = isWindowsShell ? windowsDirs : unixDirs;
  const files = isWindowsShell ? windowsFiles : unixFiles;
  const combinedItems = [...directories, ...files];

  // Tokenize input: Split by space, but handle potential quoted paths later if needed
  const parts = input.split(/\s+/);
  const currentWordIndex = parts.length - 1;
  const currentWord = parts[currentWordIndex] || '';
  const prevWord = parts[currentWordIndex - 1]?.toLowerCase();

  // --- Completion Logic ---

  // 1. Complete command name (first word)
  if (currentWordIndex === 0) {
    return commands
      .filter(cmd => cmd.toLowerCase().startsWith(currentWord.toLowerCase()))
      .sort();
  }

  // 2. Complete arguments (files/directories) based on command
  const isCdCommand = prevWord === 'cd' || (isWindowsShell && prevWord === 'chdir');
  const isLsCommand = prevWord === 'ls' || (isWindowsShell && prevWord === 'dir');
  const isFileArgCommand = ['cat', 'type', 'rm', 'del', 'mv', 'move', 'cp', 'copy', 'ren', 'attrib', 'Get-Content', 'Remove-Item']; // Add more as needed

  if (isCdCommand || isLsCommand) {
     // Suggest directories primarily, maybe files for ls/dir
     const itemsToSuggest = isCdCommand ? directories : combinedItems;
     return itemsToSuggest
            .filter(item => item.toLowerCase().startsWith(currentWord.toLowerCase()))
            .map(item => `${prevWord} ${item}`) // Return full command part suggestion
            .sort();
  }

  if(isFileArgCommand.includes(prevWord)) {
       // Suggest files primarily, maybe directories
       return combinedItems
            .filter(item => item.toLowerCase().startsWith(currentWord.toLowerCase()))
            .map(item => `${prevWord} ${item}`) // Return full command part suggestion
            .sort();
  }

   // 3. Complete options/flags (basic example)
   if (currentWord.startsWith('-') && !isWindowsShell) {
       const options = { ls: ['-l', '-a', '-h', '-t', '-r'], grep: ['-i', '-n', '-v', '-r'] };
       const commandOptions = options[prevWord] || [];
       return commandOptions
            .filter(opt => opt.startsWith(currentWord))
            .map(opt => `${prevWord} ${opt}`)
            .sort();
   }
   if (currentWord.startsWith('/') && isWindowsShell && (prevWord === 'dir' || prevWord ==='format')) {
        const flags = { dir: ['/w', '/p', '/a', '/o', '/s', '/b'], format: ['/q', '/fs:NTFS', '/fs:FAT32'] };
        const commandFlags = flags[prevWord] || [];
         return commandFlags
            .filter(flag => flag.toLowerCase().startsWith(currentWord.toLowerCase()))
             .map(flag => `${prevWord} ${flag}`)
            .sort();
   }


  // Default: return empty list if no specific context matches
  return [];
};


// --- Keep remaining functions unchanged ---
export const formatTimestamp = (timestamp) => {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Just now';
    const now = new Date();
    const isToday = date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
             ' ' +
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Unknown time';
  }
};

export const generateUniqueTitle = (terminals) => {
  const existingTitles = terminals.map(t => t.title);
  const baseTitle = 'Terminal';
  let counter = 1;
  let newTitle = `${baseTitle} ${counter}`;
  while (existingTitles.includes(newTitle)) {
    counter++;
    newTitle = `${baseTitle} ${counter}`;
  }
  return newTitle;
};


// Updated saveTerminalsToStorage function for better persistence
export const saveTerminalsToStorage = (terminals, storageKey) => {
  try {
    const terminalsToSave = terminals.map(terminal => {
      // Preserve essential state but remove runtime-specific properties
      const { 
        id, title, position, size, shellType, lastDirectory, 
        commandHistory, backgroundProcesses, createdAt, lastActiveAt,
        zIndex
      } = terminal;
      
      return {
        id,
        title,
        position,
        size,
        shellType,
        lastDirectory,
        commandHistory: commandHistory || [],
        backgroundProcesses: backgroundProcesses || [],
        createdAt,
        lastActiveAt,
        zIndex,
        isActive: true,
        isVisible: false,  // Save as invisible, will be made visible on restore
        isAttached: false  // Don't save attached state
      };
    });
    
    localStorage.setItem(storageKey, JSON.stringify(terminalsToSave));
    return true;
  } catch (error) {
    console.error('Error saving terminals to storage:', error);
    return false;
  }
};

export const loadTerminalsFromStorage = (storageKey) => {
  try {
    const savedTerminals = localStorage.getItem(storageKey);
    if (!savedTerminals) return [];
    const terminals = JSON.parse(savedTerminals);
    return terminals.map(terminal => ({
      ...terminal,
      commandHistory: terminal.commandHistory || [],
      isActive: true,
      isVisible: terminal.isVisible !== false,
      lastActiveAt: terminal.lastActiveAt || new Date().toISOString(),
       isAttached: false // Ensure loaded terminals are not marked as attached initially
    }));
  } catch (error) {
    console.error('Error loading terminals from storage:', error);
    return [];
  }
};

export const showStatusMessage = (setStatusMessage, message, timeoutRef) => {
  if (timeoutRef.current) clearTimeout(timeoutRef.current);
  setStatusMessage(message);
  timeoutRef.current = setTimeout(() => { setStatusMessage(''); }, 3000);
};

export const hideResultsArea = () => {
  const resultsArea = document.querySelector('.results-area');
  if (resultsArea) {
    resultsArea.dataset.originalDisplay = resultsArea.style.display;
    resultsArea.style.display = 'none';
  }
};

export const restoreResultsArea = () => {
  const resultsArea = document.querySelector('.results-area');
  if (resultsArea) {
    const originalDisplay = resultsArea.dataset.originalDisplay || 'block';
    resultsArea.style.display = originalDisplay;
  }
};

// Detect directory changes from command output
export const detectDirectoryChange = (command, output, currentDir, shellType = 'bash') => {
  // Simple implementation to detect potential directory changes
  // In a real implementation, this would parse command output more intelligently
  
  const isWindowsShell = shellType === 'cmd' || shellType === 'powershell';
  const parts = command.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();
  
  // Only process cd/chdir commands
  if (cmd === 'cd' || (isWindowsShell && cmd === 'chdir')) {
    if (parts.length > 1) {
      const targetPath = parts[1];
      
      // Handle common cd targets
      if (targetPath === '~' && !isWindowsShell) {
        return '~';
      } else if (targetPath === '..') {
        // Go up one level
        if (isWindowsShell) {
          const dirParts = currentDir.split('\\');
          if (dirParts.length > 1) {
            return dirParts.slice(0, -1).join('\\') || 'C:\\';
          }
        } else {
          const dirParts = currentDir.split('/');
          return dirParts.slice(0, -1).join('/') || '/';
        }
      } else if (targetPath === '.') {
        // Stay in same directory
        return currentDir;
      } else if (isWindowsShell && targetPath.match(/^[A-Za-z]:/)) {
        // Drive letter change
        return targetPath + '\\';
      } else if (targetPath.startsWith('/') || (isWindowsShell && targetPath.match(/^[A-Za-z]:\\/))) {
        // Absolute path
        return targetPath;
      } else {
        // Relative path
        const separator = isWindowsShell ? '\\' : '/';
        return currentDir + separator + targetPath;
      }
    } else {
      // cd without args goes to home
      return isWindowsShell ? 'C:\\Users\\user' : '~';
    }
  }
  
  // If we can't detect a directory change, return the current directory
  return currentDir;
};