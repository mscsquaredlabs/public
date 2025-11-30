import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import JsonValidator from './components/JsonValidator/JsonValidator';
import XmlValidator from './components/XmlValidator/XmlValidator';
import YamlValidator from './components/YamlValidator/YamlValidator';
import TestDataGenerator from './components/TestDataGenerator/TestDataGenerator';
import ApiTester from './components/ApiTester/ApiTester';
import CodeSkeleton from './components/CodeSkeleton/CodeSkeleton';
import ConfigSamples from './components/ConfigSamples/ConfigSamples';
import AppGenerator from './components/AppGenerator/AppGenerator';
import CodeDiffChecker from './components/CodeDiffChecker/CodeDiffChecker';
import UrlParser from './components/UrlParser/UrlParser';
import Base64EncoderDecoder from './components/Base64EncoderDecoder/Base64EncoderDecoder';
import CronExpressionTool from './components/CronExpressionTool/CronExpressionTool';
import MarkdownPreviewer from './components/MarkdownPreviewer/MarkdownPreviewer';
import Mems from './components/Mems/Mems';
import CheatSheet from './components/CheatSheet/CheatSheet';

// Import the existing tools
import SqlFormatter from './components/SqlFormatter/SqlFormatter';
import SchemaVisualizer from './components/SchemaVisualizer/SchemaVisualizer';
import LogAnalyzer from './components/LogAnalyzer/LogAnalyzer';
import SqlFiddle from './components/SqlFiddle/SqlFiddle';
import NetworkInspector from './components/NetworkInspector/NetworkInspector';
import DeployApp from './components/DeployApp/DeployApp';
import Terms from './components/Terms/Terms';
import Logs from './components/Logs/Logs';
import Views from './components/Views/Views';
import BCrypts from './components/BCrypts/BCrypts';

// Import the new Database Client component
import DatabaseClient from './components/DBClient/DatabaseClient';

import { AppProvider } from './AppContext';

import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />}>
            <Route path="json-validator" element={<JsonValidator />} />
            <Route path="xml-validator" element={<XmlValidator />} />
            <Route path="yaml-validator" element={<YamlValidator />} />
            <Route path="test-data-generator" element={<TestDataGenerator />} />
            <Route path="api-tester" element={<ApiTester />} />
            <Route path="code-skeleton" element={<CodeSkeleton />} />
            <Route path="config-samples" element={<ConfigSamples />} />
            <Route path="app-generator" element={<AppGenerator />} />
            <Route path="code-diff-checker" element={<CodeDiffChecker />} />
            <Route path="url-parser" element={<UrlParser />} />
            <Route path="base64-encoder-decoder" element={<Base64EncoderDecoder />} />
            <Route path="cron-expression-tool" element={<CronExpressionTool />} />
            <Route path="markdown-previewer" element={<MarkdownPreviewer />} />
            <Route path="mems" element={<Mems />} />
            <Route path="terms" element={<Terms />} />
            <Route path="views" element={<Views />} />
            <Route path="bcrypts" element={<BCrypts />} />
            <Route path="logs" element={<Logs />} />
            
            {/* Database tools */}
            <Route path="sql-formatter" element={<SqlFormatter />} />
            <Route path="schema-visualizer" element={<SchemaVisualizer />} />
            <Route path="log-analyzer" element={<LogAnalyzer />} />
            <Route path="sql-fiddle" element={<SqlFiddle />} />
            <Route path="database-client" element={<DatabaseClient />} />
            
            {/* Network and deployment tools */}
            <Route path="network-inspector" element={<NetworkInspector />} />
            <Route path="deploy-app" element={<DeployApp />} />

            <Route index element={<Navigate to="/mems" replace />} />
            
            <Route path="/cheat-sheet" element={<CheatSheet />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;