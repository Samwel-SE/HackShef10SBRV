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
    const { startLocation, endLocation} = req.body;

    console.log("Starting City: " + startLocation + "Ending City: " + endLocation)

    const response = await client.responses.create({
        model: "gpt-4-turbo",
        input: `Tell a 400 word mythological story from ${startLocation} to ${endLocation}.
                Tell the story from the perspective of 4 characters with different ages and backgrounds.
                The first character journeys from the ${startLocation} to ${endLocation} and meets the
                other characters along the way`
                
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
textToSpeech("Hello motherfuckers");

