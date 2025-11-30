import { getPackagePath } from './getPackagePath.js';

/**
 * Java Class Template
 */
export const javaClass = (options) => {
    const {
        includeComments = true,
        includeTests = false,
        className = 'MyClass',
        packageName = 'com.example.myapp',
        authorName = 'YourName'
    } = options || {}; // Add default empty object to prevent errors if options is undefined

    const packagePath = getPackagePath(packageName);
    const testPackageName = `${packageName}.tests`; // Example test package convention
    const testPackagePath = getPackagePath(testPackageName);
    const generationDate = new Date().toISOString().split('T')[0];

    // Main class code generation
    let classContent = `${includeComments ?
`/**
 * ${className} - Class description
 *
 * Provides basic functionalities for demonstration.
 *
 * @author ${authorName}
 * @version 1.0
 * @since ${generationDate}
 */` : ""}
package ${packageName};

${includeComments ? `
// Consider adding necessary imports here if needed
// import java.util.ArrayList;
` : ""}
public class ${className} {

    ${includeComments ? "// --- Fields ---" : ""}
    private String name;
    private int value;

    ${includeComments ?
`   /**
     * Default constructor.
     * Initializes the object with default values.
     */` : ""}
    public ${className}() {
        this.name = "${className}"; // Default name
        this.value = 0;         // Default value
    }

    ${includeComments ?
`   /**
     * Parameterized constructor.
     *
     * @param name The initial name for the object.
     * @param value The initial value for the object.
     */` : ""}
    public ${className}(String name, int value) {
        // Add validation if necessary (e.g., check for null name)
        this.name = name;
        this.value = value;
    }

    ${includeComments ?
`   /**
     * Gets the current name of the object.
     *
     * @return The current name.
     */` : ""}
    public String getName() {
        return name;
    }

    ${includeComments ?
`   /**
     * Sets the name of the object.
     *
     * @param name The new name to set.
     */` : ""}
    public void setName(String name) {
        // Consider adding validation (e.g., non-empty)
        this.name = name;
    }

    ${includeComments ?
`   /**
     * Gets the current value of the object.
     *
     * @return The current value.
     */` : ""}
    public int getValue() {
        return value;
    }

    ${includeComments ?
`   /**
     * Sets the value of the object.
     *
     * @param value The new value to set.
     */` : ""}
    public void setValue(int value) {
        // Consider adding validation (e.g., range checks)
        this.value = value;
    }

    ${includeComments ?
`   /**
     * Increments the current value by a specified amount.
     *
     * @param amount The amount to add to the current value.
     * @return The new value after incrementing.
     */` : ""}
    public int increment(int amount) {
        // Consider potential overflow if value can become very large
        this.value += amount;
        return this.value;
    }

    ${includeComments ?
`   /**
     * Returns a string representation of the object.
     * Includes the values of its fields.
     *
     * @return A string describing the object state.
     */` : ""}
    @Override
    public String toString() {
        return "${className}{" +
               "name='" + name + '\\'' + // Escaped single quote
               ", value=" + value +
               '}';
    }

    ${includeComments ?
`   /**
     * Main method for simple demonstration or testing purposes.
     * Creates an instance, prints its state, modifies it, and prints again.
     *
     * @param args Command line arguments (not used in this example).
     */` : ""}
    public static void main(String[] args) {
        ${className} instance1 = new ${className}("Test Instance", 10);
        System.out.println("Initial state: " + instance1); // Uses toString()

        instance1.increment(5);
        System.out.println("Value after increment: " + instance1.getValue());
        System.out.println("State after increment: " + instance1);

        ${className} defaultInstance = new ${className}();
        System.out.println("Default instance state: " + defaultInstance);
    }
}`; // End of class definition

    // Test class generation (appended if requested)
    const testContent = includeTests ?
`

// ================== TEST CLASS (Should be in separate file: ${testPackagePath}/${className}Test.java) ==================

package ${testPackageName};

import ${packageName}.${className}; // Import the class under test
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for the {@link ${className}} class.
 */
@DisplayName("${className} Tests")
class ${className}Test { // Use 'class' for JUnit 5 test class

    private ${className} instance;

    @BeforeEach
    void setUp() {
        // Re-initialize before each test for isolation
        instance = new ${className}("Initial Name", 100);
    }

    @Test
    @DisplayName("Default Constructor Sets Correct Defaults")
    void testDefaultConstructor() {
        ${className} defaultInstance = new ${className}();
        assertAll(
            () -> assertEquals("${className}", defaultInstance.getName(), "Default name should match class name"),
            () -> assertEquals(0, defaultInstance.getValue(), "Default value should be 0")
        );
    }

    @Test
    @DisplayName("Parameterized Constructor Sets Values Correctly")
    void testParameterizedConstructor() {
        ${className} paramInstance = new ${className}("Param Name", 50);
        assertAll(
            () -> assertEquals("Param Name", paramInstance.getName(), "Parameterized name should be set"),
            () -> assertEquals(50, paramInstance.getValue(), "Parameterized value should be set")
        );
    }

    @Test
    @DisplayName("Getters Retrieve Correct Values")
    void testGetters() {
        assertAll(
            () -> assertEquals("Initial Name", instance.getName(), "getName should return initial name"),
            () -> assertEquals(100, instance.getValue(), "getValue should return initial value")
        );
    }

    @Test
    @DisplayName("Setters Update Values Correctly")
    void testSetters() {
        instance.setName("Updated Name");
        instance.setValue(200);
        assertAll(
            () -> assertEquals("Updated Name", instance.getName(), "setName should update the name"),
            () -> assertEquals(200, instance.getValue(), "setValue should update the value")
        );
    }

    @Test
    @DisplayName("Increment Method Adds Correct Amount")
    void testIncrement() {
        int initialValue = instance.getValue();
        int incrementAmount = 25;
        int expectedValue = initialValue + incrementAmount;

        int newValue = instance.increment(incrementAmount);

        assertAll(
            () -> assertEquals(expectedValue, newValue, "increment should return the new value"),
            () -> assertEquals(expectedValue, instance.getValue(), "Instance value should be updated after increment")
        );

        // Test incrementing again
        int secondIncrement = -10;
        int finalExpectedValue = expectedValue + secondIncrement;
        int finalNewValue = instance.increment(secondIncrement);

         assertAll(
            () -> assertEquals(finalExpectedValue, finalNewValue, "increment should handle negative amounts"),
            () -> assertEquals(finalExpectedValue, instance.getValue(), "Instance value should be updated after second increment")
        );
    }

    @Test
    @DisplayName("toString Method Returns Expected Format")
    void testToString() {
        String expected = "${className}{name='Initial Name', value=100}";
        assertEquals(expected, instance.toString(), "toString output format should match expected");

        // Test with different values
        instance.setName("Another");
        instance.setValue(-5);
        String expectedAfterChange = "${className}{name='Another', value=-5}";
        assertEquals(expectedAfterChange, instance.toString(), "toString should reflect updated state");
    }
}` : ""; // End of testContent

    return classContent + testContent; // Concatenate class and optional test code
};