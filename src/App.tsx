import { jsPDF } from "jspdf";
import "jspdf-autotable";
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

  const downloadPDF = (analysis: AnalysisResult) => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("Ratio AI - Karar Analiz Raporu", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Ozet: ${analysis.summary}`, 20, 40);
    doc.text(`Nihai Tavsiye: ${analysis.finalRecommendation}`, 20, 55);

    (doc as any).autoTable({
      startY: 70,
      head: [['Metrik', analysis.extractedOptions?.nameA || 'Secenek A', analysis.extractedOptions?.nameB || 'Secenek B']],
      body: analysis.comparisonTable.map(row => [row.metric, row.optionA, row.optionB]),
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
          <div className="text-xs font-mono text-slate-500 hidden sm:block">
            
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-12">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 mb-4"
          >
            İçindeki İkilemi <br />
            <span className="text-brand-600">Dök İçini Analiz Edelim.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-600 text-lg max-w-2xl mx-auto"
          >
            "Yurtdışına mı gitsem yoksa burada kalıp terfi mi kovalasam?" veya 
            "iPhone 15 mi alsam yoksa o parayla tatile mi çıksam?" gibi ikilemlerini yaz.
          </motion.p>
        </div>

        {!result ? (
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-3xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Brain className="w-6 h-6 text-brand-600" />
                <h3 className="font-display font-bold text-xl">Düşüncen Nedir?</h3>
              </div>
              
              <textarea
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder="Örn: Starbucks'tan her gün kahve almak yerine evde demlesem ayda ne kadar tasarruf ederim ve buna değer mi? Yoksa o sosyal ortamın keyfi paha biçilemez mi?"
                className="w-full h-48 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-500 transition-all resize-none text-lg leading-relaxed"
              />
              <button 
  onClick={startListening}
  className="mt-2 flex items-center gap-2 text-sm text-brand-600 font-bold hover:text-brand-700"
>
  <Zap className="w-4 h-4" /> Sesle Anlat
</button>

              <div className="mt-8">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Nereden Başlamalı? (İlham Al)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      title: "Finansal İkilemler",
                      examples: [
                        "Dışarıdan yemek söylemek vs Evde yemek yapmak",
                        "Yeni bir telefon almak vs Mevcut olanı tamir ettirmek",
                        "Araba satın almak vs Taksi/Toplu taşıma kullanmak"
                      ]
                    },
                    {
                      title: "Kariyer & Eğitim",
                      examples: [
                        "Yurtdışında yüksek lisans vs Türkiye'de işe girmek",
                        "Kurumsal işe devam etmek vs Kendi işini kurmak",
                        "Yeni bir dil öğrenmek vs Mevcut yetenekleri geliştirmek"
                      ]
                    },
                    {
                      title: "Yaşam Tarzı",
                      examples: [
                        "Spor salonu üyeliği vs Evde egzersiz yapmak",
                        "Şehir merkezinde yaşamak vs Şehir dışında bahçeli ev",
                        "Hafta sonu tatile gitmek vs Evde dinlenmek"
                      ]
                    },
                    {
                      title: "Alışkanlıklar",
                      examples: [
                        "Her gün kahve satın almak vs Evde demlemek",
                        "Sigarayı bırakmak vs Devam etmek (Maliyet/Sağlık)",
                        "Abonelik servislerini (Netflix vb.) iptal etmek"
                      ]
                    }
                  ].map((category, idx) => (
                    <div key={idx} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <h5 className="text-xs font-bold text-slate-500 mb-2">{category.title}</h5>
                      <div className="flex flex-wrap gap-2">
                        {category.examples.map((example) => (
                          <button 
                            key={example}
                            onClick={() => setThought(example)}
                            className="text-xs bg-white hover:bg-brand-50 hover:text-brand-600 border border-slate-200 hover:border-brand-200 text-slate-600 px-3 py-1.5 rounded-xl transition-all text-left"
                          >
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
              <button
                onClick={handleCalculate}
                disabled={loading || !thought.trim()}
                className={cn(
                  "group relative px-12 py-5 bg-slate-900 text-white rounded-2xl font-bold text-xl shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100",
                  loading && "cursor-wait"
                )}
              >
                <div className="flex items-center gap-3">
                  {loading ? (
                    <RefreshCcw className="w-6 h-6 animate-spin" />
                  ) : (
                    <Zap className="w-6 h-6 text-yellow-400 group-hover:animate-pulse" />
                  )}
                  <span>{loading ? 'Analiz Ediliyor...' : 'Rasyonel Analizi Başlat'}</span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Result Summary */}
            <div className={cn(
              "p-8 rounded-3xl border-2 shadow-2xl overflow-hidden relative",
              result.winner === 'A' ? "bg-blue-50 border-blue-200" : 
              result.winner === 'B' ? "bg-indigo-50 border-indigo-200" : 
              "bg-slate-50 border-slate-200"
            )}>
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <TrendingUp className="w-32 h-32" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className={cn(
                    "w-6 h-6",
                    result.winner === 'A' ? "text-blue-600" : "text-indigo-600"
                  )} />
                  <span className="font-bold uppercase tracking-widest text-sm text-slate-500">Analiz Tamamlandı</span>
                </div>
                
                <h3 className="text-3xl font-display font-extrabold text-slate-900 mb-4">
                  {result.summary}
                </h3>
                
                <div className="flex flex-wrap gap-4 mt-8">
                  <button 
                    onClick={reset}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Yeni Analiz
                  </button>
                </div>
              </div>
            </div>
            <button 
  onClick={() => downloadPDF(result)}
  className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors"
>
  <Calculator className="w-4 h-4" />
  PDF Raporu İndir
</button>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Table */}
              <div className="lg:col-span-2 glass-card rounded-3xl p-6">
                <h4 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-brand-600" />
                  Karşılaştırma Matrisi
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-4 px-2 text-slate-400 font-medium text-sm uppercase tracking-wider">Metrik</th>
                        <th className="text-left py-4 px-2 text-blue-600 font-bold">{result.extractedOptions?.nameA || 'Seçenek A'}</th>
                        <th className="text-left py-4 px-2 text-indigo-600 font-bold">{result.extractedOptions?.nameB || 'Seçenek B'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {result.comparisonTable.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-2 font-semibold text-slate-700">{row.metric}</td>
                          <td className="py-4 px-2 text-slate-600">{row.optionA}</td>
                          <td className="py-4 px-2 text-slate-600">{row.optionB}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Visualization */}
              <div className="glass-card rounded-3xl p-6">
                <h4 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-brand-600" />
                  Görsel Analiz
                </h4>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={result.scorecard.map(s => ({
                        name: s.metric,
                        A: s.scoreA,
                        B: s.scoreB
                      }))}
                      layout="vertical"
                      margin={{ left: 20, right: 20 }}
                    >
                      <XAxis type="number" domain={[0, 10]} hide />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        fontSize={12} 
                        width={100}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar 
                        dataKey="A" 
                        name={result.extractedOptions?.nameA || 'Seçenek A'} 
                        fill="#2563eb" 
                        radius={[0, 4, 4, 0]} 
                        barSize={12}
                      />
                      <Bar 
                        dataKey="B" 
                        name={result.extractedOptions?.nameB || 'Seçenek B'} 
                        fill="#4f46e5" 
                        radius={[0, 4, 4, 0]} 
                        barSize={12}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-center gap-6 text-xs font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-sm" />
                    <span className="text-blue-600">{result.extractedOptions?.nameA || 'A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-600 rounded-sm" />
                    <span className="text-indigo-600">{result.extractedOptions?.nameB || 'B'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hidden Costs & Recommendation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-amber-50 border border-amber-100 rounded-3xl p-8">
                <h4 className="font-display font-bold text-xl text-amber-900 mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                  Gizli Maliyet Uyarıları
                </h4>
                <ul className="space-y-4">
                  {result.hiddenCosts.map((cost, i) => (
                    <li key={i} className="flex gap-3 text-amber-800">
                      <ArrowRight className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-50" />
                      <p className="leading-relaxed">{cost}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 opacity-10">
                  <Brain className="w-48 h-48" />
                </div>
                <h4 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  Nihai Tavsiye
                </h4>
                <div className="text-lg leading-relaxed text-slate-300 italic">
                  <Markdown>
                    {result.finalRecommendation}
                  </Markdown>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-800 text-sm text-slate-500 font-mono">
                 
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 py-12 text-center text-slate-400 text-sm">
        <p>© 2026 Ratio AI. Rasyonellik bir tercihtir.</p>
      </footer>
    </div>
  );
}

function OptionCard({ title, option, setOption, color }: { 
  title: string, 
  option: DecisionOption, 
  setOption: (o: DecisionOption) => void,
  color: 'blue' | 'indigo'
}) {
  const handleChange = (field: keyof DecisionOption, value: string | number) => {
    setOption({ ...option, [field]: value });
  };

  const accentColor = color === 'blue' ? 'text-blue-600' : 'text-indigo-600';
  const bgAccent = color === 'blue' ? 'bg-blue-50' : 'bg-indigo-50';
  const borderAccent = color === 'blue' ? 'focus:border-blue-500' : 'focus:border-indigo-500';

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-card rounded-3xl p-8 transition-all"
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className={cn("font-display font-extrabold text-2xl", accentColor)}>{title}</h3>
        <div className={cn("p-2 rounded-xl", bgAccent)}>
          <Brain className={cn("w-6 h-6", accentColor)} />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">İsim</label>
          <input 
            type="text" 
            value={option.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Örn: Dışarıda Yemek"
            className={cn("w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all", borderAccent)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Maliyet (TL)
            </label>
            <input 
              type="number" 
              value={option.cost || ''}
              onChange={(e) => handleChange('cost', Number(e.target.value))}
              placeholder="0"
              className={cn("w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all", borderAccent)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Zaman (Dk)
            </label>
            <input 
              type="number" 
              value={option.time || ''}
              onChange={(e) => handleChange('time', Number(e.target.value))}
              placeholder="0"
              className={cn("w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all", borderAccent)}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Fayda / Keyif</label>
            <span className={cn("font-bold", accentColor)}>{option.benefit}/10</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={option.benefit}
            onChange={(e) => handleChange('benefit', Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 uppercase font-bold">
            <span>Düşük</span>
            <span>Yüksek</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Stres / Efor</label>
            <span className="font-bold text-red-500">{option.stress}/10</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={option.stress}
            onChange={(e) => handleChange('stress', Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 uppercase font-bold">
            <span>Huzurlu</span>
            <span>Yorucu</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
