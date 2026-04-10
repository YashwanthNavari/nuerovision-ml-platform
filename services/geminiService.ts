import { GoogleGenAI, Type } from "@google/genai";
import { BoundingBox } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-2.5-flash for speed
const MODEL_NAME = 'gemini-2.5-flash';

export const detectObjects = async (base64Image: string): Promise<BoundingBox[]> => {
  try {
    // Remove data URL prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: `Detect all main objects in this image. 
            Return a JSON object with a list of objects.
            For each object, provide a 'label' and a bounding box 'box_2d' with [ymin, xmin, ymax, xmax].
            Coordinates must be normalized between 0 and 1000.
            Example: { "objects": [{ "label": "cat", "box_2d": [100, 200, 500, 600] }] }`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            objects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  box_2d: {
                    type: Type.ARRAY,
                    items: { type: Type.NUMBER },
                    description: "ymin, xmin, ymax, xmax (0-1000)"
                  }
                }
              }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const data = JSON.parse(jsonText);
    if (!data.objects) return [];

    return data.objects.map((obj: any) => ({
      label: obj.label,
      ymin: obj.box_2d[0],
      xmin: obj.box_2d[1],
      ymax: obj.box_2d[2],
      xmax: obj.box_2d[3],
      confidence: 0.85 + Math.random() * 0.14 // Mock confidence for demo as Gemini doesn't always return it in this schema
    }));

  } catch (error) {
    console.error("Gemini Detection Error:", error);
    return [];
  }
};
