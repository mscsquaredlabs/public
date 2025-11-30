import { getPackagePath } from './getPackagePath.js';

/**
 * Java JPA Entity Template
 */
export const javaEntity = (options) => {
    const {
        includeComments = true,
        includeTests = false,
        className = 'UserProfile', // Use a more descriptive name if User is too generic
        packageName = 'com.example.myapp', // Base package
    } = options || {};

    // Derive related package names and paths
    const modelPackageName = `${packageName}.model`;
    const modelPackagePath = getPackagePath(modelPackageName);
    const testPackageName = `${modelPackageName}.tests`;
    const testPackagePath = getPackagePath(testPackageName);

    const lowerClassName = className.toLowerCase().endsWith('profile')
                             ? className.substring(0, className.length - 7).toLowerCase()
                             : className.toLowerCase(); // Adjust logic for table name if needed

    // Assume Role and Order entities exist in the same model package for simplicity
    const roleClassName = 'Role'; // Assuming Role class name
    const orderClassName = 'Order'; // Assuming Order class name
    const lowerRoleClassName = roleClassName.toLowerCase();
    const lowerOrderClassName = orderClassName.toLowerCase();

    // --- Main Entity Code ---
    const entityContent = `${includeComments ?
`/**
 * JPA Entity representing a ${className}.
 * Maps to the "${lowerClassName}s" table in the database.
 * Includes relationships with ${roleClassName} and ${orderClassName}.
 * File: ${modelPackagePath}/${className}.java
 */` : ""}
package ${modelPackageName};

// Lombok imports (optional but convenient)
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;
// import lombok.EqualsAndHashCode; // Careful with relationships here

// Hibernate annotation imports
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

// JPA imports
import javax.persistence.*; // Standard JPA annotations

// Validation imports (optional but recommended)
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import javax.validation.constraints.PastOrPresent; // Example for date

// Java standard imports
import java.math.BigDecimal; // Use BigDecimal for monetary values
import java.time.Instant;    // Use Instant or LocalDateTime for timestamps
import java.util.HashSet;
import java.util.Set;
import java.util.Objects; // For manual equals/hashCode if not using Lombok @Data/@EqualsAndHashCode

/**
 * Entity class representing a ${className} in the database.
 * Uses Lombok for boilerplate code reduction (getters, setters, constructors, etc.).
 */
@Entity
@Table(name = "${lowerClassName}s") // Customize table name if needed
// Lombok Annotations:
@Getter // Generates getters for all fields
@Setter // Generates setters for all fields
@NoArgsConstructor // Generates a no-argument constructor (required by JPA)
// @AllArgsConstructor // Might not be ideal if some fields (like ID, timestamps, collections) shouldn't be in constructor
@ToString(exclude = {"roles", "orders"}) // Exclude collections from toString to avoid recursion/large output
// @EqualsAndHashCode(exclude = {"roles", "orders"}) // Be cautious using Lombok's default with relationships (can cause issues)
// If using Lombok @Data, it includes @Getter, @Setter, @ToString, @EqualsAndHashCode, @RequiredArgsConstructor
// @Data
public class ${className} {

    ${includeComments ? "// --- Primary Key ---" : ""}
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Suitable for most SQL databases (auto-increment)
    // @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "${lowerClassName}_seq")
    // @SequenceGenerator(name = "${lowerClassName}_seq", sequenceName = "${lowerClassName}_id_seq", allocationSize = 1) // For sequence-based generation
    private Long id;

    ${includeComments ? "// --- Basic Attributes ---" : ""}
    @NotBlank(message = "Name cannot be blank")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Column(name = "full_name", length = 100, nullable = false) // Example: Explicit column name and length
    private String name;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email should be a valid email address")
    @Size(max = 150)
    @Column(length = 150, unique = true, nullable = false) // Email should likely be unique and non-null
    private String email;

    @Size(max = 20, message = "Phone number cannot exceed 20 characters")
    @Column(length = 20)
    private String phone;

    @Size(max = 255) // Increase size for address
    private String address;

    @Column(name = "is_active", nullable = false) // Explicitly non-nullable
    private boolean active = true; // Default value

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    ${includeComments ? "// --- Timestamps (Managed by Hibernate) ---" : ""}
    @CreationTimestamp // Automatically set on creation
    @Column(name = "created_at", nullable = false, updatable = false) // Should be non-null, not updatable
    private Instant createdAt; // Use Instant for timestamp (time-zone neutral)

    @UpdateTimestamp // Automatically set on update
    @Column(name = "updated_at", nullable = false) // Should be non-null
    private Instant updatedAt;

    ${includeComments ?
`   // --- Relationships ---

    /**
     * Many-to-Many relationship with ${roleClassName}.
     * FetchType.LAZY is generally preferred for performance.
     * The JoinTable defines the intermediary table.
     * Helper methods (addRole/removeRole) ensure consistency.
     */` : ""}
    @ManyToMany(fetch = FetchType.LAZY) // EAGER can cause performance issues
    @JoinTable(
            name = "${lowerClassName}_roles", // Name of the join table
            joinColumns = @JoinColumn(name = "${lowerClassName}_id", referencedColumnName = "id"), // FK to this entity
            inverseJoinColumns = @JoinColumn(name = "role_id", referencedColumnName = "id") // FK to the other entity (${roleClassName})
    )
    private Set<${roleClassName}> roles = new HashSet<>(); // Initialize collections

    ${includeComments ?
`   /**
     * One-to-Many relationship with ${orderClassName}.
     * 'mappedBy' indicates the field in the ${orderClassName} entity that owns the relationship.
     * CascadeType.ALL propagates persistence operations (persist, merge, remove). Use with caution.
     * orphanRemoval=true ensures that if an ${orderClassName} is removed from this collection, it's also deleted from the DB.
     */` : ""}
    @OneToMany(
            mappedBy = "${lowerClassName}", // Field name in ${orderClassName} entity referencing this ${className}
            cascade = CascadeType.ALL,     // Be careful with CascadeType.ALL, especially REMOVE
            orphanRemoval = true,
            fetch = FetchType.LAZY         // LAZY loading is usually best
    )
    private Set<${orderClassName}> orders = new HashSet<>();

    ${includeComments ?
`   /**
     * Convenience constructor for creating a ${className} with essential details.
     * ID and timestamps are typically managed by the persistence provider.
     *
     * @param name The name of the ${lowerClassName}.
     * @param email The email of the ${lowerClassName}.
     */` : ""}
    public ${className}(String name, String email) {
        this.name = name;
        this.email = email;
        this.active = true; // Set defaults
        // Let createdAt and updatedAt be handled by Hibernate/JPA
        // Initialize collections explicitly if not done at field declaration
        this.roles = new HashSet<>();
        this.orders = new HashSet<>();
    }

    ${includeComments ?
`   // --- Relationship Helper Methods (Essential for Bidirectional Consistency) ---

    /**
     * Adds a ${roleClassName} to this ${lowerClassName} and updates the ${roleClassName}'s side of the relationship (if managed).
     * Ensures bidirectional consistency.
     * @param role The ${roleClassName} to add.
     */` : ""}
    public void addRole(${roleClassName} role) {
        if (role != null) {
            this.roles.add(role);
            // Ensure the other side is also updated IF the Role class manages users
            // Example: role.getUsersInternal().add(this); // Assuming Role has a Set<${className}> users field and a package-private/protected getter
        }
    }

    ${includeComments ?
`   /**
     * Removes a ${roleClassName} from this ${lowerClassName} and updates the ${roleClassName}'s side (if managed).
     * Ensures bidirectional consistency.
     * @param role The ${roleClassName} to remove.
     */` : ""}
    public void removeRole(${roleClassName} role) {
        if (role != null) {
            this.roles.remove(role);
            // Ensure the other side is also updated IF the Role class manages users
            // Example: role.getUsersInternal().remove(this);
        }
    }

    ${includeComments ?
`   /**
     * Adds an ${orderClassName} to this ${lowerClassName}'s collection and sets the back-reference on the ${orderClassName}.
     * Ensures bidirectional consistency.
     * @param order The ${orderClassName} to add.
     */` : ""}
    public void addOrder(${orderClassName} order) {
        if (order != null) {
            this.orders.add(order);
            order.set${className}(this); // Set the reference on the Order side (Requires Order to have set${className}(${className} ${lowerClassName}))
        }
    }

    ${includeComments ?
`   /**
     * Removes an ${orderClassName} from this ${lowerClassName}'s collection and clears the back-reference on the ${orderClassName}.
     * Ensures bidirectional consistency.
     * @param order The ${orderClassName} to remove.
     */` : ""}
    public void removeOrder(${orderClassName} order) {
        if (order != null) {
            this.orders.remove(order);
            order.set${className}(null); // Clear the reference on the Order side
        }
    }

    ${includeComments ?
`   // --- equals() and hashCode() ---
    // IMPORTANT: If not using Lombok @EqualsAndHashCode, implement manually.
    // Base the implementation ONLY on the ID (primary key) for JPA entities
    // to ensure consistency across different persistence states.
    ` : ""}
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        // Consider using instanceof for proxy safety: if (!(o instanceof ${className})) return false;
        if (o == null || getClass() != o.getClass()) return false;
        ${className} that = (${className}) o;
        // Only compare IDs if they are not null (i.e., persisted entities)
        // Comparing non-persistent entities (id == null) should rely on reference equality (handled by the 'this == o' check)
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        // Use a constant hash code for non-persistent entities (id == null) to be consistent with equals.
        // Or rely on the ID's hash code if persisted. Using getClass().hashCode() is common for the null ID case.
        return id != null ? Objects.hash(id) : getClass().hashCode();
        // Alternative simpler (but potentially less performant for collections) approach for persisted entities: return Objects.hash(id);
        // Simple constant for non-persisted: return 31; // If ID is null
    }
}`; // End of Entity Content


    // --- Related Entity Examples (Role, Order) ---
    const relatedEntitiesContent = `

// --- Related Entity Examples (Defined here for template simplicity) ---
// NOTE: These should ideally be in their own separate files (e.g., Role.java, Order.java)

${includeComments ?
`/**
 * Example ${roleClassName} Entity. (Should be in its own file: ${modelPackagePath}/${roleClassName}.java)
 */` : ""}
@Entity
@Table(name = "${lowerRoleClassName}s") // Table name for roles
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"users"}) // Exclude the back-reference from toString
// @EqualsAndHashCode(exclude = {"users"}) // Exclude back-reference if using Lombok equals/hashCode
public class ${roleClassName} { // Made public for visibility if inline, but separate files are standard.

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 50)
    @Column(length = 50, nullable = false, unique = true)
    private String name; // e.g., "ROLE_USER", "ROLE_ADMIN"

    ${includeComments ? `// Back-reference to ${className} (MappedBy indicates the 'roles' field in ${className} owns the relationship)` : ""}
    @ManyToMany(mappedBy = "roles", fetch = FetchType.LAZY)
    private Set<${className}> users = new HashSet<>(); // Initialize collection

    public ${roleClassName}(String name) {
        this.name = name;
        this.users = new HashSet<>(); // Initialize in constructor too
    }

    // Internal accessor for helper methods in ${className} IF needed and IF Role manages the back-reference
    // protected Set<${className}> getUsersInternal() { return users; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ${roleClassName} role = (${roleClassName}) o;
        return id != null && id.equals(role.id);
    }

    @Override
    public int hashCode() {
        return id != null ? Objects.hash(id) : getClass().hashCode();
    }
}

