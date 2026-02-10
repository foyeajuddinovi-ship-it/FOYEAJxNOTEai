
import { GoogleGenAI, Modality } from "@google/genai";

export const geminiService = {
  async translate(text: string, targetLanguage: string): Promise<string> {
    if (!text) return '';
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are foyeajX Linguistics, a world-class translation engine. Refine and translate the following text into ${targetLanguage}. Capture the original tone, nuance, and elegance. Ensure the output is natural and professional. Return ONLY the translated text:\n\n${text}`,
    });
    return response.text || text;
  },

  async transcribe(base64Audio: string, mimeType: string, languageName: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Audio,
              mimeType: mimeType,
            },
          },
          {
            text: `You are foyeajX Audio Transcription Intel. Listen carefully to this audio in ${languageName}. Convert it into a clean, accurately punctuated, and professional text script. Omit filler words and ensure maximum readability.`,
          },
        ],
      },
    });
    return response.text || "";
  },

  async analyzeNoteForImagePrompt(noteContent: string): Promise<string> {
    if (!noteContent.trim()) return '';
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are foyeajX Creative Director. Synthesize the visual essence of this note content. Create a high-fidelity, artistic image generation prompt that captures the core emotion, theme, and lighting of the text. Focus on cinematic details. Return ONLY the prompt string:\n\n${noteContent}`,
    });
    return response.text?.trim() || noteContent;
  },

  async speak(text: string): Promise<void> {
    if (!text) return;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Please provide a sophisticated, elegant, and natural narration of the following text script: ${text}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const decode = (base64: string) => {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
      };

      const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
        const dataInt16 = new Int16Array(data.buffer);
        const frameCount = dataInt16.length / numChannels;
        const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

        for (let channel = 0; channel < numChannels; channel++) {
          const channelData = buffer.getChannelData(channel);
          for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
          }
        }
        return buffer;
      };

      try {
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
      } catch (e) {
        console.error("Audio playback error", e);
      }
    }
  },

  async summarize(text: string): Promise<string> {
    if (!text) return '';
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are foyeajX Executive Editor. Distill the following note into a profound, concise, and executive-level summary. Focus on core objectives and high-level insights. Elegance is mandatory:\n\n${text}`,
    });
    return response.text || text;
  },

  async generateImage(prompt: string): Promise<string> {
    if (!prompt) return '';
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("Failed to generate image");
  },

  async chat(message: string, context: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = ai.chats.create({
      // Use gemini-3-pro-preview for complex reasoning tasks like this intelligent assistant.
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: `You are foyeajX Intelligent Insight, an advanced neural-sync assistant for the foyeajX Note application. You are profoundly analytical, articulate, and world-class in your reasoning. You have full awareness of the user's current note context: [${context}]. Your goal is to help the user evolve their ideas, refine their writing, and provide structured insights. Always prioritize clarity, depth, and creative expansion. Your tone is professional and inspiring.`,
      },
    });
    const response = await chat.sendMessage({ message });
    return response.text || "I apologize, my neural link experienced a momentary interruption. How may I further assist your creative process?";
  }
};
