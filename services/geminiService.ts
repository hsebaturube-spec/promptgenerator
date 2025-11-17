import { GoogleGenAI, GenerateContentResponse, GenerateImageResponse, GenerateImageParameters } from '@google/genai';
import { CharacterPosition, ImageAspectRatio, ImageStyle } from '../types';

interface ImagePart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

const getGeminiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error('API_KEY is not defined in the environment variables.');
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateImagePrompt = async (
  contentIdea: string,
  characterImageBase64: string | null,
  faceImageBase64: string | null,
  imageStyle: ImageStyle,
  characterPosition: CharacterPosition,
  aspectRatio: ImageAspectRatio,
): Promise<string> => {
  const ai = getGeminiClient();
  const model = 'gemini-2.5-flash';

  const parts: (string | ImagePart)[] = [
    `Generate a highly descriptive image generation prompt, suitable for a text-to-image model, based on the following details:`,
    `Content Idea: "${contentIdea}"`,
    `Image Style: "${imageStyle}"`,
    `Character Position/Pose: "${characterPosition}"`,
    `Intended Aspect Ratio: "${aspectRatio}"`,
  ];

  if (characterImageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/png', // Assuming PNG for uploaded images
        data: characterImageBase64,
      },
    });
    parts.push(`This image is a reference for the character. Incorporate its appearance details.`);
  }

  if (faceImageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/png', // Assuming PNG for uploaded images
        data: faceImageBase64,
      },
    });
    parts.push(`This image is a reference for the character's face. Emphasize its features.`);
  }

  parts.push(
    `The generated prompt should be in English, detailed, evocative, and between 100-200 words. ` +
    `It should clearly describe the main subject, setting, lighting, mood, color palette, and any specific elements. ` +
    `Do not include the aspect ratio or style in the final prompt itself, but ensure the description implies them. ` +
    `Focus on visual elements only, without conversational filler.`
  );

  const request = {
    model,
    contents: [{ parts }],
    config: {
      temperature: 0.8,
      maxOutputTokens: 200,
    },
  };

  try {
    const result: GenerateContentResponse = await ai.models.generateContent(request);
    return result.text;
  } catch (error) {
    console.error('Error generating image prompt:', error);
    throw new Error(`Failed to generate image prompt: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const generateImage = async (
  prompt: string,
  aspectRatio: ImageAspectRatio,
): Promise<string> => {
  const ai = getGeminiClient();
  const model = 'imagen-4.0-generate-001';

  const config: GenerateImageParameters['config'] = {
    numberOfImages: 1,
    outputMimeType: 'image/jpeg',
    aspectRatio: aspectRatio,
  };

  try {
    const result: GenerateImageResponse = await ai.models.generateImages({
      model,
      prompt,
      config,
    });

    const base64ImageBytes: string | undefined = result.generatedImages[0]?.image?.imageBytes;

    if (!base64ImageBytes) {
      throw new Error('No image bytes returned from the model.');
    }

    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : String(error)}`);
  }
};
