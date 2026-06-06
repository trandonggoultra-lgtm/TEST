import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase request limit for base64 image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Google Gen AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// JSON Schema for structured geometry output
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    extractedFacts: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    points: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique point ID, e.g. p0, p1, p2, p3..." },
          label: { type: Type.STRING, description: "Human label, e.g. A, B, C, D, S, O, H..." },
          x: { type: Type.NUMBER, description: "Calculated beautiful X coordinate centered inside a box of 800x500" },
          y: { type: Type.NUMBER, description: "Calculated beautiful Y coordinate centered inside a box of 800x500" }
        },
        required: ["id", "label", "x", "y"]
      }
    },
    lines: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          p1: { type: Type.STRING, description: "Point ID of start point, e.g. p0" },
          p2: { type: Type.STRING, description: "Point ID of end point, e.g. p1" },
          dashed: { type: Type.BOOLEAN, description: "true if the line is an inside/auxiliary/invisible line in a 3D figure, false if outer visible outline" },
          color: { type: Type.STRING, description: "Color utility variable of the line, e.g. var(--draw-black), var(--draw-blue), var(--draw-red), etc." }
        },
        required: ["p1", "p2", "dashed"]
      }
    },
    circles: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          cx: { type: Type.NUMBER },
          cy: { type: Type.NUMBER },
          r: { type: Type.NUMBER },
          dashed: { type: Type.BOOLEAN },
          color: { type: Type.STRING }
        },
        required: ["cx", "cy", "r", "dashed"]
      }
    },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Step title/heading in uppercase, e.g. CHỨNG MINH THEO QUAN HỆ VUÔNG GÓC" },
          content: { 
            type: Type.STRING, 
            description: "High-quality detailed explanation content using HTML. Important math expressions should be enclosed in tags like <span class='math-expr'>...</span>. Bold key formulas or steps. Speak in Vietnamese." 
          }
        },
        required: ["title", "content"]
      }
    }
  },
  required: ["title", "extractedFacts", "points", "lines", "circles", "steps"]
};

// Solve Endpoint
app.post("/api/solve", async (req, res) => {
  try {
    const { problemText, imageBase64, imageMime } = req.body;

    let queryText = problemText;
    if (!queryText && imageBase64) {
      queryText = "Hãy đọc và phân tích đề bài toán hình học trong hình ảnh này. Sau đó, tính toán tọa độ để dựng hình, vẽ lại hình vẽ chính xác và trình bày lời giải chi tiết.";
    }

    if (!queryText) {
      return res.status(400).json({ error: "Missing problemText query or image base64." });
    }

    const systemInstruction = `You are an elite, world-class Math & Geometry AI assistant ("AI Geometry Engine").
Your goal is to parse a school geometry problem (2D or 3D) written in Vietnamese or English (and optionally view its accompanying uploaded hand-drawn or print diagram image if included).
You will compile a complete structural layout mapping representing the drawing AND write an outstanding pedagogical step-by-step solution.

CRITICAL COORDINATE LAYOUT GUIDELINES:
- Return points positioned inside a coordinate box of 800 x 500. This is the SVG view area.
- All points should be spaced beautifully, balanced, and perfectly legible.
- For 3D geometries (e.g. Pyramid S.ABCD, tetrahedron S.ABC, prism, etc.), use realistic oblique cavalier perspective:
  * Pyramid S.ABCD: Place baseline A around (250, 300). Base parallel B around (350, 380). Base C around (580, 380). Base parallel D around (480, 300). Center of base O is around (415, 340). Apex S directly above A (if SA perp ABCD) around (250, 100). Height O to S, AH perp SO, etc.
  * Adjust coordinates depending on SA perp plane, or SH perp plane, or other characteristics.
  * In 3D drawings, back-lying hidden edges (inside lines) MUST have "dashed: true". Visible silhouettes must have "dashed: false". For example, if S.ABCD has SA perp (ABCD), the back outline AD, AB are dashed, AC and BD are dashed, SO, AH are dashed. SB, SC, SD, BC, CD are visible (solid: dashed: false).
- For 2D geometries (Triangles, Circles, Polygons):
  * Place points centered around (400, 250) with sufficient sizes (e.g. triangles with side lengths 150-250 pixels) so it looks gorgeous and fits nicely.
- Ensure points are named exactly as referenced in instructions, e.g. S, A, B, C, D, O, H, M, N, E, F etc.
- In extractedFacts, detail the structure found: (e.g. "Hình chóp tứ giác S.ABCD", "SA ⊥ (ABCD)", "O = AC ∩ BD", etc.).
- Under steps, give 4 to 6 wonderfully clear, progressive mathematical explanations in Vietnamese, using standard math symbols, wrapping math items like S.ABCD, SA ⊥ (ABCD), AC in <span class="math-expr">...</span> and using HTML tags like <p>, <strong>, etc. for flawless pedagogical layout.`;

    const parts: any[] = [];

    // Add image if base64 exists
    if (imageBase64 && imageMime) {
      // Stripping data scheme prefix if exists
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: imageMime,
          data: base64Data
        }
      });
    }

    // Add prompt
    parts.push({
      text: `Solve and compile coordinates for this geometry problem:\n\n${queryText}\n\nReturn the structured coordinates and beautiful detailed explanations in Vietnamese according to the JSON schema.`
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: parts,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.1,
      }
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    res.json(data);

  } catch (error: any) {
    console.error("Gemini solving error:", error);
    res.status(500).json({ error: error.message || "An error occurred while solving the problem with AI." });
  }
});

// App Entry & Vite Middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Geometry Server running on port ${PORT}`);
  });
}

startServer();
