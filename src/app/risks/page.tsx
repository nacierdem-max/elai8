'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { RISKS, PERSONS, PROJECTS, TASKS, type Risk, type RiskStatus } from '@/data/mockData';
import { AlertTriangle, Search, X, ChevronRight, FileText, User, Calendar, CheckCircle2, ShieldAlert, Bot, Send, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

const RISK_STATUS_COLORS: Record<RiskStatus, string> = {
  'Açık': '#ef4444',
  'Riskli': '#f97316',
  'Çözüm Aranıyor': '#eab308',
  'Kapatıldı': '#22c55e',
};

const AI_RESPONSES: Record<string, string> = {
  kritik: '4 kritik risk aktif: "Yazılım Lisans Süresi" (Haziran sonu), "Otomasyon PLC Uyumsuzluğu" (protokol hatası), "Güç Kaynağı Aşırı Isınma" (85°C+), "Lojistik Gecikme Riski". İlk ikisi için acil aksiyon planı oluşturuldu.',
  açık: 'Bu hafta 7 açık risk var. En eskisi "PCB Stok Sıkıntısı" (18 gün). Ortalama yaş: 11.2 gün. 3 risk sorumlu atanmayı bekliyor.',
  sorumlu: 'Sorumlu önerileri: "Yazılım Lisans" → Ahmet Yılmaz, "PLC Uyumsuzluğu" → Melih Şahin, "Güç Kaynağı" → Elif Kaya.',
  rapor: 'Risk raporu: 15 toplam, 8 açık/riskli, 4 kritik, 3 kapatıldı. En riskli proje: Saha Mobile App (3 risk). Ortalama çözüm süresi: 14.3 gün.',
};

const AI_QUICK_ACTIONS = [
  { label: 'Kritik riskleri özetle', query: 'kritik' },
  { label: 'Bu haftaki açık riskler', query: 'açık' },
  { label: 'Sorumlu ata öner', query: 'sorumlu' },
  { label: 'Risk raporu oluştur', query: 'rapor' },
];

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
    'Açık': 'Sorumlu kişiyle acil toplantı planla, etkilenen projeye geçici kaynak ata ve 48 saat içinde durum güncellemesi talep et.',
    'Riskli': 'Günlük kontrol noktası ekle, yedek plan hazırla. Mevcut trend devam ederse 5 gün içinde "Açık" statüsüne geçebilir.',
    'Çözüm Aranıyor': '3 çözüm yolu: 1) Tedarikçi değiştir (7 gün), 2) Geçici workaround uygula (2 gün), 3) Proje kapsamını daralt (hemen).',
    'Kapatıldı': 'Risk başarıyla kapatıldı. Çözüm süresi 12 gün (ortalama 14.3 gün). Bu çözüm yolu gelecekteki benzer riskler için şablon olarak kaydedildi.',
  };

  const handleAISuggest = async () => {
    setLoadingAI(true);
    await new Promise(r => setTimeout(r, 1000));
    setAiSuggestion(aiSuggestions[risk.status] || 'AI analiz tamamlandı.');
    setLoadingAI(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: '#ffffff', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6" style={{ borderBottom: '1px solid #f0f0f5' }}>
          <div>
            <span
              className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2"
              style={{ backgroundColor: `${statusColor}15`, color: statusColor }}
            >
              {risk.status}
            </span>
            <h2 className="text-base font-semibold" style={{ color: '#1d1d1f' }}>{risk.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: '#6e6e73' }}>
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm leading-relaxed" style={{ color: '#6e6e73' }}>{risk.description}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3" style={{ background: '#f5f5f7' }}>
              <p className="text-xs mb-1 flex items-center gap-1" style={{ color: '#aeaeb2' }}><User size={11} /> Sorumlu</p>
              <p className="text-sm font-semibold" style={{ color: '#1d1d1f' }}>{assignee?.name}</p>
              <p className="text-xs" style={{ color: '#6e6e73' }}>{assignee?.department}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: '#f5f5f7' }}>
              <p className="text-xs mb-1 flex items-center gap-1" style={{ color: '#aeaeb2' }}><Calendar size={11} /> Tarih</p>
              <p className="text-sm font-semibold" style={{ color: '#1d1d1f' }}>{risk.date}</p>
            </div>
          </div>

          {project && (
            <Link href="/projects" onClick={onClose} className="flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-gray-50" style={{ background: '#f5f5f7' }}>
              <div>
                <p className="text-xs mb-0.5" style={{ color: '#aeaeb2' }}>Proje</p>
                <p className="text-sm font-semibold" style={{ color: '#1d1d1f' }}>{project.name}</p>
              </div>
              <ChevronRight size={14} style={{ color: '#aeaeb2' }} />
            </Link>
          )}

          {task && (
            <Link href="/task-kanban-panel" onClick={onClose} className="flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-gray-50" style={{ background: '#f5f5f7' }}>
              <div>
                <p className="text-xs mb-0.5" style={{ color: '#aeaeb2' }}>İlgili Görev</p>
                <p className="text-sm font-semibold" style={{ color: '#1d1d1f' }}>{task.name}</p>
              </div>
              <ChevronRight size={14} style={{ color: '#aeaeb2' }} />
            </Link>
          )}

          {risk.fileCount > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: '#f5f5f7' }}>
              <FileText size={14} style={{ color: '#06b6d4' }} />
              <span className="text-sm" style={{ color: '#1d1d1f' }}>{risk.fileCount} ekli dosya</span>
              <Link href="/files" onClick={onClose} className="ml-auto text-xs font-medium" style={{ color: '#0071e3' }}>Görüntüle</Link>
            </div>
          )}

          {/* AI Suggestion */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e8e8ed' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #f0f0f5', background: '#f5f5f7' }}>
              <div className="flex items-center gap-2">
                <Bot size={13} style={{ color: '#0071e3' }} />
                <span className="text-xs font-semibold" style={{ color: '#1d1d1f' }}>AI Önerisi</span>
              </div>
              <button
                onClick={handleAISuggest}
                disabled={loadingAI}
                className="text-xs px-3 py-1 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                style={{ background: '#0071e3', color: '#ffffff' }}
              >
                {loadingAI ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                {loadingAI ? 'Analiz...' : 'Analiz Et'}
              </button>
            </div>
            <div className="px-4 py-3 min-h-[48px]">
              {loadingAI ? (
                <p className="text-xs" style={{ color: '#aeaeb2' }}>Analiz yapılıyor...</p>
              ) : aiSuggestion ? (
                <p className="text-xs leading-relaxed" style={{ color: '#1d1d1f' }}>{aiSuggestion}</p>
              ) : (
                <p className="text-xs italic" style={{ color: '#aeaeb2' }}>Analiz başlatmak için "Analiz Et" butonuna tıklayın.</p>
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
      (assignee?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (project?.name ?? '').toLowerCase().includes(search.toLowerCase());
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
    setAiResponse('');
    await new Promise(r => setTimeout(r, 900));
    const key = Object.keys(AI_RESPONSES).find(k => query.toLowerCase().includes(k));
    setAiResponse(key ? AI_RESPONSES[key] : `"${query}" için analiz tamamlandı. ${counts.total} risk incelendi, ${counts.critical} kritik tespit edildi.`);
    setAiLoading(false);
    setAiQuery('');
  };

  return (
    <AppLayout currentPath="/risks">
      <div className="space-y-6">

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: '#1d1d1f', letterSpacing: '-0.02em' }}>Riskler</h1>
            <p className="text-sm mt-1" style={{ color: '#6e6e73' }}>{counts.total} toplam · {counts.critical} kritik · {counts.closed} kapatıldı</p>
          </div>
          <button className="text-sm font-medium px-4 py-2 rounded-lg transition-colors" style={{ background: '#0071e3', color: '#ffffff' }}>
            + Yeni Risk
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Toplam Risk', value: counts.total, color: '#6e6e73', icon: ShieldAlert },
            { label: 'Açık/Riskli', value: counts.open, color: '#ef4444', icon: AlertTriangle },
            { label: 'Kritik', value: counts.critical, color: '#f97316', icon: AlertTriangle },
            { label: 'Kapatıldı', value: counts.closed, color: '#22c55e', icon: CheckCircle2 },
          ].map(s => {
            const SIcon = s.icon;
            return (
              <div key={s.label} className="rounded-xl p-4" style={{ background: '#ffffff', border: '1px solid #e8e8ed' }}>
                <SIcon size={15} style={{ color: s.color }} className="mb-2" />
                <p className="text-2xl font-bold tabular-nums" style={{ color: '#1d1d1f', letterSpacing: '-0.02em' }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color: '#6e6e73' }}>{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* AI Query */}
        <div className="rounded-xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #e8e8ed' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid #f0f0f5' }}>
            <p className="text-xs font-semibold" style={{ color: '#1d1d1f' }}>AI Risk Asistanı</p>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Bot size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#aeaeb2' }} />
                <input
                  type="text"
                  placeholder="Kritik riskleri özetle, sorumlu ata öner..."
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && aiQuery.trim()) handleAIQuery(); }}
                  className="w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none transition-colors"
                  style={{ background: '#f5f5f7', border: '1px solid transparent', color: '#1d1d1f' }}
                />
              </div>
              <button
                onClick={() => handleAIQuery()}
                disabled={aiLoading || !aiQuery.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                style={{ background: '#0071e3', color: '#ffffff' }}
              >
                {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {AI_QUICK_ACTIONS.map(a => (
                <button
                  key={a.label}
                  onClick={() => handleAIQuery(a.label)}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors hover:bg-blue-50"
                  style={{ background: '#f0f7ff', color: '#0071e3' }}
                >
                  {a.label}
                </button>
              ))}
            </div>

            {(aiLoading || aiResponse) && (
              <div className="rounded-lg p-3" style={{ background: '#f5f5f7' }}>
                {aiLoading ? (
                  <p className="text-xs" style={{ color: '#aeaeb2' }}>Analiz yapılıyor...</p>
                ) : (
                  <p className="text-sm leading-relaxed" style={{ color: '#1d1d1f' }}>{aiResponse}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: statusFilter === s ? '#0071e3' : '#f5f5f7',
                color: statusFilter === s ? '#ffffff' : '#6e6e73',
              }}
            >
              {s}
            </button>
          ))}
          <div className="relative ml-auto">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#aeaeb2' }} />
            <input
              type="text"
              placeholder="Risk ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-4 py-1.5 rounded-lg text-sm focus:outline-none transition-colors w-44"
              style={{ background: '#f5f5f7', border: '1px solid transparent', color: '#1d1d1f' }}
            />
          </div>
        </div>

        {/* Risk Table */}
        <div className="rounded-xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #e8e8ed' }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #f0f0f5' }}>
            <span className="text-sm font-semibold" style={{ color: '#1d1d1f' }}>Risk Listesi</span>
            <span className="text-xs" style={{ color: '#aeaeb2' }}>{filtered.length} sonuç</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #f0f0f5', background: '#fafafa' }}>
                  <th className="text-left text-xs font-medium px-4 py-3" style={{ color: '#aeaeb2' }}>Risk Başlığı</th>
                  <th className="text-left text-xs font-medium px-4 py-3 hidden md:table-cell" style={{ color: '#aeaeb2' }}>Proje</th>
                  <th className="text-left text-xs font-medium px-4 py-3 hidden lg:table-cell" style={{ color: '#aeaeb2' }}>Sorumlu</th>
                  <th className="text-left text-xs font-medium px-4 py-3 hidden sm:table-cell" style={{ color: '#aeaeb2' }}>Tarih</th>
                  <th className="text-left text-xs font-medium px-4 py-3" style={{ color: '#aeaeb2' }}>Durum</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((risk, idx) => {
                  const assignee = PERSONS.find(p => p.id === risk.assigneeId);
                  const project = PROJECTS.find(p => p.id === risk.projectId);
                  const statusColor = RISK_STATUS_COLORS[risk.status] || '#94a3b8';

                  return (
                    <tr
                      key={risk.id}
                      onClick={() => setSelectedRisk(risk)}
                      className="cursor-pointer transition-colors hover:bg-gray-50 group"
                      style={{ borderTop: idx > 0 ? '1px solid #f5f5f7' : 'none' }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: statusColor }} />
                          <span className="text-sm font-medium" style={{ color: '#1d1d1f' }}>{risk.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs" style={{ color: '#6e6e73' }}>{project?.name}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs" style={{ color: '#6e6e73' }}>{assignee?.name}</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs font-mono" style={{ color: '#aeaeb2' }}>{risk.date}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${statusColor}15`, color: statusColor }}
                        >
                          {risk.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight size={14} style={{ color: '#aeaeb2' }} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <ShieldAlert size={28} className="mx-auto mb-3" style={{ color: '#d2d2d7' }} />
              <p className="text-sm" style={{ color: '#aeaeb2' }}>Arama kriterlerine uygun risk bulunamadı.</p>
            </div>
          )}
        </div>
      </div>

      {selectedRisk && <RiskModal risk={selectedRisk} onClose={() => setSelectedRisk(null)} />}
    </AppLayout>
  );
}
