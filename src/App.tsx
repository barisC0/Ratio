import React, { useState } from 'react';
import { Brain, Sparkles, Mic, Wallet, Briefcase, Heart, Repeat, Zap, RefreshCcw, Calculator, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Anthropic API ile gerçek analiz
const analyzeDecision = async (text) => {
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

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: `Şu ikilemi analiz et: "${text}"` }]
    })
  });

  const data = await response.json();
  const raw = data.content?.[0]?.text || '';
  
  // JSON temizle ve parse et
  const clean = raw.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);

  return {
    summary: parsed.summary,
    winner: parsed.winner,
    extractedOptions: { nameA: parsed.nameA, nameB: parsed.nameB },
    comparisonTable: parsed.comparisonTable,
    scorecard: parsed.scorecard,
    hiddenCosts: parsed.hiddenCosts,
    finalRecommendation: parsed.finalRecommendation
  };
};

const RatioLanding = () => {
  const [thought, setThought] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCalculate = async () => {
    if (!thought.trim()) {
      setError('Lütfen analiz edilecek bir düşünce veya ikilem yazın.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const analysis = await analyzeDecision(thought);
      setResult(analysis);
    } catch (err) {
      console.error(err);
      setError('Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setThought('');
  };

  const handleCategoryClick = (item) => {
    setThought(item);
    setError(null);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tarayıcı ses desteği sunmuyor.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "tr-TR";
    recognition.onresult = (e) => {
      setThought(e.results[0][0].transcript);
      setError(null);
    };
    recognition.start();
  };

  const downloadPDF = (analysis) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const M = 16;
    const CW = pageW - M * 2;

    const BLUE = [29, 78, 216];
    const BLUE_L = [219, 234, 254];
    const ORG = [234, 88, 12];
    const ORG_L = [255, 237, 213];
    const DARK = [15, 23, 42];
    const GRAY = [100, 116, 139];
    const WHITE = [255, 255, 255];
    const AMBER = [217, 119, 6];
    const AMBER_L = [254, 243, 199];

    const tr = (s) => String(s)
      .replace(/ğ/g,'g').replace(/Ğ/g,'G')
      .replace(/ü/g,'u').replace(/Ü/g,'U')
      .replace(/ş/g,'s').replace(/Ş/g,'S')
      .replace(/ı/g,'i').replace(/İ/g,'I')
      .replace(/ö/g,'o').replace(/Ö/g,'O')
      .replace(/ç/g,'c').replace(/Ç/g,'C');

    const nameA = tr(analysis.extractedOptions?.nameA || 'Secim 1');
    const nameB = tr(analysis.extractedOptions?.nameB || 'Secim 2');

    const addFooter = () => {
      const n = doc.internal.getNumberOfPages();
      for (let p = 1; p <= n; p++) {
        doc.setPage(p);
        doc.setFillColor(...DARK);
        doc.rect(0, pageH - 10, pageW, 10, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...WHITE);
        doc.text('Ratio AI  |  Rasyonel Karar Analizi', M, pageH - 3.5);
        doc.text(`Sayfa ${p} / ${n}`, pageW - M, pageH - 3.5, { align: 'right' });
      }
    };

    // HEADER
    doc.setFillColor(...DARK);
    doc.rect(0, 0, pageW, 44, 'F');
    doc.setFillColor(...BLUE);
    doc.rect(0, 0, 5, 44, 'F');

    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('Ratio AI', M + 2, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text('Karar Analiz Raporu', M + 2, 28);

    const now = new Date();
    const ds = `${now.getDate().toString().padStart(2,'0')}.${(now.getMonth()+1).toString().padStart(2,'0')}.${now.getFullYear()}`;
    doc.setFontSize(9);
    doc.setTextColor(...WHITE);
    doc.text(ds, pageW - M, 18, { align: 'right' });

    const winLabel = analysis.winner === 'A' ? nameA : nameB;
    const winColor = analysis.winner === 'A' ? BLUE : ORG;
    doc.setFillColor(...winColor);
    doc.roundedRect(pageW - M - 52, 26, 52, 12, 2, 2, 'F');
    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`Onerilir: ${winLabel.substring(0, 16)}`, pageW - M - 26, 33.5, { align: 'center' });

    let y = 54;

    // ÖZET KUTUSU
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    const summLines = doc.splitTextToSize(tr(analysis.summary), CW - 8);
    const summH = summLines.length * 5.8 + 12;
    doc.roundedRect(M, y, CW, summH, 3, 3, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text('ANALIZ OZETI', M + 4, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...DARK);
    doc.text(summLines, M + 4, y + 14);
    y += summH + 10;

    // LEGEND
    doc.setFillColor(...BLUE);
    doc.roundedRect(M, y, CW / 2 - 3, 11, 2, 2, 'F');
    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(nameA.substring(0, 28), M + CW / 4 - 1, y + 7.5, { align: 'center' });

    doc.setFillColor(...ORG);
    doc.roundedRect(M + CW / 2 + 3, y, CW / 2 - 3, 11, 2, 2, 'F');
    doc.setTextColor(...WHITE);
    doc.text(nameB.substring(0, 28), M + CW * 0.75 + 1.5, y + 7.5, { align: 'center' });
    y += 18;

    // KARŞILAŞTIRMA MATRİSİ
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...DARK);
    doc.text('Karsilastirma Matrisi', M, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [[
        { content: 'Metrik', styles: { fillColor: DARK, textColor: WHITE, fontStyle: 'bold', halign: 'left' } },
        { content: nameA, styles: { fillColor: BLUE, textColor: WHITE, fontStyle: 'bold', halign: 'center' } },
        { content: nameB, styles: { fillColor: ORG, textColor: WHITE, fontStyle: 'bold', halign: 'center' } },
      ]],
      body: analysis.comparisonTable.map((row) => [
        tr(row.metric),
        tr(String(row.optionA)),
        tr(String(row.optionB)),
      ]),
      theme: 'plain',
      styles: { font: 'helvetica', fontSize: 9, cellPadding: { top: 4, bottom: 4, left: 4, right: 4 } },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold', textColor: DARK },
        1: { halign: 'center', textColor: [29, 78, 216] },
        2: { halign: 'center', textColor: [194, 65, 12] },
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          const even = data.row.index % 2 === 0;
          if (data.column.index === 0) data.cell.styles.fillColor = even ? [248,250,252] : [241,245,249];
          if (data.column.index === 1) data.cell.styles.fillColor = even ? BLUE_L : [199,220,254];
          if (data.column.index === 2) data.cell.styles.fillColor = even ? ORG_L : [254,215,170];
        }
      },
    });
    y = doc.lastAutoTable.finalY + 12;

    // SKOR BARLARI
    if (y + 20 + analysis.scorecard.length * 18 > pageH - 18) { doc.addPage(); y = 20; }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...DARK);
    doc.text('Skor Karsilastirmasi  (0 - 10)', M, y);
    y += 7;

    const labelColW = CW * 0.28;
    const barAreaW = CW * 0.55;
    const scoreColX = M + labelColW + barAreaW + 4;

    doc.setFillColor(...BLUE); doc.rect(scoreColX, y - 4, 4, 4, 'F');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...BLUE);
    doc.text(nameA.substring(0,14), scoreColX + 6, y - 0.5);
    doc.setFillColor(...ORG); doc.rect(scoreColX + 30, y - 4, 4, 4, 'F');
    doc.setTextColor(...ORG);
    doc.text(nameB.substring(0,14), scoreColX + 36, y - 0.5);
    y += 3;

    const BAR_H = 5;
    const BAR_GAP = 2;
    const ROW_H = BAR_H * 2 + BAR_GAP + 6;

    analysis.scorecard.forEach((s) => {
      if (y + ROW_H > pageH - 18) { doc.addPage(); y = 20; }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...DARK);
      const ml = doc.splitTextToSize(tr(s.metric), labelColW - 2);
      doc.text(ml, M, y + BAR_H);

      const bx = M + labelColW;

      doc.setFillColor(226, 232, 240);
      doc.roundedRect(bx, y, barAreaW, BAR_H, 1, 1, 'F');
      doc.roundedRect(bx, y + BAR_H + BAR_GAP, barAreaW, BAR_H, 1, 1, 'F');

      const wA = Math.max((s.scoreA / 10) * barAreaW, 2);
      doc.setFillColor(...BLUE);
      doc.roundedRect(bx, y, wA, BAR_H, 1, 1, 'F');

      const wB = Math.max((s.scoreB / 10) * barAreaW, 2);
      doc.setFillColor(...ORG);
      doc.roundedRect(bx, y + BAR_H + BAR_GAP, wB, BAR_H, 1, 1, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...BLUE);
      doc.text(`${s.scoreA}/10`, scoreColX, y + BAR_H - 0.5);
      doc.setTextColor(...ORG);
      doc.text(`${s.scoreB}/10`, scoreColX, y + BAR_H * 2 + BAR_GAP - 0.5);

      y += ROW_H;
    });

    y += 6;

    // GİZLİ MALİYETLER
    const costLines = analysis.hiddenCosts.map(c => doc.splitTextToSize(`• ${tr(c)}`, CW - 12));
    const costH = costLines.reduce((a, l) => a + l.length * 5.5, 0) + 18;
    if (y + costH > pageH - 18) { doc.addPage(); y = 20; }

    doc.setFillColor(...AMBER_L);
    doc.setDrawColor(...AMBER);
    doc.roundedRect(M, y, CW, costH, 3, 3, 'FD');

    doc.setFillColor(...AMBER);
    doc.roundedRect(M, y, CW, 10, 3, 3, 'F');
    doc.rect(M, y + 5, CW, 5, 'F');
    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('! Gizli Maliyetler & Riskler', M + 4, y + 7.5);
    y += 16;

    analysis.hiddenCosts.forEach((cost, i) => {
      const lines = costLines[i];
      doc.setFont('helvetica', i % 2 === 0 ? 'normal' : 'italic');
      doc.setFontSize(9);
      doc.setTextColor(120, 53, 15);
      doc.text(lines, M + 5, y);
      y += lines.length * 5.5 + 1;
    });
    y += 10;

    // NİHAİ TAVSİYE
    const recText = tr(analysis.finalRecommendation);
    const recLines = doc.splitTextToSize(recText, CW - 12);
    const recH = recLines.length * 6 + 20;
    if (y + recH > pageH - 18) { doc.addPage(); y = 20; }

    doc.setFillColor(...DARK);
    doc.roundedRect(M, y, CW, recH, 4, 4, 'F');

    doc.setFillColor(...(analysis.winner === 'A' ? BLUE : ORG));
    doc.roundedRect(M, y, 5, recH, 2, 2, 'F');
    doc.rect(M + 3, y, 2, recH, 'F');

    doc.setTextColor(250, 204, 21);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Nihai Tavsiye', M + 9, y + 10);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(203, 213, 225);
    doc.text(recLines, M + 9, y + 18);

    addFooter();
    doc.save('ratio-analiz-raporu.pdf');
  };

  // SONUÇ EKRANI
  if (result) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        
        <style>{`
          .font-display { font-family: 'Syne', sans-serif; }
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: inline-block;
            animation: marquee 25s linear infinite;
          }
          .animate-marquee-reverse {
            display: inline-block;
            animation: marquee 25s linear infinite reverse;
          }
          .text-stroke {
            -webkit-text-stroke: 1.5px #ccff00;
            color: transparent;
          }
          @media (max-width: 768px) {
            .text-stroke {
              -webkit-text-stroke: 1px #ccff00;
            }
          }
        `}</style>

        <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)',
          backgroundSize: '40px 40px'
        }}></div>
        
        <div className="relative z-10 bg-white text-black py-2 border-b-4 border-white overflow-hidden whitespace-nowrap">
          <div className="animate-marquee font-bold text-xs sm:text-sm uppercase tracking-wider">
            ANALIZ TAMAMLANDI • KARAR VERMEK ZOR GELIYOR? • YAPAY ZEKA SANA YARDIM ETSIN • RASYONEL ANALIZ • IÇINDEKI IKILEMI ÇÖZ • ANALIZ TAMAMLANDI • KARAR VERMEK ZOR GELIYOR? • YAPAY ZEKA SANA YARDIM ETSIN • 
          </div>
        </div>

        <nav className="relative z-10 border-b-4 border-white bg-black p-4 sm:p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white flex items-center justify-center border-2 sm:border-4 border-white shadow-[4px_4px_0px_0px_#ccff00] sm:shadow-[8px_8px_0px_0px_#ccff00]">
                <Brain size={24} className="text-black sm:w-8 sm:h-8" />
              </div>
              <span className="text-xl sm:text-3xl font-display font-black tracking-tighter">RATIO AI</span>
            </div>
          </div>
        </nav>

        <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 sm:space-y-8">
            
            {/* Özet Kartı */}
            <div className={`border-2 sm:border-4 border-white p-4 sm:p-8 max-w-4xl mx-auto ${result.winner === 'A' ? 'bg-blue-950' : 'bg-purple-950'}`}
              style={{ boxShadow: result.winner === 'A' ? '10px 10px 0px 0px #0066ff' : '10px 10px 0px 0px #ff0066' }}>
              <h2 className="text-3xl sm:text-5xl font-black mb-4 sm:mb-6 text-stroke uppercase font-display text-center">Analiz Tamamlandı</h2>
              <p className="text-base sm:text-2xl font-mono mb-4 sm:mb-6 text-center italic break-words">"{thought}"</p>
              <div className="h-1 bg-white mb-4 sm:mb-6"></div>
              <p className={`text-xl sm:text-3xl font-black uppercase text-center ${result.winner === 'A' ? 'text-[#0066ff]' : 'text-[#ff0066]'}`}>
                Kazanan: {result.winner === 'A' ? result.extractedOptions.nameA : result.extractedOptions.nameB}
              </p>
              <p className="text-gray-300 text-center mt-4 text-sm sm:text-base">{result.summary}</p>
            </div>

            {/* Karşılaştırma Tablosu */}
            <div className="border-2 sm:border-4 border-white shadow-[4px_4px_0px_0px_white] sm:shadow-[8px_8px_0px_0px_white] bg-black overflow-hidden">
              <div className="grid grid-cols-3 border-b-2 sm:border-b-4 border-white text-xs sm:text-base">
                <div className="bg-slate-800 p-2 sm:p-4 font-bold uppercase text-gray-400 text-xs tracking-wider">Metrik</div>
                <div className="bg-[#0066ff] p-2 sm:p-4 font-bold uppercase text-center border-l-2 sm:border-l-4 border-white text-xs sm:text-sm truncate">
                  {result.extractedOptions.nameA}
                </div>
                <div className="bg-[#ff0066] p-2 sm:p-4 font-bold uppercase text-center border-l-2 sm:border-l-4 border-white text-xs sm:text-sm truncate">
                  {result.extractedOptions.nameB}
                </div>
              </div>
              {result.comparisonTable.map((row, i) => (
                <div key={i} className={`grid grid-cols-3 border-b border-white/20 text-xs sm:text-base ${i % 2 === 0 ? 'bg-white/5' : 'bg-white/10'}`}>
                  <div className="p-2 sm:p-4 font-bold border-r-2 sm:border-r-4 border-white/20">{row.metric}</div>
                  <div className="p-2 sm:p-4 text-center text-[#0066ff] border-r-2 sm:border-r-4 border-white/20 font-mono">{row.optionA}</div>
                  <div className="p-2 sm:p-4 text-center text-[#ff0066] font-mono">{row.optionB}</div>
                </div>
              ))}
            </div>

            {/* Skor Grafikleri */}
            <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
              <div className="border-2 sm:border-4 border-white shadow-[4px_4px_0px_0px_#0066ff] sm:shadow-[8px_8px_0px_0px_#0066ff] bg-black p-4 sm:p-6">
                <h3 className="text-lg sm:text-2xl font-display font-bold mb-4 sm:mb-6 uppercase text-[#0066ff]">Skor Analizi</h3>
                <div className="h-48 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.scorecard} layout="vertical">
                      <XAxis type="number" domain={[0, 10]} stroke="white" fontSize={12} />
                      <YAxis dataKey="metric" type="category" width={80} stroke="white" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '2px solid white' }} />
                      <Bar dataKey="scoreA" fill="#0066ff" name={result.extractedOptions.nameA} />
                      <Bar dataKey="scoreB" fill="#ff0066" name={result.extractedOptions.nameB} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gizli Maliyetler */}
              <div className="border-2 sm:border-4 border-white shadow-[4px_4px_0px_0px_#ffcc00] sm:shadow-[8px_8px_0px_0px_#ffcc00] bg-black p-4 sm:p-6">
                <h3 className="text-lg sm:text-2xl font-display font-bold mb-4 sm:mb-6 uppercase text-[#ffcc00] flex items-center gap-2">
                  <AlertTriangle size={20} /> Gizli Maliyetler
                </h3>
                <ul className="space-y-2 sm:space-y-3">
                  {result.hiddenCosts.map((cost, i) => (
                    <li key={i} className="flex gap-2 sm:gap-3 text-gray-300 text-xs sm:text-sm border-l-2 sm:border-l-4 border-[#ffcc00] pl-2 sm:pl-4">
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-[#ffcc00]" /> {cost}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Nihai Tavsiye */}
            <div className="border-2 sm:border-4 border-white shadow-[4px_4px_0px_0px_#ccff00] sm:shadow-[8px_8px_0px_0px_#ccff00] bg-slate-900 p-4 sm:p-8 relative">
              <div className="absolute top-0 left-0 w-1 sm:w-2 h-full bg-[#ccff00]"></div>
              <h3 className="text-xl sm:text-3xl font-display font-bold mb-4 sm:mb-6 uppercase text-[#ccff00] flex items-center gap-2">
                <Zap /> Nihai Tavsiye
              </h3>
              <div className="text-sm sm:text-xl leading-relaxed text-gray-300 font-mono whitespace-pre-wrap">
                {result.finalRecommendation.split('**').map((part, i) => 
                  i % 2 === 0 ? part : <span key={i} className="text-[#ccff00] font-bold">{part}</span>
                )}
              </div>

              {/* Butonlar */}
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-4 sm:pt-8">
                <button 
                  onClick={reset}
                  className="border-2 sm:border-4 border-white bg-white text-black px-6 sm:px-10 py-3 sm:py-4 font-black text-base sm:text-xl hover:bg-[#ff0066] hover:text-white transition-all shadow-[4px_4px_0px_0px_#0066ff] sm:shadow-[6px_6px_0px_0px_#0066ff] font-display uppercase flex items-center gap-2 sm:gap-3 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  <RefreshCcw size={20} /> Yeni Analiz
                </button>
                <button 
                  onClick={() => downloadPDF(result)}
                  className="border-2 sm:border-4 border-white bg-[#0066ff] text-white px-6 sm:px-10 py-3 sm:py-4 font-black text-base sm:text-xl hover:bg-[#ccff00] hover:text-black transition-all shadow-[4px_4px_0px_0px_white] sm:shadow-[6px_6px_0px_0px_white] font-display uppercase flex items-center gap-2 sm:gap-3 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  <Calculator size={20} /> PDF İndir
                </button>
              </div>
            </div>
          </motion.div>
        </main>

        <div className="bg-white text-black py-2 sm:py-3 border-t-2 sm:border-t-4 border-white mt-12 sm:mt-20 overflow-hidden whitespace-nowrap">
          <div className="animate-marquee-reverse font-bold text-xs sm:text-lg uppercase tracking-wider">
            ANALIZ ET • KARAR VER • HAREKETE GEÇ • ANALIZ ET • KARAR VER • HAREKETE GEÇ • ANALIZ ET • KARAR VER • HAREKETE GEÇ • 
          </div>
        </div>
      </div>
    );
  }

  // ANA EKRAN
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      
      <style>{`
        .font-display { font-family: 'Syne', sans-serif; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 25s linear infinite;
        }
        .animate-marquee-reverse {
          display: inline-block;
          animation: marquee 25s linear infinite reverse;
        }
        .text-stroke {
          -webkit-text-stroke: 1.5px #ccff00;
          color: transparent;
        }
        @media (max-width: 768px) {
          .text-stroke {
            -webkit-text-stroke: 1px #ccff00;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>
      
      <div className="relative z-10 bg-white text-black py-2 border-b-4 border-white overflow-hidden whitespace-nowrap">
        <div className="animate-marquee font-bold text-xs sm:text-sm uppercase tracking-wider">
          KARAR VERMEK ZOR GELIYOR? • YAPAY ZEKA SANA YARDIM ETSIN • RASYONEL ANALIZ • IÇINDEKI IKILEMI ÇÖZ • KARAR VERMEK ZOR GELIYOR? • YAPAY ZEKA SANA YARDIM ETSIN • 
        </div>
      </div>

      <nav className="relative z-10 border-b-4 border-white bg-black p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white flex items-center justify-center border-2 sm:border-4 border-white shadow-[4px_4px_0px_0px_white] sm:shadow-[8px_8px_0px_0px_white] hover:shadow-[4px_4px_0px_0px_#ccff00] sm:hover:shadow-[8px_8px_0px_0px_#ccff00] hover:border-[#ccff00] transition-all cursor-pointer">
              <Brain size={24} className="text-black sm:w-8 sm:h-8" />
            </div>
            <span className="text-xl sm:text-3xl font-display font-black tracking-tighter">RATIO AI</span>
          </div>

        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="mb-12 sm:mb-20">
          <h1 className="font-display font-black text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-none mb-4 sm:mb-8">
            IÇINDEKI<br />
            <span className="text-stroke">IKILEMI</span><br />
            DÖK.
          </h1>
          <p className="text-base sm:text-xl text-gray-400 max-w-xl border-l-2 sm:border-l-4 border-white pl-4 sm:pl-6 font-mono">
            Karar verme sürecini yapay zeka ile rasyonelleştir. En dogru seçimi verilerle yap.
          </p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8 border-2 sm:border-4 border-[#ff0066] bg-[#ff0066]/20 p-3 sm:p-4 text-[#ff0066] font-bold uppercase text-xs sm:text-sm">
            {error}
          </motion.div>
        )}

        <div className="border-2 sm:border-4 border-white shadow-[4px_4px_0px_0px_white] sm:shadow-[8px_8px_0px_0px_white] bg-black p-4 sm:p-8 md:p-12 mb-8 sm:mb-16 max-w-3xl hover:translate-x-[-2px] sm:hover:translate-x-[-4px] hover:translate-y-[-2px] sm:hover:translate-y-[-4px] hover:shadow-[6px_6px_0px_0px_#ccff00] sm:hover:shadow-[12px_12px_0px_0px_#ccff00] hover:border-[#ccff00] transition-all">
          <div className="flex items-center gap-3 mb-4 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white flex items-center justify-center">
              <Sparkles size={20} className="text-black sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-xl sm:text-3xl font-display font-bold uppercase">DÜŞUNCEN NEDIR?</h2>
          </div>
          
          <textarea 
            className="w-full h-32 sm:h-48 border-2 sm:border-4 border-white bg-transparent p-3 sm:p-6 text-sm sm:text-lg resize-none focus:outline-none focus:border-[#0066ff] focus:shadow-[3px_3px_0px_0px_#0066ff] sm:focus:shadow-[6px_6px_0px_0px_#0066ff] transition-all font-mono text-white placeholder:text-gray-600"
            placeholder="Örn: Starbucks'tan her gün kahve almak vs evde kahve yapmak..."
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            maxLength={500}
          ></textarea>
          
          <div className="flex items-center justify-between mt-4 sm:mt-6">
            <button 
              onClick={startListening}
              className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 border-2 border-white hover:bg-white hover:text-black transition-colors font-bold uppercase text-xs sm:text-sm"
            >
              <Mic size={16} className="sm:w-5 sm:h-5" />
              SESLE ANLAT
            </button>
            <span className="text-gray-500 font-mono text-xs sm:text-sm">{thought.length}/500</span>
          </div>
        </div>

        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-10">
            <div className="h-1 bg-white flex-1"></div>
            <span className="font-display font-bold text-sm sm:text-xl uppercase text-center">NEREDEN BAŞLAMALI?</span>
            <div className="h-1 bg-white flex-1"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            {[
              { 
                icon: Wallet, 
                color: 'bg-green-400', 
                title: 'FINANSAL IKILEMLER',
                items: [
                  "Dışarıdan yemek söylemek vs evde yemek yapmak",
                  "Yeni telefon almak vs mevcut olanı tamir ettirmek",
                  "Araba satın almak vs taksi/toplu taşıma"
                ]
              },
              { 
                icon: Briefcase, 
                color: 'bg-blue-400', 
                title: 'KARIYER & EĞITIM',
                items: [
                  "Yurtdışında yüksek lisans vs Türkiye'de işe girmek",
                  "Kurumsal işe devam etmek vs kendi işini kurmak",
                  "Yeni dil öğrenmek vs mevcut yetenekleri geliştirmek"
                ]
              },
              { 
                icon: Heart, 
                color: 'bg-pink-400', 
                title: 'YAŞAM TARZI',
                items: [
                  "Spor salonu üyeliği vs evde egzersiz yapmak",
                  "Şehir merkezinde yaşamak vs şehir dışında bahçeli ev",
                  "Hafta sonu tatile gitmek vs evde dinlenmek"
                ]
              },
              { 
                icon: Repeat, 
                color: 'bg-orange-400', 
                title: 'ALIŞKANLIKLAR',
                items: [
                  "Her gün kahve satın almak vs evde demlemek",
                  "Sigarayı bırakmak vs devam etmek",
                  "Netflix aboneliğini iptal etmek vs devam etmek"
                ]
              }
            ].map((category, idx) => (
              <div key={idx} className="border-2 sm:border-4 border-white shadow-[4px_4px_0px_0px_white] sm:shadow-[8px_8px_0px_0px_white] bg-black p-4 sm:p-6 transition-all">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 ${category.color} flex items-center justify-center`}>
                    <category.icon size={16} className="text-black sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="font-display font-bold text-base sm:text-xl uppercase">{category.title}</h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {category.items.map((item, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleCategoryClick(item)}
                      className="bg-white text-black p-2 sm:p-3 font-bold uppercase text-[10px] sm:text-xs cursor-pointer transition-all hover:bg-[#ccff00] hover:rotate-[-1deg]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center py-6 sm:py-12">
          <button 
            onClick={handleCalculate}
            disabled={loading}
            className={`bg-[#0066ff] border-2 sm:border-4 border-white shadow-[4px_4px_0px_0px_white] sm:shadow-[8px_8px_0px_0px_white] transition-all px-8 sm:px-16 py-4 sm:py-8 text-lg sm:text-2xl font-black flex items-center gap-2 sm:gap-4 uppercase font-display
            ${loading ? 'opacity-70 cursor-wait' : 'hover:bg-[#ff0066] hover:translate-x-[-2px] sm:hover:translate-x-[-4px] hover:translate-y-[-2px] sm:hover:translate-y-[-4px] hover:shadow-[6px_6px_0px_0px_#ccff00] sm:hover:shadow-[12px_12px_0px_0px_#ccff00] active:translate-x-[2px] sm:active:translate-x-[4px] active:translate-y-[2px] sm:active:translate-y-[4px]'}`}
          >
            <Zap size={24} className={`${loading ? 'animate-bounce text-[#ccff00]' : ''} sm:w-8 sm:h-8`} />
            {loading ? 'ANALIZ EDILIYOR...' : 'RASYONEL ANALIZI BAŞLAT'}
          </button>
        </div>
      </main>

      <div className="bg-white text-black py-2 sm:py-3 border-t-2 sm:border-t-4 border-white mt-12 sm:mt-20 overflow-hidden whitespace-nowrap">
        <div className="animate-marquee-reverse font-bold text-xs sm:text-lg uppercase tracking-wider">
          ANALIZ ET • KARAR VER • HAREKETE GEÇ • ANALIZ ET • KARAR VER • HAREKETE GEÇ • ANALIZ ET • KARAR VER • HAREKETE GEÇ • 
        </div>
      </div>
    </div>
  );
};

export default RatioLanding;
