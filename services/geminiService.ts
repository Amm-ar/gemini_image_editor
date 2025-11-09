import { GoogleGenAI, Modality } from "@google/genai";

// The API key is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Custom error class to represent a quota-related API error.
 * Contains the time in seconds after which a retry is recommended.
 */
export class QuotaError extends Error {
  public retryAfter: number; // in seconds

  constructor(message: string, retryAfter: number) {
    super(message);
    this.name = 'QuotaError';
    this.retryAfter = retryAfter;
  }
}

export const editImageWithPrompt = async (
  imageData: { mimeType: string; data: string },
  prompt: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageData.data,
              mimeType: imageData.mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }

    throw new Error("No image found in the Gemini API response.");

  } catch (err: any) {
    console.error("Error editing image with Gemini:", err);

    const apiError = err?.error; // The actual error payload from Gemini is often nested
    if (apiError && apiError.status) {
      // Handle Quota Error
      if (apiError.status === "RESOURCE_EXHAUSTED") {
        try {
          const retryInfo = apiError.details?.find(
            (d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
          );

          if (retryInfo?.retryDelay) {
            const seconds = parseInt(retryInfo.retryDelay, 10);
            if (!isNaN(seconds)) {
              throw new QuotaError(`Quota exceeded.`, seconds);
            }
          }
        } catch (parseError) {
          console.error("Could not parse quota error details:", parseError);
        }
        // Fallback for quota error if parsing fails or details are missing
        throw new QuotaError("You've exceeded your request limit. Please try again in 60 seconds.", 60);
      }

      // Handle the 500 / UNKNOWN server error
      if (apiError.status === "UNKNOWN" || apiError.code === 500) {
        throw new Error("An unexpected server error occurred. Please try again in a few moments.");
      }
    }

    // Fallback for other types of errors (e.g., network failure before request)
    if (err instanceof Error) {
      throw new Error(`Failed to generate image: ${err.message}`);
    }

    throw new Error("An unknown error occurred while trying to generate the image.");
  }
};