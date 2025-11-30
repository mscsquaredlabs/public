// templates/php/model.js

/**
 * PHP Model Template (Laravel Eloquent)
 */
const model = (options) => {
    const {
      includeComments = true,
      className = 'User'
    } = options || {}; // Added default empty object for safety

    // Basic pluralization, might need a more robust library for complex cases
    const tableName = className.toLowerCase().endsWith('s')
        ? `${className.toLowerCase()}es` // e.g., Address -> addresses
        : `${className.toLowerCase()}s`; // e.g., User -> users, Post -> posts

    const foreignKey = `${className.toLowerCase()}_id`; // e.g., user_id

    return `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\SoftDeletes; // Include if using soft deletes
// use Illuminate\\Foundation\\Auth\\User as Authenticatable; // Uncomment if this is the User model for auth
// use Illuminate\\Notifications\\Notifiable; // Include if using notifications
// use Laravel\\Sanctum\\HasApiTokens; // Include if using Sanctum for API tokens

${includeComments ? `
/**
 * ${className} Model
 *
 * Represents a ${className} in the application.
 * Links to the \`${tableName}\` table.
 *
 * === Properties ===
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property string|null $address
 * @property bool $is_active
 * // Add other relevant model properties here based on your migration
 * @property \\Carbon\\Carbon $created_at // Automatically handled by Eloquent
 * @property \\Carbon\\Carbon $updated_at // Automatically handled by Eloquent
 * @property \\Carbon\\Carbon|null $deleted_at // If using SoftDeletes
 *
 * === Relationships ===
 * // Define relationships based on your application structure
 * // @property-read \\Illuminate\\Database\\Eloquent\\Collection|\\App\\Models\\Post[] $posts // Example: hasMany
 * // @property-read \\Illuminate\\Database\\Eloquent\\Collection|\\App\\Models\\Role[] $roles // Example: belongsToMany
 * // @property-read \\App\\Models\\Profile|null $profile // Example: hasOne
 *
 * === Scopes ===
 * @method static \\Illuminate\\Database\\Eloquent\\Builder|${className} active() // Example scope
 *
 * === Accessors ===
 * @property-read string $full_name // Example accessor
 */` : ``}
// class ${className} extends Authenticatable // Use this if User model for auth
class ${className} extends Model
{
    use HasFactory; // Enables model factories
    use SoftDeletes; // Enables soft deletes (deleted_at column) - remove if not needed
    // use Notifiable; // Enables notifications - remove if not needed
    // use HasApiTokens; // Enables Sanctum API tokens - remove if not needed

    /**
     * The table associated with the model.
     * If table name follows Laravel conventions (plural snake_case), this is optional.
     *
     * @var string
     */
    protected $table = '${tableName}';

    /**
     * The attributes that are mass assignable.
     * Protects against mass assignment vulnerabilities. Add all fields you want
     * to be able to fill using Model::create() or $model->fill().
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'is_active',
        // Add other fillable fields here
        // 'password', // If applicable (usually handled separately or hashed in a mutator)
    ];

    /**
     * The attributes that should be hidden for serialization.
     * Commonly used for passwords or tokens.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        // 'password',
        // 'remember_token',
    ];

    /**
     * The attributes that should be cast.
     * Automatically casts attributes to common data types.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime', // Example common cast
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime', // If using SoftDeletes
        // 'options' => 'array', // Cast JSON column to array
    ];

    //======================================================================
    // Relationships (Examples - Adjust to your needs)
    //======================================================================
    ${includeComments ? `
    /**
     * Example: Get the posts for the ${className.toLowerCase()}. (One-to-Many)
     * Assumes a Post model exists with a '${foreignKey}' column.
     *
     * @return \\Illuminate\\Database\\Eloquent\\Relations\\HasMany
     */` : ``}
    /*
    public function posts()
    {
        return $this->hasMany(Post::class); // Assumes App\\Models\\Post exists
    }
    */

    ${includeComments ? `
    /**
     * Example: Get the roles that belong to the ${className.toLowerCase()}. (Many-to-Many)
     * Assumes a Role model and a pivot table (e.g., 'role_${tableName}') exist.
     *
     * @return \\Illuminate\\Database\\Eloquent\\Relations\\BelongsToMany
     */` : ``}
    /*
    public function roles()
    {
        // Adjust pivot table name and foreign keys if they don't follow conventions
        return $this->belongsToMany(Role::class); // Assumes App\\Models\\Role exists
    }
    */

    ${includeComments ? `
    /**
     * Example: Get the profile associated with the ${className.toLowerCase()}. (One-to-One)
     * Assumes a Profile model exists with a '${foreignKey}' column.
     *
     * @return \\Illuminate\\Database\\Eloquent\\Relations\\HasOne
     */` : ``}
    /*
    public function profile()
    {
        return $this->hasOne(Profile::class); // Assumes App\\Models\\Profile exists
    }
    */

    ${includeComments ? `
    /**
     * Example: Get the category that this ${className.toLowerCase()} belongs to. (Inverse One-to-Many / Belongs To)
     * Assumes a Category model exists and this model's table has a 'category_id' column.
     *
     * @return \\Illuminate\\Database\\Eloquent\\Relations\\BelongsTo
     */` : ``}
    /*
    public function category()
    {
        return $this->belongsTo(Category::class); // Assumes App\\Models\\Category exists
    }
    */

    //======================================================================
    // Scopes (Examples)
    //======================================================================
    ${includeComments ? `
    /**
     * Scope a query to only include active ${tableName}.
     * Usage: ${className}::active()->get();
     *
     * @param  \\Illuminate\\Database\\Eloquent\\Builder  $query
     * @return \\Illuminate\\Database\\Eloquent\\Builder
     */` : ``}
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    ${includeComments ? `
    /**
     * Scope a query to search by name or email.
     * Usage: ${className}::search('searchTerm')->get();
     *
     * @param  \\Illuminate\\Database\\Eloquent\\Builder  $query
     * @param  string $searchTerm
     * @return \\Illuminate\\Database\\Eloquent\\Builder
     */` : ``}
     /*
    public function scopeSearch($query, $searchTerm)
    {
        return $query->where(function($q) use ($searchTerm) {
            $q->where('name', 'like', '%' . $searchTerm . '%')
              ->orWhere('email', 'like', '%' . $searchTerm . '%');
        });
    }
    */

    //======================================================================
    // Accessors & Mutators (Examples)
    //======================================================================
    ${includeComments ? `
    /**
     * Get the user's full name. (Accessor)
     * Access via $${className.toLowerCase()}->full_name
     * Note: Only useful if you have separate first/last name fields.
     * Adjust this example based on your actual fields.
     *
     * @return string
     */` : ``}
     /*
    public function getFullNameAttribute()
    {
        // Example assumes 'first_name' and 'last_name' attributes exist
        // return "{$this->first_name} {$this->last_name}";
        return "{$this->name}"; // Simple example using only 'name'
    }
    */

    ${includeComments ? `
    /**
     * Set the user's password. (Mutator)
     * Automatically hashes the password when setting $${className.toLowerCase()}->password = '...'
     * Only needed if not using the built-in Hash facade elsewhere (e.g., in a Service or Controller).
     * Requires 'password' to be in the $fillable array if using mass assignment.
     *
     * @param  string  $value
     * @return void
     */` : ``}
     /*
    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = bcrypt($value);
    }
    */

    //======================================================================
    // Custom Methods (Examples)
    //======================================================================
    ${includeComments ? `
    /**
     * Check if the ${className.toLowerCase()} is currently active.
     *
     * @return bool
     */` : ``}
    public function isActive(): bool
    {
        return $this->is_active;
    }

    ${includeComments ? `
    /**
     * Activate the ${className.toLowerCase()}.
     *
     * @return bool Returns true on success, false on failure.
     */` : ``}
    public function activate(): bool
    {
        $this->is_active = true;
        return $this->save();
    }

    ${includeComments ? `
    /**
     * Deactivate the ${className.toLowerCase()}.
     *
     * @return bool Returns true on success, false on failure.
     */` : ``}
    public function deactivate(): bool
    {
        $this->is_active = false;
        return $this->save();
    }
}

${includeComments ? `
//----------------------------------------------------------------------
// Example Migration (database/migrations/YYYY_MM_DD_HHMMSS_create_${tableName}_table.php):
//----------------------------------------------------------------------
/*
<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration // Anonymous class syntax for newer Laravel versions
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('${tableName}', function (Blueprint $table) {
            $table->id(); // Bigint unsigned primary key
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable(); // For email verification
            $table->string('password')->nullable(); // Add if using for authentication
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->boolean('is_active')->default(true);
            // $table->rememberToken(); // If using remember me functionality
            // Add other columns as needed
            // $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null'); // Example foreign key

            $table->timestamps(); // Adds created_at and updated_at columns
            $table->softDeletes(); // Adds deleted_at column for soft deletes
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('${tableName}');
    }
};
*/` : ''}

${includeComments ? `
//----------------------------------------------------------------------
// Example Factory (database/factories/${className}Factory.php):
//----------------------------------------------------------------------
/*
<?php

namespace Database\\Factories;

use App\\Models\\${className};
use Illuminate\\Database\\Eloquent\\Factories\\Factory;
use Illuminate\\Support\\Str; // For Str::random() if needed for tokens
use Illuminate\\Support\\Facades\\Hash; // For hashing passwords

/**
 * @extends \\Illuminate\\Database\\Eloquent\\Factories\\Factory<\\App\\Models\\${className}>
 */
class ${className}Factory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ${className}::class;

     /**
      * The current password being used by the factory.
      */
     protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(), // Or null if verification is needed
            // 'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // Default hashed password ('password')
            'password' => static::$password ??= Hash::make('password'), // Hash password or use static
            'phone' => $this->faker->phoneNumber(),
            'address' => $this->faker->address(),
            'is_active' => $this->faker->boolean(80), // 80% chance of being true
            // 'remember_token' => Str::random(10), // If using remember token
            // Add definitions for other fields
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     * Usage: ${className}::factory()->unverified()->create();
     *
     * @return static
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the model should be inactive.
     * Usage: ${className}::factory()->inactive()->create();
     *
     * @return static
     */
     /*
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
    */
}
*/` : ''}`;
};

export default model;