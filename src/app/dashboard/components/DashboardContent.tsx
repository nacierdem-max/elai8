'use client';
import React from 'react';
import { useRole } from '@/context/RoleContext';
import { TASKS, PROJECTS, RISKS } from '@/data/mockData';
import Link from 'next/link';
import { Shield, Bot, FolderKanban, CheckSquare } from 'lucide-react';

import KPIBentoGrid from './KPIBentoGrid';
import AIQueryBar from './AIQueryBar';
import WorkloadChartSection from './WorkloadChartSection';
import RiskAlertList from './RiskAlertList';
import ActivityFeed from './ActivityFeed';
import TopEngineersWorkload from './TopEngineersWorkload';
import Icon from '@/components/ui/AppIcon';


export default function DashboardContent() {
  const { currentRole, currentPerson, canViewAllData, isTeamLeader, isAdmin } = useRole();

  // Personal stats for non-admin users
  const myTasks = currentRole?.personId
    ? TASKS.filter(t => t.assigneeId === currentRole.personId || (t.collaboratorIds || []).includes(currentRole.personId!))
    : [];
  const myProjects = currentRole?.personId
    ? PROJECTS.filter(p => p.leadId === currentRole.personId || (p.collaboratorIds || []).includes(currentRole.personId!))
    : [];
  const myRisks = myProjects.length > 0
    ? RISKS.filter(r => myProjects.some(p => p.id === r.projectId) && r.status !== 'Kapatıldı')
    : [];

  const isPersonnel = !canViewAllData && !isTeamLeader;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: '#1d1d1f', letterSpacing: '-0.02em' }}>
            {currentPerson ? `Merhaba, ${currentPerson.name.split(' ')[0]} 👋` : 'Dashboard'}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6e6e73' }}>
            {isPersonnel
              ? `${myTasks.filter(t => t.status !== 'Tamamlandı').length} aktif görev · ${myProjects.length} proje`
              : 'Ar-Ge Merkezi genel durumu'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/ai-assistant" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all" style={{ background: 'linear-gradient(135deg, #0071e3, #5856d6)', color: '#fff' }}>
            <Bot size={13} /> AI Asistan
          </Link>
        </div>
      </div>

      {/* Personal quick stats for personnel role */}
      {isPersonnel && currentRole?.personId && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Aktif Görevim', value: myTasks.filter(t => !['Tamamlandı'].includes(t.status)).length, color: '#0071e3', href: '/task-kanban-panel', icon: CheckSquare },
            { label: 'Gecikmiş', value: myTasks.filter(t => t.status === 'Gecikmiş').length, color: '#ef4444', href: '/task-kanban-panel', icon: CheckSquare },
            { label: 'Projelerim', value: myProjects.length, color: '#8b5cf6', href: '/projects', icon: FolderKanban },
            { label: 'Aktif Risk', value: myRisks.length, color: '#f97316', href: '/risks', icon: Shield },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.href} className="rounded-xl p-4 border border-border hover:shadow-sm transition-all" style={{ background: '#fff' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}18` }}>
                    <Icon size={13} style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold tabular-nums" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs mt-0.5" style={{ color: '#6e6e73' }}>{stat.label}</p>
              </Link>
            );
          })}
        </div>
      )}

      {/* My projects quick access for personnel */}
      {isPersonnel && myProjects.length > 0 && (
        <div className="rounded-xl border border-border p-4" style={{ background: '#fff' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground">Projelerim</h3>
            <Link href="/projects" className="text-xs text-primary hover:underline">Tümünü Gör →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {myProjects.slice(0, 4).map(p => {
              const statusColors: Record<string, string> = { Aktif: '#22c55e', Kritik: '#ef4444', Tamamlandı: '#3b7dd8', Beklemede: '#eab308' };
              const sc = statusColors[p.status] || '#94a3b8';
              return (
                <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: sc }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.completionPercent}% tamamlandı</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: `${sc}18`, color: sc }}>{p.status}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI Grid — only for admin/leader */}
      {!isPersonnel && <KPIBentoGrid />}

      {/* AI Query Bar */}
      <AIQueryBar />

      {/* Charts — only for admin/leader */}
      {!isPersonnel && <WorkloadChartSection />}

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <RiskAlertList />
        <ActivityFeed />
        <TopEngineersWorkload />
      </div>
    </div>
  );
}