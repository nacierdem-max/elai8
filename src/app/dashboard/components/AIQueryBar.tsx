'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, X, Loader2, Sparkles, Zap, ChevronDown, ChevronUp } from 'lucide-react';

const QUICK_QUERIES = [
  'Haziran\'da en çok iş yükü olan ilk 5 kişi?',
  'Enerji İzleme projesinde plan dışı işler?',
  'Hangi departmanda çakışan görev var?',
  'Son 60 günde kaç görev gecikti?',
];

const MOCK_RESPONSES: Record<string, string> = {
  "Haziran'da en çok iş yükü olan ilk 5 kişi?": '🔴 Temmuz kritik! Aytem Çelik (12 görev), Temen Yıldız (9), Ahmet Yılmaz (8), Melih Şahin (8), Elif Kaya (7) — Aytem ve Temen\'de görev çakışması tespit edildi. Bazı işlerin Ağustos\'a kaydırılması önerilir.',
  'Enerji İzleme projesinde plan dışı işler?': '⚠️ Enerji İzleme\'de 3 plan dışı görev: "Enerji Sapma Analizi" (Temen Yıldız, -4 gün gecikme), "Batarya Kalibrasyon" (Nesrin Tetik), "Ölçüm Sapma Testi" (Elif Kaya). Toplam etkilenen: 5 personel, 2 departman.',
  'Hangi departmanda çakışan görev var?': '📊 Elektronik: 4 çakışma (Mart-Mayıs), Yazılım: 6 çakışma (Haziran-Temmuz), Test: 3 çakışma (Nisan). En kritik: Yazılım departmanında Aytem Çelik ve Seda Arman üst üste 3 projede yer alıyor.',
  'Son 60 günde kaç görev gecikti?': '🔴 Son 60 günde 39 görev gecikti. Ortak neden: PCB stok sıkıntısı (12 görev), firmware hataları (8 görev), kaynak yetersizliği (11 görev), dış bağımlılık (8 görev). Önerim: Tedarik süreçlerini 2 hafta öne alın.',
};

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  time: string;
}

export default function AIQueryBar() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const now = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleQuery = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setQuery('');
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text: trimmed, time: now() };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsThinking(false);
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 900));
    const response = MOCK_RESPONSES[trimmed] || `"${trimmed}" sorgusu için analiz tamamlandı. Detaylı rapor için Analytics sayfasına gidin.`;
    const aiMsg: Message = { id: `a-${Date.now()}`, role: 'ai', text: response, time: now() };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#0071e320', background: 'linear-gradient(135deg, #f0f7ff 0%, #fafbff 60%, #fff 100%)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 cursor-pointer"
        style={{ borderBottom: expanded ? '1px solid #0071e315' : 'none', background: 'rgba(0,113,227,0.04)' }}
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #0071e3 0%, #5ac8fa 100%)' }}>
              <Brain size={18} className="text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-ping" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">AI İş Asistanı</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#e8f0fb', color: '#0071e3' }}>
                <Zap size={9} className="inline mr-0.5" />
                Aktif
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Görev, proje ve ekip analizleri için doğal dilde sorun</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <span className="text-xs text-muted-foreground">{messages.length} mesaj</span>
          )}
          {expanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <>
          {/* Messages */}
          {messages.length > 0 && (
            <div className="px-5 py-4 space-y-3 max-h-64 overflow-y-auto">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {msg.role === 'ai' && (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #0071e3, #5ac8fa)' }}>
                      <Brain size={13} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                    style={{
                      background: msg.role === 'user' ? '#0071e3' : 'white',
                      color: msg.role === 'user' ? 'white' : '#1d1d1f',
                      border: msg.role === 'ai' ? '1px solid #e8e8ed' : 'none',
                    }}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className="text-xs mt-1 opacity-60">{msg.time}</p>
                  </div>
                </div>
              ))}
              {(isThinking || isLoading) && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #0071e3, #5ac8fa)' }}>
                    <Brain size={13} className="text-white" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-white border border-border">
                    {isThinking ? (
                      <div className="flex gap-1 items-center">
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 size={12} className="animate-spin text-primary" />
                        Veri analiz ediliyor...
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input */}
          <div className="px-5 pb-4 pt-3 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Sparkles size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60" />
                <input
                  type="text"
                  placeholder="Örn: Haziran'da en çok iş yükü olan 5 kişi kim?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && query.trim()) handleQuery(query); }}
                  className="w-full rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none transition-all"
                  style={{ background: 'white', border: '1px solid #d2d2d7', color: '#1d1d1f' }}
                />
                {query && (
                  <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={() => query.trim() && handleQuery(query)}
                disabled={isLoading || isThinking || !query.trim()}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 flex items-center gap-2 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #0071e3, #5ac8fa)' }}
              >
                {(isLoading || isThinking) ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>

            {/* Quick queries */}
            <div className="flex flex-wrap gap-2">
              {QUICK_QUERIES.map((q) => (
                <button
                  key={`qquery-${q.slice(0, 20)}`}
                  onClick={() => handleQuery(q)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                  style={{ background: '#e8f0fb', color: '#0071e3' }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}