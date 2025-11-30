import { writeFileSync } from "node:fs";
import OpenAI from "openai";
import 'dotenv/config';


const OPEN_AI_KEY = process.env.OPEN_AI_KEY;
const openai = new OpenAI( { apiKey: process.env.OPENAI_API_KEY } );

async function createAudioFile() {
    // Generate an audio response to the given prompt
    const response = await openai.chat.completions.create({
      model: "gpt-4o-audio-preview",
      modalities: ["audio"],
      audio: { voice: "alloy", format: "wav" },
      messages: [
        {
          role: "user",
          content: "Is a golden retriever a good family dog?"
        }
      ],
      store: true,
    });
    
    // Inspect returned data
    console.log(response.choices[0]);
    
    // Write audio data to a file
    writeFileSync(
      "text-to-speech.wav",
      Buffer.from(response.choices[0].message.audio.data, 'base64'),
      { encoding: "utf-8" }
    );

}

