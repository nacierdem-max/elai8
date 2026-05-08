'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { RISKS, PERSONS, PROJECTS, TASKS, type Risk, type RiskStatus } from '@/data/mockData';
import { AlertTriangle, Search, X, ChevronRight, FileText, User, Calendar, Sparkles, Brain, Zap, CheckCircle2, TrendingUp, ShieldAlert, Bot, Send, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';


const RISK_STATUS_COLORS: Record<RiskStatus, string> = {
  'Açık': '#ef4444',
  'Riskli': '#f97316',
  'Çözüm Aranıyor': '#eab308',
  'Kapatıldı': '#22c55e',
};

const AI_RISK_INSIGHTS = [
  { id: 1, type: 'critical', icon: '🔴', text: 'Yazılım Lisans Süresi riski Haziran sonunda kritik eşiğe ulaşıyor — hemen aksiyon alınmalı.', action: 'Lisans Yenile', time: '2 dk önce' },
  { id: 2, type: 'warning', icon: '🟡', text: 'Saha Ekipman Arızası ve Mekanik Tolerans Sapması aynı projeyi etkiliyor — çakışma tespit edildi.', action: 'Detay Gör', time: '5 dk önce' },
  { id: 3, type: 'info', icon: '🔵', text: 'Bu hafta 3 yeni risk açıldı. Ortalama çözüm süresi 8.4 gün — geçen haftaya göre %12 iyileşme.', action: 'Rapor Al', time: '12 dk önce' },
  { id: 4, type: 'success', icon: '🟢', text: 'Donanım Entegrasyon Hatası başarıyla kapatıldı. AI önerilen çözüm yolu uygulandı.', action: 'Görüntüle', time: '1 saat önce' },
];

const AI_QUICK_ACTIONS = [
  { label: 'Kritik riskleri özetle', query: 'kritik' },
  { label: 'Bu haftaki açık riskler', query: 'açık' },
  { label: 'Sorumlu ata öner', query: 'sorumlu' },
  { label: 'Risk raporu oluştur', query: 'rapor' },
];

const AI_RESPONSES: Record<string, string> = {
  kritik: '🔴 Şu an 4 kritik risk aktif: "Yazılım Lisans Süresi" (Haziran sonu), "Otomasyon PLC Uyumsuzluğu" (protokol hatası), "Güç Kaynağı Aşırı Isınma" (85°C+), "Lojistik Gecikme Riski" (sunucu teslimatı). Öncelik sırası bu şekilde. İlk ikisi için acil aksiyon planı oluşturuldu.',
  açık: '📋 Bu hafta 7 açık risk var. En eskisi "PCB Stok Sıkıntısı" (18 gün). Ortalama yaş: 11.2 gün. 3 risk sorumlu atanmayı bekliyor. Önerim: Aytem Çelik ve Temen Yıldız bu riskleri üstlenebilir — iş yükleri uygun.',
  sorumlu: '👤 Sorumlu önerileri: "Yazılım Lisans" → Ahmet Yılmaz (Yazılım, müsait), "PLC Uyumsuzluğu" → Melih Şahin (Otomasyon uzmanı), "Güç Kaynağı" → Elif Kaya (Donanım, 2 aktif görev). Atama yapmamı ister misiniz?',
  rapor: '📊 Risk raporu hazırlandı: 15 toplam risk, 8 açık/riskli, 4 kritik, 3 kapatıldı. En riskli proje: Saha Mobile App (3 risk). En çok etkilenen departman: Yazılım (5 risk). Tahmini çözüm süresi: 14.3 gün ortalama. PDF olarak indirmek ister misiniz?',
};

interface RiskModalProps {
  risk: Risk;
  onClose: () => void;
}

function RiskModal({ risk, onClose }: RiskModalProps) {
  const assignee = PERSONS.find(p => p.id === risk.assigneeId);
  const project = PROJECTS.find(p => p.id === risk.projectId);
  const task = TASKS.find(t => t.id === risk.taskId);
  const statusColor = RISK_STATUS_COLORS[risk.status] || '#94a3b8';
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  const aiSuggestions: Record<RiskStatus, string> = {
    'Açık': `Bu risk için AI önerisi: Sorumlu kişiyle acil toplantı planla, etkilenen projeye geçici kaynak ata ve 48 saat içinde durum güncellemesi talep et. Benzer geçmiş risklerde bu yaklaşım %78 başarı sağladı.`,
    'Riskli': `Bu risk izleme altında. AI tavsiyesi: Günlük kontrol noktası ekle, yedek plan hazırla. Mevcut trend devam ederse 5 gün içinde "Açık" statüsüne geçebilir.`,
    'Çözüm Aranıyor': `AI 3 çözüm yolu tespit etti: 1) Tedarikçi değiştir (7 gün), 2) Geçici workaround uygula (2 gün), 3) Proje kapsamını daralt (hemen). En hızlı çözüm için seçenek 2 önerilir.`,
    'Kapatıldı': `Risk başarıyla kapatıldı. AI analizi: Çözüm süresi 12 gün (ortalama 14.3 gün). Bu çözüm yolu gelecekteki benzer riskler için şablon olarak kaydedildi.`,
  };

  const handleAISuggest = async () => {
    setLoadingAI(true);
    await new Promise(r => setTimeout(r, 1200));
    setAiSuggestion(aiSuggestions[risk.status] || 'AI analiz tamamlandı.');
    setLoadingAI(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div>
            <span
              className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2"
              style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
            >
              {risk.status}
            </span>
            <h2 className="text-lg font-bold text-foreground">{risk.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{risk.description}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 rounded-xl p-3 border border-border">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><User size={11} /> Sorumlu</p>
              <p className="text-sm font-semibold text-foreground">{assignee?.name}</p>
              <p className="text-xs text-muted-foreground">{assignee?.department}</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 border border-border">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar size={11} /> Tarih</p>
              <p className="text-sm font-semibold text-foreground">{risk.date}</p>
            </div>
          </div>

          {project && (
            <Link href="/projects" onClick={onClose} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/60 border border-border transition-all cursor-pointer">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Proje</p>
                <p className="text-sm font-semibold text-foreground">{project.name}</p>
              </div>
              <ChevronRight size={14} className="text-muted-foreground" />
            </Link>
          )}

          {task && (
            <Link href="/task-kanban-panel" onClick={onClose} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/60 border border-border transition-all cursor-pointer">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">İlgili Görev</p>
                <p className="text-sm font-semibold text-foreground">{task.name}</p>
              </div>
              <ChevronRight size={14} className="text-muted-foreground" />
            </Link>
          )}

          {risk.fileCount > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border">
              <FileText size={14} className="text-cyan-400" />
              <span className="text-sm text-foreground">{risk.fileCount} ekli dosya</span>
              <Link href="/files" onClick={onClose} className="ml-auto text-xs text-primary hover:underline">Görüntüle</Link>
            </div>
          )}

          {/* AI Suggestion */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10">
              <div className="flex items-center gap-2">
                <Bot size={14} className="text-primary" />
                <span className="text-xs font-semibold text-primary">AI Asistan Önerisi</span>
              </div>
              <button
                onClick={handleAISuggest}
                disabled={loadingAI}
                className="text-xs px-3 py-1 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-1"
              >
                {loadingAI ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                {loadingAI ? 'Analiz...' : 'Analiz Et'}
              </button>
            </div>
            <div className="px-4 py-3 min-h-[48px]">
              {loadingAI ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 size={12} className="animate-spin text-primary" />
                  AI risk analizi yapıyor...
                </div>
              ) : aiSuggestion ? (
                <p className="text-xs text-foreground leading-relaxed">{aiSuggestion}</p>
              ) : (
                <p className="text-xs text-muted-foreground italic">Bu risk için AI analizi başlatmak üzere "Analiz Et" butonuna tıklayın.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RisksPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Tümü');
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [pulseActive, setPulseActive] = useState(true);
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setPulseActive(p => !p), 3000);
    return () => clearInterval(interval);
  }, []);

  const statuses = ['Tümü', 'Açık', 'Riskli', 'Çözüm Aranıyor', 'Kapatıldı'];

  const allRisks: Risk[] = [
    ...RISKS,
    { id: 'rsk-009', title: 'Yazılım Lisans Süresi', projectId: 'prj-003', taskId: 'tsk-003', assigneeId: 'p-017', date: '10.05.2026', status: 'Açık', description: 'SCADA yazılım lisansı Haziran sonunda doluyor, yenileme süreci başlatılmalı.', fileCount: 1 },
    { id: 'rsk-010', title: 'Saha Ekipman Arızası', projectId: 'prj-004', taskId: 'tsk-014', assigneeId: 'p-039', date: '08.05.2026', status: 'Riskli', description: 'Saha test cihazlarından 2 tanesi kalibrasyon dışına çıktı.', fileCount: 0 },
    { id: 'rsk-011', title: 'Mekanik Tolerans Sapması', projectId: 'prj-006', taskId: 'tsk-008', assigneeId: 'p-031', date: '05.05.2026', status: 'Çözüm Aranıyor', description: 'Termal yönetim modülü mekanik parçalarında ±0.05mm tolerans aşımı.', fileCount: 2 },
    { id: 'rsk-012', title: 'Otomasyon PLC Uyumsuzluğu', projectId: 'prj-007', taskId: 'tsk-016', assigneeId: 'p-049', date: '03.05.2026', status: 'Açık', description: 'IoT Gateway ile mevcut PLC versiyonu arasında protokol uyumsuzluğu.', fileCount: 1 },
    { id: 'rsk-013', title: 'Donanım Entegrasyon Hatası', projectId: 'prj-005', taskId: 'tsk-015', assigneeId: 'p-059', date: '01.05.2026', status: 'Kapatıldı', description: 'Donanım test platformu entegrasyon hatası giderildi, yeniden test onaylandı.', fileCount: 3 },
    { id: 'rsk-014', title: 'Lojistik Gecikme Riski', projectId: 'prj-010', taskId: 'tsk-011', assigneeId: 'p-084', date: '28.04.2026', status: 'Açık', description: 'Lojistik takip sistemi için gerekli sunucu donanımı teslimatı gecikiyor.', fileCount: 0 },
    { id: 'rsk-015', title: 'Güç Kaynağı Aşırı Isınma', projectId: 'prj-009', taskId: 'tsk-007', assigneeId: 'p-014', date: '25.04.2026', status: 'Riskli', description: 'Güç kaynağı optimizasyon testlerinde 85°C üzeri sıcaklık ölçüldü.', fileCount: 2 },
  ];

  const filtered = allRisks.filter(r => {
    const assignee = PERSONS.find(p => p.id === r.assigneeId);
    const project = PROJECTS.find(p => p.id === r.projectId);
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      assignee?.name.toLowerCase().includes(search.toLowerCase()) ||
      project?.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Tümü' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: allRisks.length,
    critical: allRisks.filter(r => r.status === 'Açık' || r.status === 'Riskli').length,
    open: allRisks.filter(r => r.status !== 'Kapatıldı').length,
    closed: allRisks.filter(r => r.status === 'Kapatıldı').length,
  };

  const handleAIQuery = async (q?: string) => {
    const query = q || aiQuery;
    if (!query.trim()) return;
    setAiLoading(true);
    setAiThinking(true);
    setAiResponse('');
    await new Promise(r => setTimeout(r, 400));
    setAiThinking(false);
    await new Promise(r => setTimeout(r, 900));
    const key = Object.keys(AI_RESPONSES).find(k => query.toLowerCase().includes(k));
    setAiResponse(key ? AI_RESPONSES[key] : `"${query}" için analiz tamamlandı. ${counts.total} risk incelendi, ${counts.critical} kritik tespit edildi. Detaylı rapor için "Risk raporu oluştur" seçeneğini kullanın.`);
    setAiLoading(false);
    setAiQuery('');
  };

  return (
    <AppLayout currentPath="/risks">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-foreground">Riskler & Notlar</h1>
              <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                AI İzliyor
              </span>
            </div>
            <p className="text-muted-foreground text-sm">{counts.total} toplam · {counts.critical} kritik · {counts.closed} kapatıldı</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-border bg-card hover:bg-muted/50 transition-colors text-muted-foreground">
              <RefreshCw size={14} />
              Yenile
            </button>
            <button className="btn-primary text-sm flex items-center gap-2">
              <Sparkles size={14} />
              AI Rapor Al
            </button>
          </div>
        </div>

        {/* AI Assistant Panel */}
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#0071e320', background: 'linear-gradient(135deg, #f0f7ff 0%, #fafbff 100%)' }}>
          {/* AI Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: '#0071e315', background: 'rgba(0,113,227,0.04)' }}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0071e3, #5ac8fa)' }}>
                  <Brain size={16} className="text-white" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">AI Risk Asistanı</p>
                <p className="text-xs text-muted-foreground">Tüm riskleri gerçek zamanlı analiz ediyor</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg" style={{ background: '#e8f0fb', color: '#0071e3' }}>
              <Zap size={11} />
              Aktif
            </div>
          </div>

          {/* AI Insights */}
          <div className="px-5 py-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">AI Tespitleri</p>
            {AI_RISK_INSIGHTS.map(insight => (
              <div
                key={insight.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/70 border border-white/80 hover:bg-white transition-all cursor-pointer"
                onClick={() => setExpandedInsight(expandedInsight === insight.id ? null : insight.id)}
              >
                <span className="text-base shrink-0 mt-0.5">{insight.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground leading-relaxed">{insight.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{insight.time}</p>
                </div>
                <button className="text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0 transition-colors" style={{ background: '#e8f0fb', color: '#0071e3' }}>
                  {insight.action}
                </button>
              </div>
            ))}
          </div>

          {/* AI Query */}
          <div className="px-5 pb-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Bot size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="AI'ya sor: Kritik riskleri özetle, sorumlu ata öner..."
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && aiQuery.trim()) handleAIQuery(); }}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-white border focus:outline-none transition-all"
                  style={{ borderColor: '#d2d2d7', color: '#1d1d1f' }}
                />
              </div>
              <button
                onClick={() => handleAIQuery()}
                disabled={aiLoading || !aiQuery.trim()}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                style={{ background: '#0071e3' }}
              >
                {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              {AI_QUICK_ACTIONS.map(a => (
                <button
                  key={a.label}
                  onClick={() => handleAIQuery(a.label)}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:scale-105"
                  style={{ background: '#e8f0fb', color: '#0071e3' }}
                >
                  {a.label}
                </button>
              ))}
            </div>

            {/* AI Response */}
            {(aiLoading || aiThinking || aiResponse) && (
              <div className="mt-3 rounded-xl border p-4" style={{ borderColor: '#0071e320', background: 'rgba(0,113,227,0.04)' }}>
                {aiThinking ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    AI düşünüyor...
                  </div>
                ) : aiLoading ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 size={12} className="animate-spin text-primary" />
                    Risk verileri analiz ediliyor...
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <Brain size={14} className="text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground leading-relaxed">{aiResponse}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Toplam Risk', value: counts.total, color: '#94a3b8', icon: ShieldAlert, bg: '#f8fafc' },
            { label: 'Açık/Riskli', value: counts.open, color: '#ef4444', icon: AlertTriangle, bg: '#fef2f2' },
            { label: 'Kritik', value: counts.critical, color: '#f97316', icon: TrendingUp, bg: '#fff7ed' },
            { label: 'Kapatıldı', value: counts.closed, color: '#22c55e', icon: CheckCircle2, bg: '#f0fdf4' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl p-4 border border-border" style={{ background: s.bg }}>
                <div className="flex items-center justify-between mb-2">
                  <Icon size={16} style={{ color: s.color }} />
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${s.color}15`, color: s.color }}>AI</span>
                </div>
                <p className="text-3xl font-bold tabular-nums" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
          <div className="relative ml-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Risk ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-muted/40 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all w-48"
            />
          </div>
        </div>

        {/* Risk Table */}
        <div className="card-base overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/10">
            <div className="flex items-center gap-2">
              <Bot size={14} className="text-primary" />
              <span className="text-xs font-semibold text-foreground">Risk Listesi</span>
              <span className="text-xs text-muted-foreground">— AI tarafından önceliklendirildi</span>
            </div>
            <span className="text-xs text-muted-foreground">{filtered.length} sonuç</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Risk Başlığı</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Proje</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Sorumlu</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Tarih</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Durum</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">AI</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(risk => {
                  const assignee = PERSONS.find(p => p.id === risk.assigneeId);
                  const project = PROJECTS.find(p => p.id === risk.projectId);
                  const statusColor = RISK_STATUS_COLORS[risk.status] || '#94a3b8';
                  const isUrgent = risk.status === 'Açık' || risk.status === 'Riskli';

                  return (
                    <tr
                      key={risk.id}
                      onClick={() => setSelectedRisk(risk)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: statusColor }} />
                          <span className="text-sm font-semibold text-foreground">{risk.title}</span>
                          {isUrgent && (
                            <span className="text-xs px-1.5 py-0.5 rounded font-medium hidden xl:inline-block" style={{ background: '#fef2f2', color: '#ef4444' }}>Acil</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-muted-foreground">{project?.name}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-foreground">{assignee?.name}</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground font-mono">{risk.date}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
                        >
                          {risk.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <Sparkles size={11} className="text-primary" />
                          <span className="text-xs text-primary font-medium">Analiz</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <ShieldAlert size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Arama kriterlerine uygun risk bulunamadı.</p>
            </div>
          )}
        </div>
      </div>

      {selectedRisk && <RiskModal risk={selectedRisk} onClose={() => setSelectedRisk(null)} />}
    </AppLayout>
  );
}
