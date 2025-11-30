// templates/csharp.js
// C# templates for various code skeletons

// --- Internal Helper Functions ---

/**
 * Generates a block of C# using statements.
 * @param {string[]} namespaces - Array of namespaces to include.
 * @returns {string} - Formatted using statements.
 * @private
 */
const _generateUsingStatements = (namespaces) => {
    return namespaces.filter(Boolean).map(ns => `using ${ns};`).join('\n');
};

/**
 * Generates a C# XML documentation comment block.
 * @param {string} summary - The content for the <summary> tag.
 * @param {string[]} [params=[]] - Array of strings for <param> tags (e.g., '<param name="id">The ID</param>').
 * @param {string[]} [typeparams=[]] - Array of strings for <typeparam> tags.
 * @param {string} [returns=''] - The content for the <returns> tag.
 * @param {string} [indent='    '] - Indentation string.
 * @returns {string} - Formatted XML doc comment.
 * @private
 */
const _generateXmlDocComment = (summary, params = [], typeparams = [], returns = '', indent = '    ') => {
    if (!summary) return ''; // Don't generate if no summary

    let comment = `${indent}/// <summary>\n`;
    comment += `${indent}/// ${summary}\n`;
    comment += `${indent}/// </summary>\n`;
    typeparams.forEach(tp => { comment += `${indent}/// ${tp}\n`; });
    params.forEach(p => { comment += `${indent}/// ${p}\n`; });
    if (returns) {
        comment += `${indent}/// <returns>${returns}</returns>\n`;
    }
    // Remove the last newline character before returning
    return comment.trimEnd();
};


/**
 * Generates a C# property with optional getter, setter, comment, attributes, and initializer.
 * @param {object} options
 * @param {boolean} [options.includeComments=true]
 * @param {string} [options.accessModifier='public']
 * @param {string} options.type
 * @param {string} options.name
 * @param {string} [options.summary=''] - Summary for XML doc comment.
 * @param {boolean} [options.hasGetter=true]
 * @param {boolean} [options.hasSetter=true]
 * @param {string|null} [options.initialValue=null] - e.g., '= string.Empty;' or '= 0;'
 * @param {string[]} [options.attributes=[]] - e.g., ['[Key]', '[Required]']
 * @param {string} [options.indent='        '] - Indentation for property members.
 * @returns {string} - Generated property string.
 * @private
 */
const _generateProperty = (options) => {
    const {
        includeComments = true,
        accessModifier = 'public',
        type,
        name,
        summary = '',
        hasGetter = true,
        hasSetter = true,
        initialValue = null,
        attributes = [],
        indent = '        ' // Default indent for properties inside class
    } = options;

    const comment = includeComments ? _generateXmlDocComment(summary, [], [], '', indent) + '\n' : '';
    const attributeLines = attributes.map(attr => `${indent}${attr}`).join('\n') + (attributes.length > 0 ? '\n' : '');
    const getter = hasGetter ? ' get;' : '';
    const setter = hasSetter ? ' set;' : '';
    const initializer = initialValue !== null ? ` ${initialValue}` : '';

    return `${comment}${attributeLines}${indent}${accessModifier} ${type} ${name} {${getter}${setter} }${initializer}`;
};

/**
 * Generates the test code for the C# Class template.
 * @private
 */
const _generateClassTests = (options) => {
    const { className, namespaceName } = options;
    const testNamespaceName = `${namespaceName}.Tests`;

    return `
// Test class: ${className}Tests.cs
using System;
using System.Collections.Generic;
using System.Linq; // Added for potential complex test scenarios
using Xunit; // Using Xunit
using ${namespaceName}; // Reference the namespace of the class being tested

namespace ${testNamespaceName}
{
    public class ${className}Tests
    {
        [Fact] // Using Xunit [Fact] attribute
        public void DefaultConstructor_SetsDefaultValues()
        {
            // Arrange & Act
            var instance = new ${className}();

            // Assert (using Xunit Assert)
            Assert.Equal("${className}", instance.Name);
            Assert.Equal(0, instance.Value);
        }

        [Fact]
        public void ParameterizedConstructor_SetsProvidedValues()
        {
            // Arrange & Act
            var instance = new ${className}("Test", 10);

            // Assert
            Assert.Equal("Test", instance.Name);
            Assert.Equal(10, instance.Value);
        }

        [Fact]
        public void Increment_AddsValueCorrectly()
        {
            // Arrange
            var instance = new ${className}("Test", 5);

            // Act
            var result = instance.Increment(3);

            // Assert
            Assert.Equal(8, result);
            Assert.Equal(8, instance.Value); // Check instance state too
        }

        [Fact]
        public void ProcessData_WithNullData_ReturnsEmptyList()
        {
            // Arrange
            var instance = new ${className}();

            // Act
            var result = instance.ProcessData<string>(null);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result); // Xunit assertion for empty collection
        }

        [Fact]
        public void ProcessData_WithEmptyData_ReturnsEmptyList()
        {
            // Arrange
            var instance = new ${className}();
            var testData = new List<string>();

            // Act
            var result = instance.ProcessData(testData);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }


        [Fact]
        public void ProcessData_WithValidData_ReturnsExpectedData()
        {
            // Arrange
            var instance = new ${className}();
            var testData = new List<string> { "a", "b", "c" };

            // Act
            var result = instance.ProcessData(testData);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.Count);
            Assert.Equal(testData, result); // Xunit Assert.Equal works for collections
            Assert.NotSame(testData, result); // Ensure it's a copy as ProcessData makes one
        }

        [Fact]
        public void ToString_ReturnsFormattedString()
        {
            // Arrange
            var instance = new ${className}("Test", 10);

            // Act
            var result = instance.ToString();

            // Assert
            Assert.Equal("${className} [Name: Test, Value: 10]", result);
        }
    }
}`;
};


/**
 * Generates the test code for the C# Controller template.
 * @private
 */


/**
 * Generates the test code for the C# Model template.
 * @private
 */
const _generateModelTests = (options) => {
    const { className, namespaceName } = options;
    const testNamespaceName = `${namespaceName}.Tests`;

    return `
// Test class: ${className}Tests.cs
using System;
using Xunit; // Using Xunit
using ${namespaceName}; // Reference the namespace of the model being tested

namespace ${testNamespaceName}
{
    public class ${className}Tests
    {
        // --- IsInStock Property Tests ---
        [Fact]
        public void IsInStock_WithPositiveQuantity_ReturnsTrue()
        {
            // Arrange
            var product = new ${className} { StockQuantity = 10 };

            // Act
            var result = product.IsInStock; // Access the computed property

            // Assert (using Xunit Assert)
            Assert.True(result);
        }

        [Fact]
        public void IsInStock_WithZeroQuantity_ReturnsFalse()
        {
            // Arrange
            var product = new ${className} { StockQuantity = 0 };

            // Act
            var result = product.IsInStock;

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void IsInStock_WithNegativeQuantity_ReturnsFalse()
        {
             // Arrange
            var product = new ${className} { StockQuantity = -5 }; // Assume invalid state for testing logic

             // Act
            var result = product.IsInStock;

             // Assert
            Assert.False(result);
        }


        // --- GetDiscountedPrice Method Tests ---
        [Theory] // Use Theory for multiple inputs/outputs
        [InlineData(100.00, 20, 80.00)]   // Input Price, Discount %, Expected Price
        [InlineData(50.00, 10, 45.00)]
        [InlineData(99.99, 10, 90.00)]    // Corrected: 99.99 * 0.9 = 89.991 -> Rounds AwayFromZero to 90.00
        [InlineData(123.45, 15, 104.93)]   // 123.45 * 0.85 = 104.9325 -> Rounds AwayFromZero to 104.93
        [InlineData(10.00, 5.5, 9.45)]     // 10 * (1 - 0.055) = 10 * 0.945 = 9.45
        [InlineData(0.50, 50, 0.25)]      // 0.50 * 0.5 = 0.25
        public void GetDiscountedPrice_WithValidPercentage_ReturnsCorrectRoundedPrice(decimal originalPrice, decimal discountPercentage, decimal expectedPrice)
        {
            // Arrange
            var product = new ${className} { Price = originalPrice };

            // Act
            var result = product.GetDiscountedPrice(discountPercentage);

            // Assert
            Assert.Equal(expectedPrice, result);
        }

        [Fact]
        public void GetDiscountedPrice_WithZeroPercentage_ReturnsOriginalPrice()
        {
            // Arrange
            var product = new ${className} { Price = 100.00m };

            // Act
            var result = product.GetDiscountedPrice(0);

            // Assert
            Assert.Equal(100.00m, result); // Use 'm' for decimal comparison
        }

         [Fact]
        public void GetDiscountedPrice_With100Percentage_ReturnsZeroPrice()
        {
            // Arrange
            var product = new ${className} { Price = 100.00m };

            // Act
            var result = product.GetDiscountedPrice(100);

            // Assert
            Assert.Equal(0.00m, result); // Use 'm'
        }


        [Theory]
        [InlineData(-10)]    // Negative percentage
        [InlineData(101)]    // Percentage over 100
        [InlineData(-0.001)] // Small negative
        [InlineData(100.001)]// Small positive above 100
        public void GetDiscountedPrice_WithInvalidPercentage_ThrowsArgumentOutOfRangeException(decimal invalidPercentage)
        {
            // Arrange
            var product = new ${className} { Price = 100.00m };

            // Act & Assert
            var exception = Assert.Throws<ArgumentOutOfRangeException>(() => product.GetDiscountedPrice(invalidPercentage));

            // Optional: Check the parameter name
            Assert.Equal("discountPercentage", exception.ParamName);
            Assert.Contains("Discount percentage must be between 0 and 100.", exception.Message);
        }

        // Example test for Customer.FullName (if Customer is part of the model file)
        [Fact]
        public void Customer_FullName_ReturnsCorrectFormat()
        {
            // Arrange
            var customer = new Customer { FirstName = "John", LastName = "Doe" };
            // Act
            var fullName = customer.FullName;
            // Assert
            Assert.Equal("John Doe", fullName);
        }
    } // Class close
} // Namespace close
`;
};


