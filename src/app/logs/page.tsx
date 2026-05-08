'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { ACTIVITY_LOGS, PERSONS, PROJECTS, TASKS } from '@/data/mockData';
import {
  Archive, Search, Filter, Download, Eye, X, MessageSquare,
  ChevronRight, FileText, Activity, AlertTriangle, CheckCircle2,
  Clock, Plus, RefreshCw, TrendingUp, Paperclip
} from 'lucide-react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';


// ─── Types ────────────────────────────────────────────────────────────────────

interface FileItem {
  id: string;
  name: string;
  sender: string;
  senderId: string;
  projectId: string;
  taskId: string;
  type: 'pdf' | 'xls' | 'img' | 'dwg' | 'zip' | 'docx';
  date: string;
  size: string;
}

interface MessageItem {
  id: string;
  fromId: string;
  toId: string;
  summary: string;
  date: string;
  projectId: string;
  taskId: string;
  hasFile: boolean;
  fileName?: string;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: '#ef4444',
  xls: '#22c55e',
  img: '#3b7dd8',
  dwg: '#f97316',
  zip: '#eab308',
  docx: '#8b5cf6',
};

const FILES: FileItem[] = [
  { id: 'f-001', name: 'test_apr_v12.pdf', sender: 'Aytem Çelik', senderId: 'p-017', projectId: 'prj-003', taskId: 'tsk-003', type: 'pdf', date: '13.04.2026', size: '2.4 MB' },
  { id: 'f-002', name: 'testdata_rev2.xls', sender: 'Elif Kaya', senderId: 'p-039', projectId: 'prj-002', taskId: 'tsk-002', type: 'xls', date: '14.05.2026', size: '1.1 MB' },
  { id: 'f-003', name: 'hmi_export.png', sender: 'Zeynep Erdek', senderId: 'p-019', projectId: 'prj-004', taskId: 'tsk-005', type: 'img', date: '11.06.2026', size: '3.8 MB' },
  { id: 'f-004', name: 'pcb_layout_rev4.dwg', sender: 'Ahmet Yılmaz', senderId: 'p-002', projectId: 'prj-008', taskId: 'tsk-001', type: 'dwg', date: '05.03.2026', size: '8.2 MB' },
  { id: 'f-005', name: 'firmware_v24_src.zip', sender: 'Burak Kaya', senderId: 'p-020', projectId: 'prj-001', taskId: 'tsk-006', type: 'zip', date: '20.04.2026', size: '15.6 MB' },
  { id: 'f-006', name: 'enerji_sapma_raporu.pdf', sender: 'Temen Yıldız', senderId: 'p-005', projectId: 'prj-002', taskId: 'tsk-010', type: 'pdf', date: '02.05.2026', size: '1.8 MB' },
  { id: 'f-007', name: 'scada_guncelleme.docx', sender: 'Seda Arman', senderId: 'p-018', projectId: 'prj-003', taskId: 'tsk-013', type: 'docx', date: '01.05.2026', size: '0.9 MB' },
  { id: 'f-008', name: 'termal_sim_v3.pdf', sender: 'Melih Şahin', senderId: 'p-031', projectId: 'prj-006', taskId: 'tsk-008', type: 'pdf', date: '10.04.2026', size: '4.2 MB' },
  { id: 'f-009', name: 'iot_protokol_spec.pdf', sender: 'Uğur Arslan', senderId: 'p-055', projectId: 'prj-007', taskId: 'tsk-009', type: 'pdf', date: '16.05.2026', size: '2.1 MB' },
  { id: 'f-010', name: 'guc_analiz_raporu.xls', sender: 'Turan Özcan', senderId: 'p-014', projectId: 'prj-009', taskId: 'tsk-007', type: 'xls', date: '05.04.2026', size: '0.7 MB' },
  { id: 'f-011', name: 'mekanik_3d_model.dwg', sender: 'Arda Kılıç', senderId: 'p-032', projectId: 'prj-006', taskId: 'tsk-008', type: 'dwg', date: '12.04.2026', size: '22.4 MB' },
  { id: 'f-012', name: 'test_raporu_donanim.pdf', sender: 'Mehmet Tan', senderId: 'p-040', projectId: 'prj-005', taskId: 'tsk-004', type: 'pdf', date: '12.04.2026', size: '3.1 MB' },
  { id: 'f-013', name: 'mobil_debug_log.zip', sender: 'Zeynep Erdek', senderId: 'p-019', projectId: 'prj-004', taskId: 'tsk-005', type: 'zip', date: '04.05.2026', size: '5.3 MB' },
  { id: 'f-014', name: 'lojistik_modul_tasarim.docx', sender: 'Hande Koç', senderId: 'p-076', projectId: 'prj-010', taskId: 'tsk-011', type: 'docx', date: '03.05.2026', size: '1.4 MB' },
  { id: 'f-015', name: 'pcb_stok_listesi.xls', sender: 'Fatih Yıldız', senderId: 'p-003', projectId: 'prj-001', taskId: 'tsk-012', type: 'xls', date: '21.04.2026', size: '0.5 MB' },
];

