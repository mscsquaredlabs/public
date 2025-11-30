/**
 * cheatSheetData.js
 * Contains data for cheat sheet categories and items
 * Each category has 10 items for comprehensive coverage
 */

export const cheatSheetCategories = [
  { id: 'ide-shortcuts', name: 'IDE Shortcuts', icon: '⌨️' },
  { id: 'javascript', name: 'JavaScript', icon: 'JS' },
  { id: 'react', name: 'React', icon: '⚛️' },
  { id: 'css', name: 'CSS', icon: '🎨' },
  { id: 'git', name: 'Git', icon: '📜' },
  { id: 'data-structures', name: 'Data Structures', icon: '🏗️' },
  { id: 'algorithms', name: 'Algorithms', icon: '🧮' },
  { id: 'database', name: 'Database', icon: '💾' },
  { id: 'devops', name: 'DevOps', icon: '🔄' },
  { id: 'best-practices', name: 'Best Practices', icon: '✅' },
  { id: 'app-creation', name: 'App Creation', icon: '🚀' }
];

export const cheatSheetItems = {
  'ide-shortcuts': [
    {
      id: 'vscode-format',
      name: 'Format Code',
      shortcut: 'Shift+Alt+F',
      description: 'Format the entire document or selected text',
      syntax: '// Select code and press Shift+Alt+F',
      context: 'VS Code',
      tags: ['formatting', 'vscode', 'shortcut']
    },
    {
      id: 'vscode-multi-cursor',
      name: 'Multiple Cursors',
      shortcut: 'Alt+Click',
      description: 'Add multiple cursors to edit in multiple places at once',
      syntax: '// Hold Alt and click where you want cursors',
      context: 'VS Code',
      tags: ['editing', 'vscode', 'shortcut']
    },
    {
      id: 'vscode-column-select',
      name: 'Column (Box) Selection',
      shortcut: 'Shift+Alt+Mouse Drag',
      description: 'Select text in columns to edit multiple lines at once',
      syntax: '// Hold Shift+Alt and drag to select a block of text',
      context: 'VS Code',
      tags: ['selection', 'vscode', 'shortcut']
    },
    {
      id: 'vscode-terminal',
      name: 'Toggle Terminal',
      shortcut: 'Ctrl+`',
      description: 'Show or hide the integrated terminal',
      syntax: '',
      context: 'VS Code',
      tags: ['terminal', 'vscode', 'shortcut']
    },
    {
      id: 'vscode-find-replace',
      name: 'Find and Replace',
      shortcut: 'Ctrl+F / Ctrl+H',
      description: 'Find or find and replace text in the current file',
      syntax: '',
      context: 'VS Code',
      tags: ['editing', 'search', 'vscode', 'shortcut']
    },
    {
      id: 'vscode-quick-open',
      name: 'Quick Open File',
      shortcut: 'Ctrl+P',
      description: 'Quickly open files by name',
      syntax: '',
      context: 'VS Code',
      tags: ['navigation', 'vscode', 'shortcut']
    },
    {
      id: 'vscode-command-palette',
      name: 'Command Palette',
      shortcut: 'Ctrl+Shift+P',
      description: 'Open command palette to access all commands',
      syntax: '',
      context: 'VS Code',
      tags: ['commands', 'vscode', 'shortcut']
    },
    {
      id: 'vscode-split-editor',
      name: 'Split Editor',
      shortcut: 'Ctrl+\\',
      description: 'Split editor into multiple panes',
      syntax: '',
      context: 'VS Code',
      tags: ['layout', 'vscode', 'shortcut']
    },
    {
      id: 'vscode-go-to-line',
      name: 'Go to Line',
      shortcut: 'Ctrl+G',
      description: 'Jump to a specific line number',
      syntax: '',
      context: 'VS Code',
      tags: ['navigation', 'vscode', 'shortcut']
    },
    {
      id: 'vscode-toggle-comment',
      name: 'Toggle Comment',
      shortcut: 'Ctrl+/',
      description: 'Comment or uncomment current line or selection',
      syntax: '',
      context: 'VS Code',
      tags: ['editing', 'vscode', 'shortcut']
    }
  ],
  'javascript': [
    {
      id: 'js-array-map',
      name: 'Array.map()',
      shortcut: '',
      description: 'Creates a new array with the results of calling a function on every element',
      syntax: 'const newArray = array.map(item => transformFunction(item));',
      context: 'JavaScript',
      tags: ['array', 'function', 'javascript']
    },
    {
      id: 'js-array-filter',
      name: 'Array.filter()',
      shortcut: '',
      description: 'Creates a new array with elements that pass the test',
      syntax: 'const filteredArray = array.filter(item => condition);',
      context: 'JavaScript',
      tags: ['array', 'function', 'javascript']
    },
    {
      id: 'js-array-reduce',
      name: 'Array.reduce()',
      shortcut: '',
      description: 'Reduce array to a single value by executing a reducer function',
      syntax: 'const sum = array.reduce((accumulator, current) => accumulator + current, 0);',
      context: 'JavaScript',
      tags: ['array', 'function', 'javascript']
    },
    {
      id: 'js-destructuring',
      name: 'Object Destructuring',
      shortcut: '',
      description: 'Extract properties from objects into distinct variables',
      syntax: 'const { property1, property2 } = object;\nconst [first, second] = array;',
      context: 'JavaScript',
      tags: ['object', 'es6', 'javascript']
    },
    {
      id: 'js-arrow-function',
      name: 'Arrow Functions',
      shortcut: '',
      description: 'Shorter syntax for writing function expressions',
      syntax: 'const myFunction = (param1, param2) => {\n  return result;\n};\n\n// Implicit return\nconst shortFunc = param => expression;',
      context: 'JavaScript',
      tags: ['function', 'es6', 'javascript']
    },
    {
      id: 'js-promises',
      name: 'Promises',
      shortcut: '',
      description: 'Object representing eventual completion of an asynchronous operation',
      syntax: 'const promise = new Promise((resolve, reject) => {\n  // Async operation\n  if (success) {\n    resolve(value);\n  } else {\n    reject(error);\n  }\n});\n\npromise\n  .then(value => console.log(value))\n  .catch(error => console.error(error));',
      context: 'JavaScript',
      tags: ['async', 'es6', 'javascript']
    },
    {
      id: 'js-async-await',
      name: 'Async/Await',
      shortcut: '',
      description: 'Modern syntax for handling asynchronous operations',
      syntax: 'async function fetchData() {\n  try {\n    const response = await fetch(url);\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error(error);\n  }\n}',
      context: 'JavaScript',
      tags: ['async', 'es8', 'javascript']
    },
    {
      id: 'js-spread-operator',
      name: 'Spread Operator',
      shortcut: '',
      description: 'Expand arrays or objects into individual elements',
      syntax: 'const newArray = [...oldArray, newItem];\nconst newObject = { ...oldObject, newProp: value };\nconst combined = [...array1, ...array2];',
      context: 'JavaScript',
      tags: ['es6', 'syntax', 'javascript']
    },
    {
      id: 'js-template-literals',
      name: 'Template Literals',
      shortcut: '',
      description: 'String literals allowing embedded expressions',
      syntax: 'const name = "World";\nconst greeting = `Hello, ${name}!`;\nconst multiLine = `Line 1\nLine 2\nLine 3`;',
      context: 'JavaScript',
      tags: ['es6', 'string', 'javascript']
    },
    {
      id: 'js-optional-chaining',
      name: 'Optional Chaining',
      shortcut: '',
      description: 'Safely access nested object properties',
      syntax: 'const value = obj?.property?.nested?.value;\nconst result = arr?.[0]?.name;\nconst func = obj?.method?.();',
      context: 'JavaScript',
      tags: ['es2020', 'syntax', 'javascript']
    }
  ],
  'react': [
    {
      id: 'react-useState',
      name: 'useState Hook',
      shortcut: '',
      description: 'Hook to add React state to functional components',
      syntax: 'import { useState } from \'react\';\n\nfunction Example() {\n  const [count, setCount] = useState(0);\n  \n  return (\n    <div>\n      <p>You clicked {count} times</p>\n      <button onClick={() => setCount(count + 1)}>\n        Click me\n      </button>\n    </div>\n  );\n}',
      context: 'React',
      tags: ['hooks', 'state', 'react']
    },
    {
      id: 'react-useEffect',
      name: 'useEffect Hook',
      shortcut: '',
      description: 'Hook to perform side effects in functional components',
      syntax: 'import { useEffect, useState } from \'react\';\n\nfunction Example() {\n  const [data, setData] = useState(null);\n  \n  useEffect(() => {\n    // Fetch data or perform side effects here\n    fetchData().then(result => setData(result));\n    \n    // Optional cleanup function\n    return () => {\n      // Cleanup code\n    };\n  }, [/* dependency array */]);\n}',
      context: 'React',
      tags: ['hooks', 'lifecycle', 'react']
    },
    {
      id: 'react-useContext',
      name: 'useContext Hook',
      shortcut: '',
      description: 'Access React context values',
      syntax: 'import { useContext } from \'react\';\nimport { MyContext } from \'./MyContext\';\n\nfunction Component() {\n  const value = useContext(MyContext);\n  return <div>{value}</div>;\n}',
      context: 'React',
      tags: ['hooks', 'context', 'react']
    },
    {
      id: 'react-useCallback',
      name: 'useCallback Hook',
      shortcut: '',
      description: 'Memoize callback functions to prevent unnecessary re-renders',
      syntax: 'import { useCallback, useState } from \'react\';\n\nfunction Component() {\n  const [count, setCount] = useState(0);\n  \n  const handleClick = useCallback(() => {\n    setCount(c => c + 1);\n  }, []);\n  \n  return <button onClick={handleClick}>Count: {count}</button>;\n}',
      context: 'React',
      tags: ['hooks', 'performance', 'react']
    },
    {
      id: 'react-useMemo',
      name: 'useMemo Hook',
      shortcut: '',
      description: 'Memoize expensive calculations',
      syntax: 'import { useMemo } from \'react\';\n\nfunction Component({ items }) {\n  const expensiveValue = useMemo(() => {\n    return items.reduce((sum, item) => sum + item.value, 0);\n  }, [items]);\n  \n  return <div>{expensiveValue}</div>;\n}',
      context: 'React',
      tags: ['hooks', 'performance', 'react']
    },
    {
      id: 'react-custom-hooks',
      name: 'Custom Hooks',
      shortcut: '',
      description: 'Create reusable logic with custom hooks',
      syntax: 'function useCounter(initialValue = 0) {\n  const [count, setCount] = useState(initialValue);\n  \n  const increment = () => setCount(c => c + 1);\n  const decrement = () => setCount(c => c - 1);\n  const reset = () => setCount(initialValue);\n  \n  return { count, increment, decrement, reset };\n}',
      context: 'React',
      tags: ['hooks', 'custom', 'react']
    },
    {
      id: 'react-conditional-render',
      name: 'Conditional Rendering',
      shortcut: '',
      description: 'Render components conditionally',
      syntax: '{isLoggedIn ? (\n  <WelcomeMessage />\n) : (\n  <LoginForm />\n)}\n\n{items.length > 0 && <ItemList items={items} />}\n\n{error && <ErrorMessage error={error} />}',
      context: 'React',
      tags: ['rendering', 'jsx', 'react']
    },
    {
      id: 'react-list-render',
      name: 'List Rendering',
      shortcut: '',
      description: 'Render lists of components',
      syntax: 'function ItemList({ items }) {\n  return (\n    <ul>\n      {items.map(item => (\n        <li key={item.id}>{item.name}</li>\n      ))}\n    </ul>\n  );\n}',
      context: 'React',
      tags: ['rendering', 'jsx', 'react']
    },
    {
      id: 'react-props',
      name: 'Props',
      shortcut: '',
      description: 'Pass data to child components',
      syntax: 'function Welcome({ name, age }) {\n  return <h1>Hello, {name}! You are {age} years old.</h1>;\n}\n\n<Welcome name="Alice" age={25} />',
      context: 'React',
      tags: ['props', 'components', 'react']
    },
    {
      id: 'react-event-handlers',
      name: 'Event Handlers',
      shortcut: '',
      description: 'Handle user interactions',
      syntax: 'function Button() {\n  const handleClick = (e) => {\n    e.preventDefault();\n    console.log("Clicked!");\n  };\n  \n  return <button onClick={handleClick}>Click me</button>;\n}',
      context: 'React',
      tags: ['events', 'handlers', 'react']
    }
  ],
  'css': [
    {
      id: 'css-flexbox',
      name: 'Flexbox Layout',
      shortcut: '',
      description: 'CSS layout model for arranging items in rows or columns',
      syntax: '.container {\n  display: flex;\n  flex-direction: row; /* or column */\n  justify-content: center; /* main axis */\n  align-items: center; /* cross axis */\n  flex-wrap: wrap; /* allow items to wrap */\n}',
      context: 'CSS',
      tags: ['layout', 'css']
    },
    {
      id: 'css-grid',
      name: 'Grid Layout',
      shortcut: '',
      description: 'Two-dimensional grid-based layout system',
      syntax: '.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  grid-template-rows: auto;\n  grid-gap: 10px;\n}',
      context: 'CSS',
      tags: ['layout', 'css']
    },
    {
      id: 'css-animations',
      name: 'CSS Animations',
      shortcut: '',
      description: 'Create smooth animations using CSS',
      syntax: '@keyframes slideIn {\n  from { transform: translateX(-100%); }\n  to { transform: translateX(0); }\n}\n\n.element {\n  animation: slideIn 0.5s ease-in-out;\n}',
      context: 'CSS',
      tags: ['animation', 'css']
    },
    {
      id: 'css-transitions',
      name: 'CSS Transitions',
      shortcut: '',
      description: 'Smooth transitions between states',
      syntax: '.button {\n  transition: background-color 0.3s ease, transform 0.2s;\n}\n\n.button:hover {\n  background-color: #4f46e5;\n  transform: scale(1.05);\n}',
      context: 'CSS',
      tags: ['transition', 'css']
    },
    {
      id: 'css-media-queries',
      name: 'Media Queries',
      shortcut: '',
      description: 'Responsive design with breakpoints',
      syntax: '@media (max-width: 768px) {\n  .container {\n    flex-direction: column;\n  }\n}\n\n@media (min-width: 1024px) {\n  .container {\n    max-width: 1200px;\n  }\n}',
      context: 'CSS',
      tags: ['responsive', 'css']
    },
    {
      id: 'css-variables',
      name: 'CSS Variables',
      shortcut: '',
      description: 'Custom properties for reusable values',
      syntax: ':root {\n  --primary-color: #4f46e5;\n  --spacing: 1rem;\n}\n\n.element {\n  color: var(--primary-color);\n  padding: var(--spacing);\n}',
      context: 'CSS',
      tags: ['variables', 'css']
    },
    {
      id: 'css-pseudo-classes',
      name: 'Pseudo-classes',
      shortcut: '',
      description: 'Style elements based on state',
      syntax: 'a:hover { color: #4f46e5; }\na:active { color: #4338ca; }\na:focus { outline: 2px solid #4f46e5; }\nli:first-child { font-weight: bold; }\nli:last-child { margin-bottom: 0; }',
      context: 'CSS',
      tags: ['selectors', 'css']
    },
    {
      id: 'css-transform',
      name: 'Transform',
      shortcut: '',
      description: 'Transform elements with rotate, scale, translate',
      syntax: '.element {\n  transform: rotate(45deg) scale(1.2) translateX(10px);\n}\n\n.element:hover {\n  transform: rotate(0deg) scale(1);\n}',
      context: 'CSS',
      tags: ['transform', 'css']
    },
    {
      id: 'css-box-shadow',
      name: 'Box Shadow',
      shortcut: '',
      description: 'Add depth with shadows',
      syntax: '.card {\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n\n.card:hover {\n  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);\n}',
      context: 'CSS',
      tags: ['effects', 'css']
    },
    {
      id: 'css-positioning',
      name: 'Positioning',
      shortcut: '',
      description: 'Control element positioning',
      syntax: '.relative { position: relative; }\n.absolute { position: absolute; top: 0; left: 0; }\n.fixed { position: fixed; top: 0; right: 0; }\n.sticky { position: sticky; top: 0; }',
      context: 'CSS',
      tags: ['position', 'css']
    }
  ],
  'git': [
    {
      id: 'git-commit',
      name: 'Git Commit',
      shortcut: '',
      description: 'Record changes to the repository',
      syntax: 'git commit -m "Descriptive message"',
      context: 'Git',
      tags: ['version control', 'git']
    },
    {
      id: 'git-branch',
      name: 'Git Branch',
      shortcut: '',
      description: 'List, create, or delete branches',
      syntax: '# List branches\ngit branch\n\n# Create a new branch\ngit branch branch-name\n\n# Delete a branch\ngit branch -d branch-name',
      context: 'Git',
      tags: ['version control', 'git']
    },
    {
      id: 'git-checkout',
      name: 'Git Checkout',
      shortcut: '',
      description: 'Switch branches or restore files',
      syntax: '# Switch to a branch\ngit checkout branch-name\n\n# Create and switch to new branch\ngit checkout -b new-branch\n\n# Restore file\ngit checkout -- filename',
      context: 'Git',
      tags: ['version control', 'git']
    },
    {
      id: 'git-merge',
      name: 'Git Merge',
      shortcut: '',
      description: 'Merge branches together',
      syntax: '# Merge feature branch into current branch\ngit merge feature-branch\n\n# Merge with no fast-forward\ngit merge --no-ff feature-branch',
      context: 'Git',
      tags: ['version control', 'git']
    },
    {
      id: 'git-pull',
      name: 'Git Pull',
      shortcut: '',
      description: 'Fetch and merge changes from remote',
      syntax: 'git pull origin main\n\n# Pull with rebase\ngit pull --rebase origin main',
      context: 'Git',
      tags: ['version control', 'git']
    },
    {
      id: 'git-push',
      name: 'Git Push',
      shortcut: '',
      description: 'Upload local commits to remote repository',
      syntax: 'git push origin main\n\n# Push to specific branch\ngit push origin feature-branch\n\n# Force push (use with caution)\ngit push --force origin main',
      context: 'Git',
      tags: ['version control', 'git']
    },
    {
      id: 'git-status',
      name: 'Git Status',
      shortcut: '',
      description: 'Show working directory status',
      syntax: 'git status\n\n# Short format\ngit status -s',
      context: 'Git',
      tags: ['version control', 'git']
    },
    {
      id: 'git-log',
      name: 'Git Log',
      shortcut: '',
      description: 'View commit history',
      syntax: '# View log\ngit log\n\n# One line per commit\ngit log --oneline\n\n# Graph view\ngit log --graph --oneline --all',
      context: 'Git',
      tags: ['version control', 'git']
    },
    {
      id: 'git-stash',
      name: 'Git Stash',
      shortcut: '',
      description: 'Temporarily save changes',
      syntax: '# Save changes\ngit stash\n\n# List stashes\ngit stash list\n\n# Apply stash\ngit stash apply\n\n# Drop stash\ngit stash drop',
      context: 'Git',
      tags: ['version control', 'git']
    },
    {
      id: 'git-reset',
      name: 'Git Reset',
      shortcut: '',
      description: 'Reset HEAD to a specific state',
      syntax: '# Soft reset (keeps changes)\ngit reset --soft HEAD~1\n\n# Mixed reset (default)\ngit reset HEAD~1\n\n# Hard reset (discards changes)\ngit reset --hard HEAD~1',
      context: 'Git',
      tags: ['version control', 'git']
    }
  ],
  'data-structures': [
    {
      id: 'ds-array',
      name: 'Array',
      shortcut: '',
      description: 'A collection of elements stored at contiguous memory locations',
      syntax: '// JavaScript Array\nconst array = [1, 2, 3, 4, 5];\n\n// Access element\nconst element = array[0]; // 1\n\n// Add to end\narray.push(6); // [1, 2, 3, 4, 5, 6]\n\n// Remove from end\narray.pop(); // [1, 2, 3, 4, 5]',
      context: 'Data Structures',
      tags: ['array', 'data structure']
    },
    {
      id: 'ds-linked-list',
      name: 'Linked List',
      shortcut: '',
      description: 'Linear collection of elements where each element points to the next',
      syntax: 'class Node {\n  constructor(value) {\n    this.value = value;\n    this.next = null;\n  }\n}\n\nclass LinkedList {\n  constructor() {\n    this.head = null;\n    this.size = 0;\n  }\n  \n  // Add a node to the end\n  append(value) {\n    const newNode = new Node(value);\n    if (!this.head) {\n      this.head = newNode;\n    } else {\n      let current = this.head;\n      while (current.next) {\n        current = current.next;\n      }\n      current.next = newNode;\n    }\n    this.size++;\n  }\n}',
      context: 'Data Structures',
      tags: ['linked list', 'data structure']
    },
    {
      id: 'ds-stack',
      name: 'Stack',
      shortcut: '',
      description: 'LIFO (Last In First Out) data structure',
      syntax: 'class Stack {\n  constructor() {\n    this.items = [];\n  }\n  \n  push(element) {\n    this.items.push(element);\n  }\n  \n  pop() {\n    return this.items.pop();\n  }\n  \n  peek() {\n    return this.items[this.items.length - 1];\n  }\n  \n  isEmpty() {\n    return this.items.length === 0;\n  }\n}',
      context: 'Data Structures',
      tags: ['stack', 'data structure']
    },
    {
      id: 'ds-queue',
      name: 'Queue',
      shortcut: '',
      description: 'FIFO (First In First Out) data structure',
      syntax: 'class Queue {\n  constructor() {\n    this.items = [];\n  }\n  \n  enqueue(element) {\n    this.items.push(element);\n  }\n  \n  dequeue() {\n    return this.items.shift();\n  }\n  \n  front() {\n    return this.items[0];\n  }\n  \n  isEmpty() {\n    return this.items.length === 0;\n  }\n}',
      context: 'Data Structures',
      tags: ['queue', 'data structure']
    },
    {
      id: 'ds-binary-tree',
      name: 'Binary Tree',
      shortcut: '',
      description: 'Tree data structure where each node has at most two children',
      syntax: 'class TreeNode {\n  constructor(value) {\n    this.value = value;\n    this.left = null;\n    this.right = null;\n  }\n}\n\nclass BinaryTree {\n  constructor() {\n    this.root = null;\n  }\n  \n  insert(value) {\n    const newNode = new TreeNode(value);\n    if (!this.root) {\n      this.root = newNode;\n      return;\n    }\n    // Insertion logic...\n  }\n}',
      context: 'Data Structures',
      tags: ['tree', 'data structure']
    },
    {
      id: 'ds-hash-table',
      name: 'Hash Table',
      shortcut: '',
      description: 'Key-value data structure with fast lookups',
      syntax: 'class HashTable {\n  constructor(size = 53) {\n    this.keyMap = new Array(size);\n  }\n  \n  _hash(key) {\n    let total = 0;\n    for (let i = 0; i < key.length; i++) {\n      total = (total * 31 + key.charCodeAt(i)) % this.keyMap.length;\n    }\n    return total;\n  }\n  \n  set(key, value) {\n    const index = this._hash(key);\n    if (!this.keyMap[index]) {\n      this.keyMap[index] = [];\n    }\n    this.keyMap[index].push([key, value]);\n  }\n}',
      context: 'Data Structures',
      tags: ['hash table', 'data structure']
    },
    {
      id: 'ds-graph',
      name: 'Graph',
      shortcut: '',
      description: 'Collection of nodes connected by edges',
      syntax: 'class Graph {\n  constructor() {\n    this.adjacencyList = {};\n  }\n  \n  addVertex(vertex) {\n    if (!this.adjacencyList[vertex]) {\n      this.adjacencyList[vertex] = [];\n    }\n  }\n  \n  addEdge(v1, v2) {\n    this.adjacencyList[v1].push(v2);\n    this.adjacencyList[v2].push(v1);\n  }\n}',
      context: 'Data Structures',
      tags: ['graph', 'data structure']
    },
    {
      id: 'ds-heap',
      name: 'Heap',
      shortcut: '',
      description: 'Complete binary tree with heap property',
      syntax: 'class MinHeap {\n  constructor() {\n    this.heap = [];\n  }\n  \n  insert(value) {\n    this.heap.push(value);\n    this.bubbleUp();\n  }\n  \n  extractMin() {\n    const min = this.heap[0];\n    const end = this.heap.pop();\n    if (this.heap.length > 0) {\n      this.heap[0] = end;\n      this.sinkDown();\n    }\n    return min;\n  }\n}',
      context: 'Data Structures',
      tags: ['heap', 'data structure']
    },
    {
      id: 'ds-set',
      name: 'Set',
      shortcut: '',
      description: 'Collection of unique elements',
      syntax: '// JavaScript Set\nconst mySet = new Set([1, 2, 3]);\n\n// Add element\nmySet.add(4);\n\n// Check if exists\nmySet.has(2); // true\n\n// Remove element\nmySet.delete(3);\n\n// Size\nmySet.size; // 3',
      context: 'Data Structures',
      tags: ['set', 'data structure']
    },
    {
      id: 'ds-map',
      name: 'Map',
      shortcut: '',
      description: 'Key-value pairs with any type of keys',
      syntax: '// JavaScript Map\nconst myMap = new Map();\n\n// Set value\nmyMap.set("key", "value");\nmyMap.set(1, "number key");\n\n// Get value\nmyMap.get("key"); // "value"\n\n// Check if exists\nmyMap.has("key"); // true\n\n// Delete\nmyMap.delete("key");',
      context: 'Data Structures',
      tags: ['map', 'data structure']
    }
  ],
  'algorithms': [
    {
      id: 'algo-binary-search',
      name: 'Binary Search',
      shortcut: '',
      description: 'Efficient search algorithm for sorted arrays by repeatedly dividing in half',
      syntax: 'function binarySearch(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n  \n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    \n    if (arr[mid] === target) {\n      return mid; // Target found\n    }\n    \n    if (arr[mid] < target) {\n      left = mid + 1; // Search right half\n    } else {\n      right = mid - 1; // Search left half\n    }\n  }\n  \n  return -1; // Target not found\n}',
      context: 'Algorithms',
      tags: ['search', 'algorithm']
    },
    {
      id: 'algo-quicksort',
      name: 'Quicksort',
      shortcut: '',
      description: 'Efficient sorting algorithm using divide and conquer approach',
      syntax: 'function quickSort(arr) {\n  if (arr.length <= 1) {\n    return arr;\n  }\n  \n  const pivot = arr[arr.length - 1];\n  const left = [];\n  const right = [];\n  \n  for (let i = 0; i < arr.length - 1; i++) {\n    if (arr[i] < pivot) {\n      left.push(arr[i]);\n    } else {\n      right.push(arr[i]);\n    }\n  }\n  \n  return [...quickSort(left), pivot, ...quickSort(right)];\n}',
      context: 'Algorithms',
      tags: ['sort', 'algorithm']
    },
    {
      id: 'algo-merge-sort',
      name: 'Merge Sort',
      shortcut: '',
      description: 'Divide and conquer sorting algorithm',
      syntax: 'function mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  \n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  \n  return merge(left, right);\n}\n\nfunction merge(left, right) {\n  const result = [];\n  while (left.length && right.length) {\n    result.push(left[0] < right[0] ? left.shift() : right.shift());\n  }\n  return [...result, ...left, ...right];\n}',
      context: 'Algorithms',
      tags: ['sort', 'algorithm']
    },
    {
      id: 'algo-bfs',
      name: 'Breadth-First Search',
      shortcut: '',
      description: 'Traverse graph level by level',
      syntax: 'function BFS(graph, start) {\n  const queue = [start];\n  const visited = new Set([start]);\n  const result = [];\n  \n  while (queue.length) {\n    const node = queue.shift();\n    result.push(node);\n    \n    for (const neighbor of graph[node]) {\n      if (!visited.has(neighbor)) {\n        visited.add(neighbor);\n        queue.push(neighbor);\n      }\n    }\n  }\n  \n  return result;\n}',
      context: 'Algorithms',
      tags: ['graph', 'algorithm']
    },
    {
      id: 'algo-dfs',
      name: 'Depth-First Search',
      shortcut: '',
      description: 'Traverse graph by going deep before wide',
      syntax: 'function DFS(graph, start, visited = new Set()) {\n  visited.add(start);\n  const result = [start];\n  \n  for (const neighbor of graph[start]) {\n    if (!visited.has(neighbor)) {\n      result.push(...DFS(graph, neighbor, visited));\n    }\n  }\n  \n  return result;\n}',
      context: 'Algorithms',
      tags: ['graph', 'algorithm']
    },
    {
      id: 'algo-two-pointers',
      name: 'Two Pointers',
      shortcut: '',
      description: 'Technique using two pointers to solve problems efficiently',
      syntax: 'function twoSum(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n  \n  while (left < right) {\n    const sum = arr[left] + arr[right];\n    if (sum === target) {\n      return [left, right];\n    } else if (sum < target) {\n      left++;\n    } else {\n      right--;\n    }\n  }\n  \n  return [];\n}',
      context: 'Algorithms',
      tags: ['technique', 'algorithm']
    },
    {
      id: 'algo-sliding-window',
      name: 'Sliding Window',
      shortcut: '',
      description: 'Technique for solving subarray/substring problems',
      syntax: 'function maxSumSubarray(arr, k) {\n  let maxSum = 0;\n  let windowSum = 0;\n  \n  // Calculate sum of first window\n  for (let i = 0; i < k; i++) {\n    windowSum += arr[i];\n  }\n  maxSum = windowSum;\n  \n  // Slide the window\n  for (let i = k; i < arr.length; i++) {\n    windowSum = windowSum - arr[i - k] + arr[i];\n    maxSum = Math.max(maxSum, windowSum);\n  }\n  \n  return maxSum;\n}',
      context: 'Algorithms',
      tags: ['technique', 'algorithm']
    },
    {
      id: 'algo-dynamic-programming',
      name: 'Dynamic Programming',
      shortcut: '',
      description: 'Solve complex problems by breaking them into simpler subproblems',
      syntax: 'function fibonacci(n, memo = {}) {\n  if (n in memo) return memo[n];\n  if (n <= 2) return 1;\n  \n  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);\n  return memo[n];\n}',
      context: 'Algorithms',
      tags: ['technique', 'algorithm']
    },
    {
      id: 'algo-greedy',
      name: 'Greedy Algorithm',
      shortcut: '',
      description: 'Make locally optimal choices at each step',
      syntax: 'function coinChange(coins, amount) {\n  coins.sort((a, b) => b - a);\n  let count = 0;\n  \n  for (const coin of coins) {\n    while (amount >= coin) {\n      amount -= coin;\n      count++;\n    }\n  }\n  \n  return amount === 0 ? count : -1;\n}',
      context: 'Algorithms',
      tags: ['technique', 'algorithm']
    },
    {
      id: 'algo-recursion',
      name: 'Recursion',
      shortcut: '',
      description: 'Function that calls itself to solve problems',
      syntax: 'function factorial(n) {\n  // Base case\n  if (n <= 1) return 1;\n  \n  // Recursive case\n  return n * factorial(n - 1);\n}\n\nfunction power(base, exponent) {\n  if (exponent === 0) return 1;\n  return base * power(base, exponent - 1);\n}',
      context: 'Algorithms',
      tags: ['technique', 'algorithm']
    }
  ],
  'database': [
    {
      id: 'db-sql-select',
      name: 'SQL SELECT',
      shortcut: '',
      description: 'Retrieve data from a database',
      syntax: 'SELECT column1, column2\nFROM table_name\nWHERE condition\nORDER BY column1 [ASC|DESC];',
      context: 'SQL',
      tags: ['query', 'database', 'sql']
    },
    {
      id: 'db-sql-join',
      name: 'SQL JOIN',
      shortcut: '',
      description: 'Combine rows from two or more tables',
      syntax: 'SELECT table1.column1, table2.column2\nFROM table1\nINNER JOIN table2 ON table1.common_field = table2.common_field;\n\n-- LEFT JOIN\nSELECT * FROM table1\nLEFT JOIN table2 ON table1.id = table2.table1_id;\n\n-- RIGHT JOIN\nSELECT * FROM table1\nRIGHT JOIN table2 ON table1.id = table2.table1_id;',
      context: 'SQL',
      tags: ['query', 'database', 'sql']
    },
    {
      id: 'db-sql-insert',
      name: 'SQL INSERT',
      shortcut: '',
      description: 'Insert new records into a table',
      syntax: 'INSERT INTO table_name (column1, column2)\nVALUES (value1, value2);\n\n-- Insert multiple rows\nINSERT INTO table_name (column1, column2)\nVALUES (value1, value2), (value3, value4);',
      context: 'SQL',
      tags: ['query', 'database', 'sql']
    },
    {
      id: 'db-sql-update',
      name: 'SQL UPDATE',
      shortcut: '',
      description: 'Modify existing records',
      syntax: 'UPDATE table_name\nSET column1 = value1, column2 = value2\nWHERE condition;',
      context: 'SQL',
      tags: ['query', 'database', 'sql']
    },
    {
      id: 'db-sql-delete',
      name: 'SQL DELETE',
      shortcut: '',
      description: 'Remove records from a table',
      syntax: 'DELETE FROM table_name\nWHERE condition;\n\n-- Delete all records\nDELETE FROM table_name;',
      context: 'SQL',
      tags: ['query', 'database', 'sql']
    },
    {
      id: 'db-sql-group-by',
      name: 'SQL GROUP BY',
      shortcut: '',
      description: 'Group rows that have the same values',
      syntax: 'SELECT column1, COUNT(*)\nFROM table_name\nGROUP BY column1\nHAVING COUNT(*) > 1;',
      context: 'SQL',
      tags: ['query', 'database', 'sql']
    },
    {
      id: 'db-sql-indexes',
      name: 'SQL Indexes',
      shortcut: '',
      description: 'Improve query performance with indexes',
      syntax: '-- Create index\nCREATE INDEX idx_name ON table_name (column_name);\n\n-- Create unique index\nCREATE UNIQUE INDEX idx_unique ON table_name (column_name);\n\n-- Drop index\nDROP INDEX idx_name;',
      context: 'SQL',
      tags: ['performance', 'database', 'sql']
    },
    {
      id: 'db-sql-transactions',
      name: 'SQL Transactions',
      shortcut: '',
      description: 'Group SQL statements into atomic operations',
      syntax: 'BEGIN TRANSACTION;\n\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\n\nCOMMIT;\n\n-- Or rollback on error\nROLLBACK;',
      context: 'SQL',
      tags: ['transaction', 'database', 'sql']
    },
    {
      id: 'db-sql-views',
      name: 'SQL Views',
      shortcut: '',
      description: 'Virtual tables based on SQL query results',
      syntax: 'CREATE VIEW view_name AS\nSELECT column1, column2\nFROM table_name\nWHERE condition;\n\n-- Use view\nSELECT * FROM view_name;\n\n-- Drop view\nDROP VIEW view_name;',
      context: 'SQL',
      tags: ['view', 'database', 'sql']
    },
    {
      id: 'db-sql-stored-procedures',
      name: 'Stored Procedures',
      shortcut: '',
      description: 'Precompiled SQL statements stored in database',
      syntax: 'CREATE PROCEDURE procedure_name\n@param1 INT,\n@param2 VARCHAR(50)\nAS\nBEGIN\n  SELECT * FROM table_name\n  WHERE column1 = @param1 AND column2 = @param2;\nEND;\n\n-- Execute procedure\nEXEC procedure_name @param1 = 1, @param2 = \'value\';',
      context: 'SQL',
      tags: ['procedure', 'database', 'sql']
    }
  ],
  'devops': [
    {
      id: 'devops-docker-run',
      name: 'Docker Run',
      shortcut: '',
      description: 'Run a command in a new container',
      syntax: 'docker run [OPTIONS] IMAGE [COMMAND] [ARG...]\n\n# Examples\ndocker run -d -p 8080:80 nginx\ndocker run -it ubuntu bash\ndocker run --name mycontainer nginx',
      context: 'Docker',
      tags: ['container', 'docker', 'devops']
    },
    {
      id: 'devops-docker-build',
      name: 'Docker Build',
      shortcut: '',
      description: 'Build an image from a Dockerfile',
      syntax: 'docker build -t image-name:tag .\n\n# Build with context\ndocker build -t myapp:latest -f Dockerfile .\n\n# Build with build args\ndocker build --build-arg NODE_ENV=production -t myapp .',
      context: 'Docker',
      tags: ['container', 'docker', 'devops']
    },
    {
      id: 'devops-docker-compose',
      name: 'Docker Compose',
      shortcut: '',
      description: 'Define and run multi-container applications',
      syntax: '# docker-compose.yml\nversion: \'3\'\nservices:\n  web:\n    build: .\n    ports:\n      - "3000:3000"\n  db:\n    image: postgres\n    environment:\n      POSTGRES_PASSWORD: password',
      context: 'Docker',
      tags: ['container', 'docker', 'devops']
    },
    {
      id: 'devops-ci-cd',
      name: 'CI/CD Pipeline',
      shortcut: '',
      description: 'Continuous Integration and Continuous Delivery pipeline',
      syntax: '# Example GitHub Actions workflow\nname: CI/CD Pipeline\n\non:\n  push:\n    branches: [ main ]\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v2\n      - name: Build and test\n        run: |\n          npm install\n          npm test\n      - name: Deploy\n        if: success()\n        run: npm run deploy',
      context: 'DevOps',
      tags: ['ci/cd', 'pipeline', 'devops']
    },
    {
      id: 'devops-kubernetes',
      name: 'Kubernetes Basics',
      shortcut: '',
      description: 'Container orchestration commands',
      syntax: '# Get pods\nkubectl get pods\n\n# Describe pod\nkubectl describe pod pod-name\n\n# Apply configuration\nkubectl apply -f deployment.yaml\n\n# Delete resource\nkubectl delete deployment deployment-name',
      context: 'Kubernetes',
      tags: ['kubernetes', 'devops']
    },
    {
      id: 'devops-nginx',
      name: 'Nginx Configuration',
      shortcut: '',
      description: 'Web server and reverse proxy configuration',
      syntax: 'server {\n    listen 80;\n    server_name example.com;\n    \n    location / {\n        proxy_pass http://backend:3000;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n    }\n}',
      context: 'Nginx',
      tags: ['nginx', 'devops']
    },
    {
      id: 'devops-monitoring',
      name: 'Monitoring & Logging',
      shortcut: '',
      description: 'Monitor applications and collect logs',
      syntax: '# View logs\ndocker logs container-name\n\n# Follow logs\ndocker logs -f container-name\n\n# View resource usage\ndocker stats\n\n# Kubernetes logs\nkubectl logs pod-name',
      context: 'DevOps',
      tags: ['monitoring', 'logging', 'devops']
    },
    {
      id: 'devops-env-vars',
      name: 'Environment Variables',
      shortcut: '',
      description: 'Manage environment variables in containers',
      syntax: '# Docker\ndocker run -e VAR_NAME=value image\n\n# Docker Compose\nservices:\n  app:\n    environment:\n      - NODE_ENV=production\n      - API_KEY=secret\n\n# Kubernetes\nenv:\n  - name: VAR_NAME\n    value: "value"',
      context: 'DevOps',
      tags: ['environment', 'devops']
    },
    {
      id: 'devops-volumes',
      name: 'Volumes & Storage',
      shortcut: '',
      description: 'Persistent storage for containers',
      syntax: '# Docker volume\ndocker volume create myvolume\ndocker run -v myvolume:/data image\n\n# Docker Compose\nvolumes:\n  - ./data:/app/data\n  - myvolume:/app/storage\n\n# Kubernetes PersistentVolume\napiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: mypvc',
      context: 'DevOps',
      tags: ['storage', 'devops']
    },
    {
      id: 'devops-networking',
      name: 'Networking',
      shortcut: '',
      description: 'Container networking configuration',
      syntax: '# Docker network\ndocker network create mynetwork\ndocker run --network mynetwork image\n\n# Docker Compose\nnetworks:\n  frontend:\n  backend:\n\n# Kubernetes Service\napiVersion: v1\nkind: Service\nmetadata:\n  name: my-service\nspec:\n  selector:\n    app: my-app\n  ports:\n    - port: 80',
      context: 'DevOps',
      tags: ['networking', 'devops']
    }
  ],
  'best-practices': [
    {
      id: 'bp-solid',
      name: 'SOLID Principles',
      shortcut: '',
      description: 'Five design principles for building maintainable software',
      syntax: '1. Single Responsibility Principle\n2. Open/Closed Principle\n3. Liskov Substitution Principle\n4. Interface Segregation Principle\n5. Dependency Inversion Principle',
      context: 'Software Design',
      tags: ['design', 'principles', 'best practices']
    },
    {
      id: 'bp-code-review',
      name: 'Code Review Checklist',
      shortcut: '',
      description: 'Common things to look for when reviewing code',
      syntax: '- Does the code work?\n- Is the code readable and maintainable?\n- Does it follow the style guide?\n- Are there tests?\n- Is error handling adequate?\n- Are there security concerns?\n- Is there duplicate code that could be refactored?',
      context: 'Development Process',
      tags: ['review', 'quality', 'best practices']
    },
    {
      id: 'bp-naming-conventions',
      name: 'Naming Conventions',
      shortcut: '',
      description: 'Best practices for naming variables, functions, and classes',
      syntax: '// Use descriptive names\nconst userCount = 10; // Good\nconst uc = 10; // Bad\n\n// Use camelCase for variables/functions\nconst userName = "John";\nfunction getUserData() {}\n\n// Use PascalCase for classes\nclass UserManager {}\n\n// Use UPPER_CASE for constants\nconst MAX_RETRIES = 3;',
      context: 'Coding Standards',
      tags: ['naming', 'best practices']
    },
    {
      id: 'bp-error-handling',
      name: 'Error Handling',
      shortcut: '',
      description: 'Proper error handling strategies',
      syntax: '// Try-catch for async operations\ntry {\n  const data = await fetchData();\n} catch (error) {\n  console.error("Error:", error);\n  // Handle error appropriately\n}\n\n// Validate inputs\nfunction processUser(user) {\n  if (!user || !user.email) {\n    throw new Error("Invalid user data");\n  }\n  // Process user\n}',
      context: 'Coding Standards',
      tags: ['error handling', 'best practices']
    },
    {
      id: 'bp-testing',
      name: 'Testing Best Practices',
      shortcut: '',
      description: 'Write effective tests',
      syntax: '// Unit test example\ndescribe("calculateTotal", () => {\n  it("should return sum of all items", () => {\n    const items = [1, 2, 3];\n    expect(calculateTotal(items)).toBe(6);\n  });\n  \n  it("should handle empty array", () => {\n    expect(calculateTotal([])).toBe(0);\n  });\n});',
      context: 'Testing',
      tags: ['testing', 'best practices']
    },
    {
      id: 'bp-security',
      name: 'Security Best Practices',
      shortcut: '',
      description: 'Common security considerations',
      syntax: '// Never expose secrets\n// Bad: const apiKey = "secret123";\n// Good: Use environment variables\nconst apiKey = process.env.API_KEY;\n\n// Sanitize user input\nfunction sanitizeInput(input) {\n  return input.replace(/<script[^>]*>.*?<\\/script>/gi, "");\n}\n\n// Use HTTPS\n// Always use HTTPS in production\n// Validate and sanitize all inputs',
      context: 'Security',
      tags: ['security', 'best practices']
    },
    {
      id: 'bp-performance',
      name: 'Performance Optimization',
      shortcut: '',
      description: 'Optimize code for better performance',
      syntax: '// Use memoization\nconst memoizedFunction = useMemo(() => {\n  return expensiveCalculation(data);\n}, [data]);\n\n// Debounce expensive operations\nconst debouncedSearch = debounce((query) => {\n  performSearch(query);\n}, 300);\n\n// Lazy load components\nconst LazyComponent = React.lazy(() => import("./Component"));',
      context: 'Performance',
      tags: ['performance', 'best practices']
    },
    {
      id: 'bp-documentation',
      name: 'Code Documentation',
      shortcut: '',
      description: 'Write clear and helpful documentation',
      syntax: '/**\n * Calculates the total price including tax\n * @param {number} price - The base price\n * @param {number} taxRate - The tax rate (0-1)\n * @returns {number} The total price with tax\n */\nfunction calculateTotal(price, taxRate) {\n  return price * (1 + taxRate);\n}',
      context: 'Documentation',
      tags: ['documentation', 'best practices']
    },
    {
      id: 'bp-git-workflow',
      name: 'Git Workflow',
      shortcut: '',
      description: 'Best practices for Git workflow',
      syntax: '# Feature branch workflow\n1. Create feature branch: git checkout -b feature/new-feature\n2. Make changes and commit: git commit -m "Add new feature"\n3. Push branch: git push origin feature/new-feature\n4. Create pull request\n5. Review and merge\n6. Delete branch after merge',
      context: 'Version Control',
      tags: ['git', 'workflow', 'best practices']
    },
    {
      id: 'bp-api-design',
      name: 'API Design',
      shortcut: '',
      description: 'Design RESTful APIs',
      syntax: '// RESTful endpoints\nGET    /api/users          // List users\nGET    /api/users/:id       // Get user\nPOST   /api/users           // Create user\nPUT    /api/users/:id       // Update user\nDELETE /api/users/:id       // Delete user\n\n// Use proper HTTP status codes\n200 OK\n201 Created\n400 Bad Request\n404 Not Found\n500 Server Error',
      context: 'API Design',
      tags: ['api', 'design', 'best practices']
    }
  ],
  'app-creation': [
    {
      id: 'app-react',
      name: 'ReactJS',
      shortcut: '',
      description: 'Create a new React application using Create React App',
      syntax: 'npx create-react-app my-app\ncd my-app\nnpm start',
      context: 'React',
      tags: ['react', 'javascript', 'frontend', 'app creation']
    },
    {
      id: 'app-angular',
      name: 'Angular',
      shortcut: '',
      description: 'Create a new Angular application using Angular CLI',
      syntax: 'npx @angular/cli new my-app\ncd my-app\nng serve',
      context: 'Angular',
      tags: ['angular', 'typescript', 'frontend', 'app creation']
    },
    {
      id: 'app-vue',
      name: 'Vue.js',
      shortcut: '',
      description: 'Create a new Vue.js application',
      syntax: 'npm create vue@latest my-app\ncd my-app\nnpm install\nnpm run dev',
      context: 'Vue.js',
      tags: ['vue', 'javascript', 'frontend', 'app creation']
    },
    {
      id: 'app-nextjs',
      name: 'Next.js',
      shortcut: '',
      description: 'Create a new Next.js application',
      syntax: 'npx create-next-app@latest my-app\ncd my-app\nnpm run dev',
      context: 'Next.js',
      tags: ['nextjs', 'react', 'fullstack', 'app creation']
    },
    {
      id: 'app-sveltekit',
      name: 'SvelteKit',
      shortcut: '',
      description: 'Create a new SvelteKit application',
      syntax: 'npm create svelte@latest my-app\ncd my-app\nnpm install\nnpm run dev',
      context: 'SvelteKit',
      tags: ['svelte', 'javascript', 'frontend', 'app creation']
    },
    {
      id: 'app-react-native',
      name: 'React Native',
      shortcut: '',
      description: 'Create a new React Native application',
      syntax: 'npx react-native@latest init MyApp\ncd MyApp\nnpx react-native run-android\n# or\nnpx react-native run-ios',
      context: 'React Native',
      tags: ['react', 'mobile', 'app creation']
    },
    {
      id: 'app-flutter',
      name: 'Flutter',
      shortcut: '',
      description: 'Create a new Flutter application',
      syntax: 'flutter create my_app\ncd my_app\nflutter run',
      context: 'Flutter',
      tags: ['flutter', 'dart', 'mobile', 'app creation']
    },
    {
      id: 'app-express',
      name: 'Express.js',
      shortcut: '',
      description: 'Create a new Express.js application',
      syntax: 'mkdir my-app\ncd my-app\nnpm init -y\nnpm install express\n\n# Create app.js\n# const express = require(\'express\');\n# const app = express();\n# app.listen(3000, () => console.log(\'Server running on port 3000\'));',
      context: 'Express.js',
      tags: ['express', 'nodejs', 'backend', 'app creation']
    },
    {
      id: 'app-spring-boot',
      name: 'Spring Boot',
      shortcut: '',
      description: 'Create a new Spring Boot application',
      syntax: '# Using Spring Initializr\ncurl https://start.spring.io/starter.zip -d dependencies=web -d javaVersion=17 -o my-app.zip\nunzip my-app.zip\ncd my-app\n./mvnw spring-boot:run\n\n# Or use Spring CLI\nspring init --dependencies=web my-app',
      context: 'Spring Boot',
      tags: ['spring', 'java', 'backend', 'app creation']
    },
    {
      id: 'app-django',
      name: 'Django',
      shortcut: '',
      description: 'Create a new Django application',
      syntax: 'pip install django\ndjango-admin startproject myproject\ncd myproject\npython manage.py startapp myapp\npython manage.py runserver',
      context: 'Django',
      tags: ['django', 'python', 'backend', 'app creation']
    },
    {
      id: 'app-rails',
      name: 'Rails',
      shortcut: '',
      description: 'Create a new Ruby on Rails application',
      syntax: 'gem install rails\nrails new my-app\ncd my-app\nrails server',
      context: 'Rails',
      tags: ['rails', 'ruby', 'fullstack', 'app creation']
    },
    {
      id: 'app-electron',
      name: 'Electron',
      shortcut: '',
      description: 'Create a new Electron application',
      syntax: 'mkdir my-app\ncd my-app\nnpm init -y\nnpm install --save-dev electron\n\n# Add to package.json:\n# "main": "main.js",\n# "scripts": { "start": "electron ." }',
      context: 'Electron',
      tags: ['electron', 'desktop', 'app creation']
    },
    {
      id: 'app-wordpress',
      name: 'WordPress (WP-CLI)',
      shortcut: '',
      description: 'Create a new WordPress site using WP-CLI',
      syntax: '# Install WP-CLI first\n# Download wp-cli.phar\n\n# Download WordPress\nwp core download\n\n# Create config\nwp config create --dbname=mydb --dbuser=user --dbpass=pass\n\n# Install WordPress\nwp core install --url=example.com --title="My Site" --admin_user=admin --admin_password=pass --admin_email=admin@example.com',
      context: 'WordPress',
      tags: ['wordpress', 'php', 'cms', 'app creation']
    },
    {
      id: 'app-gatsby',
      name: 'Gatsby',
      shortcut: '',
      description: 'Create a new Gatsby application',
      syntax: 'npm install -g gatsby-cli\ngatsby new my-app\ncd my-app\ngatsby develop',
      context: 'Gatsby',
      tags: ['gatsby', 'react', 'static', 'app creation']
    },
    {
      id: 'app-hugo',
      name: 'Hugo',
      shortcut: '',
      description: 'Create a new Hugo static site',
      syntax: '# Install Hugo first\n# brew install hugo (macOS)\n# choco install hugo (Windows)\n\nhugo new site my-site\ncd my-site\nhugo new posts/my-first-post.md\nhugo server -D',
      context: 'Hugo',
      tags: ['hugo', 'static', 'golang', 'app creation']
    },
    {
      id: 'app-jekyll',
      name: 'Jekyll',
      shortcut: '',
      description: 'Create a new Jekyll static site',
      syntax: 'gem install bundler jekyll\njekyll new my-site\ncd my-site\nbundle exec jekyll serve',
      context: 'Jekyll',
      tags: ['jekyll', 'ruby', 'static', 'app creation']
    }
  ]
};