// --- Internal: Core Generation Logic ---

/**
 * Generates the core C# Class structure.
 * @private
 */
const _generateCoreClass = (options) => {
    const { includeComments, className, namespaceName } = options;
    const indent = '        '; // Indent for members within the class

    const usings = _generateUsingStatements(['System', 'System.Collections.Generic', 'System.Linq']);
    const classComment = includeComments ? _generateXmlDocComment(`${className} - A class for demonstration`, [], [], '', '    ') : '';

    // Properties
    const nameProperty = _generateProperty({ includeComments, type: 'string', name: 'Name', summary: 'Gets or sets the name', indent });
    const valueProperty = _generateProperty({ includeComments, type: 'int', name: 'Value', summary: 'Gets or sets the value', indent });

    // Constructors
    const defaultConstructorComment = includeComments ? _generateXmlDocComment('Default constructor', [], [], '', indent) : '';
    const defaultConstructor = `
${defaultConstructorComment}
${indent}public ${className}()
${indent}{
${indent}    _name = "${className}";
${indent}    _value = 0;
${indent}}`;

    const paramConstructorComment = includeComments ? _generateXmlDocComment('Parameterized constructor', ['<param name="name">The name to set</param>', '<param name="value">The value to set</param>'], [], '', indent) : '';
    const paramConstructor = `
${paramConstructorComment}
${indent}public ${className}(string name, int value)
${indent}{
${indent}    _name = name;
${indent}    _value = value;
${indent}}`;

    // Methods
    const incrementMethodComment = includeComments ? _generateXmlDocComment('Increment the value', ['<param name="amount">The amount to increment by</param>'], [], 'The new value', indent) : '';
    const incrementMethod = `
${incrementMethodComment}
${indent}public int Increment(int amount)
${indent}{
${indent}    _value += amount;
${indent}    return _value;
${indent}}`;

    const processDataMethodComment = includeComments ? _generateXmlDocComment('Process the data (Example generic method)', ['<param name="data">Data to process</param>'], ['<typeparam name="T">Type of data</typeparam>'], 'Processed data', indent) : '';
    const processDataMethod = `
${processDataMethodComment}
${indent}public List<T> ProcessData<T>(List<T> data)
${indent}{
${indent}    if (data == null || !data.Any())
${indent}    {
${indent}        return new List<T>();
${indent}    }
${indent}
${indent}    ${includeComments ? "// For demonstration - just return a copy of the input data" : ""}
${indent}    // In a real scenario, perform actual processing here
${indent}    return data.ToList();
${indent}}`;

    const toStringMethodComment = includeComments ? _generateXmlDocComment('Override of the ToString method', [], [], 'String representation', indent) : '';
    const toStringMethod = `
${toStringMethodComment}
${indent}public override string ToString()
${indent}{
${indent}    return $"${className} [Name: {_name}, Value: {_value}]";
${indent}}`;

    return `
${includeComments ? `// Generated Class: ${className}.cs` : ''}
${usings}

namespace ${namespaceName}
{
${classComment}
    public class ${className}
    {
        ${includeComments ? "// Private fields" : ""}
        private string _name = string.Empty; // Initialize to avoid warnings
        private int _value;

${nameProperty}

${valueProperty}

${defaultConstructor}

${paramConstructor}

${incrementMethod}

${processDataMethod}

${toStringMethod}
    }
}`;
};


/**
 * Generates the core C# Controller structure (excluding supporting types and tests).
 * @private
 */
const _generateCoreController = (options) => {
    const {
        includeComments, className, apiName, controllerNamespace, modelNamespace, serviceNamespace
    } = options;

    const controllerClassName = `${className}Controller`;
    const serviceInterfaceName = `I${className}Service`;
    const lowerClassName = className.toLowerCase();
    const indent = '        '; // Indent for members within the class
    const methodIndent = '            '; // Indent for logic within methods


    const usings = _generateUsingStatements([
        'System',
        'System.Collections.Generic',
        'System.Linq',
        'System.Threading.Tasks',
        'Microsoft.AspNetCore.Mvc',
        'Microsoft.AspNetCore.Authorization', // Keep conditional if needed
        'Microsoft.Extensions.Logging',
        modelNamespace,
        serviceNamespace
    ]);

    const classComment = includeComments ? _generateXmlDocComment(`API Controller for ${className} resources (${apiName})`, [], [], '', '    ') : '';
    const constructorComment = includeComments ? _generateXmlDocComment(
        `Constructor with dependency injection`,
        [`<param name="service">The ${className} service (${serviceInterfaceName})</param>`,
         `<param name="logger">The logger instance</param>`],
        [], '', indent) : '';

    // Helper to generate a standard API method with try-catch and logging
    const generateApiMethod = (methodOptions) => {
        const {
            httpVerb, route, methodName, parameters, returnType,
            successStatusCode, successLog, notFoundLog,
            mainLogic, produces = [], summary = '', paramDocs = [], responseDocs = []
        } = methodOptions;

        const methodComment = includeComments ? _generateXmlDocComment(summary, paramDocs, [], returnType.replace('Task<ActionResult<', '').replace('Task<IActionResult>', '').replace('>>', '>').replace('>', ''), indent) : '';
        const producesAttributes = produces.map(p => `${indent}[ProducesResponseType(${p.type ? `typeof(${p.type}), ` : ''}${p.code})]`).join('\n');
        const parameterString = parameters.map(p => `${p.decorators ? p.decorators + ' ' : ''}${p.type} ${p.name}`).join(', ');

        let responseCodeDocs = '';
        if(includeComments && responseDocs.length > 0) {
            responseCodeDocs = responseDocs.map(rd => `${indent}/// <response code="${rd.code}">${rd.description}</response>`).join('\n') + '\n';
        }


        return `
${methodComment}
${responseCodeDocs}${producesAttributes}
${indent}[${httpVerb}${route ? `("${route}")` : ''}]
${indent}public async ${returnType} ${methodName}(${parameterString})
${indent}{
${indent}    try
${indent}    {
${methodIndent}        ${mainLogic}
${indent}    }
${indent}    catch (Exception ex)
${indent}    {
${methodIndent}        // Generic error logging, specific handlers can be added above this catch-all
${methodIndent}        _logger.LogError(ex, "An error occurred in ${methodName}");
${methodIndent}        return StatusCode(500, "An unexpected error occurred. Please try again later.");
${indent}    }
${indent}}`;
    };

    // --- Define Methods using the helper ---

    const getAllMethod = generateApiMethod({
        httpVerb: 'HttpGet',
        methodName: `GetAll${className}s`,
        parameters: [],
        returnType: `Task<ActionResult<IEnumerable<${className}>>>`,
        produces: [{ type: `IEnumerable<${className}>`, code: 200 }, { code: 500 }],
        summary: `Gets all ${apiName}. GET: api/${apiName}`,
        responseDocs: [
            { code: 200, description: `Returns the list of ${apiName}` },
            { code: 500, description: 'If an internal server error occurs' }
        ],
        mainLogic: `
${methodIndent}_logger.LogInformation("Attempting to retrieve all ${apiName}");
${methodIndent}var results = await _service.GetAll${className}sAsync();
${methodIndent}_logger.LogInformation($"Successfully retrieved {results?.Count() ?? 0} ${apiName}");
${methodIndent}return Ok(results ?? new List<${className}>());` // Return empty list if service returns null
    });

    const getByIdMethod = generateApiMethod({
        httpVerb: 'HttpGet',
        route: '{id}',
        methodName: `Get${className}`,
        parameters: [{ type: 'int', name: 'id' }],
        returnType: `Task<ActionResult<${className}>>`,
        produces: [{ type: className, code: 200 }, { code: 404 }, { code: 500 }],
        summary: `Gets a specific ${lowerClassName} by its ID. GET: api/${apiName}/{id}`,
        paramDocs: [`<param name="id">The ID of the ${lowerClassName} to retrieve</param>`],
        responseDocs: [
            { code: 200, description: `Returns the requested ${lowerClassName}` },
            { code: 404, description: `If the ${lowerClassName} with the specified ID is not found` },
            { code: 500, description: 'If an internal server error occurs' }
        ],
        mainLogic: `
${methodIndent}_logger.LogInformation("Attempting to retrieve ${lowerClassName} with ID: {${className}Id}", id);
${methodIndent}var result = await _service.Get${className}ByIdAsync(id);
${methodIndent}if (result == null)
${methodIndent}{
${methodIndent}    _logger.LogWarning("${className} with ID: {${className}Id} not found", id);
${methodIndent}    return NotFound($"${className} with ID {id} not found.");
${methodIndent}}
${methodIndent}_logger.LogInformation("Successfully retrieved ${lowerClassName} with ID: {${className}Id}", id);
${methodIndent}return Ok(result);`
    });

    const createMethod = generateApiMethod({
        httpVerb: 'HttpPost',
        methodName: `Create${className}`,
        parameters: [{ decorators: '[FromBody]', type: className, name: `${lowerClassName}ToCreate` }],
        returnType: `Task<ActionResult<${className}>>`,
        produces: [{ type: className, code: 201 }, { code: 400 }, { code: 500 }],
        summary: `Creates a new ${lowerClassName}. POST: api/${apiName}`,
        paramDocs: [`<param name="${lowerClassName}ToCreate">The ${lowerClassName} data to create</param>`],
         responseDocs: [
            { code: 201, description: `Returns the newly created ${lowerClassName}` },
            { code: 400, description: 'If the item is null or validation fails' },
            { code: 500, description: 'If an internal server error occurs' }
        ],
       mainLogic: `
${methodIndent}// Basic null check
${methodIndent}if (${lowerClassName}ToCreate == null)
${methodIndent}{
${methodIndent}    _logger.LogWarning("Create ${lowerClassName} attempt failed: Request body was null.");
${methodIndent}    return BadRequest("Request body cannot be empty.");
${methodIndent}}
${methodIndent}// ModelState validation handled by [ApiController] for [FromBody]

${methodIndent}_logger.LogInformation("Attempting to create a new ${lowerClassName}");
${methodIndent}var created${className} = await _service.Create${className}Async(${lowerClassName}ToCreate);

${methodIndent}if (created${className} == null)
${methodIndent}{
${methodIndent}     _logger.LogError("Failed to create ${lowerClassName} - service returned null or failed.");
${methodIndent}     return StatusCode(500, "Failed to create the ${lowerClassName}. An unexpected issue occurred in the service layer.");
${methodIndent}}

${methodIndent}_logger.LogInformation("Successfully created ${lowerClassName} with ID: {${className}Id}", created${className}.Id);
${methodIndent}return CreatedAtAction(nameof(Get${className}), new { id = created${className}.Id }, created${className});`
        // Note: Specific ArgumentException handling removed for brevity, can be added before the generic catch if needed.
    });


    const updateMethod = generateApiMethod({
        httpVerb: 'HttpPut',
        route: '{id}',
        methodName: `Update${className}`,
        parameters: [{ type: 'int', name: 'id' }, { decorators: '[FromBody]', type: className, name: `${lowerClassName}ToUpdate` }],
        returnType: `Task<IActionResult>`,
        produces: [{ code: 204 }, { code: 400 }, { code: 404 }, { code: 500 }],
        summary: `Updates an existing ${lowerClassName}. PUT: api/${apiName}/{id}`,
        paramDocs: [
            `<param name="id">The ID of the ${lowerClassName} to update</param>`,
            `<param name="${lowerClassName}ToUpdate">The updated ${lowerClassName} data</param>`
        ],
        responseDocs: [
            { code: 204, description: 'If the update was successful' },
            { code: 400, description: "If the ID in the URL doesn't match the ID in the body, body is null, or validation fails" },
            { code: 404, description: `If the ${lowerClassName} with the specified ID is not found` },
            { code: 500, description: 'If an internal server error occurs' }
        ],
        mainLogic: `
${methodIndent}if (${lowerClassName}ToUpdate == null || id != ${lowerClassName}ToUpdate.Id)
${methodIndent}{
${methodIndent}    _logger.LogWarning("Update failed for ID {${className}Id}: ID mismatch or null request body.", id);
${methodIndent}    return BadRequest("ID mismatch or request body cannot be empty.");
${methodIndent}}
${methodIndent}// ModelState validation handled by [ApiController]

${methodIndent}_logger.LogInformation("Attempting to update ${lowerClassName} with ID: {${className}Id}", id);
${methodIndent}bool updated = await _service.Update${className}Async(${lowerClassName}ToUpdate);

${methodIndent}if (!updated)
${methodIndent}{
${methodIndent}    _logger.LogWarning("Update failed: Service indicated ${className} with ID {${className}Id} was not found or could not be updated.", id);
${methodIndent}    return NotFound($"${className} with ID {id} not found or could not be updated.");
${methodIndent}}

${methodIndent}_logger.LogInformation("Successfully updated ${lowerClassName} with ID: {${className}Id}", id);
${methodIndent}return NoContent();`
        // Note: Specific ArgumentException handling removed for brevity
    });


    const deleteMethod = generateApiMethod({
        httpVerb: 'HttpDelete',
        route: '{id}',
        methodName: `Delete${className}`,
        parameters: [{ type: 'int', name: 'id' }],
        returnType: `Task<IActionResult>`,
        produces: [{ code: 204 }, { code: 404 }, { code: 500 }],
        summary: `Deletes a ${lowerClassName} by its ID. DELETE: api/${apiName}/{id}`,
        paramDocs: [`<param name="id">The ID of the ${lowerClassName} to delete</param>`],
        responseDocs: [
            { code: 204, description: 'If the deletion was successful' },
            { code: 404, description: `If the ${lowerClassName} with the specified ID is not found` },
            { code: 500, description: 'If an internal server error occurs' }
        ],
        mainLogic: `
${methodIndent}_logger.LogInformation("Attempting to delete ${lowerClassName} with ID: {${className}Id}", id);
${methodIndent}bool deleted = await _service.Delete${className}Async(id);

${methodIndent}if (!deleted)
${methodIndent}{
${methodIndent}    _logger.LogWarning("Delete failed: Service indicated ${className} with ID {${className}Id} was not found.", id);
${methodIndent}    return NotFound($"${className} with ID {id} not found or could not be deleted.");
${methodIndent}}

${methodIndent}_logger.LogInformation("Successfully deleted ${lowerClassName} with ID: {${className}Id}", id);
${methodIndent}return NoContent();`
    });

    const searchMethod = generateApiMethod({
        httpVerb: 'HttpGet',
        route: 'search',
        methodName: `Search${className}s`,
        parameters: [{ decorators: '[FromQuery]', type: 'string', name: `name` }],
        returnType: `Task<ActionResult<IEnumerable<${className}>>>`,
        produces: [{ type: `IEnumerable<${className}>`, code: 200 }, { code: 400 }, { code: 500 }],
        summary: `Searches for ${apiName} by name. GET: api/${apiName}/search?name={name}`,
        paramDocs: [`<param name="name">The name (or part of the name) to search for</param>`],
        responseDocs: [
            { code: 200, description: `Returns the list of matching ${apiName}` },
            { code: 400, description: 'If the name parameter is missing or empty' },
            { code: 500, description: 'If an internal server error occurs' }
        ],
        mainLogic: `
${methodIndent}if (string.IsNullOrWhiteSpace(name))
${methodIndent}{
${methodIndent}    _logger.LogWarning("Search ${apiName} attempt failed: 'name' query parameter was missing or empty.");
${methodIndent}    return BadRequest("The 'name' query parameter is required for searching.");
${methodIndent}}

${methodIndent}_logger.LogInformation("Attempting to search ${apiName} by name: '{SearchTerm}'", name);
${methodIndent}var results = await _service.Search${className}sAsync(name);
${methodIndent}_logger.LogInformation($"Search for '{name}' returned {results?.Count() ?? 0} results.");
${methodIndent}return Ok(results ?? new List<${className}>());`
    });

    // --- Assemble Controller ---
    return `
${includeComments ? `// Generated Controller: ${controllerClassName}.cs` : ''}
${usings}