const MESSAGES: MessageItem[] = [
  { id: 'm-001', fromId: 'p-002', toId: 'p-020', summary: '"Testte hata tespit edildi, PCB stok durumu kritik, tedarikçi görüşmesi lazım"', date: '12.05.2026', projectId: 'prj-001', taskId: 'tsk-001', hasFile: true, fileName: 'test_results.pdf' },
  { id: 'm-002', fromId: 'p-003', toId: 'p-017', summary: '"Güncel versiyon yüklendi, SCADA modülü test edilebilir"', date: '13.05.2026', projectId: 'prj-002', taskId: 'tsk-010', hasFile: true, fileName: 'cost_report.xls' },
  { id: 'm-003', fromId: 'p-039', toId: 'p-040', summary: '"Termal simülasyon sonuçları beklenenden %8 sapıyor, revizyon gerekiyor"', date: '10.05.2026', projectId: 'prj-002', taskId: 'tsk-002', hasFile: false },
  { id: 'm-004', fromId: 'p-017', toId: 'p-018', summary: '"SCADA arayüz tasarımı için yeni gereksinimler eklendi, plan dışı görev açıldı"', date: '01.05.2026', projectId: 'prj-003', taskId: 'tsk-013', hasFile: false },
  { id: 'm-005', fromId: 'p-031', toId: 'p-001', summary: '"Mekanik 3D model revizyonu tamamlandı, onay bekleniyor"', date: '15.04.2026', projectId: 'prj-006', taskId: 'tsk-008', hasFile: true, fileName: 'model_rev2.dwg' },
  { id: 'm-006', fromId: 'p-019', toId: 'p-039', summary: '"Mobil uygulama GPS hatası kritik seviyede, deadline geçildi"', date: '11.05.2026', projectId: 'prj-004', taskId: 'tsk-005', hasFile: true, fileName: 'debug_log.zip' },
  { id: 'm-007', fromId: 'p-055', toId: 'p-049', summary: '"IoT protokol entegrasyonu için tedarikçi onayı alındı"', date: '17.05.2026', projectId: 'prj-007', taskId: 'tsk-009', hasFile: false },
  { id: 'm-008', fromId: 'p-014', toId: 'p-001', summary: '"Güç analiz raporu hazır, incelemenizi bekliyorum"', date: '06.04.2026', projectId: 'prj-009', taskId: 'tsk-007', hasFile: true, fileName: 'guc_analiz.xls' },
];

const ACTION_COLORS: Record<string, string> = {
  'Görev Güncellendi': '#3b7dd8',
  'Görev Tamamlandı': '#22c55e',
  'Görev Eklendi': '#8b5cf6',
  'Görev Gecikti': '#ef4444',
  'Dosya Eklendi': '#f97316',
  'Risk Açıldı': '#ef4444',
  'Risk Güncellendi': '#eab308',
  'Mesaj Gönderildi': '#06b6d4',
};

