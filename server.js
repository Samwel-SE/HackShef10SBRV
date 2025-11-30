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

// Helper functions to generate prompts
function homerPrompt(startLocation, endLocation, voicesPool, narratorVoice) {
  return `Write a story from the perspective of Homer Simpson that takes place 
      from ${startLocation} to ${endLocation}.
      Talk like Homer Simpson
      Make scenes somewhat continuous. 
      Show, don't tell.
      Dont abuse dialogue, but dont be too afraid of having sizable section of dialogue.
      You should have some main characters and side characters from the Simpsons

      First, output a CSV with the columns: Character, Voice
      Use ONLY the following voices for characters:
      ${voicesPool.join(", ")}
      
      Rules:
      - Narrator must always have the voice "${narratorVoice}"
      - Every character name must be ONE word when referenced as a speaker, they may have a canon last name.
      - Assign each character ONE voice from the list, there may be multiple characters with the same model.
      - The CSV must include every character that speaks.
      - Max 200 Words!!!
      
      Then, after the CSV, write the story using:
      CharacterName: text
      
      Do NOT put voices inside the story itself.
      
      Format strictly like:
      
      ### VOICE_MAP_CSV
      Character,Voice
      Narrator,ash
      Ares,onyx
      ...
      
      ### STORY
      Narrator: text...
      Ares: text...
      Hera: text..
      `;
}

function brainRotPrompt(startLocation, endLocation, voicesPool, narratorVoice) {
  return `Write a story that takes place from ${startLocation} to ${endLocation}.
    include as much braintrot as possible. Include the brainrot that you know and words like "67", "sigma", "skibidi", "rizzler
    "lebron james", "9/11 tradegy", "cisco packet tracer".
    Include these words as much as possible  
    The story should be historic where possible, witty, and engaging.
      The narrator should function like the parts of a book that arent dialogue. So it should be the majority.
      Make scenes somewhat continuous. 
      Show, don't tell.
      Dont abuse dialogue, but dont be too afraid of having sizable section of dialogue.
      You should have some main characters and side characters.

      First, output a CSV with the columns: Character, Voice
      Use ONLY the following voices for characters:
      ${voicesPool.join(", ")}
      
      Rules:
      - Narrator must always have the voice "${narratorVoice}"
      - Every character name must be ONE word when referenced as a speaker, they may have a canon last name.
      - Assign each character ONE voice from the list, there may be multiple characters with the same model.
      - The CSV must include every character that speaks.
      - Max 200 Words!!!
      
      Then, after the CSV, write the story using:
      CharacterName: text
      
      Do NOT put voices inside the story itself.
      
      Format strictly like:
      
      ### VOICE_MAP_CSV
      Character,Voice
      Narrator,ash
      Ares,onyx
      ...
      
      ### STORY
      Narrator: text...
      Ares: text...
      Hera: text..
      `;
}

function normalPrompt(startLocation, endLocation, voicesPool, narratorVoice) {
  return ` max 20 words Write a story like Homer's "Odyssey" that takes place from ${startLocation} to ${endLocation}.
      The story should be historic where possible, witty, and engaging.

      The narrator should function like the parts of a book that arent dialogue. So it should be the majority.
      Make scenes somewhat continuous. 
      Show, don't tell.
      Dont abuse dialogue, but dont be too afraid of having sizable section of dialogue.
      You should have some main characters and side characters.

      First, output a CSV with the columns: Character, Voice
      Use ONLY the following voices for characters:
      ${voicesPool.join(", ")}
      
      Rules:
      - Narrator must always have the voice "${narratorVoice}"
      - Every character name must be ONE word when referenced as a speaker, they may have a canon last name.
      - Assign each character ONE voice from the list, there may be multiple characters with the same model.
      - The CSV must include every character that speaks.

      Then, after the CSV, write the story using:
      CharacterName: text

      Do NOT put voices inside the story itself.
      
      Format strictly like:
      
      ### VOICE_MAP_CSV
      Character,Voice
      Narrator,ash
      Ares,onyx
      ...
      
      ### STORY
      Narrator: text...
      Ares: text...
      Hera: text..
      `;
}



app.post("/story", async (req, res) => {
  const { startLocation, endLocation, mode } = req.body;

  let prompt = "";
  
  if (mode === "homer") {
    prompt = homerPrompt(startLocation, endLocation, voicesPool, narratorVoice);
  } 
  
  else if (mode === "brainRot") {
    prompt = brainRotPrompt(startLocation, endLocation, voicesPool, narratorVoice);
  } 
  
  else {
    prompt = normalPrompt(startLocation, endLocation, voicesPool, narratorVoice);
  }

  console.log(prompt);
  console.log("Starting City:", startLocation, "Ending City:", endLocation, "Mode:", mode);
  


  try {
    // Generate story with speaker tags
    const textResponse = await client.responses.create({
      model: "gpt-4-turbo",
      input: prompt
    });
    
    const storyText = textResponse.output_text;
    console.log("Generated Story Text:", storyText);

    // Extract CSV block
    const csvBlock =
      storyText.match(/### VOICE_MAP_CSV([\s\S]*?)### STORY/)?.[1].trim();

    if (!csvBlock) throw new Error("CSV block missing");

    const characterVoices = {};
    csvBlock.split("\n").slice(1).forEach(line => {
      const [character, voice] = line.split(",");
      if (character && voice) {
        characterVoices[character.trim()] = voice.trim();
      }
    });

    // Extract story block
    const storyBlock = storyText.split("### STORY")[1]?.trim();
    if (!storyBlock) throw new Error("Story block missing");

    // Parse story segments
    const segments = storyBlock.split(/\n(?=[A-Za-z]+:)/).map(s => {
      const match = s.match(/^([A-Za-z]+):\s*(.*)$/s);
      return match
        ? {
            speaker: match[1],
            text: match[2],
            voice: characterVoices[match[1]] // assign the model-chosen voice
          }
        : null;
    }).filter(Boolean);

    const audioSegments = [];

    // Convert each segment to audio using assigned voice
    for (const seg of segments) {
      const audioResponse = await client.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: seg.voice,
        input: seg.text,
        response_format: "wav",
      });

      const arrayBuffer = await audioResponse.arrayBuffer();
      const audioBase64 = Buffer.from(arrayBuffer).toString("base64");

      audioSegments.push({
        speaker: seg.speaker,
        text: seg.text,
        audio: audioBase64,
        voice: seg.voice,
      });

      console.log(`Segment: ${seg.speaker} (${seg.voice}) length: ${audioBase64.length}`);
    }

    res.json({ segments: audioSegments });

  } catch (err) {
    console.error("Error generating story:", err);
    res.status(500).json({ error: err.message });
  }
});


app.post("/analyze", async (req, res) => {
  const { storySoFar, query } = req.body;

  
  console.log("Query:", query);
  
  try {
    // Generate story with speaker tags
    const textResponse = await client.responses.create({
      model: "gpt-4-turbo",
      input: `Act as if you have a wide knowledge on literature, literature techniques and the like. Answer what the user asks about the story.
      This is the story so far ---${storySoFar}---. And this is the Users query ---${query}---

      Write critically and indepth unless otherwise stated. Be concise but detailed.

      !Test Mode, keep it to one short sentence!
      `
    });
    
    const answer = textResponse.output_text;
    console.log("Generated Answer:", answer);


    res.json({ answer });

  } catch (err) {
    console.error("Error generating story:", err);
    res.status(500).json({ error: err.message });
  }
});


app.listen(3000, () => console.log("Server running on port 3000"));
