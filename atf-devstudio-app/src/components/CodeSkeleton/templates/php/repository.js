// templates/php/repository.js

/**
 * PHP Repository Template (Laravel Focused)
 */
const repository = (options) => {
    const {
      includeComments = true,
      className = 'User' // Expects Model name (e.g., User, Post)
    } = options || {}; // Added default empty object for safety

    const repositoryName = `${className}Repository`;
    const modelVarName = strtolower(className); // e.g., user, post
    const modelClassName = className; // e.g., User, Post

    return `<?php

namespace App\\Repositories;

use App\\Models\\${modelClassName};
use Illuminate\\Database\\Eloquent\\Collection;
use Illuminate\\Pagination\\LengthAwarePaginator;
// use Your\\Specific\\Exception\\NotFoundException; // Optional custom exception

${includeComments ? `/**
 * ${repositoryName}
 *
 * Repository class for handling data access logic for the ${modelClassName} model.
 * It abstracts the underlying data source (Eloquent ORM in this case)
 * from the service layer or controllers.
 *
 * @package App\\Repositories
 */` : ''}
class ${repositoryName}
{
    /**
     * The Eloquent model instance.
     *
     * @var ${modelClassName}
     */
    protected $model;

    /**
     * Create a new repository instance.
     * Inject the Eloquent model.
     *
     * @param ${modelClassName} $model The Eloquent model for this repository.
     */
    public function __construct(${modelClassName} $model)
    {
        $this->model = $model;
    }

    ${includeComments ? `/**
     * Get all ${modelClassName} records.
     *
     * @param array $columns Columns to select (default: all).
     * @return Collection<int, ${modelClassName}> A collection of all ${modelClassName} models.
     */` : ''}
    public function getAll(array $columns = ['*']): Collection
    {
        return $this->model->all($columns);
    }

    ${includeComments ? `/**
     * Get paginated ${modelClassName} records.
     *
     * @param int $perPage Number of items per page.
     * @param string $sortBy Column to sort by.
     * @param string $sortOrder Sort order ('asc' or 'desc').
     * @param array $columns Columns to select.
     * @return LengthAwarePaginator Paginated result set.
     */` : ''}
    public function getAllPaginated(int $perPage = 15, string $sortBy = 'created_at', string $sortOrder = 'desc', array $columns = ['*']): LengthAwarePaginator
    {
        return $this->model->orderBy($sortBy, $sortOrder)->paginate($perPage, $columns);
    }


    ${includeComments ? `/**
     * Find a ${modelClassName} by its primary key.
     *
     * @param int $id The primary key ID.
     * @param array $columns Columns to select.
     * @return ${modelClassName}|null The found model or null if not found.
     */` : ''}
    public function findById(int $id, array $columns = ['*']): ?${modelClassName}
    {
        return $this->model->find($id, $columns);
    }

    ${includeComments ? `/**
     * Find a ${modelClassName} by its primary key or throw an exception.
     *
     * @param int $id The primary key ID.
     * @param array $columns Columns to select.
     * @return ${modelClassName} The found model.
     * @throws \\Illuminate\\Database\\Eloquent\\ModelNotFoundException If the model is not found.
     * // Or throw a custom exception: @throws \\Your\\Specific\\Exception\\NotFoundException
     */` : ''}
    public function findOrFail(int $id, array $columns = ['*']): ${modelClassName}
    {
        // Use findOrFail provided by Eloquent
        return $this->model->findOrFail($id, $columns);
        // Or handle manually to throw custom exception:
        /*
        $result = $this->findById($id, $columns);
        if (!$result) {
            throw new NotFoundException("${modelClassName} with ID {$id} not found.");
        }
        return $result;
        */
    }

     ${includeComments ? `/**
      * Find records by specific criteria.
      *
      * @param array $criteria Key-value pairs for WHERE clauses (e.g., ['email' => 'test@example.com']).
      * @param string|null $sortBy Column to sort by.
      * @param string $sortOrder Sort order ('asc' or 'desc').
      * @param array $columns Columns to select.
      * @return Collection<int, ${modelClassName}>
      */` : ''}
     public function findBy(array $criteria, ?string $sortBy = null, string $sortOrder = 'asc', array $columns = ['*']): Collection
     {
         $query = $this->model->where($criteria);

         if ($sortBy) {
             $query->orderBy($sortBy, $sortOrder);
         }

         return $query->get($columns);
     }

    ${includeComments ? `/**
     * Create a new ${modelClassName} record in the database.
     *
     * @param array $data Associative array of data matching model's fillable attributes.
     * @return ${modelClassName} The newly created model instance.
     */` : ''}
    public function create(array $data): ${modelClassName}
    {
        // Assumes $data contains validated and fillable attributes.
        // Hashing passwords etc. should ideally be handled before this point (e.g., Service layer or Model Mutator).
        return $this->model->create($data);
    }

    ${includeComments ? `/**
     * Update an existing ${modelClassName} record.
     *
     * @param ${modelClassName} $${modelVarName} The model instance to update.
     * @param array $data Associative array of data to update (fillable attributes).
     * @return ${modelClassName} The updated model instance.
     */` : ''}
    public function update(${modelClassName} $${modelVarName}, array $data): ${modelClassName}
    {
        // Assumes $data contains validated and fillable attributes.
        $${modelVarName}->fill($data); // Use fill() for mass assignment safety
        $${modelVarName}->save();

        // Return the same instance, or refresh it from the database if needed
        return $${modelVarName}->refresh(); // Refresh ensures you get latest data including DB defaults/triggers
    }

    ${includeComments ? `/**
     * Delete a ${modelClassName} record.
     * Handles soft deletes automatically if the model uses the SoftDeletes trait.
     *
     * @param ${modelClassName} $${modelVarName} The model instance to delete.
     * @return bool|null Returns true if deleted, false on failure, null if soft deleting doesn't return status.
     * @throws \\Exception Rethrows exceptions caught during deletion.
     */` : ''}
    public function delete(${modelClassName} $${modelVarName}): ?bool
    {
        // delete() handles soft deletes automatically if the trait is used
        return $${modelVarName}->delete();
    }

     ${includeComments ? `/**
      * Force delete a ${modelClassName} record, bypassing soft deletes.
      * Use with caution!
      *
      * @param ${modelClassName} $${modelVarName} The model instance to force delete.
      * @return bool|null
      */` : ''}
     public function forceDelete(${modelClassName} $${modelVarName}): ?bool
     {
         return $${modelVarName}->forceDelete();
     }

    ${includeComments ? `/**
     * Search for ${modelClassName} records based on a query string.
     * Example implementation searches 'name' and 'email' fields. Adjust as needed.
     *
     * @param string $query The search term.
     * @param int $perPage Optional: Number of results per page for pagination.
     * @param array $searchFields Optional: Fields to search within (default: ['name', 'email']).
     * @return Collection|LengthAwarePaginator Depending on whether pagination is used.
     */` : ''}
    public function search(string $query, ?int $perPage = null, array $searchFields = ['name', 'email'])
    {
        $dbQuery = $this->model->query(); // Start a new query builder instance

        $dbQuery->where(function ($q) use ($query, $searchFields) {
            foreach ($searchFields as $index => $field) {
                if ($index === 0) {
                    $q->where($field, 'like', "%{$query}%");
                } else {
                    $q->orWhere($field, 'like', "%{$query}%");
                }
            }
        });

        if ($perPage) {
            return $dbQuery->paginate($perPage);
        }

        return $dbQuery->get();
    }

    ${includeComments ? `/**
     * Get records matching a specific scope defined in the model.
     * Example: Uses an 'active' scope if defined in the ${modelClassName} model.
     *
     * @return Collection<int, ${modelClassName}>
     */` : ''}
    public function getActive(): Collection
    {
        // Assumes an 'active' scope exists in the ${modelClassName} model:
        // public function scopeActive($query) { return $query->where('is_active', true); }
        if (method_exists($this->model, 'scopeActive')) {
             return $this->model->active()->get();
        } else {
             // Fallback or throw error if scope doesn't exist
             // This is just an example; adapt based on your actual scopes
             return $this->model->where('is_active', true)->get();
        }
    }

     ${includeComments ? `/**
      * Eager load relationships for a given model or collection.
      *
      * @param ${modelClassName}|Collection $models The model instance or collection.
      * @param array|string $relations The relationship(s) to load.
      * @return ${modelClassName}|Collection The model(s) with relations loaded.
      */` : ''}
     public function loadRelations($models, $relations)
     {
         return $models->load($relations);
     }
}`;

     // Basic function to convert CamelCase to snake_case for variable names
    function strtolower(str) {
        return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
    }
};

export default repository;