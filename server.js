import OpenAI from "openai";
import express from "express";
import cors from "cors";
import 'dotenv/config';

const app = express();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json({ limit: "50mb" })); // Make sure large audio data works

const voicesPool = ['echo', 'fable', 'onyx', 'nova', 'shimmer', 'coral', 'verse', 'ballad', 'alloy', 'sage', 'marin', 'cedar'];
const narratorVoice = "ash";

app.post("/story", async (req, res) => {
  const { startLocation, endLocation } = req.body;
  console.log("Starting City:", startLocation, "Ending City:", endLocation);

  try {
    // Generate story with speaker tags
    const textResponse = await client.responses.create({
      model: "gpt-4-turbo",
      input: `Write a 400-word mythological story from ${startLocation} to ${endLocation}.
              Format the story like this:
              Narrator: [text]\n
              CharacterName: [dialogue or thought]\n -- a character identifier cannot have a multiple words
              Make the story hisoric and realistic, but you cann add flair to make it entertaining`
    });

    const storyText = textResponse.output_text;
    console.log("Generated Story Text:", storyText);

    // Split story into segments by speaker
    const segments = storyText.split(/\n(?=[A-Za-z]+:)/).map(s => {
      const match = s.match(/^([A-Za-z]+):\s*(.*)$/s);
      return match ? { speaker: match[1], text: match[2] } : { speaker: "narrator", text: s };
    });

    const audioSegments = [];

    for (const seg of segments) {
      let voice;
      if (seg.speaker.toLowerCase() === "narrator") {
        voice = narratorVoice; // Narrator stays the same
      } else {
        // Pick a random voice for character each time
        voice = voicesPool[Math.floor(Math.random() * voicesPool.length)];
      }

      const audioResponse = await client.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice,
        input: seg.text,
        response_format: "wav",
      });

      const arrayBuffer = await audioResponse.arrayBuffer();
      const audioBase64 = Buffer.from(arrayBuffer).toString("base64");

      audioSegments.push({ speaker: seg.speaker, text: seg.text, audio: audioBase64, voice });
      console.log(`Segment: ${seg.speaker} (${voice}) length: ${audioBase64.length}`);
    }

    res.json({ segments: audioSegments });

  } catch (err) {
    console.error("Error generating story:", err);
    res.status(500).json({ error: err.message });
  }
});


app.listen(3000, () => console.log("Server running on port 3000"));