${includeComments ?
`/**
 * Example ${orderClassName} Entity. (Should be in its own file: ${modelPackagePath}/${orderClassName}.java)
 */` : ""}
@Entity
@Table(name = "${lowerOrderClassName}s") // Table name for orders
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"${lowerClassName}"}) // Exclude the back-reference
// @EqualsAndHashCode(exclude = {"${lowerClassName}"})
public class ${orderClassName} { // Made public for visibility if inline

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(length = 100, nullable = false, unique = true) // Example: order number is unique
    private String orderNumber;

    ${includeComments ? `// Many-to-One relationship back to ${className} (Owner of the order)` : ""}
    @ManyToOne(fetch = FetchType.LAZY, optional = false) // An order must belong to a user/profile
    @JoinColumn(name = "${lowerClassName}_id", nullable = false) // Foreign key column name
    private ${className} ${lowerClassName}; // Field name MUST match 'mappedBy' in ${className}

    @Column(nullable = false, precision = 10, scale = 2) // Define precision and scale for BigDecimal
    private BigDecimal amount; // Use BigDecimal for currency

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public ${orderClassName}(String orderNumber, BigDecimal amount) {
        this.orderNumber = orderNumber;
        this.amount = amount;
    }

    // Crucial: Setter for the @ManyToOne side, used by ${className}.addOrder/${className}.removeOrder
    public void set${className}(${className} ${lowerClassName}) {
         this.${lowerClassName} = ${lowerClassName};
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ${orderClassName} order = (${orderClassName}) o;
        return id != null && id.equals(order.id);
    }

