// server-diagnostic.js - ES Module version
import fetch from 'node-fetch';

async function testServerEndpoints() {
  console.log('Testing Terminal API Server...');
  
  try {
    // Test connection endpoint
    console.log('\nTesting /api/terminal/test endpoint:');
    const testResponse = await fetch('http://localhost:3001/api/terminal/test');
    const testData = await testResponse.json();
    console.log('Status:', testResponse.status);
    console.log('Response:', testData);
    
    // Test command execution
    console.log('\nTesting /api/terminal/exec endpoint:');
    const cmdResponse = await fetch('http://localhost:3001/api/terminal/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'dir', cwd: 'C:\\' })
    });
    const cmdData = await cmdResponse.json();
    console.log('Status:', cmdResponse.status);
    console.log('Response:', cmdData);
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Diagnostic test failed:', error);
  }
}

testServerEndpoints();