namespace ${controllerNamespace}
{
${classComment}
    [ApiController]
    [Route("api/${apiName}")]
    // [Authorize] // Example: Uncomment if authorization is required globally for this controller
    public class ${controllerClassName} : ControllerBase
    {
        private readonly ${serviceInterfaceName} _service;
        private readonly ILogger<${controllerClassName}> _logger;

${constructorComment}
${indent}public ${controllerClassName}(${serviceInterfaceName} service, ILogger<${controllerClassName}> logger)
${indent}{
${indent}    _service = service ?? throw new ArgumentNullException(nameof(service));
${indent}    _logger = logger ?? throw new ArgumentNullException(nameof(logger));
${indent}}

${getAllMethod}

${getByIdMethod}

${createMethod}

${updateMethod}

${deleteMethod}

${searchMethod}
    }
}`;
};

/**
 * Generates the supporting interface and model definitions for the Controller template.
 * @private
 */
const _generateSupportingInterfacesAndModels = (options) => {
    const {
        includeComments, className, modelNamespace, serviceNamespace
    } = options;
    const lowerClassName = className.toLowerCase();
    const serviceInterfaceName = `I${className}Service`;

    // Service Interface
    const serviceInterfaceComment = includeComments ? _generateXmlDocComment(`Interface for ${className} service defining business logic operations.`, [], [], '', '    ') : '';
    const serviceInterface = `
