# ATF Dev Studio

ATF Dev Studio is a comprehensive web-based development toolkit providing various utilities for developers, including validators, generators, and testing tools.

## Features

### Utilities
- **Mems**: Manage and store code snippets
- **Terms**: Terminal sessions for command line operations
- **Views**: Monitor folder contents and changes
- **BCrypts**: Generate and verify BCrypt hashes
- **Code Diff Checker**: Compare and analyze code differences
- **URL Parser**: Parse and analyze URL components
- **Base64 Encoder/Decoder**: Encode or decode Base64 strings
- **Cron Expression Tool**: Create and test cron expressions
- **Markdown Previewer**: Preview and edit Markdown documents
- **Logs**: Monitor log files in real-time

### Validators
- **JSON Validator**: Validate and format JSON data with syntax checking
- **XML Validator**: Validate XML documents and check for well-formedness
- **YAML Validator**: Validate YAML files and convert between formats
- **SQL Formatter**: Format and beautify SQL queries

### Generators
- **Test Data Generator**: Generate sample data based on schemas or templates
- **Code Skeleton**: Generate code templates for various programming languages
- **App Generator**: Create starter applications for different platforms (React, Node.js, Java, Python)

### Database Tools
- **Database Client**: Connect to PostgreSQL, MySQL, Oracle, and Sybase databases
- **SQL Fiddle**: Test and run SQL queries in SQLite sandbox
- **Schema Visualizer**: Visualize database schemas and relationships

### Testers
- **API Tester**: Test API endpoints with different request methods and parameters
- **Network Inspector**: Inspect network traffic and requests

### Analyzers
- **Log Analyzer**: Analyze and parse log files

### Deployment
- **Deploy App**: Deploy WAR files to Tomcat and WildFly servers

### Resources
- **Config Samples**: Repository of common configuration templates
- **Dev Cheat Sheet**: Programming cheat sheets and quick references

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
├── public/                    # Static files
├── server/                    # Backend server for database connections and deployments
├── src/
│   ├── components/            # React components
│   │   ├── Dashboard/         # Main layout component
│   │   ├── ApiTester/         # API testing tool
│   │   ├── AppGenerator/      # Application generator
│   │   ├── Base64EncoderDecoder/ # Base64 encoding/decoding tool
│   │   ├── BCrypts/           # BCrypt hash generator
│   │   ├── CheatSheet/        # Developer cheat sheets
│   │   ├── CodeDiffChecker/   # Code comparison tool
│   │   ├── CodeSkeleton/      # Code template generator
│   │   ├── ConfigSamples/     # Configuration samples library
│   │   ├── CronExpressionTool/ # Cron expression builder
│   │   ├── DBClient/          # Database client for multiple databases
│   │   ├── DeployApp/         # Application deployment tool
│   │   ├── JsonValidator/     # JSON validation tool
│   │   ├── LogAnalyzer/       # Log analysis tool
│   │   ├── MarkdownPreviewer/ # Markdown editor and previewer
│   │   ├── Mems/              # Code snippets manager
│   │   ├── NetworkInspector/  # Network traffic inspector
│   │   ├── SchemaVisualizer/  # Database schema visualization
│   │   ├── SqlFiddle/         # SQL query sandbox
│   │   ├── SqlFormatter/      # SQL formatting tool
│   │   ├── Terms/             # Terminal sessions manager
│   │   ├── TestDataGenerator/ # Test data generation tool
│   │   ├── UrlParser/         # URL parsing tool
│   │   ├── Views/             # Folder monitoring tool
│   │   ├── XmlValidator/      # XML validation tool
│   │   └── YamlValidator/     # YAML validation tool
│   ├── shared/                # Shared utilities and components
│   ├── App.jsx                # Main application component
│   ├── AppContext.jsx         # Application context provider
│   ├── index.jsx              # Application entry point
│   └── styles.css             # Global styles
├── package.json               # Project dependencies
├── vite.config.js             # Vite configuration
└── tailwind.config.js         # Tailwind CSS configuration
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

- More code templates and sample configurations
- Advanced schema validation
- Import/export functionality for all tools
- Collaboration features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- All the open-source projects that made this possible
- The developer community for their constant inspiration