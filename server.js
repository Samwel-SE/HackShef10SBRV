import OpenAI from "openai";
import express from "express";
import cors from "cors";
import 'dotenv/config';
import { playAudio } from "openai/helpers/audio";
const OPEN_AI_KEY = process.env.OPENAI_API_KEY;

const app = express();
const client = new OpenAI( { apiKey: process.env.OPENAI_API_KEY } );


app.use(cors());
app.use(express.json());

app.post("/story", async (req, res) => {
    const { startCityInput, timeInput } = req.body;

    console.log("Starting City: " + startCityInput + " time: " + timeInput)

    const response = await client.responses.create({
        model: "gpt-5-nano",
        input: `Tell a story set in ${startCityInput} during the year ${timeInput}`
    });

    res.json({ text: response.output_text });
    console.log(response);
    textToSpeech(response.output_text);
});

app.listen(3000, () => console.log("Server running on port 3000"));


async function textToSpeech(inputText) {
  const openai = new OpenAI();

  const response = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "coral",
    input: inputText,
    instructions: "Speak in a cheerful and positive tone.",
    response_format: "wav",
  });

  await playAudio(response);
}

