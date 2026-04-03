import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY }); 

export interface DecisionOption {
  name: string;
  cost: number;
  time: number;
  benefit: number; // 1-10
  stress: number; // 1-10
}

export interface AnalysisResult {
  summary: string;
  comparisonTable: {
    metric: string;
    optionA: string;
    optionB: string;
  }[];
  scorecard: {
    metric: string;
    scoreA: number;
    scoreB: number;
  }[];
  hiddenCosts: string[];
  finalRecommendation: string;
  percentageDifference: number;
  winner: 'A' | 'B' | 'Draw';
  extractedOptions?: {
    nameA: string;
    nameB: string;
  };
}

export async function analyzeDecision(thought: string): Promise<AnalysisResult> {
  // src/lib/gemini.ts içindeki prompt değişkenini bununla değiştir:

const prompt = `
  Sen dünyanın en gelişmiş "Ratio" (Karar Analisti) yapay zekasısın.
  Kullanıcının yazdığı (veya sesle ilettiği) şu ikilemi analiz et: "${thought}"

  Görevin:
  1. Metinden A ve B seçeneklerini netleştir. Eğer sesli bir dökümse, konuşma dilindeki gereksiz kelimeleri temizle.
  2. PDF Raporu için uygun, resmi ama iğneleyici bir "Karar Özeti" oluştur.
  3. Verileri rasyonel analiz süzgecinden geçir.

  Yanıtını şu JSON formatında ver:
  {
    "summary": "Analizin kısa ve vurucu özeti",
    "pdfHeader": "RATİO ANALİZ RAPORU - GİZLİ VE KİŞİYE ÖZEL",
    "extractedOptions": { "nameA": "...", "nameB": "..." },
    "comparisonTable": [...],
    "scorecard": [...],
    "hiddenCosts": [...],
    "finalRecommendation": "Kesin sonuç cümlesi",
    "percentageDifference": 15,
    "winner": "A"
  }
`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          extractedOptions: {
            type: Type.OBJECT,
            properties: {
              nameA: { type: Type.STRING },
              nameB: { type: Type.STRING }
            },
            required: ["nameA", "nameB"]
          },
          comparisonTable: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                metric: { type: Type.STRING },
                optionA: { type: Type.STRING },
                optionB: { type: Type.STRING }
              },
              required: ["metric", "optionA", "optionB"]
            }
          },
          scorecard: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                metric: { type: Type.STRING },
                scoreA: { type: Type.NUMBER },
                scoreB: { type: Type.NUMBER }
              },
              required: ["metric", "scoreA", "scoreB"]
            }
          },
          hiddenCosts: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          finalRecommendation: { type: Type.STRING },
          percentageDifference: { type: Type.NUMBER },
          winner: { type: Type.STRING, enum: ["A", "B", "Draw"] }
        },
        required: ["summary", "extractedOptions", "comparisonTable", "scorecard", "hiddenCosts", "finalRecommendation", "percentageDifference", "winner"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