namespace ${serviceNamespace} // Define service interface in its namespace
{
${serviceInterfaceComment}
    public interface ${serviceInterfaceName}
    {
        ${includeComments ? "        /// <summary>Gets all items.</summary>" : ""}
        Task<IEnumerable<${className}>> GetAll${className}sAsync();

        ${includeComments ? "        /// <summary>Gets an item by ID.</summary>" : ""}
        Task<${className}?> Get${className}ByIdAsync(int id); // Return nullable type if not found

        ${includeComments ? "        /// <summary>Creates a new item.</summary>" : ""}
        Task<${className}?> Create${className}Async(${className} ${lowerClassName}ToCreate); // Return created item or null on failure

        ${includeComments ? "        /// <summary>Updates an existing item.</summary>" : ""}
        Task<bool> Update${className}Async(${className} ${lowerClassName}ToUpdate); // Return bool indicating success/found & updated

        ${includeComments ? "        /// <summary>Deletes an item by ID.</summary>" : ""}
        Task<bool> Delete${className}Async(int id); // Return bool indicating success/found & deleted

        ${includeComments ? "        /// <summary>Searches for items by name.</summary>" : ""}
        Task<IEnumerable<${className}>> Search${className}sAsync(string name);
    }
}`;

    // Model Definition
    const modelComment = includeComments ? _generateXmlDocComment(`Represents a ${className} entity.`, [], [], '', '    ') : '';
    const modelUsings = _generateUsingStatements(['System.ComponentModel.DataAnnotations']);
    const modelIndent = '        ';

    const idProperty = _generateProperty({ includeComments, type: 'int', name: 'Id', summary: 'Unique identifier.', attributes: ['[Key]'], indent: modelIndent }); // Assume Key is implicit or handled by convention/config
    const nameProperty = _generateProperty({ includeComments, type: 'string', name: 'Name', summary: `Name of the ${lowerClassName}. Should be required.`, attributes: [`[Required(ErrorMessage = "${className} name is required.")]`, `[StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters.")]`], initialValue: '= string.Empty;', indent: modelIndent });
    const emailProperty = _generateProperty({ includeComments, type: 'string?', name: 'Email', summary: 'Optional email address.', attributes: [`[EmailAddress(ErrorMessage = "Invalid email address format.")]`, `[StringLength(150)]`], indent: modelIndent });
    const isActiveProperty = _generateProperty({ includeComments, type: 'bool', name: 'IsActive', summary: `Indicates if the ${lowerClassName} is active.`, initialValue: '= true;', indent: modelIndent });
    const createdAtProperty = _generateProperty({ includeComments, type: 'DateTime', name: 'CreatedAt', summary: 'Timestamp when the entity was created (UTC).', initialValue: '= DateTime.UtcNow;', indent: modelIndent });
    const updatedAtProperty = _generateProperty({ includeComments, type: 'DateTime?', name: 'UpdatedAt', summary: 'Timestamp when the entity was last updated (UTC). Nullable.', indent: modelIndent });

    const modelDefinition = `
namespace ${modelNamespace} // Define model in its namespace
{
    ${modelUsings}

${modelComment}
    public class ${className}
    {
${idProperty}

${nameProperty}

${emailProperty}

${isActiveProperty}

${createdAtProperty}

${updatedAtProperty}
    }
}`;

    return `
// --- Supporting Interface and Model (Defined here for template simplicity) ---
// In a real project, these would be in separate files under respective namespaces.
${serviceInterface}
${modelDefinition}
`;
};


/**
 * Generates the core C# Model structure (EF Core Style, excluding related entities and tests).
 * @private
 */
