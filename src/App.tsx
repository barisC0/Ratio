import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import React, { useState } from 'react';
import {
  Calculator,
  TrendingUp,
  Clock,
  DollarSign,
  Zap,
  Brain,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RefreshCcw,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import Markdown from 'react-markdown';
import { analyzeDecision, DecisionOption, AnalysisResult } from './lib/gemini';
import { cn } from './lib/utils';

export default function App() {
  const [thought, setThought] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const downloadPDF = (analysis: AnalysisResult) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const M = 16; // margin
    const CW = pageW - M * 2;

    // Renk paleti — A: koyu mavi, B: canlı turuncu
    const BLUE: [number,number,number]   = [29, 78, 216];
    const BLUE_L: [number,number,number] = [219, 234, 254];
    const ORG: [number,number,number]    = [234, 88, 12];
    const ORG_L: [number,number,number]  = [255, 237, 213];
    const DARK: [number,number,number]   = [15, 23, 42];
    const GRAY: [number,number,number]   = [100, 116, 139];
    const WHITE: [number,number,number]  = [255, 255, 255];
    const AMBER: [number,number,number]  = [217, 119, 6];
    const AMBER_L: [number,number,number]= [254, 243, 199];
    const GREEN: [number,number,number]  = [21, 128, 61];
    const GREEN_L: [number,number,number]= [220, 252, 231];

    const tr = (s: string) => s
      .replace(/ğ/g,'g').replace(/Ğ/g,'G')
      .replace(/ü/g,'u').replace(/Ü/g,'U')
      .replace(/ş/g,'s').replace(/Ş/g,'S')
      .replace(/ı/g,'i').replace(/İ/g,'I')
      .replace(/ö/g,'o').replace(/Ö/g,'O')
      .replace(/ç/g,'c').replace(/Ç/g,'C');

    const nameA = tr(analysis.extractedOptions?.nameA || 'Secenek A');
    const nameB = tr(analysis.extractedOptions?.nameB || 'Secenek B');

    const addFooter = () => {
      const n = (doc as any).internal.getNumberOfPages();
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

    // ══════════════════════════════════════════
    // HEADER
    // ══════════════════════════════════════════
    doc.setFillColor(...DARK);
    doc.rect(0, 0, pageW, 44, 'F');

    // Sol mavi şerit
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

    // Kazanan rozeti sağda
    const winLabel = analysis.winner === 'A' ? nameA : nameB;
    const winColor = analysis.winner === 'A' ? BLUE : ORG;
    doc.setFillColor(...winColor);
    doc.roundedRect(pageW - M - 52, 26, 52, 12, 2, 2, 'F');
    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`Onerilir: ${winLabel.substring(0, 16)}`, pageW - M - 26, 33.5, { align: 'center' });

    let y = 54;

    // ══════════════════════════════════════════
    // ÖZET KUTUSU
    // ══════════════════════════════════════════
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

    // ══════════════════════════════════════════
    // LEGEND — A ve B renk göstergesi
    // ══════════════════════════════════════════
    // Seçenek A etiketi
    doc.setFillColor(...BLUE);
    doc.roundedRect(M, y, CW / 2 - 3, 11, 2, 2, 'F');
    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(nameA.substring(0, 28), M + CW / 4 - 1, y + 7.5, { align: 'center' });

    // Seçenek B etiketi
    doc.setFillColor(...ORG);
    doc.roundedRect(M + CW / 2 + 3, y, CW / 2 - 3, 11, 2, 2, 'F');
    doc.setTextColor(...WHITE);
    doc.text(nameB.substring(0, 28), M + CW * 0.75 + 1.5, y + 7.5, { align: 'center' });
    y += 18;

    // ══════════════════════════════════════════
    // KARŞILAŞTIRMA MATRİSİ
    // ══════════════════════════════════════════
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
      body: analysis.comparisonTable.map((row, i) => [
        tr(row.metric),
        tr(String(row.optionA)),
        tr(String(row.optionB)),
      ]),
      theme: 'plain',
      styles: { font: 'helvetica', fontSize: 9, cellPadding: { top: 4, bottom: 4, left: 4, right: 4 } },
      columnStyles: {
        0: { halign: 'left',   fontStyle: 'bold', textColor: DARK },
        1: { halign: 'center', textColor: [29, 78, 216] },
        2: { halign: 'center', textColor: [194, 65, 12] },
      },
      didParseCell: (data: any) => {
        if (data.section === 'body') {
          const even = data.row.index % 2 === 0;
          if (data.column.index === 0) data.cell.styles.fillColor = even ? [248,250,252] : [241,245,249];
          if (data.column.index === 1) data.cell.styles.fillColor = even ? BLUE_L : [199,220,254];
          if (data.column.index === 2) data.cell.styles.fillColor = even ? ORG_L : [254,215,170];
        }
      },
    });
    y = (doc as any).lastAutoTable.finalY + 12;

    // ══════════════════════════════════════════
    // SKOR BARLARI
    // ══════════════════════════════════════════
    if (y + 20 + analysis.scorecard.length * 18 > pageH - 18) { doc.addPage(); y = 20; }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...DARK);
    doc.text('Skor Karsilastirmasi  (0 - 10)', M, y);
    y += 7;

    const labelColW = CW * 0.28;
    const barAreaW = CW * 0.55;
    const scoreColX = M + labelColW + barAreaW + 4;

    // Legend küçük
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

      // Metrik adı
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...DARK);
      const ml = doc.splitTextToSize(tr(s.metric), labelColW - 2);
      doc.text(ml, M, y + BAR_H);

      const bx = M + labelColW;

      // Zemin çubuğu (gri)
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(bx, y, barAreaW, BAR_H, 1, 1, 'F');
      doc.roundedRect(bx, y + BAR_H + BAR_GAP, barAreaW, BAR_H, 1, 1, 'F');

      // A çubuğu — mavi
      const wA = Math.max((s.scoreA / 10) * barAreaW, 2);
      doc.setFillColor(...BLUE);
      doc.roundedRect(bx, y, wA, BAR_H, 1, 1, 'F');

      // B çubuğu — turuncu
      const wB = Math.max((s.scoreB / 10) * barAreaW, 2);
      doc.setFillColor(...ORG);
      doc.roundedRect(bx, y + BAR_H + BAR_GAP, wB, BAR_H, 1, 1, 'F');

      // Skor etiketleri
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...BLUE);
      doc.text(`${s.scoreA}/10`, scoreColX, y + BAR_H - 0.5);
      doc.setTextColor(...ORG);
      doc.text(`${s.scoreB}/10`, scoreColX, y + BAR_H * 2 + BAR_GAP - 0.5);

      y += ROW_H;
    });

    y += 6;

    // ══════════════════════════════════════════
    // GİZLİ MALİYETLER
    // ══════════════════════════════════════════
    const costLines = analysis.hiddenCosts.map(c => doc.splitTextToSize(`• ${tr(c)}`, CW - 12));
    const costH = costLines.reduce((a, l) => a + l.length * 5.5, 0) + 18;
    if (y + costH > pageH - 18) { doc.addPage(); y = 20; }

    doc.setFillColor(...AMBER_L);
    doc.setDrawColor(...AMBER);
    doc.roundedRect(M, y, CW, costH, 3, 3, 'FD');

    // Üst şerit
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

    // ══════════════════════════════════════════
    // NİHAİ TAVSİYE
    // ══════════════════════════════════════════
    const recText = tr(analysis.finalRecommendation);
    const recLines = doc.splitTextToSize(recText, CW - 12);
    const recH = recLines.length * 6 + 20;
    if (y + recH > pageH - 18) { doc.addPage(); y = 20; }

    doc.setFillColor(...DARK);
    doc.roundedRect(M, y, CW, recH, 4, 4, 'F');

    // Sol renkli çubuk (kazanan rengi)
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

    // ══════════════════════════════════════════
    addFooter();
    doc.save('ratio-analiz-raporu.pdf');
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Tarayıcı ses desteği sunmuyor.");
    const recognition = new SpeechRecognition();
    recognition.lang = "tr-TR";
    recognition.onresult = (e: any) => setThought(e.results[0][0].transcript);
    recognition.start();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 p-2 rounded-lg">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-display font-bold text-xl tracking-tight text-slate-900">
              Ratio <span className="text-brand-600">AI</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-12">
        <div className="text-center mb-12">
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 mb-4">
            İçindeki İkilemi <br />
            <span className="text-brand-600">Dök İçini Analiz Edelim.</span>
          </motion.h2>
        </div>

        {!result ? (
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl p-8 bg-white shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Brain className="w-6 h-6 text-brand-600" />
                <h3 className="font-display font-bold text-xl">Düşüncen Nedir?</h3>
              </div>

              <textarea
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder="Örn: Starbucks'tan her gün kahve almak yerine..."
                className="w-full h-48 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-500 text-lg"
              />
              <button onClick={startListening} className="mt-2 flex items-center gap-2 text-sm text-brand-600 font-bold hover:text-brand-700">
                <Zap className="w-4 h-4" /> Sesle Anlat
              </button>

              <div className="mt-8">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4" /> Nereden Başlamalı? (İlham Al)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { title: "Finansal İkilemler", examples: ["Dışarıdan yemek söylemek vs Evde yemek yapmak", "Yeni bir telefon almak vs Mevcut olanı tamir ettirmek", "Araba satın almak vs Taksi/Toplu taşıma kullanmak"] },
                    { title: "Kariyer & Eğitim", examples: ["Yurtdışında yüksek lisans vs Türkiye'de işe girmek", "Kurumsal işe devam etmek vs Kendi işini kurmak", "Yeni bir dil öğrenmek vs Mevcut yetenekleri geliştirmek"] },
                    { title: "Yaşam Tarzı", examples: ["Spor salonu üyeliği vs Evde egzersiz yapmak", "Şehir merkezinde yaşamak vs Şehir dışında bahçeli ev", "Hafta sonu tatile gitmek vs Evde dinlenmek"] },
                    { title: "Alışkanlıklar", examples: ["Her gün kahve satın almak vs Evde demlemek", "Sigarayı bırakmak vs Devam etmek (Maliyet/Sağlık)", "Abonelik servislerini (Netflix vb.) iptal etmek"] }
                  ].map((category, idx) => (
                    <div key={idx} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <h5 className="text-xs font-bold text-slate-500 mb-2">{category.title}</h5>
                      <div className="flex flex-wrap gap-2">
                        {category.examples.map((example) => (
                          <button key={example} onClick={() => setThought(example)} className="text-xs bg-white hover:bg-brand-50 hover:text-brand-600 border border-slate-200 p-2 rounded-lg transition-all text-left">
                            {example}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="flex justify-center pt-4">
              <button onClick={handleCalculate} disabled={loading || !thought.trim()} className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-bold text-xl shadow-xl">
                <div className="flex items-center gap-3">
                  {loading ? <RefreshCcw className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 text-yellow-400" />}
                  <span>{loading ? 'Analiz Ediliyor...' : 'Rasyonel Analizi Başlat'}</span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <div className={cn("p-8 rounded-3xl border-2 shadow-2xl relative", result.winner === 'A' ? "bg-blue-50 border-blue-200" : "bg-indigo-50 border-indigo-200")}>
              <h3 className="text-3xl font-extrabold text-slate-900 mb-4">{result.summary}</h3>
              <div className="flex flex-wrap gap-4 mt-8">
                <button onClick={reset} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-semibold">
                  <RefreshCcw className="w-4 h-4" /> Yeni Analiz
                </button>
                <button onClick={() => downloadPDF(result)} className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors shadow-lg">
                  <Calculator className="w-4 h-4" /> PDF Raporu İndir
                </button>
              </div>
            </div>

            {/* Karşılaştırma Grid ve Grafik */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 rounded-3xl overflow-hidden shadow-lg border border-slate-200">
                {/* Tablo başlık şeridi */}
                <div className="grid grid-cols-3">
                  <div className="bg-slate-800 py-4 px-4 flex items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Metrik</span>
                  </div>
                  <div className="bg-blue-600 py-4 px-4 flex items-center justify-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-white/30 flex-shrink-0" />
                    <span className="font-extrabold text-white text-sm truncate">{result.extractedOptions?.nameA || 'Seçenek A'}</span>
                  </div>
                  <div className="bg-orange-500 py-4 px-4 flex items-center justify-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-white/30 flex-shrink-0" />
                    <span className="font-extrabold text-white text-sm truncate">{result.extractedOptions?.nameB || 'Seçenek B'}</span>
                  </div>
                </div>

                {/* Satırlar */}
                {result.comparisonTable.map((row, i) => (
                  <div key={i} className={cn("grid grid-cols-3 border-t border-slate-100", i % 2 === 0 ? "bg-white" : "bg-slate-50")}>
                    <div className="py-4 px-4 flex items-center">
                      <span className="font-bold text-slate-700 text-sm">{row.metric}</span>
                    </div>
                    <div className="py-4 px-4 flex items-center justify-center border-l-4 border-blue-500 bg-blue-50">
                      <span className="text-blue-900 font-semibold text-sm text-center">{row.optionA}</span>
                    </div>
                    <div className="py-4 px-4 flex items-center justify-center border-l-4 border-orange-400 bg-orange-50">
                      <span className="text-orange-900 font-semibold text-sm text-center">{row.optionB}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass-card rounded-3xl p-6 bg-white shadow-lg">
                <h4 className="font-bold text-xl mb-6 text-center">Görsel Analiz</h4>
                <div className="h-[250px] w-full" style={{ minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.scorecard.map(s => ({ name: s.metric, A: s.scoreA, B: s.scoreB }))} layout="vertical">
                      <XAxis type="number" domain={[0, 10]} hide />
                      <YAxis dataKey="name" type="category" width={80} fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'transparent' }} />
                      <Bar dataKey="A" fill="#2563eb" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="B" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Gizli Maliyetler ve Tavsiye */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-amber-50 border border-amber-100 rounded-3xl p-8">
                <h4 className="font-bold text-xl text-amber-900 mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-amber-600" /> Gizli Maliyetler
                </h4>
                <ul className="space-y-3">
                  {result.hiddenCosts.map((cost, i) => (
                    <li key={i} className="flex gap-3 text-amber-800 text-sm">
                      <ArrowRight className="w-4 h-4 flex-shrink-0 mt-1 opacity-50" /> {cost}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden">
                <h4 className="font-bold text-xl mb-6 flex items-center gap-2 text-yellow-400">
                  <Zap className="w-6 h-6" /> Nihai Tavsiye
                </h4>
                <div className="text-lg leading-relaxed text-slate-300 italic">
                  <Markdown>{result.finalRecommendation}</Markdown>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