    @Override
    public int hashCode() {
         return id != null ? Objects.hash(id) : getClass().hashCode();
    }
}`; // End of Related Entities Content


    // --- Test Code ---
    const testContent = includeTests ? `

// ================== TEST CLASS (Should be in separate file: ${testPackagePath}/${className}Test.java) ==================
package ${testPackageName};

import ${modelPackageName}.${className};
// Make sure these imports work based on where Role/Order are defined (same package assumed here)
import ${modelPackageName}.${roleClassName};
import ${modelPackageName}.${orderClassName};
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal; // Import BigDecimal
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for the {@link ${className}} entity and its relationships.
 */
@DisplayName("JPA Entity - ${className} Tests")
class ${className}Test { // Test class naming convention

    private ${className} ${lowerClassName};
    private ${roleClassName} roleAdmin;
    private ${roleClassName} roleUser;
    private ${orderClassName} order1;
    private ${orderClassName} order2;

    @BeforeEach
    void setUp() {
        ${lowerClassName} = new ${className}("Test ${className}", "test@example.com");
        ${lowerClassName}.setId(1L); // Simulate persisted entity for equals/hashCode tests

        roleAdmin = new ${roleClassName}("ROLE_ADMIN");
        roleAdmin.setId(10L);
        roleUser = new ${roleClassName}("ROLE_USER");
        roleUser.setId(11L);

        order1 = new ${orderClassName}("ORD-001", new BigDecimal("99.99"));
        order1.setId(100L);
        // order1.set${className}(${lowerClassName}); // Set manually if needed for setup, but add/removeOrder should handle it

        order2 = new ${orderClassName}("ORD-002", new BigDecimal("12.50"));
        order2.setId(101L);
        // order2.set${className}(${lowerClassName});
    }

