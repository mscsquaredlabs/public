// templates/javascript/javascriptCrud.js
// JavaScript CRUD Operations Template (Conceptual - requires specific context like ORM/DB driver)

export const jsCrud = (options) => { // Renamed to jsCrud
    const {
      includeComments = true,
      includeTests = false,
      className = 'Item', // The resource being managed (e.g., User, Product, Item)
      // Add options for specific ORM or library if needed (e.g., prisma, sequelize)
      // ormType = 'generic'
    } = options;
  
    const lowerClassName = className.toLowerCase(); // e.g., item
    const pluralClassName = lowerClassName.endsWith('s') ? lowerClassName : `${lowerClassName}s`; // Basic pluralization
  
    return `${includeComments ? `/**
   * @module ${className}CRUD
   * Provides asynchronous functions for CRUD (Create, Read, Update, Delete)
   * operations for ${className} resources.
   *
   * NOTE: This is a conceptual template. Implementation details depend heavily
   * on the database, ORM (like Prisma, Sequelize), or data storage mechanism used.
   * Replace placeholder comments with actual database interaction logic.
   */
  ` : ""}
  
  // --- Placeholder for Database Client/ORM Initialization ---
  ${includeComments ? `// Example using a generic client (replace with your actual setup)
  // const dbClient = require('../db/client'); // Your DB client module
  // Example using Prisma:
  // const { PrismaClient } = require('@prisma/client');
  // const prisma = new PrismaClient();
  ` : ""}
  const mockDb = { // In-memory mock DB for demonstration
    [pluralClassName]: {},
    nextId: 1
  };
  
  
  ${includeComments ? `/**
   * Creates a new ${className}.
   * @param {object} data - The data for the new ${className}. Should not contain an ID.
   * @returns {Promise<object>} The newly created ${className} object (including its generated ID).
   * @throws {Error} If creation fails (e.g., validation error, DB error).
   */` : ""}
  export async function create${className}(data) {
    ${includeComments ? '// --- Input Validation (Essential!) ---\n' : ''}
    if (!data || typeof data !== 'object' || data.id) {
      throw new Error('Invalid data provided for creation. Must be an object without an ID.');
    }
    // Add more specific validation based on your ${className} schema (e.g., required fields)
    if (!data.name) { // Example validation
       throw new Error('${className} name is required.');
    }
  
    console.log(\`Attempting to create ${className} with data:\`, data);
  
    try {
      ${includeComments ? `// --- Database/ORM Interaction ---
      // Replace with your actual logic:
      // Example (Generic):
      // const result = await dbClient.query('INSERT INTO ${pluralClassName}(name, ...) VALUES ($1, ...) RETURNING *', [data.name, ...]);
      // const new${className} = result.rows[0];
  
      // Example (Prisma):
      // const new${className} = await prisma.${lowerClassName}.create({ data: data });
  
      // Mock Implementation:
      ` : ""}
      const newId = mockDb.nextId++;
      const new${className} = { ...data, id: newId, createdAt: new Date().toISOString() };
      mockDb[pluralClassName][newId] = new${className};
  
      console.log(\`Successfully created ${className} with ID:\`, newId);
      return new${className};
  
    } catch (error) {
      console.error(\`Error creating ${className}:\`, error);
      // Re-throw or handle specific DB errors (e.g., unique constraint violation)
      throw new Error(\`Failed to create ${className}: \${error.message}\`);
    }
  }
  
  ${includeComments ? `/**
   * Retrieves all ${className}s. Supports optional filtering/pagination.
   * @param {object} [options={}] - Optional query options.
   * @param {object} options.filter - Filtering criteria (e.g., { isActive: true }).
   * @param {object} options.pagination - Pagination parameters (e.g., { limit: 10, offset: 0 }).
   * @param {object} options.sortBy - Sorting parameters (e.g., { field: 'name', order: 'ASC' }).
   * @returns {Promise<Array<object>>} A list of ${className} objects matching the criteria.
   * @throws {Error} If retrieval fails.
   */` : ""}
  export async function getAll${className}s(options = {}) {
    const { filter = {}, pagination = {}, sortBy = {} } = options;
    console.log('Attempting to get all ${pluralClassName} with options:', options);
  
    try {
      ${includeComments ? `// --- Database/ORM Interaction ---
      // Build query based on filter, pagination, sortBy
      // Example (Prisma):
      // const whereClause = buildPrismaWhere(filter); // Helper to convert filter to Prisma 'where'
      // const orderByClause = buildPrismaOrderBy(sortBy); // Helper for 'orderBy'
      // const ${pluralClassName} = await prisma.${lowerClassName}.findMany({
      //   where: whereClause,
      //   take: pagination.limit,
      //   skip: pagination.offset,
      //   orderBy: orderByClause
      // });
  
      // Mock Implementation (basic filtering):
      ` : ""}
      let results = Object.values(mockDb[pluralClassName]);
      if (filter.isActive !== undefined) {
          results = results.filter(item => item.isActive === filter.isActive);
      }
       if (filter.nameContains) {
          results = results.filter(item => item.name?.toLowerCase().includes(filter.nameContains.toLowerCase()));
      }
      // Add mock pagination/sorting if needed for demo
  
      console.log(\`Found \${results.length} ${pluralClassName}.\`);
      return results;
  
    } catch (error) {
      console.error(\`Error getting all ${pluralClassName}:\`, error);
      throw new Error(\`Failed to retrieve ${pluralClassName}: \${error.message}\`);
    }
  }
  
  ${includeComments ? `/**
   * Retrieves a single ${className} by its ID.
   * @param {string|number} id - The ID of the ${className} to retrieve.
   * @returns {Promise<object|null>} The ${className} object if found, otherwise null.
   * @throws {Error} If retrieval fails (excluding not found).
   */` : ""}
  export async function get${className}ById(id) {
     ${includeComments ? '// Basic validation\n' : ''}
    if (id === undefined || id === null) {
      throw new Error('ID must be provided to retrieve a ${className}.');
    }
    console.log(\`Attempting to get ${className} by ID:\`, id);
  
    try {
      ${includeComments ? `// --- Database/ORM Interaction ---
      // Example (Prisma):
      // const ${lowerClassName} = await prisma.${lowerClassName}.findUnique({ where: { id: Number(id) } }); // Ensure ID is correct type
      // Example (Generic):
      // const result = await dbClient.query('SELECT * FROM ${pluralClassName} WHERE id = $1', [id]);
      // const ${lowerClassName} = result.rows.length > 0 ? result.rows[0] : null;
  
      // Mock Implementation:
      ` : ""}
      const ${lowerClassName} = mockDb[pluralClassName][id] || null;
  
      if (${lowerClassName}) {
        console.log(\`Found ${className} with ID:\`, id);
      } else {
        console.log(\`${className} with ID \${id} not found.\`);
      }
      return ${lowerClassName};
  
    } catch (error) {
      console.error(\`Error getting ${className} by ID \${id}:\`, error);
      throw new Error(\`Failed to retrieve ${className} \${id}: \${error.message}\`);
    }
  }
  
  ${includeComments ? `/**
   * Updates an existing ${className} by its ID.
   * @param {string|number} id - The ID of the ${className} to update.
   * @param {object} data - An object containing the fields to update. Should not contain the ID.
   * @returns {Promise<object|null>} The updated ${className} object, or null if not found.
   * @throws {Error} If update fails (e.g., validation, DB error).
   */` : ""}
  export async function update${className}(id, data) {
    ${includeComments ? '// Basic validation\n' : ''}
    if (id === undefined || id === null) {
      throw new Error('ID must be provided to update a ${className}.');
    }
     if (!data || typeof data !== 'object' || data.id) {
      throw new Error('Invalid data provided for update. Must be an object without an ID.');
    }
    // Add specific field validation if needed
  
    console.log(\`Attempting to update ${className} \${id} with data:\`, data);
  
    try {
       ${includeComments ? `// --- Database/ORM Interaction ---
      // Check if exists first (optional but good practice)
      // Example (Prisma):
      // const updated${className} = await prisma.${lowerClassName}.update({
      //   where: { id: Number(id) },
      //   data: data, // Prisma handles partial updates
      // });
      // Example (Generic - SELECT then UPDATE or UPDATE ... RETURNING):
      // const checkResult = await dbClient.query('SELECT id FROM ${pluralClassName} WHERE id = $1 FOR UPDATE', [id]);
      // if (checkResult.rows.length === 0) return null;
      // const updateResult = await dbClient.query('UPDATE ${pluralClassName} SET name = $1, ... WHERE id = $2 RETURNING *', [data.name, ..., id]);
      // const updated${className} = updateResult.rows[0];
  
      // Mock Implementation:
      ` : ""}
      const existing${className} = mockDb[pluralClassName][id];
      if (!existing${className}) {
        console.log(\`${className} \${id} not found for update.\`);
        return null; // Return null if not found
      }
  
      // Apply updates (only specified fields)
      const updated${className} = { ...existing${className}, ...data, updatedAt: new Date().toISOString() };
      mockDb[pluralClassName][id] = updated${className};
  
      console.log(\`Successfully updated ${className} \${id}.\`);
      return updated${className};
  
    } catch (error) {
      console.error(\`Error updating ${className} \${id}:\`, error);
       // Handle specific errors like optimistic locking if applicable
      throw new Error(\`Failed to update ${className} \${id}: \${error.message}\`);
    }
  }
  
  ${includeComments ? `/**
   * Deletes a ${className} by its ID.
   * @param {string|number} id - The ID of the ${className} to delete.
   * @returns {Promise<boolean>} True if deletion was successful, false if not found.
   * @throws {Error} If deletion fails for other reasons (e.g., DB error).
   */` : ""}
  export async function delete${className}(id) {
    ${includeComments ? '// Basic validation\n' : ''}
    if (id === undefined || id === null) {
      throw new Error('ID must be provided to delete a ${className}.');
    }
    console.log(\`Attempting to delete ${className} with ID:\`, id);
  
    try {
      ${includeComments ? `// --- Database/ORM Interaction ---
      // Example (Prisma):
      // try {
      //   await prisma.${lowerClassName}.delete({ where: { id: Number(id) } });
      //   return true;
      // } catch (e) {
      //   if (e instanceof prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      //      // Record not found
      //     return false;
      //   }
      //   throw e; // Re-throw other errors
      // }
      // Example (Generic):
      // const result = await dbClient.query('DELETE FROM ${pluralClassName} WHERE id = $1', [id]);
      // return result.rowCount > 0; // Check if any row was actually deleted
  
      // Mock Implementation:
      ` : ""}
       if (!mockDb[pluralClassName][id]) {
          console.log(\`${className} \${id} not found for deletion.\`);
          return false; // Return false if not found
       }
  
       delete mockDb[pluralClassName][id];
       console.log(\`Successfully deleted ${className} \${id}.\`);
       return true;
  
    } catch (error) {
      console.error(\`Error deleting ${className} \${id}:\`, error);
      // Handle potential foreign key constraint errors if necessary
      throw new Error(\`Failed to delete ${className} \${id}: \${error.message}\`);
    }
  }
  
  
  ${includeTests ? `
  // ================== TEST FILE (e.g., ${className}CRUD.test.js) ==================
  // Using Jest
  
  // Import the CRUD functions
  import {
    create${className},
    getAll${className}s,
    get${className}ById,
    update${className},
    delete${className}
  } from './${className}CRUD'; // Adjust path
  
  // --- Mocking Dependencies ---
  // If using a real DB client/ORM, mock it here
  // jest.mock('../db/client'); // Mock the client module
  // const dbClient = require('../db/client');
  // Or mock Prisma client:
  // jest.mock('@prisma/client', () => {
  //   const mockPrisma = {
  //     ${lowerClassName}: {
  //       create: jest.fn(),
  //       findMany: jest.fn(),
  //       findUnique: jest.fn(),
  //       update: jest.fn(),
  //       delete: jest.fn(),
  //     },
  //   };
  //   return { PrismaClient: jest.fn(() => mockPrisma) };
  // });
  // const { PrismaClient } = require('@prisma/client');
  // const prisma = new PrismaClient();
  
  
  // Reset mockDb state before each test if using the in-memory mock
  let originalMockDbState;
  beforeAll(() => {
    // Store the initial state IF the mockDb is defined outside the functions
    // This requires mockDb to be accessible here or re-imported
    // For simplicity, we'll assume the mockDb used is the one in the CRUD file scope
    // If it's modified by tests, reset is needed.
  });
  
  beforeEach(() => {
    // Reset mocks if using jest.mock
    // prisma?.[${lowerClassName}]?.create.mockClear();
    // prisma?.[${lowerClassName}]?.findMany.mockClear();
    // ... reset other mocks
  
    // Reset the in-memory mock DB state if it's modified directly by tests
    // This is tricky if the mockDb is not exported. A better approach for testing
    // is mocking the layer that USES the db (like Prisma calls).
    // For this example, we'll assume the functions use the internal mockDb and test its state.
  });
  
  describe('${className} CRUD Operations', () => {
  
    describe('create${className}', () => {
      test('should create a new ${className} and return it with an ID', async () => {
        const inputData = { name: 'Test ${className}', value: 100 };
        // // Mock Prisma response:
        // const expectedResult = { ...inputData, id: 1, createdAt: expect.any(String) };
        // prisma.${lowerClassName}.create.mockResolvedValue(expectedResult);
  
        const result = await create${className}(inputData);
  
        expect(result).toHaveProperty('id');
        expect(result.id).toEqual(expect.any(Number)); // Or specific type if known
        expect(result.name).toBe(inputData.name);
        expect(result.value).toBe(inputData.value);
        expect(result).toHaveProperty('createdAt');
        // expect(prisma.${lowerClassName}.create).toHaveBeenCalledWith({ data: inputData }); // Verify mock call
      });
  
      test('should throw error for invalid input data (missing name)', async () => {
        const invalidData = { value: 100 };
        // Using await expect(...).rejects works well for async errors
        await expect(create${className}(invalidData)).rejects.toThrow('${className} name is required.');
        // expect(prisma.${lowerClassName}.create).not.toHaveBeenCalled();
      });
  
       test('should throw error for invalid input data (contains ID)', async () => {
        const invalidData = { id: 5, name: 'Invalid Create' };
        await expect(create${className}(invalidData)).rejects.toThrow(/Invalid data provided.*without an ID/);
        // expect(prisma.${lowerClassName}.create).not.toHaveBeenCalled();
      });
  
      // Add test for database error during creation if mocking allows
    });
  
    describe('getAll${className}s', () => {
       // Pre-populate mock DB for read tests or mock the findMany call
      let item1, item2;
      beforeAll(async () => { // Use beforeAll to setup data for all tests in this block
          item1 = await create${className}({ name: 'Read Test 1', isActive: true });
          item2 = await create${className}({ name: 'Read Test 2', isActive: false });
      });
  
      test('should return all ${className}s', async () => {
          // // Mock Prisma:
          // const mockItems = [item1, item2];
          // prisma.${lowerClassName}.findMany.mockResolvedValue(mockItems);
  
          const results = await getAll${className}s();
  
          expect(Array.isArray(results)).toBe(true);
          expect(results.length).toBeGreaterThanOrEqual(2); // Check length based on setup
          expect(results.map(i => i.id)).toEqual(expect.arrayContaining([item1.id, item2.id]));
          // expect(prisma.${lowerClassName}.findMany).toHaveBeenCalledWith({}); // Default options
      });
  
       test('should filter ${className}s (e.g., by isActive)', async () => {
          const filterOptions = { filter: { isActive: true } };
          // // Mock Prisma:
          // const mockItems = [item1]; // Only active item
          // prisma.${lowerClassName}.findMany.mockResolvedValue(mockItems);
  
          const results = await getAll${className}s(filterOptions);
  
          expect(results.length).toBe(1);
          expect(results[0].id).toBe(item1.id);
          expect(results[0].isActive).toBe(true);
          // expect(prisma.${lowerClassName}.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { isActive: true } }));
      });
  
      // Add tests for pagination and sorting if implemented and mockable
    });
  
    describe('get${className}ById', () => {
       let testItem;
       beforeAll(async () => { // Setup data once for this describe block
          testItem = await create${className}({ name: 'Get By ID Test' });
       });
  
      test('should return the correct ${className} when found', async () => {
         // // Mock Prisma:
         // prisma.${lowerClassName}.findUnique.mockResolvedValue(testItem);
  
         const result = await get${className}ById(testItem.id);
  
         expect(result).not.toBeNull();
         expect(result.id).toBe(testItem.id);
         expect(result.name).toBe(testItem.name);
         // expect(prisma.${lowerClassName}.findUnique).toHaveBeenCalledWith({ where: { id: testItem.id } });
      });
  
      test('should return null when ${className} is not found', async () => {
        const nonExistentId = 9999;
        // // Mock Prisma:
        // prisma.${lowerClassName}.findUnique.mockResolvedValue(null);
  
        const result = await get${className}ById(nonExistentId);
  
        expect(result).toBeNull();
        // expect(prisma.${lowerClassName}.findUnique).toHaveBeenCalledWith({ where: { id: nonExistentId } });
      });
  
       test('should throw error if ID is not provided', async () => {
         await expect(get${className}ById()).rejects.toThrow('ID must be provided');
         await expect(get${className}ById(null)).rejects.toThrow('ID must be provided');
         // expect(prisma.${lowerClassName}.findUnique).not.toHaveBeenCalled();
      });
    });
  
    describe('update${className}', () => {
       let itemToUpdate;
       beforeAll(async () => {
           itemToUpdate = await create${className}({ name: 'Update Test Original' });
       });
  
      test('should update the ${className} and return the updated object', async () => {
        const updateData = { name: 'Update Test New Name', value: 55 };
        // // Mock Prisma:
        // const expectedUpdatedItem = { ...itemToUpdate, ...updateData, updatedAt: expect.any(String) };
        // prisma.${lowerClassName}.update.mockResolvedValue(expectedUpdatedItem);
  
        const result = await update${className}(itemToUpdate.id, updateData);
  
        expect(result).not.toBeNull();
        expect(result.id).toBe(itemToUpdate.id);
        expect(result.name).toBe(updateData.name);
        expect(result.value).toBe(updateData.value); // Assuming 'value' field exists
        expect(result).toHaveProperty('updatedAt');
        // expect(prisma.${lowerClassName}.update).toHaveBeenCalledWith({ where: { id: itemToUpdate.id }, data: updateData });
  
        // Verify in mockDb (if testing mock directly)
        const updatedItemInDb = await get${className}ById(itemToUpdate.id);
        expect(updatedItemInDb.name).toBe(updateData.name);
      });
  
      test('should return null if ${className} to update is not found', async () => {
        const nonExistentId = 8888;
        const updateData = { name: 'Wont Update' };
        // // Mock Prisma (need to simulate not found, update throws error in Prisma if not found)
        // // This might require mocking findUnique first or catching the specific Prisma error
        // prisma.${lowerClassName}.update.mockRejectedValue(new Error('Record to update not found.')); // Simulate Prisma error
  
        const result = await update${className}(nonExistentId, updateData); // Function should handle not found gracefully
  
        expect(result).toBeNull();
        // expect(prisma.${lowerClassName}.update).not.toHaveBeenCalled(); // Or verify it was called and handled
      });
  
      test('should throw error for invalid update data (contains ID)', async () => {
         const updateData = { id: itemToUpdate.id, name: 'Update Invalid ID' };
         await expect(update${className}(itemToUpdate.id, updateData)).rejects.toThrow(/Invalid data provided.*without an ID/);
         // expect(prisma.${lowerClassName}.update).not.toHaveBeenCalled();
      });
  
       test('should throw error if ID is not provided', async () => {
         const updateData = { name: 'Update No ID' };
         await expect(update${className}(null, updateData)).rejects.toThrow('ID must be provided');
         // expect(prisma.${lowerClassName}.update).not.toHaveBeenCalled();
      });
    });
  
    describe('delete${className}', () => {
      let itemToDelete;
       beforeAll(async () => {
           itemToDelete = await create${className}({ name: 'Delete Test' });
       });
  
      test('should delete the ${className} and return true when found', async () => {
          // // Mock Prisma:
          // prisma.${lowerClassName}.delete.mockResolvedValue(itemToDelete); // delete returns the deleted item
  
          const result = await delete${className}(itemToDelete.id);
  
          expect(result).toBe(true);
          // expect(prisma.${lowerClassName}.delete).toHaveBeenCalledWith({ where: { id: itemToDelete.id } });
  
          // Verify in mockDb
          const deletedItem = await get${className}ById(itemToDelete.id);
          expect(deletedItem).toBeNull();
      });
  
      test('should return false if ${className} to delete is not found', async () => {
         const nonExistentId = 7777;
         // // Mock Prisma (delete throws P2025 if not found)
         // const prismaNotFoundError = new Error(); // Simulate Prisma error object
         // prismaNotFoundError.code = 'P2025';
         // prisma.${lowerClassName}.delete.mockRejectedValue(prismaNotFoundError);
  
         const result = await delete${className}(nonExistentId);
  
         expect(result).toBe(false);
         // expect(prisma.${lowerClassName}.delete).toHaveBeenCalledWith({ where: { id: nonExistentId } });
      });
  
       test('should throw error if ID is not provided', async () => {
         await expect(delete${className}()).rejects.toThrow('ID must be provided');
         // expect(prisma.${lowerClassName}.delete).not.toHaveBeenCalled();
      });
  
      // Add test for database error during deletion if mockable (e.g., constraint violation)
    });
  
  });
  ` : ""}
  `;
  };