const _generateCoreModel = (options) => {
     const { includeComments, className, namespaceName } = options;
     const indent = '        '; // Indent for members within the class

     const usings = _generateUsingStatements([
        'System',
        'System.Collections.Generic',
        'System.ComponentModel.DataAnnotations',
        'System.ComponentModel.DataAnnotations.Schema'
     ]);
     const classComment = includeComments ? _generateXmlDocComment(
        `Represents a ${className} entity.\n${indent}/// Often used with an ORM like Entity Framework Core.`,
        [], [], '', '    '
     ) : '';

     // Properties
     const idProperty = _generateProperty({ includeComments, type: 'int', name: 'Id', summary: "Primary key. Conventionally named 'Id' or '${className}Id'.", attributes: ['[Key]'], indent });
     const nameProperty = _generateProperty({ includeComments, type: 'string', name: 'Name', summary: `Name of the ${className}. Required field.`, attributes: ['[Required(ErrorMessage = "Name is required.")]', '[StringLength(100, MinimumLength = 3, ErrorMessage = "Name must be between 3 and 100 characters.")]'], initialValue: '= string.Empty;', indent });
     const descriptionProperty = _generateProperty({ includeComments, type: 'string?', name: 'Description', summary: 'Optional description.', attributes: ['[StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]'], indent });
     const priceProperty = _generateProperty({ includeComments, type: 'decimal', name: 'Price', summary: `Price of the ${className}. Must be positive.`, attributes: ['[Required(ErrorMessage = "Price is required.")]', '[Range(0.01, 1000000.00, ErrorMessage = "Price must be between $0.01 and $1,000,000.")]', '[Column(TypeName = "decimal(18, 2)")]'], indent });
     const stockProperty = _generateProperty({ includeComments, type: 'int', name: 'StockQuantity', summary: 'Available stock quantity. Cannot be negative.', attributes: ['[Range(0, int.MaxValue, ErrorMessage = "Stock quantity cannot be negative.")]'], initialValue: '= 0;', indent });
     const categoryIdProperty = _generateProperty({ includeComments, type: 'int?', name: 'CategoryId', summary: `Foreign key for the Category. Nullable if a ${className} might not have a category.`, hasGetter: true, hasSetter: true, indent });
     const categoryNavProperty = _generateProperty({ includeComments, type: 'virtual Category?', name: 'Category', summary: "Navigation property back to the Category. Marked as 'virtual' enables lazy loading (if configured in EF Core).", attributes: ['[ForeignKey("CategoryId")]'], indent });
     const createdAtProperty = _generateProperty({ includeComments, type: 'DateTime', name: 'CreatedAt', summary: 'Timestamp of creation (UTC). Often set automatically by the database or application.', initialValue: '= DateTime.UtcNow;', indent });
     const updatedAtProperty = _generateProperty({ includeComments, type: 'DateTime?', name: 'UpdatedAt', summary: 'Timestamp of the last update (UTC). Nullable.', indent });
     const isActiveProperty = _generateProperty({ includeComments, type: 'bool', name: 'IsActive', summary: `Flag indicating if the ${className} is currently active/available.`, initialValue: '= true;', indent });

     // Collection Navigation Property
     const orderItemsCollectionComment = includeComments ? _generateXmlDocComment(
            `Collection navigation property for OrderItems (representing the 'many' side of the relationship with OrderItem).\n${indent}/// Initialized to an empty collection to prevent null reference exceptions.\n${indent}/// Marked as 'virtual' for lazy loading.`, [], [], '', indent) : '';
     const orderItemsCollection = `
${orderItemsCollectionComment}
${indent}// Defines the relationship: One ${className} can be in many OrderItems
${indent}public virtual ICollection<OrderItem> OrderItems { get; set; } = new HashSet<OrderItem>(); // Use HashSet or List`;

     // Business Logic / Not Mapped Property
     const isInStockPropertyComment = includeComments ? _generateXmlDocComment(
         `Checks if the ${className} is currently in stock (StockQuantity > 0).\n${indent}/// This property is not mapped to the database.`, [], [], '', indent
     ) : '';
     const isInStockProperty = `
${isInStockPropertyComment}
${indent}[NotMapped] // Ensures EF Core ignores this property for database mapping
${indent}public bool IsInStock => StockQuantity > 0; // Expression-bodied property for conciseness`;

     // Business Logic Method
     const getDiscountedPriceComment = includeComments ? _generateXmlDocComment(
         `Calculates the price after applying a discount percentage. Does not modify the object's Price.`,
         ['<param name="discountPercentage">The discount percentage (e.g., 10 for 10%). Must be between 0 and 100.</param>'],
         [],
         'The discounted price, rounded to 2 decimal places.',
         indent
     ) + `\n${indent}/// <exception cref="ArgumentOutOfRangeException">Thrown if discountPercentage is not between 0 and 100.</exception>` : '';
     const getDiscountedPriceMethod = `
${getDiscountedPriceComment}
${indent}public decimal GetDiscountedPrice(decimal discountPercentage)
${indent}{
${indent}    if (discountPercentage < 0 || discountPercentage > 100)
${indent}    {
${indent}        throw new ArgumentOutOfRangeException(nameof(discountPercentage), "Discount percentage must be between 0 and 100.");
${indent}    }
${indent}
${indent}    if (discountPercentage == 0) return Price; // No calculation needed for 0% discount
${indent}
${indent}    // Calculate the multiplier (e.g., 10% discount -> 1 - (10 / 100) = 0.9)
${indent}    var discountMultiplier = 1 - (discountPercentage / 100m); // Use 'm' for decimal literal
${indent}    // Calculate and round the result to 2 decimal places (typical for currency)
${indent}    return Math.Round(Price * discountMultiplier, 2, MidpointRounding.AwayFromZero); // Explicit rounding mode
${indent}}`;


     return `
${includeComments ? `// Generated Model: ${className}.cs` : ''}
${usings}

namespace ${namespaceName}
{
${classComment}
    // Example Table attribute (optional, EF Core uses convention by pluralizing class name otherwise)
    // [Table("${className}s")]
    public class ${className}
    {
${idProperty}

${nameProperty}

${descriptionProperty}

${priceProperty}

${stockProperty}

${categoryIdProperty}

${categoryNavProperty}

${createdAtProperty}

${updatedAtProperty}

${isActiveProperty}

${orderItemsCollection}

        // --- Business Logic Methods (Examples) ---

${isInStockProperty}

${getDiscountedPriceMethod}
    }
`;
};

/**
 * Generates the related entity definitions for the Model template.
 * @private
 */
const _generateRelatedModelEntities = (options) => {
     const { includeComments, className, namespaceName } = options;
     const indent = '    '; // Indent for class members
     const propIndent = '        '; // Indent for properties within class

     // --- Category Entity ---
     const categoryComment = includeComments ? _generateXmlDocComment(`Represents a category for ${className}s.`, [], [], '', indent) : '';
     const categoryIdProp = _generateProperty({ includeComments: false, type: 'int', name: 'Id', attributes: ['[Key]'], indent: propIndent });
     const categoryNameProp = _generateProperty({ includeComments: false, type: 'string', name: 'Name', attributes: ['[Required(ErrorMessage = "Category name is required.")]', '[StringLength(50)]'], initialValue: '= string.Empty;', indent: propIndent });
     const categoryDescProp = _generateProperty({ includeComments: false, type: 'string?', name: 'Description', attributes: ['[StringLength(200)]'], indent: propIndent });
     const categoryProductsCollectionComment = includeComments ? _generateXmlDocComment(`Collection navigation property back to ${className}s in this category (One-to-Many).`, [], [], '', propIndent) : '';
     const categoryProductsCollection = `
${categoryProductsCollectionComment}
${propIndent}// Defines the relationship: One Category has many ${className}s
${propIndent}public virtual ICollection<${className}> ${className}s { get; set; } = new HashSet<${className}>();`;

     const categoryEntity = `
${categoryComment}
    public class Category
    {
${categoryIdProp}

${categoryNameProp}

${categoryDescProp}

${categoryProductsCollection}
    }`;

     // --- OrderItem Entity ---
     const orderItemComment = includeComments ? _generateXmlDocComment(`Represents an item within an Order (Join Entity for Many-to-Many between Order and ${className}).`, [], [], '', indent) : '';
     const orderItemIdProp = _generateProperty({ includeComments: false, type: 'int', name: 'Id', attributes: ['[Key]'], indent: propIndent });
     const orderItemOrderIdProp = _generateProperty({ includeComments, summary: 'Foreign key to the Order this item belongs to.', type: 'int', name: 'OrderId', attributes: ['[Required]'], indent: propIndent });
     const orderItemProductIdProp = _generateProperty({ includeComments, summary: `Foreign key to the ${className} included in this order item.`, type: 'int', name: `${className}Id`, attributes: ['[Required]'], indent: propIndent }); // Changed name convention
     const orderItemQuantityProp = _generateProperty({ includeComments, summary: `Quantity of the ${className} ordered.`, type: 'int', name: 'Quantity', attributes: ['[Range(1, 1000, ErrorMessage = "Quantity must be between 1 and 1000.")]'], indent: propIndent });
     const orderItemUnitPriceProp = _generateProperty({ includeComments, summary: 'Price per unit at the time the order was placed. Important for historical accuracy.', type: 'decimal', name: 'UnitPrice', attributes: ['[Required]', '[Column(TypeName = "decimal(18, 2)")]'], indent: propIndent });
     const orderItemOrderNavProp = _generateProperty({ includeComments, summary: 'Navigation property back to the Order.', type: 'virtual Order?', name: 'Order', attributes: ['[ForeignKey("OrderId")]'], indent: propIndent });
     const orderItemProductNavProp = _generateProperty({ includeComments, summary: `Navigation property back to the ${className}.`, type: `virtual ${className}?`, name: `${className}`, attributes: [`[ForeignKey("${className}Id")]`], indent: propIndent }); // Changed name convention

     const orderItemEntity = `
${orderItemComment}
    public class OrderItem
    {
${orderItemIdProp}

${orderItemOrderIdProp}

${orderItemProductIdProp}

${orderItemQuantityProp}

${orderItemUnitPriceProp}

${orderItemOrderNavProp}

${orderItemProductNavProp}
    }`;

    // --- Order Entity ---
    const orderComment = includeComments ? _generateXmlDocComment('Represents a customer order containing multiple OrderItems.', [], [], '', indent) : '';
    const orderIdProp = _generateProperty({ includeComments: false, type: 'int', name: 'Id', attributes: ['[Key]'], indent: propIndent });
    const orderNumberProp = _generateProperty({ includeComments, summary: 'Unique order identifier/number (could be a GUID string or custom format).', type: 'string', name: 'OrderNumber', attributes: ['[Required]', '[StringLength(50)]'], initialValue: '= Guid.NewGuid().ToString();', indent: propIndent });
    const orderCustomerIdProp = _generateProperty({ includeComments, summary: 'Foreign key to the Customer who placed the order.', type: 'int', name: 'CustomerId', attributes: ['[Required]'], indent: propIndent });
    const orderTotalAmountProp = _generateProperty({ includeComments, summary: 'Total amount for the order (can be calculated from OrderItems or stored directly).', type: 'decimal', name: 'TotalAmount', attributes: ['[Required]', '[Column(TypeName = "decimal(18, 2)")]'], indent: propIndent });
    const orderDateProp = _generateProperty({ includeComments, summary: 'Date and time (UTC) the order was placed.', type: 'DateTime', name: 'OrderDate', initialValue: '= DateTime.UtcNow;', indent: propIndent });
    const orderCustomerNavProp = _generateProperty({ includeComments, summary: 'Navigation property back to the Customer.', type: 'virtual Customer?', name: 'Customer', attributes: ['[ForeignKey("CustomerId")]'], indent: propIndent });
    const orderItemsCollectionComment2 = includeComments ? _generateXmlDocComment('Collection navigation property to the items included in this order (One-to-Many).', [], [], '', propIndent) : '';
    const orderItemsCollection2 = `
${orderItemsCollectionComment2}
${propIndent}// Defines the relationship: One Order has many OrderItems
${propIndent}public virtual ICollection<OrderItem> OrderItems { get; set; } = new HashSet<OrderItem>();`;

    const orderEntity = `
${orderComment}
    public class Order
    {
${orderIdProp}

${orderNumberProp}

${orderCustomerIdProp}

${orderTotalAmountProp}

${orderDateProp}

${propIndent}// TODO: Add other relevant properties like ShippingAddress, BillingAddress, OrderStatus enum, etc.

${orderCustomerNavProp}

${orderItemsCollection2}
    }`;


    // --- Customer Entity ---
    const customerComment = includeComments ? _generateXmlDocComment('Represents a customer.', [], [], '', indent) : '';
    const customerIdProp = _generateProperty({ includeComments: false, type: 'int', name: 'Id', attributes: ['[Key]'], indent: propIndent });
    const customerFirstNameProp = _generateProperty({ includeComments: false, type: 'string', name: 'FirstName', attributes: ['[Required]', '[StringLength(100)]'], initialValue: '= string.Empty;', indent: propIndent });
    const customerLastNameProp = _generateProperty({ includeComments: false, type: 'string', name: 'LastName', attributes: ['[Required]', '[StringLength(100)]'], initialValue: '= string.Empty;', indent: propIndent });
    const customerEmailProp = _generateProperty({ includeComments: false, type: 'string', name: 'Email', attributes: ['[Required]', '[EmailAddress]', '[StringLength(150)]'], initialValue: '= string.Empty;', indent: propIndent });
    const customerOrdersCollectionComment = includeComments ? _generateXmlDocComment('Collection navigation property to the orders placed by this customer (One-to-Many).', [], [], '', propIndent) : '';
    const customerOrdersCollection = `
${customerOrdersCollectionComment}
${propIndent}// Defines the relationship: One Customer can have many Orders
${propIndent}public virtual ICollection<Order> Orders { get; set; } = new HashSet<Order>();`;
    const customerFullNameComment = includeComments ? _generateXmlDocComment('Computed property for Full Name (Not mapped to DB).', [], [], '', propIndent) : '';
    const customerFullNameProp = `
${customerFullNameComment}
${propIndent}[NotMapped]
${propIndent}public string FullName => $"{FirstName} {LastName}";`;

    const customerEntity = `
${customerComment}
    public class Customer
    {
${customerIdProp}

${customerFirstNameProp}

${customerLastNameProp}

${customerEmailProp}

${propIndent}// TODO: Add other relevant properties like Phone, Address collection, DateOfBirth, etc.

${customerOrdersCollection}

${customerFullNameProp}
    }`;

    return `

    // --- Related Entities (Defined here for template simplicity) ---
    // In a real project, each entity would typically reside in its own .cs file.
${categoryEntity}
${orderItemEntity}
${orderEntity}
${customerEntity}
} // End namespace ${namespaceName}`; // Close the namespace from the core model
};


