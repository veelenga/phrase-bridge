import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai'
import axios from 'axios';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new OpenAI({  apiKey: process.env.OPENAI_API_KEY});

const INSTRUCTION_FILE = process.env.INSTRUCTION_FILE;
const instructionsPath = path.join(__dirname, INSTRUCTION_FILE);
let instructions;

try {
  instructions = fs.readFileSync(instructionsPath, 'utf8');
} catch (error) {
  console.error('Error reading instruction file:', error.message);
}

export async function handler() {
  if (!instructions) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Instruction file not found' }),
    };
  }

  try {
    const content = await generateContent();
    if (content) {
      await sendMessage(content);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Message sent successfully' }),
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Content generation failed' }),
      };
    }
  } catch (error) {
    console.error('Error in handler:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

async function generateContent() {
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: instructions }],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const content = response.choices[0].message.content;
    console.log(content);
    return content;
  } catch (error) {
    console.error(
      'Error generating content:',
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

// Function to send message to Telegram
async function sendMessage(message) {
  try {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML',
    });
    console.log('Message sent successfully.');
  } catch (error) {
    console.error(
      'Error sending message:',
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

// If running locally, invoke the main function
if (process.env.NODE_ENV !== 'lambda') {
  (async () => {
    try {
      const content = await generateContent();
      if (content) {
        await sendMessage(content);
      } else {
        console.error('No content generated.');
      }
    } catch (error) {
      console.error('Error in main function:', error.message);
    }
  })();
}
