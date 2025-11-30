import { getPackagePath } from './getPackagePath.js';

/**
 * Java API Controller Template (using DTO Pattern)
 */
export const javaApi = (options) => {
    const {
        includeComments = true,
        includeTests = false,
        apiName = 'users',        // e.g., users (lowercase plural for path)
        className = 'User',       // e.g., User (often matches Entity name)
        packageName = 'com.example.myapp', // Base package
    } = options || {};

    const dtoClassName = `${className}Dto`; // e.g., UserDto

    // Derive related package names
    const apiPackageName = `${packageName}.web.api`; // Common practice for API controllers
    const modelPackageName = `${packageName}.model`;
    const servicePackageName = `${packageName}.service`;
    const dtoPackageName = `${packageName}.web.api.dto`; // DTOs often live near API layer

    // Derive paths for file comments
    const apiPackagePath = getPackagePath(apiPackageName);
    const dtoPackagePath = getPackagePath(dtoPackageName);
    const testPackageName = `${apiPackageName}.tests`; // Or `${packageName}.tests`
    const testPackagePath = getPackagePath(testPackageName);

    // Derive names
    const lowerClassName = className.toLowerCase();
    const serviceClassName = `${className}Service`;
    const apiControllerClassName = `${className}ApiController`;
    const entityClassName = className; // Assume entity name matches className here

    // --- API Controller Code ---
    const controllerContent = `${includeComments ?
`/**
 * REST Controller for managing ${className} resources via DTOs.
 * Provides CRUD endpoints at /api/${apiName} using {@link ${dtoPackageName}.${dtoClassName}}.
 * File: ${apiPackagePath}/${apiControllerClassName}.java
 */` : ""}
package ${apiPackageName};

import ${modelPackageName}.${entityClassName};
import ${dtoPackageName}.${dtoClassName};
import ${servicePackageName}.${serviceClassName};
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST controller for managing {@link ${entityClassName}} resources using DTOs.
 */
@RestController
@RequestMapping("/api/${apiName}")
public class ${apiControllerClassName} {

    private final Logger log = LoggerFactory.getLogger(${apiControllerClassName}.class);

    private final ${serviceClassName} ${lowerClassName}Service;
    // Optional: Inject a mapper (e.g., MapStruct) instead of manual conversion methods
    // private final ${className}Mapper ${lowerClassName}Mapper;

    @Autowired
    public ${apiControllerClassName}(${serviceClassName} ${lowerClassName}Service) { // , ${className}Mapper ${lowerClassName}Mapper) {
        this.${lowerClassName}Service = ${lowerClassName}Service;
        // this.${lowerClassName}Mapper = ${lowerClassName}Mapper;
    }

    ${includeComments ?
`   /**
     * {@code GET /api/${apiName}} : Get all ${apiName} as DTOs.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of ${dtoClassName} in body.
     */` : ""}
    @GetMapping
    public ResponseEntity<List<${dtoClassName}>> getAll${className}s() {
        log.debug("REST request to get all ${className}s as DTOs");
        List<${entityClassName}> entities = ${lowerClassName}Service.findAll();
        List<${dtoClassName}> dtos = entities.stream()
                // .map(${lowerClassName}Mapper::toDto) // Using MapStruct example
                .map(this::convertToDto)     // Using manual conversion method
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    ${includeComments ?
`   /**
     * {@code GET /api/${apiName}/:id} : Get the "id" ${lowerClassName} as a DTO.
     *
     * @param id the id of the ${lowerClassName} to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the ${dtoClassName}, or with status {@code 404 (Not Found)}.
     */` : ""}
    @GetMapping("/{id}")
    public ResponseEntity<${dtoClassName}> get${className}(@PathVariable Long id) {
        log.debug("REST request to get ${className} as DTO : {}", id);
        return ${lowerClassName}Service.findById(id)
                // .map(${lowerClassName}Mapper::toDto) // Using MapStruct example
                .map(this::convertToDto)     // Using manual conversion method
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "${className} DTO not found with id " + id));
    }

    ${includeComments ?
`   /**
     * {@code POST /api/${apiName}} : Create a new ${lowerClassName} from a DTO.
     *
     * @param ${lowerClassName}Dto the ${dtoClassName} containing data for the new ${lowerClassName}.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new ${dtoClassName}.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */` : ""}
    @PostMapping
    public ResponseEntity<${dtoClassName}> create${className}(@Valid @RequestBody ${dtoClassName} ${lowerClassName}Dto) throws URISyntaxException {
        log.debug("REST request to save ${className} from DTO : {}", ${lowerClassName}Dto);
        if (${lowerClassName}Dto.getId() != null) {
             throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A new ${className} cannot already have an ID in DTO");
        }
        // ${entityClassName} entityToSave = ${lowerClassName}Mapper.toEntity(${lowerClassName}Dto); // Using MapStruct example
        ${entityClassName} entityToSave = convertToEntity(${lowerClassName}Dto); // Using manual conversion method

        ${entityClassName} savedEntity = ${lowerClassName}Service.save(entityToSave);

        // ${dtoClassName} resultDto = ${lowerClassName}Mapper.toDto(savedEntity); // Using MapStruct example
        ${dtoClassName} resultDto = convertToDto(savedEntity); // Using manual conversion method

        return ResponseEntity.created(new URI("/api/${apiName}/" + savedEntity.getId()))
            .body(resultDto);
    }

    ${includeComments ?
`   /**
     * {@code PUT /api/${apiName}/:id} : Updates an existing ${lowerClassName} using data from a DTO.
     *
     * @param id the id of the ${lowerClassName} to update.
     * @param ${lowerClassName}Dto the ${dtoClassName} containing the updated data.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated ${dtoClassName},
     * or with status {@code 404 (Not Found)} if the ${lowerClassName} with the given id is not found.
     */` : ""}
    @PutMapping("/{id}")
    public ResponseEntity<${dtoClassName}> update${className}(
            @PathVariable Long id,
            @Valid @RequestBody ${dtoClassName} ${lowerClassName}Dto) {
        log.debug("REST request to update ${className} : {} with DTO : {}", id, ${lowerClassName}Dto);

        // Ensure the entity exists before attempting update
        return ${lowerClassName}Service.findById(id)
                .map(existingEntity -> {
                    // --- USER CUSTOMIZATION REQUIRED (if using manual conversion) ---
                    // Map updated fields from DTO to the existing entity
                    log.warn("TODO: Implement mapping from DTO to existing Entity in update${className} if using manual conversion");
                    // Example mapping (adjust based on your DTO/Entity fields):
                    if (${lowerClassName}Dto.getName() != null) { // Check if field is provided in DTO
                       existingEntity.setName(${lowerClassName}Dto.getName());
                    }
                    // if (${lowerClassName}Dto.getEmail() != null) {
                    //    existingEntity.setEmail(${lowerClassName}Dto.getEmail());
                    // }
                    // ... map other allowed updateable fields ...
                    // NOTE: Do NOT set the ID again here, it's already the correct entity

                    // If using MapStruct, the update might look different, potentially:
                    // ${lowerClassName}Mapper.updateEntityFromDto(${lowerClassName}Dto, existingEntity);

                    ${entityClassName} updatedEntity = ${lowerClassName}Service.save(existingEntity); // Save the updated entity
                    // return ${lowerClassName}Mapper.toDto(updatedEntity); // MapStruct
                     return convertToDto(updatedEntity); // Manual conversion
                })
                .map(ResponseEntity::ok) // Wrap the resulting DTO in ResponseEntity.ok()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "${className} not found with id " + id));
    }

    ${includeComments ?
`   /**
     * {@code DELETE /api/${apiName}/:id} : delete the "id" ${lowerClassName}.
     *
     * @param id the id of the ${lowerClassName} to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */` : ""}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete${className}(@PathVariable Long id) {
        log.debug("REST request to delete ${className} : {}", id);
        if (!${lowerClassName}Service.existsById(id)) {
             throw new ResponseStatusException(HttpStatus.NOT_FOUND, "${className} not found with id " + id);
        }
        ${lowerClassName}Service.deleteById(id);
        // Add headers if desired (e.g., X-App-Alert)
        return ResponseEntity.noContent().build();
    }


    ${includeComments ?
`   // --- Manual DTO Conversion Methods (Example) ---
    // Consider using a mapping library like MapStruct for more complex scenarios.

    /**
     * Converts a ${entityClassName} entity to a ${dtoClassName}.
     * USER ACTION: Ensure all relevant fields are mapped.
     *
     * @param entity The entity to convert.
     * @return The corresponding DTO, or null if entity is null.
     */` : ""}
    private ${dtoClassName} convertToDto(${entityClassName} entity) {
        if (entity == null) {
            return null;
        }
        ${dtoClassName} dto = new ${dtoClassName}();
        dto.setId(entity.getId());
        // --- USER ACTION: Map properties from entity to DTO ---
        dto.setName(entity.getName()); // Assuming entity has getName()
        // dto.setEmail(entity.getEmail()); // Example
        // dto.setActive(entity.isActive());
        // dto.setCreatedAt(entity.getCreatedAt()); // Adjust types if needed
        return dto;
    }

    ${includeComments ?
`   /**
     * Converts a ${dtoClassName} to a ${entityClassName} entity.
     * USER ACTION: Ensure all relevant fields are mapped.
     * Handles potential null ID for creation scenarios.
     *
     * @param dto The DTO to convert.
     * @return The corresponding entity, or null if dto is null.
     */` : ""}
    private ${entityClassName} convertToEntity(${dtoClassName} dto) {
         if (dto == null) {
            return null;
        }
        ${entityClassName} entity = new ${entityClassName}();
        // IMPORTANT: Only set ID if it's present in the DTO (usually for updates)
        // For creates, ID should be null and generated by the database.
        // The update method handles finding the existing entity anyway.
        // If needed for specific scenarios, uncomment:
        // if (dto.getId() != null) {
        //     entity.setId(dto.getId());
        // }
        // --- USER ACTION: Map properties from DTO to entity ---
        entity.setName(dto.getName()); // Assuming DTO has getName() and entity has setName()
        // entity.setEmail(dto.getEmail());
        // entity.setActive(dto.isActive());
        // Note: Timestamps (createdAt, updatedAt) are usually handled by JPA/Hibernate
        return entity;
    }
}`; // End of Controller Content

    // --- DTO Code ---
    const dtoContent = `

// ================== DTO CLASS (Should be in separate file: ${dtoPackagePath}/${dtoClassName}.java) ==================
${includeComments ?
`/**
 * Data Transfer Object (DTO) for representing {@link ${modelPackageName}.${entityClassName}} data in API requests/responses.
 * Includes validation annotations.
 */` : ""}
package ${dtoPackageName};

// Lombok imports (optional, for consistency)
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

// Validation imports
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import javax.validation.constraints.Email; // Example

// Java standard imports
import java.io.Serializable;
import java.time.Instant; // Example if including timestamps

/**
 * DTO for {@link ${entityClassName}}. Used in the API layer.
 */
@Data // Lombok: Generates getters, setters, toString, equals, hashCode, required args constructor
@NoArgsConstructor
@AllArgsConstructor
public class ${dtoClassName} implements Serializable { // Implementing Serializable is common practice

    private static final long serialVersionUID = 1L; // Recommended for Serializable classes

    private Long id; // Include ID, often useful in responses and sometimes in updates

    @NotBlank(message = "Name cannot be blank")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name; // Example property, MUST match convertToDto/Entity methods

    // --- USER ACTION: Add other properties from the Entity that should be exposed via the API ---
    // Make sure these properties exist in your actual Entity class and are handled
    // in the convertToDto and convertToEntity methods in the Controller above.
    // Example:
    // @Email(message = "Email should be valid")
    // @Size(max = 150)
    // private String email;
    //
    // private boolean active;
    //
    // private Instant createdAt; // Read-only field in responses

    // Note: Lombok @Data generates getters/setters automatically.
    // If not using Lombok, add manual getters and setters below.
}`; // End of DTO Content

    // --- Test Code ---
    const testContent = includeTests ? `

// ================== TEST CLASS (Should be in separate file: ${testPackagePath}/${apiControllerClassName}Test.java) ==================
package ${testPackageName};

import ${apiPackageName}.${apiControllerClassName};
import ${modelPackageName}.${entityClassName};
import ${dtoPackageName}.${dtoClassName};
import ${servicePackageName}.${serviceClassName};
// Import MapStruct Mapper if used
// import ${apiPackageName}.mapper.${className}Mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
// Import BDDMockito static methods
import static org.mockito.BDDMockito.*;
import static org.mockito.ArgumentMatchers.any; // Import any() argument matcher
import static org.mockito.ArgumentMatchers.argThat; // Import argThat()


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

// Import Hamcrest matchers static methods
import static org.hamcrest.Matchers.*;
// Import Spring MockMvcResultMatchers static methods
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for the {@link ${apiControllerClassName}} REST controller, focusing on DTO interactions.
 */
@WebMvcTest(${apiControllerClassName}.class) // Target only the API controller
@DisplayName("API Controller - ${apiControllerClassName} Tests (DTO Focus)")
class ${apiControllerClassName}Test {

    @Autowired
    private MockMvc mockMvc;

    @MockBean // Mock the direct dependency (Service)
    private ${serviceClassName} ${lowerClassName}Service;

    // @MockBean // Also mock the mapper if it's injected
    // private ${className}Mapper ${lowerClassName}Mapper;

    @Autowired
    private ObjectMapper objectMapper; // Used for JSON serialization/deserialization

    private ${entityClassName} testEntity1;
    private ${entityClassName} testEntity2;
    private ${dtoClassName} testDto1;
    private ${dtoClassName} testDto2;
    private List<${entityClassName}> allEntities;
    private List<${dtoClassName}> allDtos;

    // Reusable constants
    private static final String API_BASE_PATH = "/api/${apiName}";
    private static final Long TEST_ID_1 = 1L;
    private static final Long TEST_ID_2 = 2L;
    private static final Long NON_EXISTENT_ID = 99L;


    // --- Helper for DTO conversion (mirroring controller's private method for test setup) ---
    // Ideally, use the actual mapper or a test utility if logic is complex
    // *** IMPORTANT: Keep this in sync with the Controller's methods and DTO/Entity fields ***
    private ${dtoClassName} convertEntityToDto(${entityClassName} entity) {
        if (entity == null) return null;
        ${dtoClassName} dto = new ${dtoClassName}();
        dto.setId(entity.getId());
        dto.setName(entity.getName()); // Map fields used in tests
        // dto.setEmail(entity.getEmail());
        return dto;
    }
     private ${entityClassName} convertDtoToEntity(${dtoClassName} dto) {
        if (dto == null) return null;
        ${entityClassName} entity = new ${entityClassName}();
        entity.setId(dto.getId()); // Be careful with setting ID on create
        entity.setName(dto.getName()); // Map fields used in tests
        // entity.setEmail(dto.getEmail());
        return entity;
    }
    //------------------------------------

    @BeforeEach
    void setUp() {
        // Initialize Entities - *** Ensure properties match convertEntityToDto/convertDtoToEntity ***
        testEntity1 = new ${entityClassName}();
        testEntity1.setId(TEST_ID_1);
        testEntity1.setName("Test Entity One");
        // Set other properties used in DTO conversion...

        testEntity2 = new ${entityClassName}();
        testEntity2.setId(TEST_ID_2);
        testEntity2.setName("Test Entity Two");
        // Set other properties...

        allEntities = Arrays.asList(testEntity1, testEntity2);

        // Initialize DTOs (based on Entities using helper)
        testDto1 = convertEntityToDto(testEntity1);
        testDto2 = convertEntityToDto(testEntity2);
        allDtos = allEntities.stream().map(this::convertEntityToDto).collect(Collectors.toList());

        // --- Mock Mapper Behaviour (if using MapStruct) ---
        // given(${lowerClassName}Mapper.toDto(any(${entityClassName}.class))).willAnswer(invocation -> convertEntityToDto(invocation.getArgument(0)));
        // given(${lowerClassName}Mapper.toEntity(any(${dtoClassName}.class))).willAnswer(invocation -> convertDtoToEntity(invocation.getArgument(0)));
    }

    @Test
    @DisplayName("GET /api/${apiName} - Should Return All DTOs")
    void testGetAll${className}s() throws Exception {
        // Given
        given(${lowerClassName}Service.findAll()).willReturn(allEntities);

        // When & Then
        mockMvc.perform(get(API_BASE_PATH))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(testDto1.getId().intValue())))
                .andExpect(jsonPath("$[0].name", is(testDto1.getName())))
                .andExpect(jsonPath("$[1].id", is(testDto2.getId().intValue())))
                .andExpect(jsonPath("$[1].name", is(testDto2.getName())));

        then(${lowerClassName}Service).should(times(1)).findAll();
    }

     @Test
    @DisplayName("GET /api/${apiName}/{id} - Should Return DTO When Found")
    void testGet${className}_Found() throws Exception {
        // Given
        given(${lowerClassName}Service.findById(TEST_ID_1)).willReturn(Optional.of(testEntity1));

        // When & Then
        mockMvc.perform(get(API_BASE_PATH + "/{id}", TEST_ID_1))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(testDto1.getId().intValue())))
                .andExpect(jsonPath("$.name", is(testDto1.getName())));

        then(${lowerClassName}Service).should(times(1)).findById(TEST_ID_1);
    }

    @Test
    @DisplayName("GET /api/${apiName}/{id} - Should Return 404 When Not Found")
    void testGet${className}_NotFound() throws Exception {
        // Given
        given(${lowerClassName}Service.findById(NON_EXISTENT_ID)).willReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get(API_BASE_PATH + "/{id}", NON_EXISTENT_ID))
                .andExpect(status().isNotFound());

        then(${lowerClassName}Service).should(times(1)).findById(NON_EXISTENT_ID);
    }

    @Test
    @DisplayName("POST /api/${apiName} - Should Create New ${className} from DTO")
    void testCreate${className}() throws Exception {
        // Arrange
        ${dtoClassName} inputDto = new ${dtoClassName}(); // DTO for request body (no ID)
        inputDto.setName("New DTO Name");
        // Set other required DTO fields matching convertDtoToEntity...

        // Entity passed to service (no ID), based on input DTO
        ${entityClassName} entityToSave = convertDtoToEntity(inputDto);
        // Entity returned by service (with ID)
        ${entityClassName} savedEntity = new ${entityClassName}();
        savedEntity.setId(3L);
        savedEntity.setName(inputDto.getName()); // Ensure name matches
        // Set other properties on savedEntity if needed for DTO conversion

        // DTO expected in response, based on saved entity
        ${dtoClassName} expectedDto = convertEntityToDto(savedEntity);

        // Use argThat for more flexible argument matching if needed, especially for complex objects
        given(${lowerClassName}Service.save(argThat(entity ->
            entity.getId() == null && entity.getName().equals(inputDto.getName())
            // Add checks for other fields if necessary
        ))).willReturn(savedEntity);


        // Act & Assert
        mockMvc.perform(post(API_BASE_PATH)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inputDto))) // Send input DTO
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString(API_BASE_PATH + "/" + savedEntity.getId())))
                .andExpect(jsonPath("$.id", is(expectedDto.getId().intValue())))
                .andExpect(jsonPath("$.name", is(expectedDto.getName())));

         // Verify the entity passed to save had null ID (or was based on DTO without ID) - Replaced by argThat above
         // then(${lowerClassName}Service).should(times(1)).save(any(${entityClassName}.class));
    }

    @Test
    @DisplayName("PUT /api/${apiName}/{id} - Should Update Existing ${className} from DTO")
    void testUpdate${className}_Found() throws Exception {
         // Arrange
        ${dtoClassName} updateDto = new ${dtoClassName}(); // DTO with updated info (ID usually ignored in body for PUT)
        updateDto.setName("Updated DTO Name");
        // Set other DTO fields matching convertEntityToDto...

        // Simulate finding existing entity (testEntity1 used here)
        given(${lowerClassName}Service.findById(TEST_ID_1)).willReturn(Optional.of(testEntity1));

        // Simulate saving the updated entity (ID should match path variable)
        ${entityClassName} updatedEntity = new ${entityClassName}();
        updatedEntity.setId(TEST_ID_1);
        updatedEntity.setName(updateDto.getName()); // Set updated fields
        // Set other fields based on updateDto if necessary...

        // DTO expected in response
        ${dtoClassName} expectedDto = convertEntityToDto(updatedEntity);

        // Mock the save call - it should receive an entity with the correct ID and updated fields
        given(${lowerClassName}Service.save(argThat(entity ->
            entity.getId().equals(TEST_ID_1) && entity.getName().equals(updateDto.getName())
            // Check other updated fields if necessary
        ))).willReturn(updatedEntity);


        // Act & Assert
        mockMvc.perform(put(API_BASE_PATH + "/{id}", TEST_ID_1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(expectedDto.getId().intValue())))
                .andExpect(jsonPath("$.name", is(expectedDto.getName())));

         then(${lowerClassName}Service).should(times(1)).findById(TEST_ID_1);
         // Verify the entity passed to save had the correct ID and updated fields - Replaced by argThat above
         // then(${lowerClassName}Service).should(times(1)).save(any(${entityClassName}.class));
    }

    @Test
    @DisplayName("PUT /api/${apiName}/{id} - Should Return 404 When Not Found")
    void testUpdate${className}_NotFound() throws Exception {
         // Arrange
        ${dtoClassName} updateDto = new ${dtoClassName}();
        updateDto.setName("Updated DTO Name");

        given(${lowerClassName}Service.findById(NON_EXISTENT_ID)).willReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(put(API_BASE_PATH + "/{id}", NON_EXISTENT_ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isNotFound());

        then(${lowerClassName}Service).should(times(1)).findById(NON_EXISTENT_ID);
        then(${lowerClassName}Service).should(never()).save(any(${entityClassName}.class));
    }


    @Test
    @DisplayName("DELETE /api/${apiName}/{id} - Should Delete When Found")
    void testDelete${className}_Found() throws Exception {
        // Given
        given(${lowerClassName}Service.existsById(TEST_ID_1)).willReturn(true);
        willDoNothing().given(${lowerClassName}Service).deleteById(TEST_ID_1);

        // When & Then
        mockMvc.perform(delete(API_BASE_PATH + "/{id}", TEST_ID_1))
                .andExpect(status().isNoContent());

        then(${lowerClassName}Service).should(times(1)).existsById(TEST_ID_1);
        then(${lowerClassName}Service).should(times(1)).deleteById(TEST_ID_1);
    }

    @Test
    @DisplayName("DELETE /api/${apiName}/{id} - Should Return 404 When Not Found")
    void testDelete${className}_NotFound() throws Exception {
        // Given
        given(${lowerClassName}Service.existsById(NON_EXISTENT_ID)).willReturn(false);

        // When & Then
        mockMvc.perform(delete(API_BASE_PATH + "/{id}", NON_EXISTENT_ID))
                .andExpect(status().isNotFound());

        then(${lowerClassName}Service).should(times(1)).existsById(NON_EXISTENT_ID);
        then(${lowerClassName}Service).should(never()).deleteById(anyLong());
    }

}` : ""; // End of testContent

    return controllerContent + dtoContent + testContent; // Concatenate all parts
};