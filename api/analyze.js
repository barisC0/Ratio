export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'text alanı gerekli' });
  }

  const systemPrompt = `Sen Ratio AI — profesyonel bir karar analisti ve rasyonel düşünce uzmanısın. 
Kullanıcı sana bir ikilem veya karşılaştırma soruyor. Görevin:
1. İkilemi doğru parse edip iki seçeneği tespit etmek
2. Her iki seçenek hakkında gerçek veriler, araştırmalar ve somut rakamlar kullanarak derinlemesine analiz yapmak
3. Tarafsız, profesyonel ve ikna edici bir rapor üretmek

KRİTİK KURAL — SEÇENEKLERİ DOĞRU PARSE ET:
- "kahve mi enerji içeceği mi" → nameA: "Kahve", nameB: "Enerji İçeceği"
- "evde yemek mi dışarıda mı" → nameA: "Evde Yemek", nameB: "Dışarıda Yemek"
- "X vs Y" → nameA: "X", nameB: "Y"
- "X yerine Y" → nameA: "X", nameB: "Y"
- Soru işaretlerini, bağlaçları (mi/mı/mu/mü, ya da, yoksa) ÇIKAR, sadece karşılaştırılan kavramları al
- İsimleri kısa ve öz tut (max 30 karakter), gereksiz kelime ekleme

YANIT FORMAT — SADECE JSON, başka hiçbir şey yazma:
{
  "nameA": "Seçenek A ismi (kısa, öz)",
  "nameB": "Seçenek B ismi (kısa, öz)",
  "winner": "A veya B",
  "summary": "2-3 cümle profesyonel özet, somut veri içermeli",
  "comparisonTable": [
    {"metric": "Metrik adı", "optionA": "A için somut, spesifik değer/açıklama", "optionB": "B için somut, spesifik değer/açıklama"},
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
    "Spesifik gizli maliyet 1 — somut veri veya araştırma ile destekle",
    "Spesifik gizli maliyet 2",
    "Spesifik gizli maliyet 3",
    "Spesifik gizli maliyet 4"
  ],
  "finalRecommendation": "Detaylı, somut verilere dayanan 4-5 cümle tavsiye. **vurgular** için çift yıldız kullan. Kesin rakamlar, yüzdeler veya araştırma bulguları içersin."
}

ÖNEMLİ KURALLAR:
- comparisonTable metrikleri konuya özgü olsun (genel "Maliyet/Ekonomi" değil, "Aylık Maliyet (Türkiye)" gibi spesifik)
- Her metrik değeri somut olsun: "~₺800/ay" veya "Yüksek kafein toleransı riski" gibi
- scorecard skorları gerçekçi ve farklılaştırılmış olsun (hepsi aynı olmasın)
- hiddenCosts gerçek, araştırmaya dayalı riskler içersin
- Türkçe yaz, profesyonel ton kullan`;

  try {
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
        system: systemPrompt,
        messages: [{ role: 'user', content: `Şu ikilemi analiz et: "${text}"` }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(response.status).json({ error: data.error?.message || 'API hatası' });
    }

    const raw = data.content?.[0]?.text || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Sunucu hatası: ' + err.message });
  }
}
