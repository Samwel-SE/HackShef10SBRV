import express from 'express';
import OpenAI from 'openai';
import 'dotenv/config';
import path from 'path';
import cors from 'cors';

const app = express();
const PORT = 5000;
const apiKey = process.env.ZUKI_API_KEY;
const corsOptions = {
  origin: ["http://localhost:5173"],
};

const client = new OpenAI({
  baseURL: 'https://api.zukijourney.com/v1',
  apiKey: apiKey,
});

app.use(cors(corsOptions));
app.use(express.json());


app.get('/', (req, res) => {
  res.send("Hello world");
});

app.post('/', async (req, res) => {
  const { messages } = req.body;

  try {
    //Interact with the AI
    //Something here throwing error
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages
    });
    res.json(response.choices[0].message.content);

  } catch (error) {
    console.log('massive error');
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));