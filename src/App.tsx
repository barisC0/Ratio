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
      head: [['Metrik', analysis.extractedOptions?.nameA || 'A', analysis.extractedOptions?.nameB || 'B']],
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

  const categories = [
    {
      title: "Finansal İkilemler",
      examples: ["Dışarıdan yemek vs Evde yemek", "Yeni telefon vs Mevcut tamir", "Araba almak vs Taksi"]
    },
    {
      title: "Kariyer & Eğitim",
      examples: ["Yurtdışı yüksek lisans vs Türkiye'de iş", "Kurumsal vs Kendi işini kurmak", "Yeni dil vs Mevcut yetenek"]
    },
    {
      title: "Yaşam Tarzı",
      examples: ["Spor salonu vs Evde egzersiz", "Şehir merkezi vs Şehir dışı ev", "Hafta sonu tatil vs Dinlenmek"]
    },
    {
      title: "Alışkanlıklar",
      examples: ["Günlük kahve almak vs Evde demlemek", "Sigarayı bırakmak vs Devam", "Netflix aboneliği iptali"]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-display font-bold text-xl tracking-tight text-slate-900">
              Ratio <span className="text-indigo-600">AI</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-12">
        <div className="text-center mb-12">
          <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 mb-4">
            İçindeki İkilemi <br />
            <span className="text-indigo-600">Dök İçini Analiz Edelim.</span>
          </h2>
        </div>

        {!result ? (
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl p-8 bg-white shadow-xl border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <Brain className="w-6 h-6 text-indigo-600" />
                <h3 className="font-display font-bold text-xl">Düşüncen Nedir?</h3>
              </div>
              <textarea
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder="Örn: Starbucks'tan her gün kahve almak yerine evde demlesem ayda ne kadar tasarruf ederim?"
                className="w-full h-48 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 text-lg transition-all"
              />
              <button onClick={startListening} className="mt-2 flex items-center gap-2 text-sm text-indigo-600 font-bold hover:text-indigo-700">
                <Zap className="w-4 h-4" /> Sesle Anlat (Beta)
              </button>

              <div className="mt-8">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4" /> İlham Al
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category, idx) => (
                    <div key={idx} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <h5 className="text-xs font-bold text-slate-500 mb-2">{category.title}</h5>
                      <div className="flex flex-wrap gap-2">
                        {category.examples.map((example) => (
                          <button key={example} onClick={() => setThought(example)} className="text-xs bg-white hover:bg-indigo-50 border border-slate-200 p-2 rounded-lg transition-all">
                            {example}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="flex justify-center">
              <button onClick={handleCalculate} disabled={loading || !thought.trim()} className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-bold text-xl shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
                {loading ? <RefreshCcw className="animate-spin mr-2 inline" /> : <Zap className="w-6 h-6 text-yellow-400 mr-2 inline" />}
                {loading ? 'Analiz Ediliyor...' : 'Analizi Başlat'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className={cn("p-8 rounded-3xl border-2 shadow-2xl relative", result.winner === 'A' ? "bg-blue-50 border-blue-200" : "bg-indigo-50 border-indigo-200")}>
              <h3 className="text-3xl font-bold mb-4">{result.summary}</h3>
              <div className="flex gap-4 mt-8">
                <button onClick={reset} className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2">
                  <RefreshCcw className="w-4 h-4" /> Yeni Analiz
                </button>
                <button onClick={() => downloadPDF(result)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg">
                  <Calculator className="w-4 h-4" /> PDF Raporu İndir
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
                <h4 className="font-bold text-xl mb-6">Karşılaştırma Matrisi</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400">
                        <th className="py-4 px-2">Metrik</th>
                        <th className="py-4 px-2">{result.extractedOptions?.nameA || 'A'}</th>
                        <th className="py-4 px-2">{result.extractedOptions?.nameB || 'B'}</th>
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

              <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 min-h-[300px]">
                <h4 className="font-bold text-xl mb-6 text-center">Analiz Grafiği</h4>
                <div className="h-[250px] w-full" style={{ minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.scorecard.map(s => ({ name: s.metric, A: s.scoreA, B: s.scoreB }))} layout="vertical">
                      <XAxis type="number" domain={[0, 10]} hide />
                      <YAxis dataKey="name" type="category" width={80} fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="A" fill="#2563eb" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="B" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="mt-20 border-t border-slate-200 py-12 text-center text-slate-400 text-sm">
        <p>© 2026 Ratio AI. Veriyle karar ver, pişman olma.</p>
      </footer>
    </div>
  );
}
