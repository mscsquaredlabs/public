// templates/php/controller.js

/**
 * PHP Controller Template (Laravel Focused)
 */
const controller = (options) => {
    const {
      includeComments = true,
      includeTests = false,
      className = 'User',
      apiName = 'users'
    } = options || {}; // Added default empty object for safety

    const controllerName = `${className}Controller`;
    const lowerClassName = className.toLowerCase();

    return `<?php

namespace App\\Http\\Controllers;

use App\\Models\\${className};
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Validator;
${includeComments ? `
/**
 * ${controllerName} - Laravel controller for ${className} resources
 * * This controller handles REST API requests for ${className} resources.
 * * @package App\\Http\\Controllers
 */` : ``}
class ${controllerName} extends Controller
{
    ${includeComments ? `/**
     * Display a listing of the ${lowerClassName}s.
     *
     * @return \\Illuminate\\Http\\JsonResponse
     */` : ``}
    public function index()
    {
        $${apiName} = ${className}::all();
        return response()->json(['data' => $${apiName}]);
    }

    ${includeComments ? `/**
     * Store a newly created ${lowerClassName} in storage.
     *
     * @param  \\Illuminate\\Http\\Request  $request
     * @return \\Illuminate\\Http\\JsonResponse
     */` : ``}
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:${apiName}',
            // Add other relevant fields based on your model
            // 'phone' => 'nullable|string|max:20',
            // 'address' => 'nullable|string',
            // 'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $${lowerClassName} = ${className}::create($request->all());

        return response()->json(['data' => $${lowerClassName}, 'message' => '${className} created successfully'], 201);
    }

    ${includeComments ? `/**
     * Display the specified ${lowerClassName}.
     *
     * @param  int  $id  // Or use Route Model Binding: ${className} $${lowerClassName}
     * @return \\Illuminate\\Http\\JsonResponse
     */` : ``}
    public function show($id) // Or: public function show(${className} $${lowerClassName})
    {
        $${lowerClassName} = ${className}::find($id); // Not needed if using Route Model Binding

        if (!$${lowerClassName}) {
            return response()->json(['message' => '${className} not found'], 404);
        }

        return response()->json(['data' => $${lowerClassName}]);
    }

    ${includeComments ? `/**
     * Update the specified ${lowerClassName} in storage.
     *
     * @param  \\Illuminate\\Http\\Request  $request
     * @param  int  $id // Or use Route Model Binding: ${className} $${lowerClassName}
     * @return \\Illuminate\\Http\\JsonResponse
     */` : ``}
    public function update(Request $request, $id) // Or: public function update(Request $request, ${className} $${lowerClassName})
    {
        $${lowerClassName} = ${className}::find($id); // Not needed if using Route Model Binding

        if (!$${lowerClassName}) {
            return response()->json(['message' => '${className} not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255', // Use 'sometimes' for updates
            'email' => 'sometimes|required|string|email|max:255|unique:${apiName},email,' . $id,
            // Add other relevant fields
            // 'phone' => 'nullable|string|max:20',
            // 'address' => 'nullable|string',
            // 'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $${lowerClassName}->update($request->all());

        return response()->json(['data' => $${lowerClassName}, 'message' => '${className} updated successfully']);
    }

    ${includeComments ? `/**
     * Remove the specified ${lowerClassName} from storage.
     *
     * @param  int  $id // Or use Route Model Binding: ${className} $${lowerClassName}
     * @return \\Illuminate\\Http\\JsonResponse
     */` : ``}
    public function destroy($id) // Or: public function destroy(${className} $${lowerClassName})
    {
        $${lowerClassName} = ${className}::find($id); // Not needed if using Route Model Binding

        if (!$${lowerClassName}) {
            return response()->json(['message' => '${className} not found'], 404);
        }

        $${lowerClassName}->delete(); // Handles soft delete if enabled

        return response()->json(['message' => '${className} deleted successfully']);
    }

    ${includeComments ? `/**
     * Search for ${lowerClassName}s.
     * Example: searches 'name' and 'email' fields. Adjust as needed.
     *
     * @param  \\Illuminate\\Http\\Request  $request
     * @return \\Illuminate\\Http\\JsonResponse
     */` : ``}
    public function search(Request $request)
    {
        $query = $request->input('query');

        if (!$query) {
            return response()->json(['message' => 'Search query is required'], 400);
        }

        // Adjust the fields and logic for your specific search needs
        $${apiName} = ${className}::where('name', 'like', "%{$query}%")
                            ->orWhere('email', 'like', "%{$query}%")
                            ->get();

        return response()->json(['data' => $${apiName}]);
    }
}

${includeTests ? `
// Test file: tests/Feature/${controllerName}Test.php
<?php

namespace Tests\\Feature\\Http\\Controllers; // Correct namespace for feature tests

use App\\Models\\${className};
use Illuminate\\Foundation\\Testing\\RefreshDatabase;
// use Illuminate\\Foundation\\Testing\\WithFaker; // Optionally use Faker
use Tests\\TestCase;

class ${controllerName}Test extends TestCase
{
    use RefreshDatabase;
    // use WithFaker; // Optionally use Faker

    /**
     * Test getting all ${apiName}.
     *
     * @return void
     */
    public function testIndex()
    {
        ${className}::factory()->count(3)->create();

        $response = $this->getJson('/api/${apiName}'); // Adjust route if needed

        $response->assertStatus(200)
                 ->assertJsonCount(3, 'data'); // More specific assertion
    }

    /**
     * Test storing a new ${lowerClassName}.
     *
     * @return void
     */
    public function testStore()
    {
        $data = ${className}::factory()->make()->toArray(); // Use factory to generate valid data
        // If factory doesn't include password or specific fields, add them:
        // $data['password'] = 'password';

        $response = $this->postJson('/api/${apiName}', $data); // Adjust route if needed

        $response->assertStatus(201)
                 ->assertJsonPath('data.name', $data['name']) // Assert specific fields
                 ->assertJsonPath('data.email', $data['email']);

        // Assert specific fields exist in the database
        $this->assertDatabaseHas('${apiName}', [
            'name' => $data['name'],
            'email' => $data['email']
        ]);
    }

     /**
      * Test storing a new ${lowerClassName} with validation errors.
      *
      * @return void
      */
     public function testStoreValidationErrors()
     {
         $data = ['name' => 'Test']; // Missing required email

         $response = $this->postJson('/api/${apiName}', $data); // Adjust route if needed

         $response->assertStatus(422) // Expect validation error status
                  ->assertJsonValidationErrors(['email']); // Check which field failed
     }

    /**
     * Test showing a specific ${lowerClassName}.
     *
     * @return void
     */
    public function testShow()
    {
        $${lowerClassName} = ${className}::factory()->create();

        $response = $this->getJson('/api/${apiName}/' . $${lowerClassName}->id); // Adjust route if needed

        $response->assertStatus(200)
                 ->assertJsonPath('data.id', $${lowerClassName}->id)
                 ->assertJsonPath('data.name', $${lowerClassName}->name);
    }

    /**
     * Test showing a non-existent ${lowerClassName}.
     *
     * @return void
     */
    public function testShowNotFound()
    {
        $response = $this->getJson('/api/${apiName}/9999'); // Adjust route if needed, use an unlikely ID

        $response->assertStatus(404);
    }

    /**
     * Test updating a ${lowerClassName}.
     *
     * @return void
     */
    public function testUpdate()
    {
        $${lowerClassName} = ${className}::factory()->create();
        $updateData = [
            'name' => 'Updated Name',
            'email' => 'updated@example.com', // Ensure email is unique if required
        ];

        $response = $this->putJson('/api/${apiName}/' . $${lowerClassName}->id, $updateData); // Adjust route if needed

        $response->assertStatus(200)
                 ->assertJsonPath('data.name', $updateData['name'])
                 ->assertJsonPath('data.email', $updateData['email']);

        $this->assertDatabaseHas('${apiName}', $updateData + ['id' => $${lowerClassName}->id]);
    }

     /**
      * Test updating a ${lowerClassName} with validation errors.
      *
      * @return void
      */
     public function testUpdateValidationErrors()
     {
         $${lowerClassName} = ${className}::factory()->create();
         // Create another user to cause unique email conflict
         ${className}::factory()->create(['email' => 'existing@example.com']);

         $updateData = ['email' => 'existing@example.com']; // Invalid data

         $response = $this->putJson('/api/${apiName}/' . $${lowerClassName}->id, $updateData); // Adjust route if needed

         $response->assertStatus(422) // Expect validation error status
                  ->assertJsonValidationErrors(['email']); // Check which field failed
     }

    /**
     * Test deleting a ${lowerClassName}.
     *
     * @return void
     */
    public function testDestroy()
    {
        $${lowerClassName} = ${className}::factory()->create();

        $response = $this->deleteJson('/api/${apiName}/' . $${lowerClassName}->id); // Adjust route if needed

        $response->assertStatus(200)
                 ->assertJsonPath('message', '${className} deleted successfully'); // Check message

        // Use assertSoftDeleted if SoftDeletes trait is used in the model
        if (in_array('Illuminate\\Database\\Eloquent\\SoftDeletes', class_uses(${className}::class))) {
             $this->assertSoftDeleted('${apiName}', ['id' => $${lowerClassName}->id]);
        } else {
             $this->assertDatabaseMissing('${apiName}', ['id' => $${lowerClassName}->id]);
        }
    }

    /**
     * Test searching for ${apiName}.
     *
     * @return void
     */
    public function testSearch()
    {
        $match1 = ${className}::factory()->create(['name' => 'Test ${className} One', 'email' => 'test1@example.com']);
        $match2 = ${className}::factory()->create(['name' => 'Another Name', 'email' => 'test2@example.com']); // Matches on email part
        $noMatch = ${className}::factory()->create(['name' => 'Different Name', 'email' => 'diff@example.com']);

        // Search for "Test"
        $response = $this->getJson('/api/${apiName}/search?query=Test'); // Adjust route if needed

        $response->assertStatus(200)
                 ->assertJsonCount(2, 'data') // Expecting 2 matches
                 ->assertJsonFragment(['id' => $match1->id]) // Check if specific results are present
                 ->assertJsonFragment(['id' => $match2->id])
                 ->assertJsonMissing(['id' => $noMatch->id]); // Check that non-matches are absent
    }

     /**
      * Test searching with no query.
      *
      * @return void
      */
     public function testSearchNoQuery()
     {
         $response = $this->getJson('/api/${apiName}/search?query='); // Adjust route if needed

         $response->assertStatus(400) // Expect bad request
                  ->assertJsonPath('message', 'Search query is required');
     }
}` : ''}

${includeComments ? `
// Example routes for this controller (in routes/api.php or routes/web.php)
/*
use App\\Http\\Controllers\\${controllerName};

// Basic RESTful Resource Route (covers index, create, store, show, edit, update, destroy)
// Note: 'create' and 'edit' are typically for web views, not JSON APIs
Route::apiResource('/${apiName}', ${controllerName}::class);

// Add the search route separately
Route::get('/${apiName}/search', [${controllerName}::class, 'search'])->name('${apiName}.search');

// OR Define routes manually:
Route::prefix('api')->group(function () {
    Route::get('/${apiName}', [${controllerName}::class, 'index']);
    Route::post('/${apiName}', [${controllerName}::class, 'store']);
    Route::get('/${apiName}/search', [${controllerName}::class, 'search']); // Search route
    Route::get('/${apiName}/{id}', [${controllerName}::class, 'show'])->where('id', '[0-9]+'); // Ensure ID is numeric
    Route::put('/${apiName}/{id}', [${controllerName}::class, 'update'])->where('id', '[0-9]+');
    Route::delete('/${apiName}/{id}', [${controllerName}::class, 'destroy'])->where('id', '[0-9]+');

    // If using Route Model Binding in controller methods:
    // Route::get('/${apiName}/{${lowerClassName}}', [${controllerName}::class, 'show']);
    // Route::put('/${apiName}/{${lowerClassName}}', [${controllerName}::class, 'update']);
    // Route::delete('/${apiName}/{${lowerClassName}}', [${controllerName}::class, 'destroy']);
});
*/` : ''}`;
};

export default controller;