// templates/javascript/javascriptApi.js
// JavaScript API Endpoint Template (Express.js example)

export const jsApi = (options) => { // Renamed to jsApi
    const {
      includeComments = true,
      includeTests = false,
      apiName = 'items', // Resource name (plural)
      functionName = 'getItemHandler' // Handler function name
    } = options || {}; // Added default object for safety
  
    const resourceNameSingular = apiName.endsWith('s') ? apiName.slice(0, -1) : apiName; // e.g., item
  
    // Use regular spaces for indentation within the template literal
    return `// Assuming Express setup (e.g., in server.js or routes/items.js)
  // import express from 'express';
  // const router = express.Router();
  
  ${includeComments ? `/**
   * Handler for GET /api/${apiName}/:id
   * Retrieves a single ${resourceNameSingular} by its ID.
   *
   * @param {object} req - Express request object. Contains request params, query, body.
   * @param {object} res - Express response object. Used to send responses.
   * @param {function} next - Express next middleware function.
   */` : ""}
  const ${functionName} = async (req, res, next) => {
    ${includeComments ? '// Extract ID from request parameters\n' : ''}
    const { id } = req.params;
    ${includeComments ? '//const { verbose } = req.query; // Example: Get query parameter\n' : ''}
  
    try {
      ${includeComments ? `// --- Input Validation (Example) ---
      // More robust validation might involve libraries like Joi or express-validator
      ` : ''}
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        ${includeComments ? '// Send a 400 Bad Request response for invalid ID format\n' : ''}
        return res.status(400).json({ success: false, message: 'Invalid ID format. ID must be a number.' });
      }
  
      ${includeComments ? `// --- Business Logic ---
      // Replace with your actual data fetching logic (e.g., database query)
      // const dataService = require('../services/${resourceNameSingular}Service');
      // const ${resourceNameSingular} = await dataService.findById(numericId);
      ` : ''}
      console.log(\`Fetching ${resourceNameSingular} with ID: \${numericId}\`);
      // Mock data fetching for demonstration
      const mockDatabase = { 1: { id: 1, name: 'Example ${resourceNameSingular} 1' }, 2: { id: 2, name: 'Example ${resourceNameSingular} 2' } };
      const ${resourceNameSingular} = mockDatabase[numericId];
  
      ${includeComments ? '// --- Response ---' : ''}
      if (!${resourceNameSingular}) {
        ${includeComments ? '// Send a 404 Not Found response if the item doesn\'t exist' : ''}
        return res.status(404).json({ success: false, message: '${resourceNameSingular.charAt(0).toUpperCase() + resourceNameSingular.slice(1)} not found.' });
      }
  
      ${includeComments ? '// Send a 200 OK response with the data\n' : ''}
      return res.status(200).json({
        success: true,
        data: ${resourceNameSingular},
        // ...(verbose && { details: 'Some extra details here' }) // Example conditional details
      });
  
    } catch (error) {
      ${includeComments ? `// --- Error Handling ---
      // Log the error for debugging purposes
      // Consider using a dedicated logger (like Winston or Pino)
      ` : ''}
      console.error(\`Error in ${functionName} [ID: \${id}]:\`, error);
  
      ${includeComments ? `// Pass the error to the Express error handling middleware
      // This allows for centralized error handling logic
      // next(error);
  
      // Or, send a generic 500 Internal Server Error response directly
      ` : ''}
      return res.status(500).json({
        success: false,
        message: 'An unexpected server error occurred.'
        // Avoid sending detailed internal error messages to the client in production
        // error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
  
  ${includeComments ? `
  // --- Example Usage with Express Router ---
  // router.get('/api/${apiName}/:id', ${functionName});
  // module.exports = router; // Or export default router;
  ` : ""}
  
  ${includeTests ? `
  // ================== TEST FILE (e.g., ${functionName}.test.js) ==================
  // Using Jest and supertest for integration testing Express handlers
  
  // const request = require('supertest');
  // const express = require('express'); // Need express to setup a test app
  
  // Import the handler function (assuming it's exported)
  // import { ${functionName} } from './path/to/your/handler/file'; // Adjust path
  
  // // --- Mock Dependencies (if any) ---
  // // Mock the data service if the handler uses one
  // // jest.mock('../services/${resourceNameSingular}Service', () => ({
  // //   findById: jest.fn(),
  // // }));
  // // const dataService = require('../services/${resourceNameSingular}Service');
  
  // // --- Setup Test Express App ---
  // const app = express();
  // // Apply necessary middleware if your handler relies on them (e.g., json parsing)
  // app.use(express.json());
  // // Mount the handler at the expected route
  // app.get('/api/${apiName}/:id', ${functionName});
  // // Add a basic error handler for testing 'next(error)' calls
  // app.use((err, req, res, next) => {
  //   console.error("Test Error Handler Caught:", err);
  //   res.status(500).json({ success: false, message: 'Test error handler caught error' });
  // });
  
  
  // describe('API Handler - ${functionName}', () => {
  
  //   beforeEach(() => {
  //     // Reset mocks before each test
  //     // dataService.findById.mockClear();
  //     // Reset mock implementation for database simulation used in handler
  //     // (Need to adjust based on how handler fetches data)
  //   });
  
  //   test('GET /api/${apiName}/:id - should return 200 OK and data for valid ID', async () => {
  //     const validId = 1;
  //     const expectedData = { id: validId, name: 'Example ${resourceNameSingular} 1' };
  //     // // Mock service response if using mocked service:
  //     // dataService.findById.mockResolvedValue(expectedData);
  
  //     const response = await request(app).get(\`/api/${apiName}/\${validId}\`);
  
  //     expect(response.statusCode).toBe(200);
  //     expect(response.body.success).toBe(true);
  //     expect(response.body.data).toEqual(expectedData);
  //     // // Verify service call if using mocked service:
  //     // expect(dataService.findById).toHaveBeenCalledWith(validId);
  //   });
  
  //   test('GET /api/${apiName}/:id - should return 404 Not Found for non-existent ID', async () => {
  //     const nonExistentId = 99;
  //      // // Mock service response if using mocked service:
  //     // dataService.findById.mockResolvedValue(null); // Simulate not found
  
  //     const response = await request(app).get(\`/api/${apiName}/\${nonExistentId}\`);
  
  //     expect(response.statusCode).toBe(404);
  //     expect(response.body.success).toBe(false);
  //     expect(response.body.message).toMatch(/not found/i);
  //     // // Verify service call if using mocked service:
  //     // expect(dataService.findById).toHaveBeenCalledWith(nonExistentId);
  //   });
  
  //   test('GET /api/${apiName}/:id - should return 400 Bad Request for invalid ID format', async () => {
  //     const invalidId = 'abc';
  
  //     const response = await request(app).get(\`/api/${apiName}/\${invalidId}\`);
  
  //     expect(response.statusCode).toBe(400);
  //     expect(response.body.success).toBe(false);
  //     expect(response.body.message).toMatch(/Invalid ID format/i);
  //     // // Verify service was not called if validation happens early:
  //     // expect(dataService.findById).not.toHaveBeenCalled();
  //   });
  
  //   // Test for 500 error (requires mocking the service/logic to throw an error)
  //   // test('GET /api/${apiName}/:id - should return 500 Internal Server Error on unexpected error', async () => {
  //   //   const validId = 1;
  //   //   const errorMessage = 'Database connection lost';
  //   //   // Mock service to throw an error:
  //   //   dataService.findById.mockRejectedValue(new Error(errorMessage));
  //   //
  //   //   const response = await request(app).get(\`/api/${apiName}/\${validId}\`);
  //   //
  //   //   expect(response.statusCode).toBe(500);
  //   //   expect(response.body.success).toBe(false);
  //   //   expect(response.body.message).toMatch(/unexpected server error/i);
  //   // });
  
  // });
  ` : ""}
  
  // Export the handler function
  // export { ${functionName} };
  `;
  };