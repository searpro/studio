import { GoogleGenAI } from "@google/genai";
import { Character, Scene, GenerationConfig } from "../types";

// Initialize Gemini Client
// In a real app, API_KEY should be in process.env.API_KEY
// Assuming the environment is set up correctly as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateImage = async (
  character: Character,
  scene: Scene,
  config: GenerationConfig
): Promise<string> => {
  try {
    // Construct the prompt based on the asset-based philosophy
    // We prioritize the user's custom instruction for action/context while keeping character/scene consistency
    const prompt = `
      Generate a ${config.style.toLowerCase()} style image.
      
      CORE ASSETS:
      - Character: ${character.description} (Name: ${character.name}).
      - Setting: ${scene.description}.
      
      SCENE DESCRIPTION / ACTION:
      ${config.customInput ? config.customInput : 'The character is posing naturally in the environment.'}
      
      ART DIRECTION:
      - Mood: ${config.mood}
      - Shot Type: ${config.shot}
      
      Ensure the character identity and setting details are preserved while fulfilling the Scene Description.
    `;

    // Use Gemini 2.5 Flash Image for speed, or 3 Pro Image for quality.
    // Using 2.5 Flash Image as default for the demo.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
            aspectRatio: "1:1",
        }
      },
    });

    // Extract image
    // The output response may contain both image and text parts
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }

    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};