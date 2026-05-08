'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { PROJECTS, PERSONS, TASKS, RISKS, DEPARTMENT_COLORS, ACTIVITY_LOGS, STATUS_COLORS as TASK_STATUS_COLORS } from '@/data/mockData';
import { ArrowLeft, Users, CheckCircle, Clock, AlertTriangle, BarChart2, ChevronRight, FileText, MessageSquare, Layers } from 'lucide-react';
import Link from 'next/link';
import { useRole } from '@/context/RoleContext';
import Icon from '@/components/ui/AppIcon';


const STATUS_COLORS: Record<string, string> = {
  Aktif: '#22c55e',
  Tamamlandı: '#3b7dd8',
  Beklemede: '#eab308',
  Kritik: '#ef4444',
};

function parseDate(str: string): Date {
  const parts = str.split('.');
  if (parts.length === 3) return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  return new Date(str);
}

function formatMonthLabel(date: Date): string {
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return `${months[date.getMonth()]} ${String(date.getFullYear()).slice(2)}`;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { canViewAllData, isTeamLeader, currentRole } = useRole();
  const projectId = params?.id as string;

  const project = PROJECTS.find(p => p.id === projectId);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team' | 'risks' | 'timeline' | 'activity'>('overview');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  if (!project) {
    return (
      <AppLayout currentPath="/projects">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertTriangle size={28} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Proje Bulunamadı</h2>
          <p className="text-muted-foreground text-sm">Bu proje mevcut değil veya erişim izniniz yok.</p>
          <button onClick={() => router.push('/projects')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: '#0071e3', color: '#fff' }}>
            <ArrowLeft size={14} /> Projelere Dön
          </button>
        </div>
      </AppLayout>
    );
  }

  const lead = PERSONS.find(p => p.id === project.leadId);
  const projectTasks = TASKS.filter(t => t.projectId === project.id);
  const projectRisks = RISKS.filter(r => r.projectId === project.id);
  const projectLogs = ACTIVITY_LOGS.filter(l => l.projectId === project.id);
  const statusColor = STATUS_COLORS[project.status] || '#94a3b8';

  // All unique team members
  const allMemberIds = [...new Set([project.leadId, ...(project.collaboratorIds || []), ...projectTasks.map(t => t.assigneeId)])];
  const allMembers = allMemberIds.map(id => PERSONS.find(p => p.id === id)).filter(Boolean) as typeof PERSONS;

  // Task stats
  const tasksByStatus = {
    Tamamlandı: projectTasks.filter(t => t.status === 'Tamamlandı').length,
    Yapılıyor: projectTasks.filter(t => t.status === 'Yapılıyor').length,
    Test: projectTasks.filter(t => t.status === 'Test').length,
    Gecikmiş: projectTasks.filter(t => t.status === 'Gecikmiş').length,
    Riskli: projectTasks.filter(t => t.status === 'Riskli').length,
    Plan: projectTasks.filter(t => t.status === 'Plan').length,
  };

  // Gantt timeline
  const allDates = projectTasks.flatMap(t => [parseDate(t.startDate), parseDate(t.endDate)]);
  allDates.push(parseDate(project.startDate), parseDate(project.endDate));
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  minDate.setDate(1);
  maxDate.setMonth(maxDate.getMonth() + 1, 1);
  const totalMs = maxDate.getTime() - minDate.getTime();

  const months: { label: string; left: number }[] = [];
  const cur = new Date(minDate);
  while (cur < maxDate) {
    months.push({ label: formatMonthLabel(cur), left: ((cur.getTime() - minDate.getTime()) / totalMs) * 100 });
    cur.setMonth(cur.getMonth() + 1);
  }
  const today = new Date();
  const todayLeft = Math.max(0, Math.min(100, ((today.getTime() - minDate.getTime()) / totalMs) * 100));

  const selectedTask = selectedTaskId ? projectTasks.find(t => t.id === selectedTaskId) : null;

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: BarChart2 },
    { id: 'tasks', label: `Görevler (${projectTasks.length})`, icon: CheckCircle },
    { id: 'team', label: `Ekip (${allMembers.length})`, icon: Users },
    { id: 'risks', label: `Riskler (${projectRisks.length})`, icon: AlertTriangle },
    { id: 'timeline', label: 'Zaman Çizelgesi', icon: Clock },
    { id: 'activity', label: 'Aktivite', icon: Layers },
  ] as const;

  return (
    <AppLayout currentPath="/projects">
      <div className="space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/projects" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Projeler
          </Link>
          <ChevronRight size={12} />
          <span className="text-foreground font-medium">{project.name}</span>
        </div>

        {/* Project Header */}
        <div className="rounded-2xl p-6 border border-border" style={{ background: '#fff' }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: `${statusColor}18`, color: statusColor }}>
                  {project.status}
                </span>
                {project.department.map(d => (
                  <span key={d} className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${DEPARTMENT_COLORS[d]}18`, color: DEPARTMENT_COLORS[d] }}>{d}</span>
                ))}
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-1">{project.name}</h1>
              {project.description && <p className="text-sm text-muted-foreground mb-3">{project.description}</p>}
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span>📅 {project.startDate} → {project.endDate}</span>
                {lead && <span>👤 Lider: <span className="font-semibold text-foreground">{lead.name}</span></span>}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-4xl font-bold tabular-nums" style={{ color: statusColor }}>{project.completionPercent}%</div>
              <div className="text-xs text-muted-foreground mt-1">Tamamlanma</div>
              <div className="mt-2 w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${project.completionPercent}%`, background: statusColor }} />
              </div>
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {[
              { label: 'Aktif Görev', value: project.activeTaskCount, color: '#f97316' },
              { label: 'Tamamlanan', value: project.completedTaskCount, color: '#22c55e' },
              { label: 'Toplam Görev', value: project.totalTaskCount, color: '#3b7dd8' },
              { label: 'Risk', value: projectRisks.length, color: '#ef4444' },
            ].map(kpi => (
              <div key={kpi.label} className="rounded-xl p-3 text-center" style={{ background: `${kpi.color}08`, border: `1px solid ${kpi.color}20` }}>
                <div className="text-2xl font-bold tabular-nums" style={{ color: kpi.color }}>{kpi.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{kpi.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all"
                style={{
                  background: active ? '#0071e3' : 'transparent',
                  color: active ? '#fff' : '#6e6e73',
                  border: active ? 'none' : '1px solid #e8e8ed',
                }}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Task Status Breakdown */}
            <div className="rounded-2xl p-5 border border-border bg-white">
              <h3 className="text-sm font-bold text-foreground mb-4">Görev Durumu Dağılımı</h3>
              <div className="space-y-2.5">
                {Object.entries(tasksByStatus).map(([status, count]) => {
                  const color = (TASK_STATUS_COLORS as Record<string, string>)[status] || '#94a3b8';
                  const pct = projectTasks.length > 0 ? Math.round((count / projectTasks.length) * 100) : 0;
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <span className="text-xs font-semibold w-20 shrink-0" style={{ color }}>{status}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <span className="text-xs font-bold tabular-nums w-8 text-right" style={{ color }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Phase Plan */}
            <div className="rounded-2xl p-5 border border-border bg-white">
              <h3 className="text-sm font-bold text-foreground mb-4">Faz Planı</h3>
              <div className="space-y-3">
                {[
                  { name: 'Planlama', pct: 20, done: true, color: '#3b7dd8' },
                  { name: 'Geliştirme', pct: 35, done: project.completionPercent > 30, color: '#8b5cf6' },
                  { name: 'Test & Doğrulama', pct: 25, done: project.completionPercent > 60, color: '#f97316' },
                  { name: 'Teslim & Kapanış', pct: 20, done: project.completionPercent > 85, color: '#22c55e' },
                ].map(phase => (
                  <div key={phase.name} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-28 shrink-0">{phase.name}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-md overflow-hidden relative">
                      <div className="h-full rounded-md flex items-center px-2" style={{ width: `${phase.pct * 3}%`, background: phase.done ? phase.color : `${phase.color}40` }}>
                        <span className="text-xs font-bold text-white truncate">{phase.pct}%</span>
                      </div>
                    </div>
                    {phase.done
                      ? <CheckCircle size={14} className="shrink-0" style={{ color: '#22c55e' }} />
                      : <Clock size={14} className="shrink-0 text-muted-foreground" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Risks */}
            {projectRisks.length > 0 && (
              <div className="rounded-2xl p-5 border border-border bg-white">
                <h3 className="text-sm font-bold text-foreground mb-4">Aktif Riskler</h3>
                <div className="space-y-2">
                  {projectRisks.filter(r => r.status !== 'Kapatıldı').map(risk => {
                    const riskColors: Record<string, string> = { Açık: '#ef4444', Riskli: '#f97316', 'Çözüm Aranıyor': '#eab308', Kapatıldı: '#22c55e' };
                    const rc = riskColors[risk.status] || '#94a3b8';
                    return (
                      <div key={risk.id} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: `${rc}08`, border: `1px solid ${rc}20` }}>
                        <AlertTriangle size={14} style={{ color: rc, marginTop: 2, flexShrink: 0 }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground">{risk.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{risk.description}</p>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: `${rc}18`, color: rc }}>{risk.status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lead & Key Members */}
            <div className="rounded-2xl p-5 border border-border bg-white">
              <h3 className="text-sm font-bold text-foreground mb-4">Proje Lideri & Ekip</h3>
              {lead && (
                <Link href={`/team?person=${lead.id}`} className="flex items-center gap-3 p-3 rounded-xl mb-3 hover:bg-gray-50 transition-colors" style={{ border: '1.5px solid #0071e320', background: '#0071e308' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: DEPARTMENT_COLORS[lead.department] || '#0071e3' }}>
                    {lead.avatar.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.title} · {lead.department}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#0071e318', color: '#0071e3' }}>Lider ★</span>
                </Link>
              )}
              <div className="flex flex-wrap gap-2">
                {allMembers.filter(m => m.id !== project.leadId).slice(0, 8).map(member => (
                  <Link key={member.id} href={`/team?person=${member.id}`} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-border hover:border-primary/30 hover:bg-primary/5 transition-all">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: DEPARTMENT_COLORS[member.department] || '#94a3b8' }}>
                      {member.avatar.slice(0, 1)}
                    </div>
                    <span className="text-xs font-semibold text-foreground">{member.name.split(' ')[0]}</span>
                  </Link>
                ))}
                {allMembers.length > 9 && (
                  <button onClick={() => setActiveTab('team')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-dashed border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
                    +{allMembers.length - 9} daha
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TASKS TAB ── */}
        {activeTab === 'tasks' && (
          <div className="rounded-2xl border border-border bg-white overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">Tüm Görevler ({projectTasks.length})</span>
              <Link href="/task-kanban-panel" className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors" style={{ background: '#0071e3', color: '#fff' }}>
                Kanban Panosunda Aç →
              </Link>
            </div>
            <div className="divide-y divide-border/30">
              {projectTasks.map(task => {
                const assignee = PERSONS.find(p => p.id === task.assigneeId);
                const collabs = (task.collaboratorIds || []).map(id => PERSONS.find(p => p.id === id)).filter(Boolean);
                const tc = (TASK_STATUS_COLORS as Record<string, string>)[task.status] || '#94a3b8';
                const priorityColors: Record<string, string> = { Kritik: '#ef4444', Yüksek: '#f97316', Orta: '#eab308', Düşük: '#22c55e' };
                const pc = priorityColors[task.priority] || '#94a3b8';
                const isSelected = selectedTaskId === task.id;
                return (
                  <div key={task.id}>
                    <div
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedTaskId(isSelected ? null : task.id)}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: DEPARTMENT_COLORS[task.department] || '#94a3b8' }}>
                        {assignee?.avatar?.slice(0, 2) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{task.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-muted-foreground">{assignee?.name}</span>
                          {collabs.length > 0 && (
                            <div className="flex -space-x-1">
                              {collabs.slice(0, 3).map(c => c && (
                                <div key={c.id} className="w-4 h-4 rounded-full border border-white flex items-center justify-center text-xs font-bold text-white" style={{ background: DEPARTMENT_COLORS[c.department] || '#94a3b8' }} title={c.name}>
                                  {c.avatar.slice(0, 1)}
                                </div>
                              ))}
                              {collabs.length > 3 && <span className="text-xs text-muted-foreground ml-1">+{collabs.length - 3}</span>}
                            </div>
                          )}
                          <span className="text-xs text-muted-foreground">· {task.endDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${pc}18`, color: pc }}>{task.priority}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${tc}18`, color: tc }}>{task.status}</span>
                        {task.progressPercent !== undefined && (
                          <span className="text-xs font-bold tabular-nums w-10 text-right" style={{ color: tc }}>{task.progressPercent}%</span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="px-4 pb-4 bg-gray-50 border-t border-border/30">
                        <div className="pt-3 space-y-3">
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            <span>📅 {task.startDate} → {task.endDate}</span>
                            <span className="flex items-center gap-1"><FileText size={11} /> {task.fileCount} dosya</span>
                            <span className="flex items-center gap-1"><MessageSquare size={11} /> {task.messageCount} mesaj</span>
                            <span className="flex items-center gap-1"><AlertTriangle size={11} /> {task.riskCount} risk</span>
                          </div>
                          {task.progressPercent !== undefined && (
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-muted-foreground">İlerleme</span>
                                <span className="text-xs font-bold" style={{ color: tc }}>{task.progressPercent}%</span>
                              </div>
                              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${task.progressPercent}%`, background: tc }} />
                              </div>
                            </div>
                          )}
                          {collabs.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Katkı Verenler</p>
                              <div className="flex flex-wrap gap-1.5">
                                {collabs.map(c => c && (
                                  <Link key={c.id} href={`/team?person=${c.id}`} className="flex items-center gap-1 px-2 py-1 rounded-full border border-border hover:bg-white transition-colors">
                                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: DEPARTMENT_COLORS[c.department] || '#94a3b8' }}>
                                      {c.avatar.slice(0, 1)}
                                    </div>
                                    <span className="text-xs font-semibold text-foreground">{c.name}</span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TEAM TAB ── */}
        {activeTab === 'team' && (
          <div className="rounded-2xl border border-border bg-white overflow-hidden">
            <div className="p-4 border-b border-border">
              <span className="text-sm font-bold text-foreground">Proje Ekibi ({allMembers.length} kişi)</span>
            </div>
            <div className="divide-y divide-border/30">
              {allMembers.map(member => {
                const memberTasks = projectTasks.filter(t => t.assigneeId === member.id || (t.collaboratorIds || []).includes(member.id));
                const isLead = member.id === project.leadId;
                const dc = DEPARTMENT_COLORS[member.department] || '#94a3b8';
                return (
                  <Link key={member.id} href={`/team?person=${member.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: dc }}>
                      {member.avatar.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">{member.name}</p>
                        {isLead && <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#d97706' }}>★ Lider</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{member.title} · {member.department}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold tabular-nums" style={{ color: dc }}>{memberTasks.length}</p>
                      <p className="text-xs text-muted-foreground">görev</p>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── RISKS TAB ── */}
        {activeTab === 'risks' && (
          <div className="space-y-3">
            {projectRisks.length === 0 ? (
              <div className="rounded-2xl border border-border bg-white p-12 text-center">
                <CheckCircle size={32} className="mx-auto mb-3 text-green-400" />
                <p className="text-sm font-semibold text-foreground">Bu projede aktif risk bulunmuyor</p>
              </div>
            ) : projectRisks.map(risk => {
              const riskColors: Record<string, string> = { Açık: '#ef4444', Riskli: '#f97316', 'Çözüm Aranıyor': '#eab308', Kapatıldı: '#22c55e' };
              const rc = riskColors[risk.status] || '#94a3b8';
              const assignee = PERSONS.find(p => p.id === risk.assigneeId);
              return (
                <div key={risk.id} className="rounded-2xl border p-5 bg-white" style={{ borderColor: `${rc}30` }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} style={{ color: rc, flexShrink: 0 }} />
                      <h3 className="text-sm font-bold text-foreground">{risk.title}</h3>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0" style={{ background: `${rc}18`, color: rc }}>{risk.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{risk.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {assignee && (
                      <Link href={`/team?person=${assignee.id}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: DEPARTMENT_COLORS[assignee.department] || '#94a3b8' }}>
                          {assignee.avatar.slice(0, 1)}
                        </div>
                        {assignee.name}
                      </Link>
                    )}
                    <span>📅 {risk.date}</span>
                    <span>📎 {risk.fileCount} dosya</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── TIMELINE TAB ── */}
        {activeTab === 'timeline' && (
          <div className="rounded-2xl border border-border bg-white overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Clock size={15} className="text-primary" />
              <span className="text-sm font-bold text-foreground">Görev Zaman Çizelgesi</span>
            </div>
            <div className="overflow-x-auto">
              <div style={{ minWidth: 800 }}>
                {/* Month header */}
                <div className="relative h-8 border-b border-border bg-gray-50 mx-4">
                  {months.map((m, i) => (
                    <div key={i} className="absolute top-0 h-full flex items-center" style={{ left: `${m.left}%` }}>
                      <div className="w-px h-full bg-border/50" />
                      <span className="text-xs text-muted-foreground ml-1.5 whitespace-nowrap">{m.label}</span>
                    </div>
                  ))}
                  <div className="absolute top-0 h-full w-px bg-red-400/80 z-10" style={{ left: `${todayLeft}%` }}>
                    <span className="absolute -top-0.5 left-1 text-xs text-red-400 font-semibold whitespace-nowrap">Bugün</span>
                  </div>
                </div>
                {/* Task rows */}
                <div className="divide-y divide-border/20">
                  {projectTasks.map(task => {
                    const assignee = PERSONS.find(p => p.id === task.assigneeId);
                    const tStart = parseDate(task.startDate);
                    const tEnd = parseDate(task.endDate);
                    const tLeft = Math.max(0, ((tStart.getTime() - minDate.getTime()) / totalMs) * 100);
                    const tRight = Math.min(100, ((tEnd.getTime() - minDate.getTime()) / totalMs) * 100);
                    const tWidth = Math.max(tRight - tLeft, 2);
                    const tc = (TASK_STATUS_COLORS as Record<string, string>)[task.status] || '#94a3b8';
                    return (
                      <div key={task.id} className="flex items-center gap-0 px-4 py-2 hover:bg-gray-50 transition-colors">
                        <div className="w-44 shrink-0 flex items-center gap-2 pr-3">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: DEPARTMENT_COLORS[task.department] || '#94a3b8' }}>
                            {assignee?.avatar?.slice(0, 2) || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{task.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{assignee?.name?.split(' ')[0]}</p>
                          </div>
                        </div>
                        <div className="flex-1 relative h-8">
                          <div
                            className="absolute top-1 h-6 rounded-md flex items-center px-2 gap-1 cursor-pointer hover:brightness-110 transition-all shadow-sm"
                            style={{ left: `${tLeft}%`, width: `${tWidth}%`, background: tc, minWidth: 40 }}
                            title={`${task.name} (${task.startDate} → ${task.endDate})`}
                          >
                            <span className="text-xs font-bold text-white truncate">{task.name}</span>
                          </div>
                          <div className="absolute top-0 h-full w-px bg-red-400/60 z-10 pointer-events-none" style={{ left: `${todayLeft}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIVITY TAB ── */}
        {activeTab === 'activity' && (
          <div className="rounded-2xl border border-border bg-white overflow-hidden">
            <div className="p-4 border-b border-border">
              <span className="text-sm font-bold text-foreground">Proje Aktivite Geçmişi</span>
            </div>
            {projectLogs.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground text-sm">Bu proje için aktivite kaydı bulunamadı.</div>
            ) : (
              <div className="divide-y divide-border/30">
                {projectLogs.map(log => {
                  const user = PERSONS.find(p => p.id === log.userId);
                  const dc = user ? DEPARTMENT_COLORS[user.department] || '#94a3b8' : '#94a3b8';
                  return (
                    <div key={log.id} className="flex items-start gap-3 px-4 py-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5" style={{ background: dc }}>
                        {user?.avatar?.slice(0, 2) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground">{user?.name || 'Bilinmeyen'}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-muted-foreground">{log.action}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{log.detail}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{log.date}</p>
                      </div>
                      {log.result && (
                        <span className="text-xs font-bold shrink-0" style={{ color: log.result.startsWith('+') ? '#22c55e' : '#6e6e73' }}>{log.result}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
