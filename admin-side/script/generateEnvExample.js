import fs from 'fs';

const envFile = '.env';
const exampleFile = '.env.example';

const envExists = await fs.promises
  .access(envFile)
  .then(() => true)
  .catch(() => false);

if (!envExists) {
  console.error('❌ No .env file found.');
  process.exit(1);
}

const envContent = await fs.promises.readFile(envFile, 'utf-8');

const exampleContent = envContent
  .split('\n')
  .map(line => {
    if (line.trim().startsWith('#') || line.trim() === '') return line;
    const [key] = line.split('=');
    return `${key}=`;
  })
  .join('\n');

await fs.promises.writeFile(exampleFile, exampleContent);
console.log('✅ .env.example generated successfully!');