const ACTION_ICONS: Record<string, React.ElementType> = {
  'Görev Güncellendi': RefreshCw,
  'Görev Tamamlandı': CheckCircle2,
  'Görev Eklendi': Plus,
  'Görev Gecikti': Clock,
  'Dosya Eklendi': FileText,
  'Risk Açıldı': AlertTriangle,
  'Risk Güncellendi': AlertTriangle,
  'Mesaj Gönderildi': MessageSquare,
};

// ─── File Modal ───────────────────────────────────────────────────────────────

interface FileModalProps {
  file: FileItem;
  onClose: () => void;
}

function FileModal({ file, onClose }: FileModalProps) {
  const sender = PERSONS.find(p => p.id === file.senderId);
  const project = PROJECTS.find(p => p.id === file.projectId);
  const task = TASKS.find(t => t.id === file.taskId);
  const typeColor = FILE_TYPE_COLORS[file.type] || '#94a3b8';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: typeColor }}>
              {file.type.toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">{file.name}</h2>
              <p className="text-xs text-muted-foreground">{file.size} · {file.date}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 rounded-xl p-3 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Gönderen</p>
              <p className="text-sm font-semibold text-foreground">{sender?.name}</p>
              <p className="text-xs text-muted-foreground">{sender?.department}</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Tür</p>
              <span className="text-sm font-bold uppercase" style={{ color: typeColor }}>.{file.type}</span>
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
          <div className="flex gap-2 pt-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors text-sm font-semibold">
              <Eye size={14} /> Önizle
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted/40 text-foreground border border-border hover:bg-muted transition-colors text-sm font-semibold">
              <Download size={14} /> İndir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type MainTab = 'logs' | 'files';
type FileSubTab = 'dosyalar' | 'mesajlar';

export default function LogsPage() {
  const [mainTab, setMainTab] = useState<MainTab>('logs');
  const [fileSubTab, setFileSubTab] = useState<FileSubTab>('dosyalar');
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('Tümü');
  const [typeFilter, setTypeFilter] = useState('Tümü');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const fileTypes = ['Tümü', 'pdf', 'xls', 'img', 'dwg', 'zip', 'docx'];
  const actionTypes = ['Tümü', ...Array.from(new Set(ACTIVITY_LOGS.map(l => l.action)))];

  // Filtered logs
  const filteredLogs = ACTIVITY_LOGS.filter(log => {
    const user = PERSONS.find(p => p.id === log.userId);
    const project = PROJECTS.find(p => p.id === log.projectId);
    const matchSearch =
      log.detail.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      user?.name.toLowerCase().includes(search.toLowerCase()) ||
      project?.name.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'Tümü' || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  // Filtered files
  const filteredFiles = FILES.filter(f => {
    const matchSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.sender.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'Tümü' || f.type === typeFilter;
    return matchSearch && matchType;
  });

  // Filtered messages
  const filteredMessages = MESSAGES.filter(m => {
    const from = PERSONS.find(p => p.id === m.fromId);
    const to = PERSONS.find(p => p.id === m.toId);
    return (
      m.summary.toLowerCase().includes(search.toLowerCase()) ||
      from?.name.toLowerCase().includes(search.toLowerCase()) ||
      to?.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Stats
  const logStats = [
    { label: 'Toplam Log', value: '980+', color: '#3b7dd8', icon: Activity },
    { label: 'Bugün', value: String(ACTIVITY_LOGS.filter(l => l.date.startsWith('05.05')).length), color: '#22c55e', icon: CheckCircle2 },
    { label: 'Risk Logu', value: String(ACTIVITY_LOGS.filter(l => l.action.includes('Risk')).length), color: '#ef4444', icon: AlertTriangle },
    { label: 'Dosya Logu', value: String(ACTIVITY_LOGS.filter(l => l.action === 'Dosya Eklendi').length), color: '#f97316', icon: FileText },
  ];

  const fileStats = [
    { label: 'Toplam Dosya', value: '4.300', color: '#3b7dd8', icon: FileText },
    { label: 'Toplam Mesaj', value: '1.350', color: '#8b5cf6', icon: MessageSquare },
    { label: 'Ekli Mesaj', value: String(MESSAGES.filter(m => m.hasFile).length), color: '#f97316', icon: Paperclip },
    { label: 'Kullanıcı', value: '40', color: '#22c55e', icon: TrendingUp },
  ];

  const currentStats = mainTab === 'logs' ? logStats : fileStats;

  return (
    <AppLayout currentPath="/logs">
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Log, Raporlar & Dosyalar</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Sistem aktivite logları · Dosya arşivi · Mesaj geçmişi
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost text-sm flex items-center gap-2">
              <Filter size={14} /> Filtrele
            </button>
            <button className="btn-primary text-sm flex items-center gap-2">
              <Download size={14} /> Dışa Aktar
            </button>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {currentStats.map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="card-base p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground tabular-nums">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Tabs ── */}
        <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl w-fit border border-border">
          {[
            { id: 'logs' as MainTab, label: `Aktivite Logları (${ACTIVITY_LOGS.length})`, icon: Archive },
            { id: 'files' as MainTab, label: `Dosya & Mesaj (${FILES.length + MESSAGES.length})`, icon: FileText },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setMainTab(tab.id); setSearch(''); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                mainTab === tab.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Search + Filters ── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={
                mainTab === 'logs' ?'Log, kullanıcı veya proje ara...'
                  : fileSubTab === 'dosyalar' ?'Dosya veya gönderen ara...' :'Mesaj veya kişi ara...'
              }
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-muted/40 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>

          {/* Log action filter */}
          {mainTab === 'logs' && (
            <div className="flex flex-wrap items-center gap-1">
              {actionTypes.map(a => (
                <button
                  key={a}
                  onClick={() => setActionFilter(a)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    actionFilter === a
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/40 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          )}

          {/* File type filter */}
          {mainTab === 'files' && fileSubTab === 'dosyalar' && (
            <div className="flex flex-wrap items-center gap-1">
              {fileTypes.map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    typeFilter === t
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/40 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {t === 'Tümü' ? 'Tümü' : `.${t}`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════════
            SECTION A — Aktivite Logları
        ════════════════════════════════════════════════════════════ */}
        {mainTab === 'logs' && (
          <div className="card-base overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Archive size={15} className="text-primary" />
                <span className="text-sm font-semibold text-foreground">Aktivite Logları</span>
                <span className="text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">{filteredLogs.length} kayıt</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Aksiyon</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Kullanıcı</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Detay</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Proje</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Sonuç</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Tarih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLogs.map(log => {
                    const user = PERSONS.find(p => p.id === log.userId);
                    const project = PROJECTS.find(p => p.id === log.projectId);
                    const actionColor = ACTION_COLORS[log.action] || '#94a3b8';
                    const ActionIcon = ACTION_ICONS[log.action] || Activity;

                    return (
                      <tr key={log.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${actionColor}18` }}>
                              <ActionIcon size={13} style={{ color: actionColor }} />
                            </div>
                            <span className="text-xs font-semibold whitespace-nowrap" style={{ color: actionColor }}>{log.action}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                              {user?.avatar?.slice(0, 2) ?? '??'}
                            </div>
                            <span className="text-xs text-foreground">{user?.name ?? '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-muted-foreground max-w-[220px] truncate">{log.detail}</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-xs text-muted-foreground">{project?.name ?? '—'}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${actionColor}15`, color: actionColor }}
                          >
                            {log.result}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">{log.date}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            SECTION B — Dosya & Mesaj (with sub-tabs)
        ════════════════════════════════════════════════════════════ */}
        {mainTab === 'files' && (
          <div className="space-y-4">

            {/* File type distribution chips */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {['pdf', 'xls', 'img', 'dwg', 'zip', 'docx'].map(t => {
                const count = FILES.filter(f => f.type === t).length;
                const color = FILE_TYPE_COLORS[t];
                return (
                  <button
                    key={t}
                    onClick={() => { setTypeFilter(typeFilter === t ? 'Tümü' : t); setFileSubTab('dosyalar'); }}
                    className={`p-3 rounded-xl border text-center transition-all duration-150 hover:scale-[1.02] ${
                      typeFilter === t ? 'border-current shadow-lg' : 'border-border bg-card hover:bg-muted/30'
                    }`}
                    style={typeFilter === t ? { borderColor: color, backgroundColor: `${color}15` } : {}}
                  >
                    <p className="text-lg font-bold tabular-nums" style={{ color }}>{count}</p>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">.{t}</p>
                  </button>
                );
              })}
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl w-fit">
              {[
                { id: 'dosyalar' as FileSubTab, label: `Dosyalar (${FILES.length})`, icon: FileText },
                { id: 'mesajlar' as FileSubTab, label: `Mesajlar (${MESSAGES.length})`, icon: MessageSquare },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFileSubTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    fileSubTab === tab.id
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Files Table */}
            {fileSubTab === 'dosyalar' && (
              <div className="card-base overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/10 flex items-center gap-2">
                  <FileText size={15} className="text-primary" />
                  <span className="text-sm font-semibold text-foreground">Dosya Arşivi</span>
                  <span className="text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">{filteredFiles.length} dosya</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/20">
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Dosya Adı</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Gönderen</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Proje</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Görev</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Tür</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Tarih</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredFiles.map(file => {
                        const project = PROJECTS.find(p => p.id === file.projectId);
                        const task = TASKS.find(t => t.id === file.taskId);
                        const typeColor = FILE_TYPE_COLORS[file.type] || '#94a3b8';
                        return (
                          <tr
                            key={file.id}
                            onClick={() => setSelectedFile(file)}
                            className="hover:bg-muted/30 transition-colors cursor-pointer group"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: typeColor }}>
                                  {file.type.slice(0, 2).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-foreground">{file.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <span className="text-xs text-foreground">{file.sender}</span>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <span className="text-xs text-muted-foreground">{project?.name}</span>
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                              <span className="text-xs text-muted-foreground truncate max-w-[120px] block">{task?.name}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-bold uppercase" style={{ color: typeColor }}>.{file.type}</span>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <span className="text-xs text-muted-foreground font-mono">{file.date}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={e => { e.stopPropagation(); setSelectedFile(file); }} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                                  <Eye size={12} />
                                </button>
                                <button onClick={e => e.stopPropagation()} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                                  <Download size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Messages Table */}
            {fileSubTab === 'mesajlar' && (
              <div className="card-base overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/10 flex items-center gap-2">
                  <MessageSquare size={15} className="text-primary" />
                  <span className="text-sm font-semibold text-foreground">Mesaj Geçmişi</span>
                  <span className="text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">{filteredMessages.length} mesaj</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/20">
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Gönderen</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Alıcı</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Mesaj Özeti</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Proje / Görev</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Tarih</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Dosya / Ek</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredMessages.map(msg => {
                        const from = PERSONS.find(p => p.id === msg.fromId);
                        const to = PERSONS.find(p => p.id === msg.toId);
                        const project = PROJECTS.find(p => p.id === msg.projectId);
                        const task = TASKS.find(t => t.id === msg.taskId);
                        return (
                          <tr key={msg.id} className="hover:bg-muted/30 transition-colors cursor-pointer group">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                                  {from?.avatar?.slice(0, 2) ?? '??'}
                                </div>
                                <span className="text-xs font-semibold text-foreground">{from?.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <span className="text-xs text-muted-foreground">{to?.name}</span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{msg.summary}</p>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <div>
                                <p className="text-xs text-foreground truncate">{project?.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{task?.name}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <span className="text-xs text-muted-foreground font-mono">{msg.date}</span>
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                              {msg.hasFile && (
                                <div className="flex items-center gap-1 text-cyan-400">
                                  <FileText size={12} />
                                  <span className="text-xs">{msg.fileName}</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedFile && (
        <FileModal file={selectedFile} onClose={() => setSelectedFile(null)} />
      )}
    </AppLayout>
  );
}
