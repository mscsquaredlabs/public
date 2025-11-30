import { getPackagePath } from './getPackagePath.js';

/**
 * Java Spring Controller Template
 */
export const javaSpringController = (options) => {
    const {
        includeComments = true,
        includeTests = false,
        className = 'User', // e.g., User
        apiName = 'users',  // e.g., users (lowercase plural)
        packageName = 'com.example.myapp', // Base package
    } = options || {};

    // Derive other package names
    const controllerPackageName = `${packageName}.controller`;
    const modelPackageName = `${packageName}.model`;
    const servicePackageName = `${packageName}.service`;
    const testPackageName = `${controllerPackageName}.tests`; // Or just `${packageName}.tests`

    // Derive paths for file comments
    const controllerPackagePath = getPackagePath(controllerPackageName);
    const testPackagePath = getPackagePath(testPackageName);

    // Derive names
    const lowerClassName = className.toLowerCase(); // e.g., user
    const serviceClassName = `${className}Service`; // e.g., UserService
    const controllerClassName = `${className}Controller`; // e.g., UserController

    // --- Controller Code ---
    const controllerContent = `${includeComments ?
`/**
 * REST Controller for managing {@link ${modelPackageName}.${className}} entities.
 * Provides CRUD endpoints for the /api/${apiName} path.
 * File: ${controllerPackagePath}/${controllerClassName}.java
 */` : ""}
package ${controllerPackageName};

import ${modelPackageName}.${className};
import ${servicePackageName}.${serviceClassName};
import org.slf4j.Logger; // Use SLF4J for logging
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException; // Good for REST exceptions

import javax.validation.Valid;
import java.net.URI; // For location header
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing {@link ${className}}.
 */
@RestController
@RequestMapping("/api/${apiName}")
public class ${controllerClassName} {

    // Use SLF4J Logger for better logging practices
    private final Logger log = LoggerFactory.getLogger(${controllerClassName}.class);

    private final ${serviceClassName} ${lowerClassName}Service;

    ${includeComments ?
`   /**
     * Constructor for dependency injection of the ${serviceClassName}.
     *
     * @param ${lowerClassName}Service The service handling business logic for ${className} entities.
     */` : ""}
    @Autowired // Autowired on constructor is standard practice
    public ${controllerClassName}(${serviceClassName} ${lowerClassName}Service) {
        this.${lowerClassName}Service = ${lowerClassName}Service;
    }

    ${includeComments ?
`   /**
     * {@code GET /api/${apiName}} : Get all the ${apiName}.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of ${apiName} in body.
     */` : ""}
    @GetMapping
    public ResponseEntity<List<${className}>> getAll${className}s() {
        log.debug("REST request to get all ${className}s");
        List<${className}> ${lowerClassName}List = ${lowerClassName}Service.findAll();
        return ResponseEntity.ok(${lowerClassName}List); // Or return new ResponseEntity<>(userList, HttpStatus.OK);
    }

    ${includeComments ?
`   /**
     * {@code GET /api/${apiName}/:id} : Get the "id" ${lowerClassName}.
     *
     * @param id the id of the ${lowerClassName} to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the ${lowerClassName}, or with status {@code 404 (Not Found)}.
     */` : ""}
    @GetMapping("/{id}")
    public ResponseEntity<${className}> get${className}ById(@PathVariable Long id) {
        log.debug("REST request to get ${className} : {}", id);
        Optional<${className}> ${lowerClassName}Opt = ${lowerClassName}Service.findById(id);
        // Use ResponseStatusException for concise not found handling
        return ${lowerClassName}Opt
                .map(ResponseEntity::ok) // If present, wrap in ResponseEntity.ok()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "${className} not found with id " + id));
                // Or: .orElse(ResponseEntity.notFound().build());
    }

    ${includeComments ?
`   /**
     * {@code POST /api/${apiName}} : Create a new ${lowerClassName}.
     *
     * @param ${lowerClassName} the ${lowerClassName} to create. Must not have an ID.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new ${lowerClassName}, or with status {@code 400 (Bad Request)} if the ${lowerClassName} has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */` : ""}
    @PostMapping
    public ResponseEntity<${className}> create${className}(@Valid @RequestBody ${className} ${lowerClassName}) throws URISyntaxException {
        log.debug("REST request to save ${className} : {}", ${lowerClassName});
        if (${lowerClassName}.getId() != null) {
            // Cannot create a user that already has an ID
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A new ${lowerClassName} cannot already have an ID");
        }
        ${className} result = ${lowerClassName}Service.save(${lowerClassName});
        return ResponseEntity.created(new URI("/api/${apiName}/" + result.getId()))
            .body(result);
    }

    ${includeComments ?
`   /**
     * {@code PUT /api/${apiName}/:id} : Updates an existing ${lowerClassName}.
     *
     * @param id the id of the ${lowerClassName} to save.
     * @param ${lowerClassName}Details the ${lowerClassName} details to update. The ID in the body is generally ignored; the ID from the path is used.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated ${lowerClassName},
     * or with status {@code 400 (Bad Request)} if the ${lowerClassName}Details is not valid,
     * or with status {@code 404 (Not Found)} if the ${lowerClassName} is not found,
     * or with status {@code 500 (Internal Server Error)} if the ${lowerClassName} couldn't be updated.
     */` : ""}
    @PutMapping("/{id}")
    public ResponseEntity<${className}> update${className}(
            @PathVariable Long id,
            @Valid @RequestBody ${className} ${lowerClassName}Details) {
        log.debug("REST request to update ${className} : {} with data {}", id, ${lowerClassName}Details);

        // Check if entity exists
        Optional<${className}> existingOpt = ${lowerClassName}Service.findById(id);
        if (!existingOpt.isPresent()) {
             throw new ResponseStatusException(HttpStatus.NOT_FOUND, "${className} not found with id " + id);
        }

        ${className} entityToUpdate = existingOpt.get(); // Get existing entity

        // --- USER CUSTOMIZATION REQUIRED ---
        // Manually map fields from ${lowerClassName}Details request body to entityToUpdate
        // Only map fields that are allowed to be updated. Avoid overriding the ID or generated timestamps.
        log.warn("TODO: Implement property mapping from request body to existing entity in update${className}");
        // Example:
        if (${lowerClassName}Details.getName() != null) { // Check if field is provided in request
             entityToUpdate.setName(${lowerClassName}Details.getName());
        }
        // if (${lowerClassName}Details.getEmail() != null) {
        //    entityToUpdate.setEmail(${lowerClassName}Details.getEmail());
        // }
        // ... map other updateable properties ...


        // The ID is already correct because we fetched entityToUpdate using the path variable 'id'.
        // Do NOT set the ID from ${lowerClassName}Details.setId(...) unless you have a specific reason and handle mismatches.

        try {
             ${className} result = ${lowerClassName}Service.save(entityToUpdate);
             return ResponseEntity.ok(result);
        } catch (Exception e) {
            // Catch potential exceptions during save (e.g., database constraints)
             log.error("Error updating ${className} with id {}", id, e);
             throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error updating ${className}", e);
        }
    }

    ${includeComments ?
`   /**
     * {@code DELETE /api/${apiName}/:id} : delete the "id" ${lowerClassName}.
     *
     * @param id the id of the ${lowerClassName} to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}, or status {@code 404 (Not Found)}.
     */` : ""}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete${className}(@PathVariable Long id) {
        log.debug("REST request to delete ${className} : {}", id);
        if (!${lowerClassName}Service.existsById(id)) { // Use existsById for efficiency if just checking
             throw new ResponseStatusException(HttpStatus.NOT_FOUND, "${className} not found with id " + id);
        }
        try {
             ${lowerClassName}Service.deleteById(id);
             // Good practice to return headers indicating the action, though not strictly required for DELETE
             // HttpHeaders headers = new HttpHeaders();
             // headers.add("X-App-Alert", "${className} deleted");
             // headers.add("X-App-Params", id.toString());
             // return ResponseEntity.noContent().headers(headers).build();
             return ResponseEntity.noContent().build();
        } catch (Exception e) {
            // Catch potential issues during deletion (e.g., foreign key constraints)
             log.error("Error deleting ${className} with id {}", id, e);
             throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error deleting ${className}", e);
             // Consider returning 409 Conflict if deletion fails due to constraints
             // throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete ${className} due to existing references", e);
        }
    }

    ${includeComments ?
`   /**
     * Example Search Endpoint: {@code GET /api/${apiName}/search} : search for ${apiName} by name.
     * Requires a corresponding method in the ${serviceClassName}.
     *
     * @param name the name (or partial name) to search for.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of matching ${apiName} in body.
     */` : ""}
    @GetMapping("/search")
    public ResponseEntity<List<${className}>> search${className}sByName(@RequestParam String name) {
        log.debug("REST request to search ${className}s by name: {}", name);
        if (name == null || name.trim().isEmpty()) {
             // Optional: Decide if empty search term is a bad request or returns all/none
             // throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Search name cannot be empty");
             return ResponseEntity.ok(List.of()); // Return empty list for empty search is common
        }
        // Assumes service method exists: e.g., findByNameContainingIgnoreCase, findByNameLike, etc.
        // *** Replace with your actual service method name ***
        List<${className}> results = ${lowerClassName}Service.findByNameContainingIgnoreCase(name);
        return ResponseEntity.ok(results);
    }
}`; // End of Controller Content


    // --- Test Code ---
    const testContent = includeTests ? `

// ================== TEST CLASS (Should be in separate file: ${testPackagePath}/${controllerClassName}Test.java) ==================
package ${testPackageName};

import ${controllerPackageName}.${controllerClassName};
import ${modelPackageName}.${className};
import ${servicePackageName}.${serviceClassName};
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions; // For fluent assertions

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString; // For search test
import static org.mockito.ArgumentMatchers.argThat; // For more specific argument matching
import static org.mockito.BDDMockito.*; // BDD style mocking
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for the {@link ${controllerClassName}} REST controller.
 * Uses {@link WebMvcTest} for focused testing of the web layer.
 */
@WebMvcTest(${controllerClassName}.class)
@DisplayName("Spring REST Controller - ${controllerClassName} Tests")
class ${controllerClassName}Test { // Class naming convention for tests

    @Autowired
    private MockMvc mockMvc;

    @MockBean // Creates a Mockito mock for the service dependency
    private ${serviceClassName} ${lowerClassName}Service;

    @Autowired
    private ObjectMapper objectMapper; // For converting objects to/from JSON

    private ${className} test${className}1;
    private ${className} test${className}2;
    private List<${className}> all${className}s;

    // Define reusable constants for paths and IDs
    private static final String API_BASE_PATH = "/api/${apiName}";
    private static final Long TEST_ID_1 = 1L;
    private static final Long TEST_ID_2 = 2L;
    private static final Long NON_EXISTENT_ID = 99L;

    @BeforeEach
    void setUp() {
        // Initialize test data before each test
        // *** Ensure properties match the actual ${className} entity ***
        test${className}1 = new ${className}(); // Assuming default constructor exists or use necessary constructor
        test${className}1.setId(TEST_ID_1);
        test${className}1.setName("Test ${className} One");
        // Set other necessary properties used in requests/responses...
        // test${className}1.setEmail("one@example.com");

        test${className}2 = new ${className}();
        test${className}2.setId(TEST_ID_2);
        test${className}2.setName("Test ${className} Two");
        // Set other necessary properties...
        // test${className}2.setEmail("two@example.com");

        all${className}s = Arrays.asList(test${className}1, test${className}2);
    }

    @Test
    @DisplayName("GET /api/${apiName} - Should Return All ${className}s")
    void testGetAll${className}s() throws Exception {
        // Given (Arrange)
        given(${lowerClassName}Service.findAll()).willReturn(all${className}s);

        // When (Act) & Then (Assert)
        mockMvc.perform(get(API_BASE_PATH))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(TEST_ID_1.intValue()))) // JSON path often expects int for number comparison
                .andExpect(jsonPath("$[0].name", is(test${className}1.getName())))
                .andExpect(jsonPath("$[1].id", is(TEST_ID_2.intValue())))
                .andExpect(jsonPath("$[1].name", is(test${className}2.getName())));

        // Verify service interaction (optional but good practice)
        then(${lowerClassName}Service).should(times(1)).findAll();
        then(${lowerClassName}Service).shouldHaveNoMoreInteractions();
    }

    @Test
    @DisplayName("GET /api/${apiName} - Should Return Empty List When No ${className}s Exist")
    void testGetAll${className}s_Empty() throws Exception {
        given(${lowerClassName}Service.findAll()).willReturn(Collections.emptyList());

        mockMvc.perform(get(API_BASE_PATH))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(0)));

        then(${lowerClassName}Service).should(times(1)).findAll();
    }


    @Test
    @DisplayName("GET /api/${apiName}/{id} - Should Return ${className} When Found")
    void testGet${className}ById_Found() throws Exception {
        given(${lowerClassName}Service.findById(TEST_ID_1)).willReturn(Optional.of(test${className}1));

        mockMvc.perform(get(API_BASE_PATH + "/{id}", TEST_ID_1))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(TEST_ID_1.intValue())))
                .andExpect(jsonPath("$.name", is(test${className}1.getName())));

        then(${lowerClassName}Service).should(times(1)).findById(TEST_ID_1);
    }

    @Test
    @DisplayName("GET /api/${apiName}/{id} - Should Return 404 Not Found When Not Found")
    void testGet${className}ById_NotFound() throws Exception {
        given(${lowerClassName}Service.findById(NON_EXISTENT_ID)).willReturn(Optional.empty());

        mockMvc.perform(get(API_BASE_PATH + "/{id}", NON_EXISTENT_ID))
                .andExpect(status().isNotFound());

        then(${lowerClassName}Service).should(times(1)).findById(NON_EXISTENT_ID);
    }

    @Test
    @DisplayName("POST /api/${apiName} - Should Create New ${className}")
    void testCreate${className}() throws Exception {
        // Arrange
        ${className} input${className} = new ${className}(); // Don't set ID for creation
        input${className}.setName("New ${className}");
        // Set other required fields for a valid entity...

        ${className} saved${className} = new ${className}(); // Simulate the entity returned by service (with ID)
        saved${className}.setId(3L);
        saved${className}.setName(input${className}.getName());
        // Copy other fields from input to saved if they should be returned

        // Use argThat to verify the object passed to save has null ID and correct fields
        given(${lowerClassName}Service.save(argThat(entity ->
             entity.getId() == null && entity.getName().equals(input${className}.getName())
             // && entity.getEmail().equals(input${className}.getEmail()) // Check other fields
        ))).willReturn(saved${className});


        // Act & Assert
        mockMvc.perform(post(API_BASE_PATH)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(input${className})))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString(API_BASE_PATH + "/" + saved${className}.getId())))
                .andExpect(jsonPath("$.id", is(saved${className}.getId().intValue())))
                .andExpect(jsonPath("$.name", is(saved${className}.getName())));

        // Verification is implicitly done by the argThat in the given() setup
        // then(${lowerClassName}Service).should(times(1)).save(any(${className}.class)); // Can remove if using argThat
    }

     @Test
     @DisplayName("POST /api/${apiName} - Should Return 400 Bad Request When ID is Present")
     void testCreate${className}_WithId() throws Exception {
        // Arrange: Input object already has an ID
        ${className} inputWithId = new ${className}();
        inputWithId.setId(5L);
        inputWithId.setName("Invalid Create");

        // Act & Assert
        mockMvc.perform(post(API_BASE_PATH)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inputWithId)))
                .andExpect(status().isBadRequest()); // Expecting 400 Bad Request

        // Verify service save was NOT called
        then(${lowerClassName}Service).should(never()).save(any(${className}.class));
    }

    // Add tests for validation failures (@Valid) on POST if applicable

    @Test
    @DisplayName("PUT /api/${apiName}/{id} - Should Update Existing ${className} When Found")
    void testUpdate${className}_Found() throws Exception {
        // Arrange
        ${className} updatedDetails = new ${className}(); // Request body DTO/Entity
        updatedDetails.setName("Updated Name");
        // set other fields that should be updated...

        ${className} existingEntity = test${className}1; // The entity found by findById

        ${className} returnedEntity = new ${className}(); // Simulate entity returned after service.save()
        returnedEntity.setId(TEST_ID_1);
        returnedEntity.setName(updatedDetails.getName()); // Should reflect the update
        // Copy other potentially updated fields...

        given(${lowerClassName}Service.findById(TEST_ID_1)).willReturn(Optional.of(existingEntity)); // Mock finding the existing one

        // Use argThat to verify the object passed to save has the correct ID and updated fields
        given(${lowerClassName}Service.save(argThat(entity ->
            entity.getId().equals(TEST_ID_1) && entity.getName().equals(updatedDetails.getName())
             // && entity.getEmail().equals(updatedDetails.getEmail()) // Check other updated fields
        ))).willReturn(returnedEntity);


        // Act & Assert
        mockMvc.perform(put(API_BASE_PATH + "/{id}", TEST_ID_1) // Use the correct ID
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedDetails)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(returnedEntity.getId().intValue())))
                .andExpect(jsonPath("$.name", is(returnedEntity.getName())));

        then(${lowerClassName}Service).should(times(1)).findById(TEST_ID_1);
        // Verification of save call is implicitly done by argThat
    }

    @Test
    @DisplayName("PUT /api/${apiName}/{id} - Should Return 404 Not Found When Not Found")
    void testUpdate${className}_NotFound() throws Exception {
         // Arrange
        ${className} updatedDetails = new ${className}();
        updatedDetails.setName("Updated Name");

        given(${lowerClassName}Service.findById(NON_EXISTENT_ID)).willReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(put(API_BASE_PATH + "/{id}", NON_EXISTENT_ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedDetails)))
                .andExpect(status().isNotFound());

        then(${lowerClassName}Service).should(times(1)).findById(NON_EXISTENT_ID);
        then(${lowerClassName}Service).should(never()).save(any(${className}.class)); // Verify save was NOT called
    }

    // Add tests for validation failures on PUT (@Valid) if applicable

    @Test
    @DisplayName("DELETE /api/${apiName}/{id} - Should Delete ${className} When Found")
    void testDelete${className}_Found() throws Exception {
        // Arrange
        given(${lowerClassName}Service.existsById(TEST_ID_1)).willReturn(true); // Mock existence check
        willDoNothing().given(${lowerClassName}Service).deleteById(TEST_ID_1); // Mock deletion

        // Act & Assert
        mockMvc.perform(delete(API_BASE_PATH + "/{id}", TEST_ID_1))
                .andExpect(status().isNoContent());

        then(${lowerClassName}Service).should(times(1)).existsById(TEST_ID_1);
        then(${lowerClassName}Service).should(times(1)).deleteById(TEST_ID_1);
    }

    @Test
    @DisplayName("DELETE /api/${apiName}/{id} - Should Return 404 Not Found When Not Found")
    void testDelete${className}_NotFound() throws Exception {
         // Arrange
        given(${lowerClassName}Service.existsById(NON_EXISTENT_ID)).willReturn(false); // Mock non-existence

        // Act & Assert
        mockMvc.perform(delete(API_BASE_PATH + "/{id}", NON_EXISTENT_ID))
                .andExpect(status().isNotFound());

        then(${lowerClassName}Service).should(times(1)).existsById(NON_EXISTENT_ID);
        then(${lowerClassName}Service).should(never()).deleteById(anyLong()); // Verify delete was NOT called
    }

    @Test
    @DisplayName("GET /api/${apiName}/search - Should Return Matching ${className}s")
    void testSearch${className}sByName() throws Exception {
        String searchTerm = "One";
        List<${className}> searchResults = Collections.singletonList(test${className}1);

        // Assuming service method: findByNameContainingIgnoreCase - *** Use your actual method name ***
        given(${lowerClassName}Service.findByNameContainingIgnoreCase(searchTerm)).willReturn(searchResults);

        mockMvc.perform(get(API_BASE_PATH + "/search")
                .param("name", searchTerm)) // Use .param for query parameters
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", containsString(searchTerm))); // Check if name contains term

        then(${lowerClassName}Service).should(times(1)).findByNameContainingIgnoreCase(searchTerm);
    }

     @Test
    @DisplayName("GET /api/${apiName}/search - Should Return Empty List For No Matches")
    void testSearch${className}sByName_NoMatch() throws Exception {
        String searchTerm = "NonExistent";
        given(${lowerClassName}Service.findByNameContainingIgnoreCase(searchTerm)).willReturn(Collections.emptyList());

        mockMvc.perform(get(API_BASE_PATH + "/search")
                .param("name", searchTerm))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(0)));

        then(${lowerClassName}Service).should(times(1)).findByNameContainingIgnoreCase(searchTerm);
    }

      @Test
    @DisplayName("GET /api/${apiName}/search - Should Return Empty List For Empty Search Term")
    void testSearch${className}sByName_EmptySearch() throws Exception {
        // Controller implementation returns OK with empty list for empty search
        mockMvc.perform(get(API_BASE_PATH + "/search")
                .param("name", " ")) // Empty or blank search term
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(0)));

        // Verify service method was NOT called for empty search as per controller logic
         then(${lowerClassName}Service).should(never()).findByNameContainingIgnoreCase(anyString());
    }
}` : ""; // End of testContent

    return controllerContent + testContent; // Concatenate controller and optional test code
};