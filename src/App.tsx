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
} from 'lucide-center'; // Not: lucide-react olduğundan emin ol, hata alırsan düzeltirsin
import { motion, AnimatePresence } from 'motion/react';
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

// ... (INITIAL_OPTION kısmı aynı kalacak)
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

  // DÜZELTİLMİŞ PDF FONKSİYONU
  const downloadPDF = (analysis: AnalysisResult) => {
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.text("Ratio Analiz Raporu", 20, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Ozet: ${analysis.summary}`, 20, 30, { maxWidth: 170 });

    autoTable(doc, {
      startY: 50,
      head: [['Metrik', analysis.extractedOptions?.nameA || 'Secenek A', analysis.extractedOptions?.nameB || 'Secenek B']],
      body: analysis.comparisonTable.map(row => [row.metric, row.optionA, row.optionB]),
      theme: 'grid',
      styles: { fontSize: 9 }
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
      {/* ... Header Kısmı Aynı ... */}
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
        {/* ... Başlık Kısmı Aynı ... */}
        <div className="text-center mb-12">
           <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 mb-4">
            İçindeki İkilemi <br />
            <span className="text-brand-600">Dök İçini Analiz Edelim.</span>
          </h2>
        </div>

        {!result ? (
          <div className="space-y-8">
            <div className="glass-card rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Brain className="w-6 h-6 text-brand-600" />
                <h3 className="font-display font-bold text-xl">Düşüncen Nedir?</h3>
              </div>
              
              <textarea
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder="Örn: Starbucks'tan her gün kahve almak yerine evde demlesem ayda ne kadar tasarruf ederim..."
                className="w-full h-48 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-500 transition-all resize-none text-lg"
              />
              <button 
                onClick={startListening}
                className="mt-2 flex items-center gap-2 text-sm text-brand-600 font-bold hover:text-brand-700"
              >
                <Zap className="w-4 h-4" /> Sesle Anlat
              </button>
              {/* ... Örnekler Kısmı Aynı ... */}
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
            {/* Result Summary */}
            <div className={cn(
              "p-8 rounded-3xl border-2 shadow-2xl relative",
              result.winner === 'A' ? "bg-blue-50 border-blue-200" : "bg-indigo-50 border-indigo-200"
            )}>
              <h3 className="text-3xl font-display font-extrabold text-slate-900 mb-4">{result.summary}</h3>
              
              <div className="flex flex-wrap gap-4 mt-8">
                <button onClick={reset} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-semibold">
                  <RefreshCcw className="w-4 h-4" /> Yeni Analiz
                </button>
                {/* PDF BUTONU BURADA */}
                <button 
                  onClick={() => downloadPDF(result)}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors"
                >
                  <Calculator className="w-4 h-4" /> PDF Raporu İndir
                </button>
              </div>
            </div>

            {/* ... Geri Kalan Grid ve Tablo Yapısı Aynı ... */}
            {/* Not: result.comparisonTable.map gibi kısımlarını koduna göre devam ettir */}
          </div>
        )}
      </main>
    </div>
  );
}