    @Test
    @DisplayName("Convenience Constructor Sets Fields Correctly")
    void testConstructor() {
        ${className} newUser = new ${className}("Constructor Test", "constructor@example.com");
        assertAll(
            () -> assertNull(newUser.getId(), "ID should be null initially"),
            () -> assertEquals("Constructor Test", newUser.getName()),
            () -> assertEquals("constructor@example.com", newUser.getEmail()),
            () -> assertTrue(newUser.isActive(), "Should be active by default"),
            () -> assertNotNull(newUser.getRoles(), "Roles set should be initialized"),
            () -> assertTrue(newUser.getRoles().isEmpty(), "Roles set should be empty initially"),
            () -> assertNotNull(newUser.getOrders(), "Orders set should be initialized"),
            () -> assertTrue(newUser.getOrders().isEmpty(), "Orders set should be empty initially")
            // Timestamps will be null until persisted or explicitly set
        );
    }

    @Test
    @DisplayName("addRole Should Add Role to Set") // Focusing on one side for simplicity
    void testAddRole() {
        ${lowerClassName}.addRole(roleAdmin);

        assertTrue(${lowerClassName}.getRoles().contains(roleAdmin), "${className} should contain added role");
        assertEquals(1, ${lowerClassName}.getRoles().size(), "Roles count should be 1");

        // Add another role
         ${lowerClassName}.addRole(roleUser);
         assertEquals(2, ${lowerClassName}.getRoles().size(), "Roles count should be 2");
         assertTrue(${lowerClassName}.getRoles().contains(roleUser));

         // Add null role (should not change anything)
         ${lowerClassName}.addRole(null);
         assertEquals(2, ${lowerClassName}.getRoles().size(), "Adding null role should not change size");

         // Add same role again (Set should handle uniqueness)
         ${lowerClassName}.addRole(roleAdmin);
         assertEquals(2, ${lowerClassName}.getRoles().size(), "Adding same role again should not change size");
    }

