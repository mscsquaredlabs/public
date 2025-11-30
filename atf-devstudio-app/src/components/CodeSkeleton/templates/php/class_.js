// templates/php/class_.js

/**
 * PHP Class Template
 */
const class_ = (options) => {
    const {
      includeComments = true,
      includeTests = false,
      className = 'MyClass'
    } = options || {}; // Added default empty object for safety

    return `<?php

${includeComments ? `/**
 * ${className} - Class description
 * * A complete implementation of ${className} with properties and methods.
 * * @package MyApp
 * @author  Your Name <your.email@example.com>
 */` : ''}
class ${className}
{
    /** @var string The name property */
    private $name;

    /** @var int The value property */
    private $value;

    ${includeComments ? `/**
     * Default constructor
     * * @param string $name  Optional name parameter
     * @param int    $value Optional value parameter
     */` : ''}
    public function __construct(string $name = '${className}', int $value = 0)
    {
        $this->name = $name;
        $this->value = $value;
    }

    ${includeComments ? `/**
     * Get the name
     * * @return string The current name
     */` : ''}
    public function getName(): string
    {
        return $this->name;
    }

    ${includeComments ? `/**
     * Set the name
     * * @param string $name The new name
     * * @return self For method chaining
     */` : ''}
    public function setName(string $name): self
    {
        $this->name = $name;
        return $this;
    }

    ${includeComments ? `/**
     * Get the value
     * * @return int The current value
     */` : ''}
    public function getValue(): int
    {
        return $this->value;
    }

    ${includeComments ? `/**
     * Set the value
     * * @param int $value The new value
     * * @return self For method chaining
     */` : ''}
    public function setValue(int $value): self
    {
        $this->value = $value;
        return $this;
    }

    ${includeComments ? `/**
     * Increment the value
     * * @param int $amount Amount to increment by
     * * @return int The new value
     */` : ''}
    public function increment(int $amount = 1): int
    {
        $this->value += $amount;
        return $this->value;
    }

    ${includeComments ? `/**
     * Convert the object to a string
     * * @return string String representation
     */` : ''}
    public function __toString(): string
    {
        return "${className} [name: {$this->name}, value: {$this->value}]";
    }

    ${includeComments ? `/**
     * Process the data
     * * @return mixed The processed result
     */` : ''}
    public function process()
    {
        // Sample processing logic
        if ($this->value > 10) {
            return $this->name . ' (High Value)';
        }

        return $this->name . ' (Low Value)';
    }
}

${includeTests ? `
// Test file: ${className}Test.php
<?php

use PHPUnit\\Framework\\TestCase;

/**
 * Test case for ${className}
 */
class ${className}Test extends TestCase
{
    /**
     * Test constructor and getters
     */
    public function testConstructorAndGetters()
    {
        // Test default constructor
        $instance = new ${className}();
        $this->assertEquals('${className}', $instance->getName());
        $this->assertEquals(0, $instance->getValue());

        // Test constructor with parameters
        $instance = new ${className}('Test', 10);
        $this->assertEquals('Test', $instance->getName());
        $this->assertEquals(10, $instance->getValue());
    }

    /**
     * Test setters
     */
    public function testSetters()
    {
        $instance = new ${className}();

        // Test setName
        $instance->setName('Updated');
        $this->assertEquals('Updated', $instance->getName());

        // Test setValue
        $instance->setValue(20);
        $this->assertEquals(20, $instance->getValue());

        // Test method chaining
        $instance->setName('Chained')->setValue(30);
        $this->assertEquals('Chained', $instance->getName());
        $this->assertEquals(30, $instance->getValue());
    }

    /**
     * Test increment method
     */
    public function testIncrement()
    {
        $instance = new ${className}('Test', 5);

        // Test default increment
        $result = $instance->increment();
        $this->assertEquals(6, $result);
        $this->assertEquals(6, $instance->getValue());

        // Test increment with amount
        $result = $instance->increment(4);
        $this->assertEquals(10, $result);
        $this->assertEquals(10, $instance->getValue());
    }

    /**
     * Test process method
     */
    public function testProcess()
    {
        // Test with low value
        $instance = new ${className}('Test', 5);
        $this->assertEquals('Test (Low Value)', $instance->process());

        // Test with high value
        $instance->setValue(15);
        $this->assertEquals('Test (High Value)', $instance->process());
    }

    /**
     * Test string conversion
     */
    public function testToString()
    {
        $instance = new ${className}('Test', 10);
        $this->assertEquals('${className} [name: Test, value: 10]', (string)$instance);
    }
}` : ''}

${includeComments ? '// Example usage' : ''}
<?php

// Create an instance
$instance = new ${className}('Example', 5);

// Use getters
echo "Name: " . $instance->getName() . PHP_EOL;
echo "Value: " . $instance->getValue() . PHP_EOL;

// Use setters
$instance->setName('Updated Example');
$instance->setValue(15);

// Use increment
$newValue = $instance->increment(5);
echo "New value after increment: " . $newValue . PHP_EOL;

// Use process
$result = $instance->process();
echo "Process result: " . $result . PHP_EOL;

// Convert to string
echo "String representation: " . $instance . PHP_EOL;
`;
};

export default class_;