
import { GoogleGenAI, Modality } from "@google/genai";

export const geminiService = {
  async translate(text: string, targetLanguage: string): Promise<string> {
    if (!text) return '';
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert polyglot translator for the elegant foyeajX Note app. Translate the following text into a sophisticated version in ${targetLanguage}. Maintain the original intent while refining the tone. Return ONLY the translated text:\n\n${text}`,
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
            text: `You are a high-fidelity transcription engine. Transcribe this audio with extreme precision. The speaker is using ${languageName}. Return only the transcribed script, maintaining natural flow and punctuation.`,
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
      contents: `You are a world-class creative director. Analyze this note content and synthesize a deeply descriptive, elegant, and evocative visual prompt for an image generator. Focus on lighting, mood, and symbolism. Return ONLY the prompt string:\n\n${noteContent}`,
    });
    return response.text?.trim() || noteContent;
  },

  async speak(text: string): Promise<void> {
    if (!text) return;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Please provide a sophisticated, elegant narration of the following text: ${text}`;
    
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
      contents: `You are a professional editor. Provide a profound and concise executive summary of the following note content. Capture the essence with elegance:\n\n${text}`,
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
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are foyeajX Intelligent Insight, a world-class AI assistant for the elegant foyeajX Note app. You are sophisticated, analytical, and profoundly helpful. You assist users in expanding their creative boundaries, refining their thoughts, and deriving deep meaning from their writing. Your tone is professional, inspiring, and precise. Context of user note: ${context}`,
      },
    });
    const response = await chat.sendMessage({ message });
    return response.text || "I apologize, but I encountered a momentary lapse in synchronization. How may I otherwise assist you?";
  }
};
