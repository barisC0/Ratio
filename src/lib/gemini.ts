import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

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
  const prompt = `
    Sen dünyanın en gelişmiş "Ratio" (Karar Analisti ve Fırsat Maliyeti Hesaplayıcısı) yapay zekasısın. 
    Kullanıcının yazdığı şu ikilemi/düşünceyi analiz et:
    
    "${thought}"

    Görevin:
    1. Bu metinden iki ana seçeneği (A ve B) çıkar.
    2. Maddi, manevi, zaman ve efor açısından hangisinin daha mantıklı olduğunu bilimsel ve rasyonel bir şekilde analiz et.
    3. Rasyonel, dürüst ve hafif iğneleyici bir ton kullan.

    Analiz kriterleri:
    1. Finansal Maliyet
    2. Zaman Maliyeti
    3. Birim Verimliliği
    4. Psikolojik Faktör (Stres/Tatmin)

    Yanıtını şu JSON formatında ver:
    {
      "summary": "Analizin kısa özeti (Örn: Seçenek B %15 daha mantıklı)",
      "extractedOptions": {
        "nameA": "Çıkarılan Seçenek A ismi",
        "nameB": "Çıkarılan Seçenek B ismi"
      },
      "comparisonTable": [
        {"metric": "Maddi Fark", "optionA": "...", "optionB": "..."},
        {"metric": "Zaman Farkı", "optionA": "...", "optionB": "..."},
        {"metric": "Efor/Stres", "optionA": "...", "optionB": "..."}
      ],
      "scorecard": [
        {"metric": "Maddi Uygunluk", "scoreA": 8, "scoreB": 5},
        {"metric": "Zaman Verimliliği", "scoreA": 4, "scoreB": 9},
        {"metric": "Psikolojik Tatmin", "scoreA": 7, "scoreB": 6},
        {"metric": "Birim Fayda", "scoreA": 6, "scoreB": 8}
      ],
      "hiddenCosts": ["Kullanıcının göremediği gizli maliyet uyarısı 1", "..."],
      "finalRecommendation": "Net ve ikna edici sonuç cümlesi",
      "percentageDifference": 15,
      "winner": "B"
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
