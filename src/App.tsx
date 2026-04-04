import React, { useState } from 'react';
import { Brain, Sparkles, Mic, Wallet, Briefcase, Heart, Repeat, Zap, RefreshCcw, Calculator, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Mock analiz fonksiyonu (gerçek API yerine)
const analyzeDecision = async (text) => {
  // Simüle edilmiş API gecikmesi
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock sonuç döndür
  return {
    summary: `"${text.substring(0, 50)}..." ikileminde rasyonel analiz sonucu: Seçenek A (Mevcut durumu koruma) uzun vadede daha avantajlı görünüyor.`,
    winner: 'A',
    extractedOptions: {
      nameA: 'Mevcut Durum',
      nameB: 'Yeni Seçenek'
    },
    comparisonTable: [
      { metric: 'Maliyet', optionA: 'Düşük', optionB: 'Yüksek' },
      { metric: 'Zaman', optionA: 'Hızlı', optionB: 'Yavaş' },
      { metric: 'Risk', optionA: 'Az', optionB: 'Çok' },
      { metric: 'Getiri', optionA: 'Orta', optionB: 'Yüksek' }
    ],
    scorecard: [
      { metric: 'Ekonomik', scoreA: 8, scoreB: 4 },
      { metric: 'Pratiklik', scoreA: 9, scoreB: 5 },
      { metric: 'Risk', scoreA: 8, scoreB: 3 },
      { metric: 'Uzun Vade', scoreA: 7, scoreB: 6 }
    ],
    hiddenCosts: [
      'Başlangıç maliyetleri göz ardı edilebilir gibi görünse bile zamanla birikir',
      'Psikolojik uyum süreci maliyetleri hesaba katılmamış olabilir',
      'Fırsat maliyeti: Alternatif kullanımlar değerlendirilmeli'
    ],
    finalRecommendation: 'Analiz sonucunda **Seçenek A** (Mevcut Durum) rasyonel olarak önerilmektedir. Düşük risk profili ve öngörülebilir maliyet yapısı nedeniyle uzun vadede daha sürdürülebilir bir seçenektir.'
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

    const tr = (s) => s
      .replace(/ğ/g,'g').replace(/Ğ/g,'G')
      .replace(/ü/g,'u').replace(/Ü/g,'U')
      .replace(/ş/g,'s').replace(/Ş/g,'S')
      .replace(/ı/g,'i').replace(/İ/g,'I')
      .replace(/ö/g,'o').replace(/Ö/g,'O')
      .replace(/ç/g,'c').replace(/Ç/g,'C');

    const nameA = tr(analysis.extractedOptions?.nameA || 'Secenek A');
    const nameB = tr(analysis.extractedOptions?.nameB || 'Secenek B');

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
      <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden font-main">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
          .font-display { font-family: 'Syne', sans-serif; }
          .font-main { font-family: 'Space Grotesk', sans-serif; }
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: inline-block;
            animation: marquee 20s linear infinite;
          }
          .animate-marquee-reverse {
            display: inline-block;
            animation: marquee 20s linear infinite reverse;
          }
          .text-stroke {
            -webkit-text-stroke: 2px #ccff00;
            color: transparent;
          }
        `}</style>

        <div className="fixed inset-0 z-0 opacity-10 pointer-events-none [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:40px_40px]"></div>
        
        <div className="relative z-10 bg-white text-black py-2 border-b-4 border-white overflow-hidden whitespace-nowrap">
          <div className="animate-marquee font-bold text-sm uppercase">
            ANALIZ TAMAMLANDI • KARAR VERMEK ZOR GELİYOR? • YAPAY ZEKA SANA YARDIM ETSİN • RASYONEL ANALIZ • 
          </div>
        </div>

        <nav className="relative z-10 border-b-4 border-white bg-black p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white flex items-center justify-center border-4 border-white shadow-[8px_8px_0px_0px_#ccff00]">
                <Brain size={32} className="text-black" />
              </div>
              <span className="text-3xl font-display font-black tracking-tighter">RATIO AI</span>
            </div>
          </div>
        </nav>

        <main className="relative z-10 max-w-6xl mx-auto px-6 py-16">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            
            {/* Özet Kartı */}
            <div className={`border-4 border-white p-8 shadow-[10px_10px_0px_0px_${result.winner === 'A' ? '#0066ff' : '#ff0066'}] max-w-4xl mx-auto ${result.winner === 'A' ? 'bg-blue-950' : 'bg-purple-950'}`}>
              <h2 className="text-5xl font-black mb-6 text-stroke uppercase font-display text-center">Analiz Tamamlandı</h2>
              <p className="text-2xl font-mono mb-6 text-center italic">"{thought}"</p>
              <div className="h-1 bg-white mb-6"></div>
              <p className={`text-3xl font-black uppercase text-center ${result.winner === 'A' ? 'text-[#0066ff]' : 'text-[#ff0066]'}`}>
                Kazanan: {result.winner === 'A' ? result.extractedOptions.nameA : result.extractedOptions.nameB}
              </p>
              <p className="text-gray-300 text-center mt-4">{result.summary}</p>
            </div>

            {/* Karşılaştırma Tablosu */}
            <div className="border-4 border-white shadow-[8px_8px_0px_0px_white] bg-black overflow-hidden">
              <div className="grid grid-cols-3 border-b-4 border-white">
                <div className="bg-slate-800 p-4 font-bold uppercase">Metrik</div>
                <div className="bg-[#0066ff] p-4 font-bold uppercase text-center border-l-4 border-white">{result.extractedOptions.nameA}</div>
                <div className="bg-[#ff0066] p-4 font-bold uppercase text-center border-l-4 border-white">{result.extractedOptions.nameB}</div>
              </div>
              {result.comparisonTable.map((row, i) => (
                <div key={i} className={`grid grid-cols-3 border-b-2 border-white/20 ${i % 2 === 0 ? 'bg-white/5' : 'bg-white/10'}`}>
                  <div className="p-4 font-bold border-r-4 border-white/20">{row.metric}</div>
                  <div className="p-4 text-center text-[#0066ff] border-r-4 border-white/20 font-mono">{row.optionA}</div>
                  <div className="p-4 text-center text-[#ff0066] font-mono">{row.optionB}</div>
                </div>
              ))}
            </div>

            {/* Skor Grafikleri */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border-4 border-white shadow-[8px_8px_0px_0px_#0066ff] bg-black p-6">
                <h3 className="text-2xl font-display font-bold mb-6 uppercase text-[#0066ff]">Skor Analizi</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.scorecard} layout="vertical">
                      <XAxis type="number" domain={[0, 10]} stroke="white" />
                      <YAxis dataKey="metric" type="category" width={100} stroke="white" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '2px solid white' }} />
                      <Bar dataKey="scoreA" fill="#0066ff" name={result.extractedOptions.nameA} />
                      <Bar dataKey="scoreB" fill="#ff0066" name={result.extractedOptions.nameB} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gizli Maliyetler */}
              <div className="border-4 border-white shadow-[8px_8px_0px_0px_#ffcc00] bg-black p-6">
                <h3 className="text-2xl font-display font-bold mb-6 uppercase text-[#ffcc00] flex items-center gap-2">
                  <AlertTriangle /> Gizli Maliyetler
                </h3>
                <ul className="space-y-3">
                  {result.hiddenCosts.map((cost, i) => (
                    <li key={i} className="flex gap-3 text-gray-300 border-l-4 border-[#ffcc00] pl-4">
                      <ArrowRight className="w-5 h-5 flex-shrink-0 text-[#ffcc00]" /> {cost}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Nihai Tavsiye */}
            <div className="border-4 border-white shadow-[8px_8px_0px_0px_#ccff00] bg-slate-900 p-8 relative">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#ccff00]"></div>
              <h3 className="text-3xl font-display font-bold mb-6 uppercase text-[#ccff00] flex items-center gap-2">
                <Zap /> Nihai Tavsiye
              </h3>
              <div className="text-xl leading-relaxed text-gray-300 font-mono whitespace-pre-wrap">
                {result.finalRecommendation}
              </div>
            </div>

            {/* Butonlar */}
            <div className="flex flex-wrap justify-center gap-6 pt-8">
              <button 
                onClick={reset}
                className="border-4 border-white bg-white text-black px-10 py-4 font-black text-xl hover:bg-[#ff0066] hover:text-white transition-all shadow-[6px_6px_0px_0px_#0066ff] font-display uppercase flex items-center gap-3"
              >
                <RefreshCcw /> Yeni Analiz
              </button>
              <button 
                onClick={() => downloadPDF(result)}
                className="border-4 border-white bg-[#0066ff] text-white px-10 py-4 font-black text-xl hover:bg-[#ccff00] hover:text-black transition-all shadow-[6px_6px_0px_0px_white] font-display uppercase flex items-center gap-3"
              >
                <Calculator /> PDF İndir
              </button>
            </div>
          </motion.div>
        </main>

        <div className="bg-white text-black py-3 border-t-4 border-white mt-20 overflow-hidden whitespace-nowrap">
          <div className="animate-marquee-reverse font-bold text-lg uppercase">
            ANALIZ ET • KARAR VER • HAREKETE GEÇ • ANALIZ ET • KARAR VER • HAREKETE GEÇ • 
          </div>
        </div>
      </div>
    );
  }

  // ANA EKRAN
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden font-main">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .font-main { font-family: 'Space Grotesk', sans-serif; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 20s linear infinite;
        }
        .animate-marquee-reverse {
          display: inline-block;
          animation: marquee 20s linear infinite reverse;
        }
        .text-stroke {
          -webkit-text-stroke: 2px #ccff00;
          color: transparent;
        }
      `}</style>

      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:40px_40px]"></div>
      
      <div className="relative z-10 bg-white text-black py-2 border-b-4 border-white overflow-hidden whitespace-nowrap">
        <div className="animate-marquee font-bold text-sm uppercase">
          KARAR VERMEK ZOR GELİYOR? • YAPAY ZEKA SANA YARDIM ETSİN • RASYONEL ANALIZ • IÇINDEKI IKILEMI ÇÖZ • 
        </div>
      </div>

      <nav className="relative z-10 border-b-4 border-white bg-black p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white flex items-center justify-center border-4 border-white shadow-[8px_8px_0px_0px_white] hover:shadow-[8px_8px_0px_0px_#ccff00] hover:border-[#ccff00] transition-all cursor-pointer">
              <Brain size={32} className="text-black" />
            </div>
            <span className="text-3xl font-display font-black tracking-tighter">RATIO AI</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <span className="text-gray-400 font-mono">v2.0.4</span>
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="mb-20">
          <h1 className="font-display font-black text-6xl md:text-8xl leading-none mb-8">
            IÇINDEKI<br />
            <span className="text-stroke">IKILEMI</span><br />
            DÖK.
          </h1>
          <p className="text-xl text-gray-400 max-w-xl border-l-4 border-white pl-6 font-mono">
            Karar verme sürecini yapay zeka ile rasyonelleştir. En dogru seçimi verilerle yap.
          </p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 border-4 border-[#ff0066] bg-[#ff0066]/20 p-4 text-[#ff0066] font-bold uppercase">
            {error}
          </motion.div>
        )}

        <div className="border-4 border-white shadow-[8px_8px_0px_0px_white] bg-black p-8 md:p-12 mb-16 max-w-3xl hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_#ccff00] hover:border-[#ccff00] transition-all">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-white flex items-center justify-center">
              <Sparkles size={24} className="text-black" />
            </div>
            <h2 className="text-3xl font-display font-bold uppercase">DÜŞUNCEN NEDIR?</h2>
          </div>
          
          <textarea 
            className="w-full h-48 border-4 border-white bg-transparent p-6 text-lg resize-none focus:outline-none focus:border-[#0066ff] focus:shadow-[6px_6px_0px_0px_#0066ff] transition-all font-mono text-white placeholder:text-gray-600"
            placeholder="Örn: Starbucks'tan her gün kahve almak yerine..."
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            maxLength={500}
          ></textarea>
          
          <div className="flex items-center justify-between mt-6">
            <button 
              onClick={startListening}
              className="flex items-center gap-3 px-6 py-3 border-2 border-white hover:bg-white hover:text-black transition-colors font-bold uppercase"
            >
              <Mic size={20} />
              SESLE ANLAT
            </button>
            <span className="text-gray-500 font-mono">{thought.length}/500</span>
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-1 bg-white flex-1"></div>
            <span className="font-display font-bold text-xl uppercase">NEREDEN BAŞLAMALI?</span>
            <div className="h-1 bg-white flex-1"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border-4 border-white shadow-[8px_8px_0px_0px_white] bg-black p-6 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_#ccff00] hover:border-[#ccff00] transition-all group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-400 flex items-center justify-center">
                  <Wallet size={20} className="text-black"/>
                </div>
                <h3 className="font-display font-bold text-xl uppercase">FINANSAL IKILEMLER</h3>
              </div>
              <div className="space-y-3">
                {[
                  "Dişaridan yemek söylemek vs Evde yemek yapmak",
                  "Yeni telefon almak vs Mevcut olani tamir ettirmek",
                  "Araba satın almak vs Taksi/Toplu taşima"
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleCategoryClick(item)}
                    className="bg-white text-black p-3 font-bold uppercase text-xs cursor-pointer hover:bg-[#ccff00] hover:rotate-[-2deg] transition-all"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-4 border-white shadow-[8px_8px_0px_0px_white] bg-black p-6 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_#0066ff] hover:border-[#0066ff] transition-all group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-400 flex items-center justify-center">
                  <Briefcase size={20} className="text-black"/>
                </div>
                <h3 className="font-display font-bold text-xl uppercase">KARIYER & EĞITIM</h3>
              </div>
              <div className="space-y-3">
                {[
                  "Yurtdişinda yüksek lisans vs Türkiye'de işe girmek",
                  "Kurumsal işe devam etmek vs Kendi işini kurmak",
                  "Yeni dil öğrenmek vs Mevcut yetenekleri geliştirmek"
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleCategoryClick(item)}
                    className="bg-white text-black p-3 font-bold uppercase text-xs cursor-pointer hover:bg-[#0066ff] hover:text-white hover:rotate-[2deg] transition-all"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-4 border-white shadow-[8px_8px_0px_0px_white] bg-black p-6 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_#ff0066] hover:border-[#ff0066] transition-all group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-pink-400 flex items-center justify-center">
                  <Heart size={20} className="text-black"/>
                </div>
                <h3 className="font-display font-bold text-xl uppercase">YAŞAM TARZI</h3>
              </div>
              <div className="space-y-3">
                {[
                  "Spor salonu üyeliği vs Evde egzersiz yapmak",
                  "Şehir merkezinde yaşamak vs Şehir dişinda bahçeli ev",
                  "Hafta sonu tatile gitmek vs Evde dinlenmek"
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleCategoryClick(item)}
                    className="bg-white text-black p-3 font-bold uppercase text-xs cursor-pointer hover:bg-[#ff0066] hover:text-white hover:rotate-[-1deg] transition-all"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-4 border-white shadow-[8px_8px_0px_0px_white] bg-black p-6 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_#ffcc00] hover:border-[#ffcc00] transition-all group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-400 flex items-center justify-center">
                  <Repeat size={20} className="text-black"/>
                </div>
                <h3 className="font-display font-bold text-xl uppercase">ALIŞKANLIKLAR</h3>
              </div>
              <div className="space-y-3">
                {[
                  "Her gün kahve satın almak vs Evde demlemek",
                  "Sigarayi birakmak vs Devam etmek (Maliyet/Sağlik)",
                  "Abonelik servislerini (Netflix vb.) iptal etmek"
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleCategoryClick(item)}
                    className="bg-white text-black p-3 font-bold uppercase text-xs cursor-pointer hover:bg-[#ffcc00] hover:rotate-[1deg] transition-all"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center py-12">
          <button 
            onClick={handleCalculate}
            disabled={loading}
            className={`bg-[#0066ff] border-4 border-white shadow-[8px_8px_0px_0px_white] transition-all px-16 py-8 text-2xl font-black flex items-center gap-4 uppercase font-display
            ${loading ? 'opacity-70 cursor-wait' : 'hover:bg-[#ff0066] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_#ccff00] active:translate-x-[4px] active:translate-y-[4px]'}`}
          >
            <Zap size={32} className={loading ? 'animate-bounce text-[#ccff00]' : ''} />
            {loading ? 'ANALIZ EDILIYOR...' : 'RASYONEL ANALIZI BAŞLAT'}
          </button>
        </div>
      </main>

      <div className="bg-white text-black py-3 border-t-4 border-white mt-20 overflow-hidden whitespace-nowrap">
        <div className="animate-marquee-reverse font-bold text-lg uppercase">
          ANALIZ ET • KARAR VER • HAREKETE GEÇ • ANALIZ ET • KARAR VER • HAREKETE GEÇ • 
        </div>
      </div>
    </div>
  );
};

export default RatioLanding;
