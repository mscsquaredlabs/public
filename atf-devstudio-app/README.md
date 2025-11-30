# ATF Dev Studio

ATF Dev Studio is a comprehensive web-based development toolkit providing various utilities for developers, including validators, generators, and testing tools.

## Features

- **JSON Validator**: Validate and format JSON data with syntax checking
- **XML Validator**: Validate XML documents and check for well-formedness
- **YAML Validator**: Validate YAML files and convert between formats
- **Test Data Generator**: Generate sample data based on schemas or templates
- **API Tester**: Test API endpoints with different request methods and parameters
- **Code Skeleton**: Generate code templates for various programming languages
- **App Generator**: Create starter applications for different platforms (React, Node.js, Java, Python)
- **Config Samples**: Repository of common configuration templates

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 8.x or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/atf-dev-studio.git
cd atf-dev-studio
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

## Building for Production

To build the application for production deployment:

```bash
npm run build
```

The built files will be in the `dist` directory, ready to be deployed to a static hosting service.

## Project Structure

```
atf-dev-studio/
├── public/                  # Static files
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard/       # Main layout component
│   │   ├── JsonValidator/   # JSON validation tool
│   │   ├── XmlValidator/    # XML validation tool
│   │   ├── YamlValidator/   # YAML validation tool
│   │   ├── TestDataGenerator/ # Data generation tool
│   │   ├── ApiTester/       # API testing tool
│   │   ├── CodeSkeleton/    # Code template generator
│   │   ├── AppGenerator/    # Application generator
│   │   └── ConfigSamples/   # Configuration samples library
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Application entry point
│   └── styles.css           # Global styles
├── package.json             # Project dependencies
└── vite.config.js           # Vite configuration
```

## Development Guidelines

- Use React hooks for state management
- Avoid direct DOM manipulation
- Keep components modular and reusable
- Follow consistent naming conventions
- Use CSS modules or component-specific CSS files
- Implement responsive design for all components

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Future Enhancements

- Dark mode support
- User preference storage
- More code templates and sample configurations
- Advanced schema validation
- Import/export functionality for all tools
- Collaboration features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- All the open-source projects that made this possible
- The developer community for their constant inspiration