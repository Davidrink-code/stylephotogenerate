import { GoogleGenAI } from "@google/genai";
import { RetroStyle } from "../types";

// Initialize Gemini Client
// Note: process.env.API_KEY is expected to be available
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const STYLE_PROMPTS: Record<RetroStyle, string> = {
  [RetroStyle.NOKIA]: "Transform this image into a retro Nokia 3310 pixel art style. Use a monochromatic palette (dark pixels on a greenish-grey background). Apply dithering for shading. Extremely low resolution, distinct pixel grid, early 2000s mobile phone aesthetic.",
  [RetroStyle.BW_CCD]: "Transform this image into a gritty, black and white photo taken with an early 2000s low-quality CCD sensor digital camera. Add heavy digital noise, crushed blacks, blooming highlights, and visible compression artifacts. Make it look like a cursed image from the early internet.",
  [RetroStyle.GAMEBOY]: "Transform this image into a Game Boy pixel art style. Use the strict 4-color green scale palette (from dark olive to bright lime). Pixelated edges, retro handheld gaming console aesthetic.",
  [RetroStyle.CRT]: "Transform this image into a 1990s TV screen capture. Add scanlines, RGB shift (chromatic aberration), slightly curved screen distortion, and VHS tape static noise. Saturated colors.",
};

export const generateRetroImage = async (
  base64Image: string,
  mimeType: string,
  style: RetroStyle
): Promise<string> => {
  try {
    const modelId = "gemini-2.5-flash-image"; 
    
    // Robustly clean base64 string regardless of mime type prefix
    const cleanBase64 = base64Image.includes(",") 
      ? base64Image.split(",")[1] 
      : base64Image;

    const prompt = STYLE_PROMPTS[style] || STYLE_PROMPTS[RetroStyle.BW_CCD];
    const finalPrompt = `${prompt} Ensure the output maintains the composition of the original image but applies the requested style heavily.`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            text: finalPrompt,
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
        ],
      },
    });

    // Check for generated image in the response
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
           // Gemini typically returns standard MIME types for images (image/png or image/jpeg)
           const returnedMime = part.inlineData.mimeType || 'image/png';
           return `data:${returnedMime};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("模型未返回图片数据，请重试。");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};