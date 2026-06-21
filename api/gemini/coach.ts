import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured."
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const { userQuery } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userQuery,
    });

    return res.status(200).json({
      response: response.text,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "Unknown error"
    });
  }
}