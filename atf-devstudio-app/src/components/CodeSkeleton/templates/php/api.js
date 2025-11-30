// templates/php/api.js

/**
 * PHP Simple Standalone API Template (No Framework)
 */
const api = (options) => {
    const {
      includeComments = true,
      apiName = 'users',
      className = 'User'
    } = options || {}; // Added default empty object for safety

    const lowerClassName = className.toLowerCase();

    return `<?php
${includeComments ? `/**
 * Simple REST API for ${className} resources (Standalone - No Framework)
 *
 * This script provides basic CRUD and search functionality for ${className} resources.
 * It uses a mock in-memory array for data storage. Replace with a real database
 * connection (like PDO or MySQLi) for production use.
 *
 * @author Your Name <your.email@example.com>
 *
 * --- How to Use ---
 * 1. Place this file on your PHP server (e.g., api.php).
 * 2. Configure your web server (Apache/Nginx) to route requests like
 * /api.php/${apiName} and /api.php/${apiName}/{id} to this script.
 * Alternatively, use PHP's built-in server: php -S localhost:8000 api.php
 * Then access endpoints like http://localhost:8000/${apiName}
 * 3. Send HTTP requests (GET, POST, PUT, DELETE) to the appropriate endpoints.
 *
 * --- Endpoints ---
 * GET    /${apiName}          - List all ${apiName}
 * GET    /${apiName}/{id}     - Get a single ${lowerClassName} by ID
 * POST   /${apiName}          - Create a new ${lowerClassName} (JSON body required)
 * PUT    /${apiName}/{id}     - Update an existing ${lowerClassName} (JSON body required)
 * DELETE /${apiName}/{id}     - Delete a ${lowerClassName} by ID
 * GET    /${apiName}/search?q={query} - Search ${apiName} by name or email
 *
 */` : ''}

// --- Basic Setup ---
error_reporting(E_ALL);
ini_set('display_errors', 1); // Show errors for debugging (disable in production)
header('Content-Type: application/json'); // Set default response type

// --- Mock Database ---
// In a real application, replace this with a database connection and queries.
// Consider using environment variables for DB credentials.
/*
${includeComments ? `// Example PDO Connection (uncomment and configure if needed)
$host = '127.0.0.1';
$dbname = 'your_database_name';
$username = 'your_db_username';
$password = 'your_db_password';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];
try {
     $pdo = new PDO($dsn, $username, $password, $options);
} catch (\\PDOException $e) {
     sendResponse(['error' => 'Database connection failed: ' . $e->getMessage()], 500);
}
` : ''}
*/
// Using a static array for demonstration
$${apiName}_data = [
    1 => ['id' => 1, 'name' => 'John Doe', 'email' => 'john@example.com', 'is_active' => true],
    2 => ['id' => 2, 'name' => 'Jane Smith', 'email' => 'jane@example.com', 'is_active' => true],
    3 => ['id' => 3, 'name' => 'Peter Jones', 'email' => 'peter@example.com', 'is_active' => false],
];
$next_id = 4; // Simple auto-increment simulation

// --- Helper Functions ---

/**
 * Sends a JSON response and terminates the script.
 * @param mixed $data The data to encode as JSON.
 * @param int $statusCode The HTTP status code (default: 200).
 */
function sendResponse($data, int $statusCode = 200): void {
    http_response_code($statusCode);
    echo json_encode($data, JSON_PRETTY_PRINT); // Use pretty print for readability
    exit();
}

/**
 * Gets the JSON input from the request body.
 * @return array|null The decoded JSON data or null on failure.
 */
function getJsonInput(): ?array {
    $input = file_get_contents('php://input');
    if ($input === false) {
        return null;
    }
    $data = json_decode($input, true); // Decode as associative array
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendResponse(['error' => 'Invalid JSON input: ' . json_last_error_msg()], 400);
    }
    return $data;
}

/**
 * Basic input validation (example).
 * @param array $data The input data.
 * @param array $rules Validation rules ['field' => 'type|required'].
 * @return array List of validation errors.
 */
function validateInput(array $data, array $rules): array {
    $errors = [];
    foreach ($rules as $field => $rule) {
        $checks = explode('|', $rule);
        $value = $data[$field] ?? null;

        if (in_array('required', $checks) && ($value === null || $value === '')) {
            $errors[$field][] = 'The ' . $field . ' field is required.';
            continue; // Skip other checks if required field is missing
        }

        if ($value !== null) {
             if (in_array('string', $checks) && !is_string($value)) {
                 $errors[$field][] = 'The ' . $field . ' must be a string.';
             }
             if (in_array('email', $checks) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                 $errors[$field][] = 'The ' . $field . ' must be a valid email address.';
             }
             if (in_array('boolean', $checks) && !is_bool($value)) {
                 $errors[$field][] = 'The ' . $field . ' must be true or false.';
             }
             if (in_array('integer', $checks) && !filter_var($value, FILTER_VALIDATE_INT)) {
                  $errors[$field][] = 'The ' . $field . ' must be an integer.';
             }
             // Add more validation rules as needed (max length, unique (needs DB check), etc.)
        }
    }
    return $errors;
}


// --- Request Routing ---
// Simple routing based on request method and path info.
// Assumes PATH_INFO is available (e.g., /api.php/${apiName}/1 -> PATH_INFO = /${apiName}/1)
// This might need adjustment based on server configuration (mod_rewrite, etc.).
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '/'; // Get path relative to the script
$pathSegments = explode('/', trim($path, '/'));

$resource = $pathSegments[0] ?? null;
$resourceId = isset($pathSegments[1]) && is_numeric($pathSegments[1]) ? (int)$pathSegments[1] : null;
$action = $resourceId === null && isset($pathSegments[1]) ? $pathSegments[1] : null; // For actions like 'search'

// --- API Logic ---

// Check if the request targets the correct resource
if ($resource !== '${apiName}') {
     if ($resource === null && $method === 'GET' && $path ==='/') {
         sendResponse(['message' => 'Welcome to the Simple ${className} API!', 'endpoints' => [
            "GET /${apiName}" => "List all ${apiName}",
            "GET /${apiName}/{id}" => "Get single ${lowerClassName}",
            "POST /${apiName}" => "Create new ${lowerClassName}",
            "PUT /${apiName}/{id}" => "Update ${lowerClassName}",
            "DELETE /${apiName}/{id}" => "Delete ${lowerClassName}",
            "GET /${apiName}/search?q={query}" => "Search ${apiName}"
         ]]);
     } else {
         sendResponse(['error' => 'Resource not found: ' . ($resource ?? 'None specified')], 404);
     }
}

// Handle search action separately
if ($action === 'search' && $method === 'GET') {
    $query = $_GET['q'] ?? null;
    if ($query === null || $query === '') {
        sendResponse(['error' => 'Search query parameter "q" is required'], 400);
    }

    $results = [];
    // In a real app, use a database query (e.g., WHERE name LIKE ? OR email LIKE ?)
    foreach ($${apiName}_data as $item) {
        if (stripos($item['name'], $query) !== false || stripos($item['email'], $query) !== false) {
            $results[] = $item;
        }
    }
    sendResponse(['data' => $results]);
}

// Handle standard CRUD operations
switch ($method) {
    case 'GET':
        if ($resourceId !== null) {
            // --- Get single ${lowerClassName} ---
            if (!isset($${apiName}_data[$resourceId])) {
                sendResponse(['error' => '${className} not found'], 404);
            }
            sendResponse(['data' => $${apiName}_data[$resourceId]]);
        } else {
            // --- List all ${apiName} ---
            // Convert associative array to indexed array for JSON output
            sendResponse(['data' => array_values($${apiName}_data)]);
        }
        break;

    case 'POST':
        if ($resourceId !== null) {
             sendResponse(['error' => 'Method Not Allowed for specific resource ID'], 405);
        }
        // --- Create new ${lowerClassName} ---
        $data = getJsonInput();
        if ($data === null) {
            sendResponse(['error' => 'No JSON data provided'], 400);
        }

        // Validation
        $validationRules = [
            'name' => 'required|string',
            'email' => 'required|email', // Add unique check against $${apiName}_data if needed
            'is_active' => 'boolean', // Optional, defaults below
        ];
        $errors = validateInput($data, $validationRules);
        // Add unique email check (simulation)
        foreach($${apiName}_data as $existing) {
             if (isset($data['email']) && $existing['email'] === $data['email']) {
                 $errors['email'][] = 'The email has already been taken.';
                 break;
             }
        }
        if (!empty($errors)) {
            sendResponse(['errors' => $errors], 422); // Unprocessable Entity
        }

        // Prepare new item (replace with DB insert)
        global $next_id; // Use global counter
        $newItem = [
            'id' => $next_id,
            'name' => $data['name'],
            'email' => $data['email'],
            'is_active' => $data['is_active'] ?? true, // Default to true if not provided
        ];
        $${apiName}_data[$next_id] = $newItem;
        $next_id++; // Increment for next insert

        sendResponse(['data' => $newItem, 'message' => '${className} created successfully'], 201); // Created
        break;

    case 'PUT':
        if ($resourceId === null) {
            sendResponse(['error' => 'Resource ID is required for PUT request'], 400);
        }
        if (!isset($${apiName}_data[$resourceId])) {
            sendResponse(['error' => '${className} not found'], 404);
        }

        // --- Update existing ${lowerClassName} ---
        $data = getJsonInput();
        if ($data === null) {
            sendResponse(['error' => 'No JSON data provided for update'], 400);
        }

        // Validation (similar to POST, but fields are often optional, use 'sometimes')
         $validationRules = [
             'name' => 'string', // Not required, only validate if present
             'email' => 'email', // Add unique check if needed, ignoring current ID
             'is_active' => 'boolean',
         ];
         $errors = validateInput($data, $validationRules);
         // Add unique email check for update (simulation)
         if (isset($data['email'])) {
             foreach($${apiName}_data as $existing) {
                 if ($existing['id'] !== $resourceId && $existing['email'] === $data['email']) {
                     $errors['email'][] = 'The email has already been taken.';
                     break;
                 }
             }
         }
        if (!empty($errors)) {
            sendResponse(['errors' => $errors], 422);
        }

        // Update item (replace with DB update)
        $updatedItem = $${apiName}_data[$resourceId];
        if (isset($data['name'])) $updatedItem['name'] = $data['name'];
        if (isset($data['email'])) $updatedItem['email'] = $data['email'];
        if (isset($data['is_active'])) $updatedItem['is_active'] = $data['is_active'];
        $${apiName}_data[$resourceId] = $updatedItem;

        sendResponse(['data' => $updatedItem, 'message' => '${className} updated successfully']);
        break;

    case 'DELETE':
        if ($resourceId === null) {
            sendResponse(['error' => 'Resource ID is required for DELETE request'], 400);
        }
        if (!isset($${apiName}_data[$resourceId])) {
            sendResponse(['error' => '${className} not found'], 404);
        }

        // --- Delete ${lowerClassName} ---
        // In a real app, use DELETE FROM ... WHERE id = ? or handle soft deletes
        unset($${apiName}_data[$resourceId]);

        sendResponse(['message' => '${className} deleted successfully']);
        break;

    default:
        // --- Method Not Allowed ---
        sendResponse(['error' => 'Method ' . $method . ' not allowed for this resource'], 405);
        break;
}

// Fallback if script somehow reaches here without exiting in sendResponse()
sendResponse(['error' => 'An unexpected error occurred'], 500);
?>`; // Note: Closing ?> tag is often omitted in pure PHP files, but included here for clarity
};

export default api;