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

  // Türkçe karakter dönüşümü
  const normalizeTR = (str: string): string => {
    return str
      .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u').replace(/Ü/g, 'U')
      .replace(/ş/g, 's').replace(/Ş/g, 'S')
      .replace(/ı/g, 'i').replace(/İ/g, 'I')
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')
      .replace(/ç/g, 'c').replace(/Ç/g, 'C');
  };

  const downloadPDF = (analysis: AnalysisResult) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentW = pageW - margin * 2;

    const nameA = normalizeTR(analysis.extractedOptions?.nameA || 'Secenek A');
    const nameB = normalizeTR(analysis.extractedOptions?.nameB || 'Secenek B');

    // ── HEADER ──────────────────────────────────────────────
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageW, 38, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Ratio AI', margin, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('Karar Analiz Raporu', margin, 25);

    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2,'0')}.${(now.getMonth()+1).toString().padStart(2,'0')}.${now.getFullYear()}`;
    doc.setFontSize(9);
    doc.text(dateStr, pageW - margin, 25, { align: 'right' });

    // ── ÖZET ────────────────────────────────────────────────
    let y = 50;
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Ozet', margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const summaryLines = doc.splitTextToSize(normalizeTR(analysis.summary), contentW);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 6 + 6;

    // ── KAZAN ─────────────────────────────────────────────
    const winnerLabel = analysis.winner === 'A' ? nameA : nameB;
    const winnerColor: [number, number, number] = analysis.winner === 'A' ? [37, 99, 235] : [79, 70, 229];
    doc.setFillColor(...winnerColor);
    doc.roundedRect(margin, y, contentW, 14, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Onerilir Secenek: ${winnerLabel}`, margin + 6, y + 9);
    y += 22;

    // ── KARŞILAŞTIRMA MATRİSİ ─────────────────────────────
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Karsilastirma Matrisi', margin, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [[
        { content: 'Metrik', styles: { fillColor: [30, 41, 59], textColor: [255,255,255], fontStyle: 'bold' } },
        { content: nameA, styles: { fillColor: [37, 99, 235], textColor: [255,255,255], fontStyle: 'bold' } },
        { content: nameB, styles: { fillColor: [79, 70, 229], textColor: [255,255,255], fontStyle: 'bold' } }
      ]],
      body: analysis.comparisonTable.map(row => [
        normalizeTR(row.metric),
        normalizeTR(String(row.optionA)),
        normalizeTR(String(row.optionB))
      ]),
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { textColor: [30, 41, 59], fontStyle: 'bold', fillColor: [248, 250, 252] },
        1: { textColor: [30, 58, 138], fillColor: [239, 246, 255] },
        2: { textColor: [46, 16, 101], fillColor: [245, 243, 255] }
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255]
      },
      headStyles: { halign: 'center' },
      bodyStyles: { halign: 'center' },
      columnStyles: {
        0: { halign: 'left', textColor: [30, 41, 59], fontStyle: 'bold', fillColor: [248, 250, 252] },
        1: { textColor: [30, 58, 138], fillColor: [239, 246, 255] },
        2: { textColor: [46, 16, 101], fillColor: [245, 243, 255] }
      }
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    // ── SKOR KARTEZİ (Bar Grafik) ─────────────────────────
    if (y + 80 > pageH - 20) { doc.addPage(); y = 20; }

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Skor Karsilastirmasi (0-10)', margin, y);
    y += 7;

    const barMaxW = contentW * 0.65;
    const rowH = 11;
    const labelW = contentW * 0.30;

    analysis.scorecard.forEach((s, i) => {
      if (y + rowH * 2 + 4 > pageH - 20) { doc.addPage(); y = 20; }
      const metricLabel = normalizeTR(s.metric);

      // Metrik etiketi
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(metricLabel, margin, y + rowH * 0.75);

      const barX = margin + labelW;
      const barH = 4.5;

      // A barı
      const wA = (s.scoreA / 10) * barMaxW;
      doc.setFillColor(37, 99, 235);
      doc.roundedRect(barX, y, wA, barH, 1, 1, 'F');
      doc.setTextColor(37, 99, 235);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(`${nameA.substring(0,12)}: ${s.scoreA}/10`, barX + wA + 2, y + barH - 0.5);

      // B barı
      const wB = (s.scoreB / 10) * barMaxW;
      doc.setFillColor(79, 70, 229);
      doc.roundedRect(barX, y + barH + 2, wB, barH, 1, 1, 'F');
      doc.setTextColor(79, 70, 229);
      doc.text(`${nameB.substring(0,12)}: ${s.scoreB}/10`, barX + wB + 2, y + barH * 2 + 1.5);

      y += rowH * 2 + 2;
    });

    y += 6;

    // ── GİZLİ MALİYETLER ─────────────────────────────────
    if (y + 40 > pageH - 20) { doc.addPage(); y = 20; }

    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(251, 191, 36);
    doc.roundedRect(margin, y, contentW, 10 + analysis.hiddenCosts.length * 8, 3, 3, 'FD');

    doc.setTextColor(120, 53, 15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Gizli Maliyetler & Riskler', margin + 5, y + 8);
    y += 14;

    analysis.hiddenCosts.forEach((cost) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(92, 45, 5);
      const lines = doc.splitTextToSize(`• ${normalizeTR(cost)}`, contentW - 10);
      doc.text(lines, margin + 5, y);
      y += lines.length * 5.5 + 1;
    });

    y += 8;

    // ── NİHAİ TAVSİYE ────────────────────────────────────
    if (y + 40 > pageH - 20) { doc.addPage(); y = 20; }

    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin, y, contentW, 12, 3, 3, 'F');
    doc.setTextColor(250, 204, 21);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Nihai Tavsiye', margin + 5, y + 8);
    y += 18;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    const recLines = doc.splitTextToSize(normalizeTR(analysis.finalRecommendation), contentW);
    doc.text(recLines, margin, y);
    y += recLines.length * 6;

    // ── FOOTER ───────────────────────────────────────────
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFillColor(248, 250, 252);
      doc.rect(0, pageH - 12, pageW, 12, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Ratio AI - Rasyonel Karar Analizi', margin, pageH - 4);
      doc.text(`Sayfa ${p} / ${totalPages}`, pageW - margin, pageH - 4, { align: 'right' });
    }

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
              <div className="lg:col-span-2 glass-card rounded-3xl p-6 bg-white shadow-lg">
                <h4 className="font-bold text-xl mb-6">Karşılaştırma Matrisi</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        {/* Metrik başlığı */}
                        <th className="py-4 px-3 text-left text-slate-500 font-semibold text-xs uppercase tracking-wider">
                          Metrik
                        </th>
                        {/* Seçenek A - Mavi ton */}
                        <th className="py-4 px-3 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-sm shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-blue-200 inline-block" />
                            {result.extractedOptions?.nameA || 'A'}
                          </span>
                        </th>
                        {/* Seçenek B - İndigo ton */}
                        <th className="py-4 px-3 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-indigo-200 inline-block" />
                            {result.extractedOptions?.nameB || 'B'}
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.comparisonTable.map((row, i) => (
                        <tr
                          key={i}
                          className={cn(
                            "border-b border-slate-100 transition-colors hover:bg-slate-50",
                            i % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                          )}
                        >
                          {/* Metrik hücresi */}
                          <td className="py-4 px-3 font-bold text-slate-700">{row.metric}</td>
                          {/* A değeri - mavi arka plan */}
                          <td className="py-4 px-3 text-center">
                            <span className="inline-block px-3 py-1 rounded-lg bg-blue-50 text-blue-800 font-semibold border border-blue-100">
                              {row.optionA}
                            </span>
                          </td>
                          {/* B değeri - indigo arka plan */}
                          <td className="py-4 px-3 text-center">
                            <span className="inline-block px-3 py-1 rounded-lg bg-indigo-50 text-indigo-800 font-semibold border border-indigo-100">
                              {row.optionB}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
