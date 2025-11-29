import OpenAI from "openai";
import express from "express";

import 'dotenv/config';

const OPEN_AI_KEY = process.env.OPENAI_API_KEY;

const app = express();
const client = new OpenAI( { apiKey: process.env.OPENAI_API_KEY } );

app.use(express.json());

app.post("/story", async (req, res) => {
    const { startCityInput, timeInput } = req.body;

    const response = await client.responses.create({
        model: "gpt-5-nano",
        input: `Tell a story set in ${startCityInput} during the year ${timeInput}`
    });

    res.json({ text: response.output_text });
});


app.listen(3000, () => console.log("Server running"));