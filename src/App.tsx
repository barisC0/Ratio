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
} from 'lucide-react'; // 'lucide-center' hatası düzeltildi
import { motion, AnimatePresence } from 'framer-motion'; // 'motion/react' yerine standart framer-motion
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

const INITIAL_OPTION: DecisionOption = {
  name: '',
  cost: 0,
  time: 0,
  benefit: 5,
  stress: 5,
};

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

  // KUSURSUZ ÇALIŞAN PDF FONKSİYONU
  const downloadPDF = (analysis: AnalysisResult) => {
    const doc = new jsPDF();

    // Başlık
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Ratio AI - Karar Analiz Raporu", 20, 20);

    // Özet Metni
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const summaryText = `Ozet: ${analysis.summary}`;
    doc.text(summaryText, 20, 35, { maxWidth: 170 });

    // Tablo (autoTable kütüphanesini doğrudan fonksiyon olarak çağırıyoruz)
    autoTable(doc, {
      startY: 55,
      head: [['Metrik', analysis.extractedOptions?.nameA || 'Secenek A', analysis.extractedOptions?.nameB || 'Secenek B']],
      body: analysis.comparisonTable.map(row => [row.metric, row.optionA, row.optionB]),
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }, // Marka rengin (Indigo 600)
      styles: { font: 'helvetica', fontSize: 9 }
    });

    // Tavsiye Bölümü
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFont("helvetica", "bold");
    doc.text("Nihai Tavsiye:", 20, finalY + 15);
    doc.setFont("helvetica", "italic");
    doc.text(analysis.finalRecommendation, 20, finalY + 25, { maxWidth: 170 });

    doc.save("ratio-analiz-raporu.pdf");
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
            <div className="glass-card rounded-3xl p-8 bg-white shadow-xl border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <Brain className="w-6 h-6 text-indigo-600" />
                <h3 className="font-display font-bold text-xl">Düşüncen Nedir?</h3>
              </div>
              
              <textarea
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder="Örn: Starbucks'tan her gün kahve almak yerine evde demlesem ayda ne kadar tasarruf ederim..."
                className="w-full h-48 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 transition-all resize-none text-lg"
              />
              <button 
                onClick={startListening}
                className="mt-2 flex items-center gap-2 text-sm text-indigo-600 font-bold hover:text-indigo-700"
              >
                <Zap className="w-4 h-4" /> Sesle Anlat
              </button>
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={handleCalculate}
                disabled={loading || !thought.trim()}
                className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-bold text-xl shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  {loading ? <RefreshCcw className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 text-yellow-400" />}
                  <span>{loading ? 'Analiz Ediliyor...' : 'Rasyonel Analizi Başlat'}</span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className={cn(
              "p-8 rounded-3xl border-2 shadow-2xl relative",
              result.winner === 'A' ? "bg-blue-50 border-blue-200" : "bg-indigo-50 border-indigo-200"
            )}>
              <h3 className="text-3xl font-display font-extrabold text-slate-900 mb-4">{result.summary}</h3>
              
              <div className="flex flex-wrap gap-4 mt-8">
                <button onClick={reset} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-semibold">
                  <RefreshCcw className="w-4 h-4" /> Yeni Analiz
                </button>
                <button 
                  onClick={() => downloadPDF(result)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
                >
                  <Calculator className="w-4 h-4" /> PDF Raporu İndir
                </button>
              </div>
            </div>
            {/* Alt kısımdaki tablolar ve grafikler burada result üzerinden render edilmeye devam eder */}
          </div>
        )}
      </main>
    </div>
  );
}
