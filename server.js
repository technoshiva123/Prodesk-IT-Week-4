import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer'; 
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse-fork'); 

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash" 
});

app.post('/generate', upload.single('resume'), async (req, res) => {
    try {
        const { name, role, company, skills } = req.body;
        let resumeText = "";

        if (!name || !role) {
            return res.status(400).json({ error: "Name and Role are required." });
        }

        if (req.file) {
            try {
                // Foolproof parsing
                const data = await pdf(req.file.buffer);
                resumeText = data.text;
                console.log("✅ PDF Text Extracted!");
            } catch (pdfErr) {
                console.error("❌ PDF Error:", pdfErr.message);
                resumeText = "Resume text could not be extracted.";
            }
        }

        const prompt = `Write a professional cover letter for ${name} applying for ${role} at ${company}. Skills: ${skills}. Resume Context: ${resumeText}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        res.json({ text });

    } catch (err) {
        console.error("❌ Gemini Error:", err.message);
        res.status(500).json({ error: "AI Generation failed. Check API Key." });
    }
});

app.listen(3000, () => {
    console.log("🚀 Server is running on http://localhost:3000");
});