     @Test
    @DisplayName("removeRole Should Remove Role from Set") // Focusing on one side
    void testRemoveRole() {
        // Add roles first
        ${lowerClassName}.addRole(roleAdmin);
        ${lowerClassName}.addRole(roleUser);
        assertEquals(2, ${lowerClassName}.getRoles().size());

        // Remove one role
        ${lowerClassName}.removeRole(roleAdmin);
        assertEquals(1, ${lowerClassName}.getRoles().size(), "Roles count should be 1 after removal");
        assertFalse(${lowerClassName}.getRoles().contains(roleAdmin), "${className} should not contain removed role");
        assertTrue(${lowerClassName}.getRoles().contains(roleUser), "${className} should still contain other role");

         // Remove the other role
         ${lowerClassName}.removeRole(roleUser);
         assertTrue(${lowerClassName}.getRoles().isEmpty(), "Roles set should be empty after removing all");

         // Remove null role (should not change anything)
         ${lowerClassName}.removeRole(null);
         assertTrue(${lowerClassName}.getRoles().isEmpty());

         // Remove role not present (should not change anything)
         ${lowerClassName}.removeRole(roleAdmin); // Already removed
         assertTrue(${lowerClassName}.getRoles().isEmpty());
    }


     @Test
    @DisplayName("addOrder Should Maintain Bidirectional Consistency")
    void testAddOrder() {
         ${lowerClassName}.addOrder(order1);

         assertTrue(${lowerClassName}.getOrders().contains(order1), "${className} should contain added order");
         assertSame(${lowerClassName}, order1.get${className}(), "Order's back-reference should be set to this ${className}");
         assertEquals(1, ${lowerClassName}.getOrders().size(), "Orders count should be 1");

         // Add another order
         ${lowerClassName}.addOrder(order2);
         assertEquals(2, ${lowerClassName}.getOrders().size(), "Orders count should be 2");
         assertTrue(${lowerClassName}.getOrders().contains(order2));
         assertSame(${lowerClassName}, order2.get${className}());

         // Add null order (should not change anything)
         ${lowerClassName}.addOrder(null);
         assertEquals(2, ${lowerClassName}.getOrders().size());

         // Add same order again (Set handles uniqueness)
         ${lowerClassName}.addOrder(order1);
         assertEquals(2, ${lowerClassName}.getOrders().size());
    }


