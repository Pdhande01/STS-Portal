import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const envVars = Object.fromEntries(envFile.split('\n').map(line => line.split('=')));

const apiKey = envVars.VITE_GEMINI_API_KEY?.trim();

if (!apiKey) {
  console.error("Missing Gemini API key");
  process.exit(1);
}

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log(data.models.map(m => m.name).join('\n'));
}

listModels();
