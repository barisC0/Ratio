import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Mic, Wallet, Briefcase, Heart, Repeat, Zap } from 'lucide-react';

const RatioLanding = () => {
  const [text, setText] = useState('');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Özel CSS Animasyonları */}
      <style dangerouslySetInnerHTML={{ __html: `
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
      `}} />

      {/* Arka Plan Izgarası ve Noise */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:40px_40px]"></div>
      
      {/* Üst Kayan Yazı */}
      <div className="relative z-10 bg-white text-black py-2 border-b-4 border-white overflow-hidden whitespace-nowrap">
        <div className="animate-marquee font-bold text-sm uppercase">
          KARAR VERMEK ZOR GELİYOR? • YAPAY ZEKA SANA YARDIM ETSİN • RASYONEL ANALİZ • İÇİNDEKİ İKİLEMİ ÇÖZ • KARAR VERMEK ZOR GELİYOR? • YAPAY ZEKA SANA YARDIM ETSİN • 
        </div>
      </div>

      {/* Navigasyon */}
      <nav className="relative z-10 border-b-4 border-white bg-black p-6 font-main">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white flex items-center justify-center border-3 border-white shadow-[8px_8px_0px_0px_white]">
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

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-16 font-main">
        {/* Hero Bölümü */}
        <div className="mb-20">
          <h1 className="font-display font-black text-6xl md:text-8xl leading-none mb-8">
            İÇİNDEKİ<br />
            <span className="text-stroke">İKİLEMİ</span><br />
            DÖK.
          </h1>
          <p className="text-xl text-gray-400 max-w-xl border-l-4 border-white pl-6 font-mono">
            Karar verme sürecini yapay zeka ile rasyonelleştir. En doğru seçimi verilerle yap.
          </p>
        </div>

        {/* Giriş Alanı */}
        <div className="border-4 border-white shadow-[8px_8px_0px_0px_white] bg-black p-8 md:p-12 mb-16 max-w-3xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-white flex items-center justify-center">
              <Sparkles size={24} className="text-black" />
            </div>
            <h2 className="text-3xl font-display font-bold uppercase">DÜŞÜNCEN NEDİR?</h2>
          </div>
          
          <textarea 
            className="w-full h-48 border-4 border-white bg-transparent p-6 text-lg resize-none focus:outline-none focus:border-[#0066ff] focus:shadow-[6px_6px_0px_0px_#0066ff] transition-all font-mono"
            placeholder="Örn: Starbucks'tan her gün kahve almak yerine..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
          
          <div className="flex items-center justify-between mt-6">
            <button className="flex items-center gap-3 px-6 py-3 border-2 border-white hover:bg-white hover:text-black transition-colors font-bold uppercase">
              <Mic size={20} />
              SESLE ANLAT
            </button>
            <span className="text-gray-500 font-mono">{text.length}/500</span>
          </div>
        </div>

        {/* Kategoriler Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Finans */}
          <div className="border-4 border-white shadow-[8px_8px_0px_0px_white] bg-black p-6 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_#ccff00] transition-all group">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-400 flex items-center justify-center"><Wallet size={20} className="text-black"/></div>
              <h3 className="font-display font-bold text-xl uppercase">Finansal İkilemler</h3>
            </div>
            <div className="space-y-3">
              {["Dışarıdan yemek söylemek vs Evde yemek", "Yeni telefon vs Tamir", "Araba vs Taksi/Toplu Taşıma"].map(item => (
                <div key={item} className="bg-white text-black p-3 font-bold uppercase text-xs cursor-pointer hover:bg-[#ccff00] hover:rotate-[-2deg] transition-all">
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Kariyer */}
          <div className="border-4 border-white shadow-[8px_8px_0px_0px_white] bg-black p-6 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_#0066ff] transition-all group">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-400 flex items-center justify-center"><Briefcase size={20} className="text-black"/></div>
              <h3 className="font-display font-bold text-xl uppercase">Kariyer & Eğitim</h3>
            </div>
            <div className="space-y-3">
              {["Yurtdışı Yüksek Lisans vs İş", "Kurumsal vs Kendi İşin", "Yeni Dil vs Mevcut Yetenek"].map(item => (
                <div key={item} className="bg-white text-black p-3 font-bold uppercase text-xs cursor-pointer hover:bg-[#0066ff] hover:text-white hover:rotate-[2deg] transition-all">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Buton */}
        <div className="flex justify-center py-12">
          <button className="bg-[#0066ff] border-4 border-white shadow-[8px_8px_0px_0px_white] hover:bg-[#ff0066] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_#ccff00] active:translate-x-[4px] active:translate-y-[4px] transition-all px-16 py-8 text-2xl font-black flex items-center gap-4 uppercase">
            <Zap size={32} />
            RASYONEL ANALİZİ BAŞLAT
          </button>
        </div>
      </main>

      {/* Alt Kayan Yazı */}
      <div className="bg-white text-black py-3 border-t-4 border-white mt-20 overflow-hidden whitespace-nowrap">
        <div className="animate-marquee-reverse font-bold text-lg uppercase">
          ANALİZ ET • KARAR VER • HAREKETE GEÇ • ANALİZ ET • KARAR VER • HAREKETE GEÇ • 
        </div>
      </div>
    </div>
  );
};

export default RatioLanding;