    @Test
    @DisplayName("removeOrder Should Maintain Bidirectional Consistency")
    void testRemoveOrder() {
         // Add orders first
        ${lowerClassName}.addOrder(order1);
        ${lowerClassName}.addOrder(order2);
        assertEquals(2, ${lowerClassName}.getOrders().size());

        // Remove one order
        ${lowerClassName}.removeOrder(order1);
        assertEquals(1, ${lowerClassName}.getOrders().size(), "Orders count should be 1 after removal");
        assertFalse(${lowerClassName}.getOrders().contains(order1), "${className} should not contain removed order");
        assertTrue(${lowerClassName}.getOrders().contains(order2), "${className} should still contain other order");
        assertNull(order1.get${className}(), "Removed order's back-reference should be null");
        assertSame(${lowerClassName}, order2.get${className}(), "Other order's back-reference should remain");

         // Remove the other order
         ${lowerClassName}.removeOrder(order2);
         assertTrue(${lowerClassName}.getOrders().isEmpty(), "Orders set should be empty after removing all");
         assertNull(order2.get${className}());

         // Remove null order (should not change anything)
         ${lowerClassName}.removeOrder(null);
         assertTrue(${lowerClassName}.getOrders().isEmpty());

         // Remove order not present (should not change anything)
         ${lowerClassName}.removeOrder(order1); // Already removed
         assertTrue(${lowerClassName}.getOrders().isEmpty());
    }

    @Test
    @DisplayName("Equals and HashCode Based on ID")
    void testEqualsAndHashCode() {
        ${className} sameIdEntity = new ${className}("Different Name", "diff@example.com");
        sameIdEntity.setId(1L); // Same ID as ${lowerClassName}

        ${className} differentIdEntity = new ${className}("Test ${className}", "test@example.com");
        differentIdEntity.setId(2L); // Different ID

        ${className} nullIdEntity1 = new ${className}("Null ID 1", "null1@example.com"); // ID is null
        ${className} nullIdEntity2 = new ${className}("Null ID 2", "null2@example.com"); // ID is null

        // Reflexivity
        assertEquals(${lowerClassName}, ${lowerClassName}, "Entity should equal itself");
        assertEquals(nullIdEntity1, nullIdEntity1, "Null ID entity should equal itself");

        // Symmetry (based on ID)
        assertEquals(${lowerClassName}, sameIdEntity, "Entities with same ID should be equal");
        assertEquals(sameIdEntity, ${lowerClassName}, "Equality should be symmetric");

        // Inequality (different IDs)
        assertNotEquals(${lowerClassName}, differentIdEntity, "Entities with different IDs should not be equal");
        assertNotEquals(differentIdEntity, ${lowerClassName});

        // Inequality (one ID null)
        assertNotEquals(${lowerClassName}, nullIdEntity1, "Persisted entity should not equal non-persisted one");
        assertNotEquals(nullIdEntity1, ${lowerClassName});

        // Inequality (both IDs null, different objects)
        assertNotEquals(nullIdEntity1, nullIdEntity2, "Different non-persisted entities should not be equal");

        // Inequality (different types or null)
        assertNotEquals(${lowerClassName}, null, "Entity should not equal null");
        assertNotEquals(${lowerClassName}, new Object(), "Entity should not equal object of different type");
        assertNotEquals(nullIdEntity1, null);
        assertNotEquals(nullIdEntity1, new Object());


        // HashCode consistency
        assertEquals(${lowerClassName}.hashCode(), sameIdEntity.hashCode(), "Entities with same ID should have same hashCode");

        // HashCode for null IDs (based on class in this implementation)
        // Note: Depending on implementation, hashCodes for different null-ID instances might be the same or different.
        // The important part is consistency with equals: if a.equals(b) is false, hashcodes don't *have* to be different.
        // If a.equals(b) is true, hashcodes *must* be the same.
        assertTrue(nullIdEntity1.hashCode() == nullIdEntity1.hashCode(), "HashCode should be consistent for same null ID object");
        // No guarantee that nullIdEntity1.hashCode() != nullIdEntity2.hashCode()
    }
}` : ""; // End of testContent

    return entityContent + relatedEntitiesContent + testContent; // Concatenate all parts
};