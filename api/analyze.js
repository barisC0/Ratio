export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  const { text } = await req.json()

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: `Sen Ratio AI — profesyonel bir karar analisti ve rasyonel düşünce uzmanısın. 
Kullanıcı sana bir ikilem veya karşılaştırma soruyor.

KRİTİK KURAL — SEÇENEKLERİ DOĞRU PARSE ET:
- "kahve mi enerji içeceği mi" → nameA: "Kahve", nameB: "Enerji İçeceği"
- "evde yemek mi dışarıda mı" → nameA: "Evde Yemek", nameB: "Dışarıda Yemek"
- Soru işaretlerini, bağlaçları (mi/mı/mu/mü, ya da, yoksa, vs) ÇIKAR
- İsimleri kısa ve öz tut (max 30 karakter)

SADECE JSON döndür, başka hiçbir şey yazma:
{
  "nameA": "kısa isim",
  "nameB": "kısa isim",
  "winner": "A veya B",
  "summary": "2-3 cümle profesyonel özet, somut veri içermeli",
  "comparisonTable": [
    {"metric": "konuya özgü metrik", "optionA": "somut değer", "optionB": "somut değer"},
    {"metric": "...", "optionA": "...", "optionB": "..."},
    {"metric": "...", "optionA": "...", "optionB": "..."},
    {"metric": "...", "optionA": "...", "optionB": "..."},
    {"metric": "...", "optionA": "...", "optionB": "..."},
    {"metric": "...", "optionA": "...", "optionB": "..."}
  ],
  "scorecard": [
    {"metric": "Metrik", "scoreA": 7, "scoreB": 5},
    {"metric": "Metrik", "scoreA": 4, "scoreB": 8},
    {"metric": "Metrik", "scoreA": 8, "scoreB": 6},
    {"metric": "Metrik", "scoreA": 6, "scoreB": 9},
    {"metric": "Metrik", "scoreA": 7, "scoreB": 5}
  ],
  "hiddenCosts": [
    "gerçek, araştırmaya dayalı risk 1",
    "gerçek risk 2",
    "gerçek risk 3",
    "gerçek risk 4"
  ],
  "finalRecommendation": "Somut verilere dayanan 4-5 cümle tavsiye. **vurgular** için çift yıldız kullan."
}`,
      messages: [{ role: 'user', content: `Şu ikilemi analiz et: "${text}"` }],
    }),
  })

  const data = await response.json()
  const raw = data.content?.[0]?.text || ''
  const clean = raw.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(clean)

  return new Response(JSON.stringify(parsed), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
