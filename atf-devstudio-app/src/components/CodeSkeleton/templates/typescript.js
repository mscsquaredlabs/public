// templates/typescript.js
// TypeScript templates for various code skeletons

/**
 * TypeScript React Component Template
 */
export const component = (options = {}) => {
    const {
      includeComments = true,
      includeTests = false,
      className = 'MyComponent'
    } = options;
  
    return `import React, { useState, useEffect } from 'react';
  
  ${includeComments ? `/**
   * Props for the ${className} component
   */` : ""}
  interface ${className}Props {
    title?: string;
    data?: any[];
    onClick?: () => void;
  }
  
  ${includeComments ? `/**
   * ${className} - A React component
   * @param props - Component props
   */` : ""}
  const ${className}: React.FC<${className}Props> = ({ 
    title = '${className}', 
    data = [],
    onClick
  }) => {
    const [state, setState] = useState<any>(null);
    
    useEffect(() => {
      // Initialization code here
    }, []);
    
    const handleClick = () => {
      if (onClick) {
        onClick();
      }
    };
    
    return (
      <div className="${className.toLowerCase()}">
        <h2>{title}</h2>
        <button onClick={handleClick}>Click Me</button>
        {data.length > 0 && (
          <ul>
            {data.map((item, index) => (
              <li key={index}>{JSON.stringify(item)}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  
  export default ${className};
  
  ${includeTests ? `
  // Test file: ${className}.test.tsx
  import React from 'react';
  import { render, screen, fireEvent } from '@testing-library/react';
  import ${className} from './${className}';
  
  test('renders ${className}', () => {
    render(<${className} title="Test Title" />);
    const element = screen.getByText('Test Title');
    expect(element).toBeInTheDocument();
  });
  
  test('calls onClick when button is clicked', () => {
    const handleClick = jest.fn();
    render(<${className} onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });` : ""}`;
  };
  
  /**
   * TypeScript Function Template
   */
  export const function_ = (options = {}) => {
    const {
      includeComments = true,
      includeTests = false,
      functionName = 'myFunction'
    } = options;
  
    return `${includeComments ? `/**
   * ${functionName} - Description of the function
   * @param param - Function parameter
   * @returns Function result
   */` : ""}
  function ${functionName}<T>(param: T): T {
    // Function implementation
    return param;
  }
  
  ${includeTests ? `
  // Test for the function
  describe('${functionName}', () => {
    test('returns the input value', () => {
      expect(${functionName}('test')).toBe('test');
      expect(${functionName}(123)).toBe(123);
      expect(${functionName}(true)).toBe(true);
    });
  });` : ""}
  
  export default ${functionName};`;
  };
  
  /**
   * TypeScript Interface Template
   */
  export const interface_ = (options = {}) => {
    const {
      includeComments = true,
      className = 'MyInterface'
    } = options;
  
    return `${includeComments ? `/**
   * ${className} - Interface description
   */` : ""}
  export interface ${className} {
    /** Unique identifier */
    id: string | number;
    
    /** Name field */
    name: string;
    
    /** Optional description */
    description?: string;
    
    /** Creation date */
    createdAt: Date;
    
    /** Status flag */
    isActive: boolean;
    
    /** Optional tags */
    tags?: string[];
    
    /** Custom data - can be any type */
    metadata?: Record<string, any>;
    
    /** Method definition */
    validate(): boolean;
  }
  
  ${includeComments ? `/**
   * Factory function to create a ${className} object
   * @param data - Partial data to create the object
   * @returns A ${className} object
   */` : ""}
  export function create${className}(data: Partial<${className}>): ${className} {
    return {
      id: data.id || Date.now(),
      name: data.name || '',
      createdAt: data.createdAt || new Date(),
      isActive: data.isActive ?? true,
      description: data.description,
      tags: data.tags || [],
      metadata: data.metadata || {},
      validate() {
        return this.name.trim().length > 0;
      }
    };
  }`;
  };
  
  /**
   * TypeScript Type Definition Template
   */
  export const type = (options = {}) => {
    const {
      includeComments = true,
      className = 'MyType'
    } = options;
  
    return `${includeComments ? `/**
   * ${className} - Type definition
   */` : ""}
  export type ${className} = {
    /** Unique identifier */
    id: string | number;
    
    /** Name field */
    name: string;
    
    /** Optional description */
    description?: string;
    
    /** Creation date */
    createdAt: Date;
    
    /** Status flag */
    isActive: boolean;
  };
  
  ${includeComments ? '// Type aliases and utility types' : ''}
  export type ${className}Id = ${className}['id'];
  export type ${className}Key = keyof ${className};
  export type Optional${className} = Partial<${className}>;
  export type Required${className} = Required<${className}>;
  export type Readonly${className} = Readonly<${className}>;
  
  ${includeComments ? `/**
   * Union type for ${className} status
   */` : ''}
  export type ${className}Status = 'active' | 'inactive' | 'pending' | 'archived';
  
  ${includeComments ? `/**
   * Discriminated union for ${className} actions
   */` : ''}
  export type ${className}Action = 
    | { type: 'CREATE'; payload: ${className} }
    | { type: 'UPDATE'; payload: Partial<${className}> & { id: ${className}Id } }
    | { type: 'DELETE'; payload: ${className}Id }
    | { type: 'ARCHIVE'; payload: ${className}Id };
  
  ${includeComments ? `/**
   * Generic wrapper for ${className}
   */` : ''}
  export type ${className}Container<T> = {
    data: T;
    meta: {
      ${className}Id: ${className}Id;
      timestamp: Date;
    };
  };`;
  };
  
  /**
   * TypeScript API Endpoint Template
   */
  export const api = (options = {}) => {
    const {
      includeComments = true,
      includeTests = false,
      apiName = 'myApi',
      className = 'User'
    } = options;
  
    return `${includeComments ? `/**
   * API handler for ${apiName}
   */` : ""}
  import { Request, Response } from 'express';
  
  ${includeComments ? `/**
   * Type for ${className} model
   */` : ""}
  interface ${className} {
    id: string | number;
    name: string;
    email?: string;
    createdAt: Date;
  }
  
  ${includeComments ? `/**
   * ${apiName} - API request handler
   * @param req - Express request object
   * @param res - Express response object
   */` : ""}
  const ${apiName} = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Request validation
      const { id } = req.params;
      
      // Business logic
      // const data = await fetch${className}FromDatabase(id);
      const data: ${className} = {
        id,
        name: 'Test ${className}',
        createdAt: new Date()
      };
      
      // Response
      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error in ${apiName}:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  };
  
  ${includeTests ? `
  // Test for the API
  import { getMockReq, getMockRes } from '@jest-mock/express';
  
  describe('${apiName}', () => {
    it('should return data for valid request', async () => {
      const req = getMockReq({ params: { id: '123' } });
      const { res, next } = getMockRes();
      
      await ${apiName}(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          id: '123'
        })
      }));
    });
  });` : ""}
  
  export default ${apiName};`;
  };
  
  /**
   * TypeScript React Hook Template
   */
  export const hook = (options = {}) => {
    const {
      includeComments = true,
      includeTests = false,
      functionName = 'useCustomHook'
    } = options;
  
    return `${includeComments ? `/**
   * ${functionName} - Custom React Hook
   * @param initialValue - Initial state value
   * @returns Tuple with state value and setter function
   */` : ""}
  import { useState, useEffect } from 'react';
  
  function ${functionName}<T>(initialValue: T): [T, (value: T) => void] {
    const [state, setState] = useState<T>(initialValue);
    
    useEffect(() => {
      // Effect logic here
      return () => {
        // Cleanup logic here
      };
    }, []);
    
    const customSetter = (newValue: T): void => {
      // Custom logic before setting state
      setState(newValue);
    };
    
    return [state, customSetter];
  }
  
  ${includeTests ? `
  // Test file: ${functionName}.test.tsx
  import { renderHook, act } from '@testing-library/react-hooks';
  import ${functionName} from './${functionName}';
  
  test('should use custom hook', () => {
    const { result } = renderHook(() => ${functionName}('initial'));
    
    expect(result.current[0]).toBe('initial');
    
    act(() => {
      result.current[1]('updated');
    });
    
    expect(result.current[0]).toBe('updated');
  });` : ""}
  
  export default ${functionName};`;
  };
  
  /**
   * TypeScript Class Template
   */
  export const class_ = (options = {}) => {
    const {
      includeComments = true,
      includeTests = false,
      className = 'MyClass'
    } = options;
  
    return `${includeComments ? `/**
   * Options for ${className}
   */` : ""}
  export interface ${className}Options {
    /** Optional name property */
    name?: string;
    
    /** Optional value property */
    value?: number;
    
    /** Optional callback function */
    onUpdate?: (instance: ${className}) => void;
  }
  
  ${includeComments ? `/**
   * ${className} - Class description
   */` : ""}
  class ${className} {
    private options: ${className}Options;
    private name: string;
    private value: number;
    
    ${includeComments ? `/**
     * Creates an instance of ${className}.
     * @param options - Configuration options
     */` : ""}
    constructor(options: ${className}Options = {}) {
      this.options = options;
      this.name = options.name || '${className}';
      this.value = options.value || 0;
    }
    
    ${includeComments ? `/**
     * Gets the name property
     * @returns The current name
     */` : ""}
    getName(): string {
      return this.name;
    }
    
    ${includeComments ? `/**
     * Sets the name property
     * @param name - New name value
     */` : ""}
    setName(name: string): void {
      this.name = name;
      this.notifyUpdate();
    }
    
    ${includeComments ? `/**
     * Gets the value property
     * @returns The current value
     */` : ""}
    getValue(): number {
      return this.value;
    }
    
    ${includeComments ? `/**
     * Sets the value property
     * @param value - New value
     */` : ""}
    setValue(value: number): void {
      this.value = value;
      this.notifyUpdate();
    }
    
    ${includeComments ? `/**
     * Increments the value by the given amount
     * @param amount - Amount to increment by (default: 1)
     * @returns The new value
     */` : ""}
    increment(amount: number = 1): number {
      this.value += amount;
      this.notifyUpdate();
      return this.value;
    }
    
    ${includeComments ? `/**
     * Notifies the update callback if provided
     * @private
     */` : ""}
    private notifyUpdate(): void {
      if (this.options.onUpdate) {
        this.options.onUpdate(this);
      }
    }
    
    ${includeComments ? `/**
     * Creates a string representation of the class
     * @returns String representation
     */` : ""}
    toString(): string {
     return "${className}: { name: \"${this.name}\", value: ${this.value} }";
    }
  }
  
  ${includeTests ? `
  // Test for the class
  describe('${className}', () => {
    test('should create instance with default values', () => {
      const instance = new ${className}();
      expect(instance.getName()).toBe('${className}');
      expect(instance.getValue()).toBe(0);
    });
    
    test('should set values through constructor', () => {
      const instance = new ${className}({ name: 'Test', value: 10 });
      expect(instance.getName()).toBe('Test');
      expect(instance.getValue()).toBe(10);
    });
    
    test('should update values through setters', () => {
      const instance = new ${className}();
      instance.setName('Updated');
      instance.setValue(20);
      expect(instance.getName()).toBe('Updated');
      expect(instance.getValue()).toBe(20);
    });
    
    test('should increment value', () => {
      const instance = new ${className}({ value: 5 });
      expect(instance.increment()).toBe(6);
      expect(instance.increment(3)).toBe(9);
    });
    
    test('should call onUpdate callback', () => {
      const onUpdate = jest.fn();
      const instance = new ${className}({ onUpdate });
      
      instance.setName('Test');
      expect(onUpdate).toHaveBeenCalledTimes(1);
      
      instance.setValue(10);
      expect(onUpdate).toHaveBeenCalledTimes(2);
      
      instance.increment();
      expect(onUpdate).toHaveBeenCalledTimes(3);
    });
  });` : ""}
  
  export default ${className};`;
  };