// --- Exported Template Functions ---

/**
 * C# Class Template Generator
 */
export const generateClass = (options = {}) => {
    // Set defaults
    const defaultedOptions = {
        includeComments: true,
        includeTests: false,
        className: 'MyClass',
        namespaceName: 'MyNamespace',
        ...options // Override defaults with provided options
    };

    const coreCode = _generateCoreClass(defaultedOptions);
    const testCode = defaultedOptions.includeTests ? _generateClassTests(defaultedOptions) : '';

    // Combine core code and optional test code
    // Note: Core code already includes the namespace closing brace. Tests are separate.
    return `${coreCode}\n${testCode}`;
};

/**
 * C# Controller Template Generator (ASP.NET Core Web API)
 */
export const generateController = (options = {}) => {
    // Set defaults
    const defaultedOptions = {
        includeComments: true,
        includeTests: false,
        className: 'User', // e.g., User
        apiName: options.className ? options.className.toLowerCase() + 's' : 'users', // Default based on className if provided
        controllerNamespace: 'MyApp.Controllers',
        modelNamespace: 'MyApp.Models',
        serviceNamespace: 'MyApp.Services',
        ...options // Override defaults
    };

    // Ensure apiName is derived if not explicitly provided
    if (!options.apiName && defaultedOptions.className) {
      defaultedOptions.apiName = defaultedOptions.className.toLowerCase() + 's';
    }


    const coreCode = _generateCoreController(defaultedOptions);
    const supportingCode = _generateSupportingInterfacesAndModels(defaultedOptions);
    const testCode = defaultedOptions.includeTests ? _generateControllerTests(defaultedOptions) : '';

    return `${coreCode}\n${supportingCode}\n${testCode}`;
};


/**
 * C# Model Template Generator (EF Core Style with Relationships)
 */
export const generateModel = (options = {}) => {
     // Set defaults
    const defaultedOptions = {
        includeComments: true,
        includeTests: false,
        className: 'Product', // e.g., Product
        namespaceName: 'MyApp.Models',
        ...options // Override defaults
    };

    const coreCode = _generateCoreModel(defaultedOptions);
    // Related entities are generated within a helper function that also closes the namespace
    const relatedEntitiesCode = _generateRelatedModelEntities(defaultedOptions);
    const testCode = defaultedOptions.includeTests ? _generateModelTests(defaultedOptions) : '';

    // Core code generates the start of the namespace and the main class.
    // Related entities helper generates the rest of the entities and closes the namespace.
    return `${coreCode}${relatedEntitiesCode}\n${testCode}`;
};


