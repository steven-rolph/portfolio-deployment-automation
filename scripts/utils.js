import fs from 'fs';

function validateConfig(configPath) {
  if (!fs.existsSync(configPath)) {
    console.error('❌ deployment-config.json not found');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  const required = ['projectName', 'description'];
  const missing = required.filter(field => !config[field]);
  
  if (missing.length > 0) {
    console.error(`❌ Missing required fields: ${missing.join(', ')}`);
    process.exit(1);
  }

  console.log('✅ Configuration valid');
  return config;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const [,, command, ...args] = process.argv;
  
  if (command === 'validate-config') {
    validateConfig(args[0]);
  }
}

export { validateConfig };