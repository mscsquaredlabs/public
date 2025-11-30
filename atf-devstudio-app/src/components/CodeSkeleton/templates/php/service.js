// templates/php/service.js

/**
 * PHP Service Template (Laravel Focused)
 */
const service = (options) => {
    const {
      includeComments = true,
      className = 'UserService' // Expects format like EntityNameService
    } = options || {}; // Added default empty object for safety

    const entityName = className.replace('Service', ''); // e.g., User
    if (!entityName || entityName === className) {
         console.warn(`Service template expects className in 'EntityNameService' format. Received '${className}'. Adjust template output if needed.`);
    }
    const entityVarName = strtolower(entityName); // e.g., user
    const repositoryClassName = `${entityName}Repository`; // e.g., UserRepository

    return `<?php

namespace App\\Services;

use App\\Models\\${entityName}; // Assuming model exists
use App\\Repositories\\${repositoryClassName}; // Assuming repository exists
use Exception; // Use base Exception or specific exceptions
use Illuminate\\Support\\Facades\\DB; // For database transactions
use Illuminate\\Support\\Facades\\Log; // For logging errors
use Illuminate\\Support\\Facades\\Validator; // For validation within the service (optional)
use Illuminate\\Validation\\ValidationException; // To handle validation failures

${includeComments ? `/**
 * ${className}
 *
 * Service class responsible for business logic related to ${entityName} entities.
 * It orchestrates operations, potentially involving multiple repositories or external services,
 * and handles transactions.
 *
 * @package App\\Services
 */` : ''}
class ${className}
{
    /**
     * The repository instance for ${entityName}.
     *
     * @var ${repositoryClassName}
     */
    protected $${entityVarName}Repository;

    // Optional: Inject other repositories or services if needed
    // protected $anotherRepository;

    /**
     * Create a new service instance.
     *
     * @param ${repositoryClassName} $${entityVarName}Repository The repository for ${entityName} data access.
     */
    public function __construct(${repositoryClassName} $${entityVarName}Repository) // Add other injected dependencies here
    {
        $this->${entityVarName}Repository = $${entityVarName}Repository;
        // $this->anotherRepository = $anotherRepository;
    }

    ${includeComments ? `/**
     * Get all ${entityName} entities.
     * Applies any standard filtering or sorting logic if needed.
     *
     * @param array $options Optional filters, sorting, pagination parameters.
     * @return \\Illuminate\\Pagination\\LengthAwarePaginator|\\Illuminate\\Database\\Eloquent\\Collection
     */` : ''}
    public function getAll(array $options = [])
    {
        ${includeComments ? `// Example: Add logic for pagination, sorting, filtering based on $options
        // $perPage = $options['per_page'] ?? 15;
        // $sortBy = $options['sort_by'] ?? 'created_at';
        // $sortOrder = $options['sort_order'] ?? 'desc';
        // return $this->${entityVarName}Repository->getAllPaginated($perPage, $sortBy, $sortOrder);` : ''}

        // Simple delegation by default
        return $this->${entityVarName}Repository->getAll();
    }

    ${includeComments ? `/**
     * Find a specific ${entityName} by its ID.
     *
     * @param int $id The ID of the ${entityName}.
     * @return ${entityName}|null The found entity or null if not found.
     */` : ''}
    public function findById(int $id): ?${entityName}
    {
        return $this->${entityVarName}Repository->findById($id);
    }

    ${includeComments ? `/**
     * Create a new ${entityName}.
     * Handles validation, data preparation, and transaction management.
     *
     * @param array $data The data for creating the ${entityName}.
     * @return ${entityName} The newly created ${entityName}.
     * @throws ValidationException If validation fails.
     * @throws \\Exception If creation fails for other reasons.
     */` : ''}
    public function create(array $data): ${entityName}
    {
        // 1. Validation (Optional: Can also be done in Controller or Form Request)
        $validator = Validator::make($data, [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:${entityVarName}s,email', // Ensure table name is correct
            // Add other validation rules relevant to ${entityName} creation
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
        $validatedData = $validator->validated(); // Get only validated data

        // 2. Business Logic / Data Preparation (Example)
        // $validatedData['some_flag'] = $this->calculateSomeFlag($validatedData);
        // if (isset($validatedData['password'])) {
        //     $validatedData['password'] = bcrypt($validatedData['password']);
        // }

        // 3. Transaction (Recommended for operations involving multiple steps/models)
        DB::beginTransaction();
        try {
            // 4. Persistence via Repository
            $${entityVarName} = $this->${entityVarName}Repository->create($validatedData);

            // 5. Additional Actions (Example: Notify admin, associate related models)
            // $this->notifyAdminOfNewUser($${entityVarName});
            // if (isset($data['roles'])) {
            //     $${entityVarName}->roles()->sync($data['roles']); // Assuming roles relationship exists
            // }

            DB::commit(); // Commit transaction if all successful

            return $${entityVarName};

        } catch (Exception $e) {
            DB::rollBack(); // Roll back transaction on error
            Log::error("Error creating ${entityName}: " . $e->getMessage(), [
                'data' => $data, // Log context
                'exception' => $e
            ]);
            // Re-throw a more specific or generic exception
            throw new Exception('Failed to create ${entityName}. Please try again later.', 0, $e);
        }
    }

    ${includeComments ? `/**
     * Update an existing ${entityName}.
     * Handles finding the entity, validation, data preparation, and transaction.
     *
     * @param int $id The ID of the ${entityName} to update.
     * @param array $data The data to update the ${entityName} with.
     * @return ${entityName} The updated ${entityName}.
     * @throws ValidationException If validation fails.
     * @throws \\App\\Exceptions\\NotFoundException If the entity is not found (Define this exception).
     * @throws \\Exception If update fails for other reasons.
     */` : ''}
    public function update(int $id, array $data): ${entityName}
    {
        // 1. Find the entity
        $${entityVarName} = $this->${entityVarName}Repository->findById($id);
        if (!$${entityVarName}) {
            // It's often better to throw a specific NotFoundException
            throw new Exception("${entityName} with ID {$id} not found."); // Or use a custom NotFoundException
        }

        // 2. Validation (Rules might differ from create, use 'sometimes')
        $validator = Validator::make($data, [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:${entityVarName}s,email,' . $id, // Ignore current ID
            // Add other validation rules relevant to ${entityName} update
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
        $validatedData = $validator->validated();

        // 3. Business Logic / Data Preparation (Example)
        // if (isset($validatedData['password']) && !empty($validatedData['password'])) {
        //     $validatedData['password'] = bcrypt($validatedData['password']);
        // } else {
        //     unset($validatedData['password']); // Don't update password if empty
        // }

        // 4. Transaction
        DB::beginTransaction();
        try {
            // 5. Persistence via Repository
            $updated${entityName} = $this->${entityVarName}Repository->update($${entityVarName}, $validatedData);

            // 6. Additional Actions (Example: Sync relationships)
            // if (isset($data['roles'])) {
            //     $updated${entityName}->roles()->sync($data['roles']);
            // }

            DB::commit();

            return $updated${entityName};

        } catch (Exception $e) {
            DB::rollBack();
            Log::error("Error updating ${entityName} with ID {$id}: " . $e->getMessage(), [
                'data' => $data,
                'exception' => $e
            ]);
            throw new Exception('Failed to update ${entityName}. Please try again later.', 0, $e);
        }
    }

    ${includeComments ? `/**
     * Delete a ${entityName}.
     * Handles finding the entity and performing deletion within a transaction.
     *
     * @param int $id The ID of the ${entityName} to delete.
     * @return bool True if deletion was successful.
     * @throws \\App\\Exceptions\\NotFoundException If the entity is not found.
     * @throws \\Exception If deletion fails.
     */` : ''}
    public function delete(int $id): bool
    {
        // 1. Find the entity
        $${entityVarName} = $this->${entityVarName}Repository->findById($id);
        if (!$${entityVarName}) {
            throw new Exception("${entityName} with ID {$id} not found."); // Or use a custom NotFoundException
        }

        // 2. Business Logic (Example: Check if deletion is allowed)
        // if (!$this->canBeDeleted($${entityVarName})) {
        //     throw new Exception("${entityName} cannot be deleted due to related records.");
        // }

        // 3. Transaction
        DB::beginTransaction();
        try {
            // 4. Perform Deletion via Repository
            $deleted = $this->${entityVarName}Repository->delete($${entityVarName});

            // 5. Additional Actions (Example: Clean up related data, log deletion)
            // $this->logDeletion($${entityVarName});

            DB::commit();

            return $deleted;

        } catch (Exception $e) {
            DB::rollBack();
            Log::error("Error deleting ${entityName} with ID {$id}: " . $e->getMessage(), [
                'exception' => $e
            ]);
            throw new Exception('Failed to delete ${entityName}. Please try again later.', 0, $e);
        }
    }

    ${includeComments ? `/**
     * Search for ${entityName} entities based on criteria.
     * Delegates searching to the repository, potentially adding service-level logic.
     *
     * @param string|array $criteria Search criteria.
     * @param array $options Optional sorting, pagination.
     * @return \\Illuminate\\Pagination\\LengthAwarePaginator|\\Illuminate\\Database\\Eloquent\\Collection
     */` : ''}
    public function search($criteria, array $options = [])
    {
        ${includeComments ? `// Add any service-level processing of criteria or options here
        // Example: Normalize search terms, set default search fields` : ''}
        return $this->${entityVarName}Repository->search($criteria, $options);
    }

    // --- Private Helper Methods for Business Logic ---
    ${includeComments ? `
    /**
     * Example private helper method.
     *
     * @param array $data
     * @return bool
     */
    /*
    private function calculateSomeFlag(array $data): bool
    {
        // ... complex business logic based on input data ...
        return ($data['value'] > 100);
    }
    */

    /**
     * Example: Check if an entity can be deleted.
     *
     * @param ${entityName} $${entityVarName}
     * @return bool
     */
    /*
    private function canBeDeleted(${entityName} $${entityVarName}): bool
    {
        // Example: Check if there are related orders or critical dependencies
        // return $${entityVarName}->orders()->count() === 0;
        return true; // Default: allow deletion
    }
    */
    ` : ''}

}`;

    // Basic function to convert CamelCase to snake_case for variable names
    function strtolower(str) {
         return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
     }
};

export default service;