const _generateControllerTests = (options) => {
    const {
        className, apiName, controllerNamespace, modelNamespace, serviceNamespace
    } = options;

    const lowerClassName = className.toLowerCase();
    const serviceInterfaceName = `I${className}Service`;
    const controllerClassName = `${className}Controller`;
    const testNamespaceName = `${controllerNamespace}.Tests`;

    // Helper method for VerifyLog - extracted for clarity
    const verifyLogMethod = `
        // --- Test Helper Method for Logging Verification ---
        // Verifies that a log message with a specific level and containing specific text was logged.
        private static void VerifyLog<T>(Mock<ILogger<T>> loggerMock, LogLevel level, string messageContains, Times? times = null)
        { // Method open
             times ??= Times.AtLeastOnce(); // Default to AtLeastOnce if not specified

             loggerMock.Verify(
                 x => x.Log(
                     level,
                     It.IsAny<EventId>(),
                     It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains(messageContains)), // Check if message contains the string, added null forgiving operator for newer .NET
                     It.IsAny<Exception>(),
                     It.Is<Func<It.IsAnyType, Exception?, string>>((v, t) => true)), // Func signature might vary slightly based on .NET version
                 times.Value);
        } // Method close
    `;


    return `
// Test class: ${controllerClassName}Tests.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc; // Needed for ActionResult, ObjectResult etc.
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using ${controllerNamespace}; // Namespace of the Controller
using ${modelNamespace};       // Namespace of the Model
using ${serviceNamespace};      // Namespace of the Service Interface

namespace ${testNamespaceName}
{
    public class ${controllerClassName}Tests
    {
        private readonly Mock<${serviceInterfaceName}> _mockService;
        private readonly Mock<ILogger<${controllerClassName}>> _mockLogger;
        private readonly ${controllerClassName} _controller;
        private readonly List<${className}> _test${className}s;

        public ${controllerClassName}Tests()
        { // Constructor open
            _mockService = new Mock<${serviceInterfaceName}>();
            _mockLogger = new Mock<ILogger<${controllerClassName}>>(); // Mock the logger

            // Setup test data - ensure it matches the model properties
            _test${className}s = new List<${className}>
            {
                new ${className} { Id = 1, Name = "Test ${className} Alpha", Email = "alpha@example.com", IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-2) },
                new ${className} { Id = 2, Name = "Test ${className} Beta", Email = "beta@example.com", IsActive = false, CreatedAt = DateTime.UtcNow.AddDays(-1) }
            };

            // Instantiate controller with mocks
_controller = new ${controllerClassName}(_mockService.Object, _mockLogger.Object);
        } // Constructor close

        ${verifyLogMethod}

        // --- GET All Tests ---
        [Fact]
        public async Task GetAll${className}s_ReturnsOkObjectResult_WithListOf${className}s()
        {
            // Arrange
            _mockService.Setup(s => s.GetAll${className}sAsync()).ReturnsAsync(_test${className}s);

            // Act
            var result = await _controller.GetAll${className}s();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<${className}>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<${className}>>(okResult.Value);
            Assert.Equal(2, returnValue.Count());
            Assert.Equal(_test${className}s, returnValue); // Check if lists are equivalent
            VerifyLog(_mockLogger, LogLevel.Information, "Attempting to retrieve all ${apiName}");
            VerifyLog(_mockLogger, LogLevel.Information, "Successfully retrieved 2 ${apiName}");
        }

         [Fact]
        public async Task GetAll${className}s_ReturnsOkObjectResult_WithEmptyList_WhenServiceReturnsEmpty()
        {
            // Arrange
            _mockService.Setup(s => s.GetAll${className}sAsync()).ReturnsAsync(new List<${className}>());

            // Act
            var result = await _controller.GetAll${className}s();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<${className}>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<${className}>>(okResult.Value);
            Assert.Empty(returnValue);
            VerifyLog(_mockLogger, LogLevel.Information, "Successfully retrieved 0 ${apiName}");
        }

        [Fact]
        public async Task GetAll${className}s_ReturnsStatusCode500_WhenServiceThrowsException()
        {
            // Arrange
            var exceptionMessage = "Database connection failed";
            _mockService.Setup(s => s.GetAll${className}sAsync()).ThrowsAsync(new Exception(exceptionMessage));

            // Act
            var result = await _controller.GetAll${className}s();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<${className}>>>(result);
            var statusCodeResult = Assert.IsType<ObjectResult>(actionResult.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            Assert.Contains("An unexpected error occurred", statusCodeResult.Value!.ToString()); // Added null forgiving operator
            VerifyLog(_mockLogger, LogLevel.Error, "An error occurred while getting all ${apiName}");
            // Verify the exception was logged (optional but good)
             _mockLogger.Verify(
                 x => x.Log(
                     LogLevel.Error,
                     It.IsAny<EventId>(),
                     It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("An error occurred")), // Added null forgiving operator
                     It.Is<Exception>(ex => ex.Message == exceptionMessage), // Check exception message
                     It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
                 Times.Once);
        }


        // --- GET by ID Tests ---
        [Fact]
        public async Task Get${className}_WithValidId_ReturnsOkObjectResult_With${className}()
        {
            // Arrange
            var testId = 1;
            var expected${className} = _test${className}s.First(u => u.Id == testId);
            _mockService.Setup(s => s.Get${className}ByIdAsync(testId)).ReturnsAsync(expected${className});

            // Act
            var result = await _controller.Get${className}(testId);

            // Assert
            var actionResult = Assert.IsType<ActionResult<${className}>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var returnValue = Assert.IsType<${className}>(okResult.Value);
            Assert.Equal(testId, returnValue.Id);
            Assert.Equal(expected${className}.Name, returnValue.Name);
            VerifyLog(_mockLogger, LogLevel.Information, $"Attempting to retrieve {lowerClassName} with ID: {testId}");
            VerifyLog(_mockLogger, LogLevel.Information, $"Successfully retrieved {lowerClassName} with ID: {testId}");
        }

        [Fact]
        public async Task Get${className}_WithInvalidId_ReturnsNotFoundResult()
        {
            // Arrange
            var testId = 999;
            _mockService.Setup(s => s.Get${className}ByIdAsync(testId)).ReturnsAsync((${className}?)null);

            // Act
            var result = await _controller.Get${className}(testId);

            // Assert
            var actionResult = Assert.IsType<ActionResult<${className}>>(result);
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(actionResult.Result);
            Assert.Equal($"${className} with ID {testId} not found.", notFoundResult.Value);
            VerifyLog(_mockLogger, LogLevel.Warning, $"{className} with ID: {testId} not found");
        }

        [Fact]
        public async Task Get${className}_ReturnsStatusCode500_WhenServiceThrowsException()
        {
             // Arrange
            var testId = 1;
            _mockService.Setup(s => s.Get${className}ByIdAsync(testId)).ThrowsAsync(new Exception("Connection failed"));

            // Act
            var result = await _controller.Get${className}(testId);

            // Assert
            var actionResult = Assert.IsType<ActionResult<${className}>>(result);
            var statusCodeResult = Assert.IsType<ObjectResult>(actionResult.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            VerifyLog(_mockLogger, LogLevel.Error, $"An error occurred while getting {lowerClassName} with ID: {testId}");
        }


        // --- POST (Create) Tests ---
        [Fact]
        public async Task Create${className}_WithValidModel_ReturnsCreatedAtActionResult()
        {
            // Arrange
            var new${className}Dto = new ${className} { Name = "New ${className}", Email = "new@example.com" };
            var created${className} = new ${className} { Id = 3, Name = new${className}Dto.Name, Email = new${className}Dto.Email, CreatedAt = DateTime.UtcNow };
            _mockService.Setup(s => s.Create${className}Async(It.Is<${className}>(u => u.Name == new${className}Dto.Name)))
                        .ReturnsAsync(created${className});

            // Act
            var result = await _controller.Create${className}(new${className}Dto);

            // Assert
            var actionResult = Assert.IsType<ActionResult<${className}>>(result);
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
            Assert.Equal(201, createdAtActionResult.StatusCode);
            Assert.Equal(nameof(${controllerClassName}.Get${className}), createdAtActionResult.ActionName);
            Assert.NotNull(createdAtActionResult.RouteValues);
            Assert.True(createdAtActionResult.RouteValues.ContainsKey("id"));
            Assert.Equal(created${className}.Id, createdAtActionResult.RouteValues["id"]);
            var returnValue = Assert.IsType<${className}>(createdAtActionResult.Value);
            Assert.Equal(created${className}.Id, returnValue.Id);
            Assert.Equal(new${className}Dto.Name, returnValue.Name);
            _mockService.Verify(s => s.Create${className}Async(It.IsAny<${className}>()), Times.Once);
            VerifyLog(_mockLogger, LogLevel.Information, "Attempting to create a new ${lowerClassName}");
            VerifyLog(_mockLogger, LogLevel.Information, $"Successfully created ${lowerClassName} with ID: {created${className}.Id}");
        }

         [Fact]
        public async Task Create${className}_WithNullModel_ReturnsBadRequest()
        {
            // Arrange
            ${className}? new${className}Dto = null;

            // Act
            var result = await _controller.Create${className}(new${className}Dto!);

            // Assert
            var actionResult = Assert.IsType<ActionResult<${className}>>(result);
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult.Result);
            Assert.Equal("Request body cannot be empty.", badRequestResult.Value);
            VerifyLog(_mockLogger, LogLevel.Warning, "Create ${lowerClassName} attempt failed: Request body was null.");
        }

         [Fact]
        public async Task Create${className}_WhenServiceReturnsNull_ReturnsStatusCode500()
        {
            // Arrange
            var new${className}Dto = new ${className} { Name = "Fail Create", Email = "fail@example.com" };
            _mockService.Setup(s => s.Create${className}Async(It.IsAny<${className}>())).ReturnsAsync((${className}?)null);

            // Act
            var result = await _controller.Create${className}(new${className}Dto);

            // Assert
            var actionResult = Assert.IsType<ActionResult<${className}>>(result);
            var statusCodeResult = Assert.IsType<ObjectResult>(actionResult.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            Assert.Contains($"Failed to create the {lowerClassName}", statusCodeResult.Value?.ToString());
            VerifyLog(_mockLogger, LogLevel.Error, $"Failed to create {lowerClassName} - service returned null or failed.");
        }

        [Fact]
        public async Task Create${className}_WhenServiceThrowsArgumentException_ReturnsBadRequest()
        {
            // Arrange
            var new${className}Dto = new ${className} { Name = "Duplicate Name", Email = "dup@example.com" };
            var exceptionMessage = "Name already exists";
             _mockService.Setup(s => s.Create${className}Async(It.IsAny<${className}>())).ThrowsAsync(new ArgumentException(exceptionMessage));

            // Act
            var result = await _controller.Create${className}(new${className}Dto);

            // Assert
            var actionResult = Assert.IsType<ActionResult<${className}>>(result);
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult.Result);
            Assert.Equal(exceptionMessage, badRequestResult.Value);
            VerifyLog(_mockLogger, LogLevel.Warning, "Validation error during ${lowerClassName} creation");
        }

        [Fact]
        public async Task Create${className}_WhenServiceThrowsGenericException_ReturnsStatusCode500()
        {
            // Arrange
            var new${className}Dto = new ${className} { Name = "Exception Test", Email = "ex@example.com" };
            _mockService.Setup(s => s.Create${className}Async(It.IsAny<${className}>())).ThrowsAsync(new Exception("Generic failure"));

            // Act
            var result = await _controller.Create${className}(new${className}Dto);

            // Assert
            var actionResult = Assert.IsType<ActionResult<${className}>>(result);
            var statusCodeResult = Assert.IsType<ObjectResult>(actionResult.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            VerifyLog(_mockLogger, LogLevel.Error, "An error occurred while creating a ${lowerClassName}");
        }


        // --- PUT (Update) Tests ---
        [Fact]
        public async Task Update${className}_WithValidIdAndModel_ReturnsNoContentResult()
        {
            // Arrange
            var testId = 1;
            var updated${className}Dto = new ${className} { Id = testId, Name = "Updated ${className}", Email = "updated@example.com" };
            _mockService.Setup(s => s.Update${className}Async(It.Is<${className}>(u => u.Id == testId))).ReturnsAsync(true);

            // Act
            var result = await _controller.Update${className}(testId, updated${className}Dto);

            // Assert
            Assert.IsType<NoContentResult>(result);
            _mockService.Verify(s => s.Update${className}Async(It.Is<${className}>(u => u.Id == testId && u.Name == updated${className}Dto.Name)), Times.Once);
            VerifyLog(_mockLogger, LogLevel.Information, $"Attempting to update {lowerClassName} with ID: {testId}");
            VerifyLog(_mockLogger, LogLevel.Information, $"Successfully updated {lowerClassName} with ID: {testId}");
        }

        [Fact]
        public async Task Update${className}_WithIdMismatch_ReturnsBadRequestResult()
        {
            // Arrange
            var urlId = 1;
            var bodyId = 2;
            var updated${className}Dto = new ${className} { Id = bodyId, Name = "Mismatch ${className}", Email = "mismatch@example.com" };

            // Act
            var result = await _controller.Update${className}(urlId, updated${className}Dto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("ID mismatch or request body cannot be empty.", badRequestResult.Value);
            VerifyLog(_mockLogger, LogLevel.Warning, $"Update failed for ID {urlId}: ID mismatch or null request body.", Times.Once());
        }

        [Fact]
        public async Task Update${className}_WithNullModel_ReturnsBadRequestResult()
        {
            // Arrange
            var testId = 1;
            ${className}? updated${className}Dto = null;

            // Act
            var result = await _controller.Update${className}(testId, updated${className}Dto!);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("ID mismatch or request body cannot be empty.", badRequestResult.Value);
            VerifyLog(_mockLogger, LogLevel.Warning, $"Update failed for ID {testId}: ID mismatch or null request body.", Times.Once());
        }


        [Fact]
        public async Task Update${className}_WhenServiceReturnsFalse_ReturnsNotFoundResult()
        {
            // Arrange
            var testId = 999;
            var updated${className}Dto = new ${className} { Id = testId, Name = "Not Found Update", Email = "notfound@example.com" };
            _mockService.Setup(s => s.Update${className}Async(It.Is<${className}>(u => u.Id == testId))).ReturnsAsync(false);

            // Act
            var result = await _controller.Update${className}(testId, updated${className}Dto);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal($"${className} with ID {testId} not found or could not be updated.", notFoundResult.Value);
            VerifyLog(_mockLogger, LogLevel.Warning, $"Update failed: Service indicated ${className} with ID {testId} was not found", Times.Once());
        }

        [Fact]
        public async Task Update${className}_WhenServiceThrowsArgumentException_ReturnsBadRequest()
        {
            // Arrange
            var testId = 1;
            var updated${className}Dto = new ${className} { Id = testId, Name = "Invalid Update", Email = "invalid@example.com" };
            var exceptionMessage = "Invalid name specified";
            _mockService.Setup(s => s.Update${className}Async(It.Is<${className}>(u => u.Id == testId))).ThrowsAsync(new ArgumentException(exceptionMessage));

            // Act
            var result = await _controller.Update${className}(testId, updated${className}Dto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(exceptionMessage, badRequestResult.Value);
            VerifyLog(_mockLogger, LogLevel.Warning, $"Validation error during {lowerClassName} update for ID {testId}");
        }

        [Fact]
        public async Task Update${className}_WhenServiceThrowsGenericException_ReturnsStatusCode500()
        {
            // Arrange
            var testId = 1;
            var updated${className}Dto = new ${className} { Id = testId, Name = "Exception Update", Email = "ex-up@example.com" };
            _mockService.Setup(s => s.Update${className}Async(It.Is<${className}>(u => u.Id == testId))).ThrowsAsync(new Exception("DB concurrency error"));

            // Act
            var result = await _controller.Update${className}(testId, updated${className}Dto);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            VerifyLog(_mockLogger, LogLevel.Error, $"An error occurred while updating {lowerClassName} with ID: {testId}");
        }

        // --- DELETE Tests ---
        [Fact]
        public async Task Delete${className}_WithValidId_ReturnsNoContentResult()
        {
            // Arrange
            var testId = 1;
            _mockService.Setup(s => s.Delete${className}Async(testId)).ReturnsAsync(true);

            // Act
            var result = await _controller.Delete${className}(testId);

            // Assert
            Assert.IsType<NoContentResult>(result);
            _mockService.Verify(s => s.Delete${className}Async(testId), Times.Once);
            VerifyLog(_mockLogger, LogLevel.Information, $"Attempting to delete {lowerClassName} with ID: {testId}");
            VerifyLog(_mockLogger, LogLevel.Information, $"Successfully deleted {lowerClassName} with ID: {testId}");
        }

        [Fact]
        public async Task Delete${className}_WhenServiceReturnsFalse_ReturnsNotFoundResult()
        {
            // Arrange
            var testId = 999;
            _mockService.Setup(s => s.Delete${className}Async(testId)).ReturnsAsync(false);

            // Act
            var result = await _controller.Delete${className}(testId);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal($"${className} with ID {testId} not found or could not be deleted.", notFoundResult.Value);
            VerifyLog(_mockLogger, LogLevel.Warning, $"Delete failed: Service indicated ${className} with ID {testId} was not found", Times.Once());
        }


        [Fact]
        public async Task Delete${className}_WhenServiceThrowsException_ReturnsStatusCode500()
        {
            // Arrange
            var testId = 1;
            _mockService.Setup(s => s.Delete${className}Async(testId)).ThrowsAsync(new InvalidOperationException("Constraint violation"));

            // Act
            var result = await _controller.Delete${className}(testId);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            VerifyLog(_mockLogger, LogLevel.Error, $"An error occurred while deleting {lowerClassName} with ID: {testId}");
        }

         // --- Search Tests ---
        [Fact]
        public async Task Search${className}s_WithValidName_ReturnsOkObjectResult_WithFilteredResults()
        {
            // Arrange
            var searchTerm = "Alpha";
            var filtered${className}s = _test${className}s.Where(u => u.Name.Contains(searchTerm)).ToList();
            _mockService.Setup(s => s.Search${className}sAsync(searchTerm)).ReturnsAsync(filtered${className}s);

            // Act
            var result = await _controller.Search${className}s(searchTerm);

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<${className}>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<${className}>>(okResult.Value);
            Assert.Single(returnValue);
            Assert.Equal("Test ${className} Alpha", returnValue.First().Name);
            VerifyLog(_mockLogger, LogLevel.Information, $"Attempting to search ${apiName} by name: '{searchTerm}'");
            VerifyLog(_mockLogger, LogLevel.Information, $"Search for '{searchTerm}' returned 1 results.");
        }

        [Theory]
        [InlineData("")]
        [InlineData(" ")]
        [InlineData(null)]
        public async Task Search${className}s_WithNullOrWhitespaceName_ReturnsBadRequestResult(string? searchTerm) // Allow null for test case
        {
            // Arrange
            // searchTerm provided by InlineData

            // Act
            var result = await _controller.Search${className}s(searchTerm!); // Use null-forgiving as we test null/empty

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<${className}>>>(result);
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult.Result);
            Assert.Equal("The 'name' query parameter is required for searching.", badRequestResult.Value);
            VerifyLog(_mockLogger, LogLevel.Warning, "Search ${apiName} attempt failed: 'name' query parameter was missing or empty.");
        }

        [Fact]
        public async Task Search${className}s_WhenServiceThrowsException_ReturnsStatusCode500()
        {
            // Arrange
            var searchTerm = "ErrorSearch";
            _mockService.Setup(s => s.Search${className}sAsync(searchTerm)).ThrowsAsync(new Exception("Search index connection failed"));

            // Act
            var result = await _controller.Search${className}s(searchTerm);

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<${className}>>>(result);
            var statusCodeResult = Assert.IsType<ObjectResult>(actionResult.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            VerifyLog(_mockLogger, LogLevel.Error, $"An error occurred while searching ${apiName} by name: '{searchTerm}'");
        }
    } // Class close
} // Namespace close
`;
};

// Add default export or other exports if needed
// export default { generateClass, generateController, generateModel };