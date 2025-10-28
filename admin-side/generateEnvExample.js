const fs = require('fs');

const envFile = '.env';
const exampleFile = '.env.example';

if (!fs.existsSync(envFile)) {
  console.error('❌ No .env file found.');
  process.exit(1);
}

const envContent = fs.readFileSync(envFile, 'utf-8');

const exampleContent = envContent
  .split('\n')
  .map(line => {
    if (line.trim().startsWith('#') || line.trim() === '') return line;
    const [key] = line.split('=');
    return `${key}=`;
  })
  .join('\n');

fs.writeFileSync(exampleFile, exampleContent);
console.log('✅ .env.example generated successfully!');
