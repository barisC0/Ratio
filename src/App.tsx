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
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text("Ratio AI - Karar Analiz Raporu", 20, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Ozet: ${analysis.summary}`, 20, 35, { maxWidth: 170 });

    autoTable(doc, {
      startY: 55,
      head: [['Metrik', analysis.extractedOptions?.nameA || 'Secenek A', analysis.extractedOptions?.nameB || 'Secenek B']],
      body: analysis.comparisonTable.map(row => [row.metric, row.optionA, row.optionB]),
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 9 }
    });

    doc.save("ratio-analiz.pdf");
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

              {/* Orijinal Kategoriler Bloğu Geri Geldi */}
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
                {/* PDF Butonu Çalışır Vaziyette */}
                <button onClick={() => downloadPDF(result)} className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors shadow-lg">
                  <Calculator className="w-4 h-4" /> PDF Raporu İndir
                </button>
              </div>
            </div>

            {/* Karşılaştırma Grid ve Grafik Alanı */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-card rounded-3xl p-6 bg-white shadow-lg">
                <h4 className="font-bold text-xl mb-6">Karşılaştırma Matrisi</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400">
                        <th className="py-4 px-2">Metrik</th>
                        <th className="py-4 px-2 text-blue-600">{result.extractedOptions?.nameA || 'A'}</th>
                        <th className="py-4 px-2 text-indigo-600">{result.extractedOptions?.nameB || 'B'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {result.comparisonTable.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="py-4 px-2 font-bold">{row.metric}</td>
                          <td className="py-4 px-2">{row.optionA}</td>
                          <td className="py-4 px-2">{row.optionB}</td>
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
