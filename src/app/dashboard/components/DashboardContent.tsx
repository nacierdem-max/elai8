'use client';
import React from 'react';

import KPIBentoGrid from './KPIBentoGrid';
import AIQueryBar from './AIQueryBar';
import WorkloadChartSection from './WorkloadChartSection';
import RiskAlertList from './RiskAlertList';
import ActivityFeed from './ActivityFeed';
import TopEngineersWorkload from './TopEngineersWorkload';
import { Brain, TrendingUp, CheckCircle2, Clock } from 'lucide-react';

// Role-specific quick access links shown in the welcome banner
const ROLE_QUICK_LINKS: Record<PersonnelRoleKey, { label: string; href: string; emoji: string }[]> = {
  'arge-personeli': [
    { label: 'Görevlerim', href: '/task-kanban-panel', emoji: '📋' },
    { label: 'Ekip', href: '/team', emoji: '👥' },
    { label: 'Dosyalar', href: '/files', emoji: '📁' },
  ],
  'proje-lideri': [
    { label: 'Projeler', href: '/projects', emoji: '🗂️' },
    { label: 'Riskler', href: '/risks', emoji: '⚠️' },
    { label: 'Ekip Takvimi', href: '/team', emoji: '📅' },
    { label: 'Log', href: '/logs', emoji: '📊' },
  ],
  'departman-lideri': [
    { label: 'Projeler', href: '/projects', emoji: '🗂️' },
    { label: 'Ekip & Personel', href: '/team', emoji: '👥' },
    { label: 'Analytics', href: '/analytics', emoji: '📈' },
    { label: 'Riskler', href: '/risks', emoji: '⚠️' },
  ],
  'urun-yoneticisi': [
    { label: 'Projeler', href: '/projects', emoji: '🗂️' },
    { label: 'AI Asistan', href: '/analytics', emoji: '🤖' },
    { label: 'Riskler', href: '/risks', emoji: '⚠️' },
    { label: 'Log', href: '/logs', emoji: '📊' },
  ],
  'arge-temsilcisi': [
    { label: 'Log', href: '/logs', emoji: '📊' },
    { label: 'Analytics', href: '/analytics', emoji: '📈' },
    { label: 'Projeler', href: '/projects', emoji: '🗂️' },
    { label: 'Riskler', href: '/risks', emoji: '⚠️' },
  ],
  'arge-yoneticisi': [
    { label: 'Projeler', href: '/projects', emoji: '🗂️' },
    { label: 'AI Asistan', href: '/analytics', emoji: '🤖' },
    { label: 'Log', href: '/logs', emoji: '📊' },
    { label: 'Riskler', href: '/risks', emoji: '⚠️' },
    { label: 'Ekip', href: '/team', emoji: '👥' },
  ],
};

const AI_ACTIONS = [
  { icon: '📋', label: 'Görev Ata', desc: 'AI personele görev atar', color: '#0071e3', bg: '#e8f0fb' },
  { icon: '⚠️', label: 'Risk Analiz', desc: 'Riskleri önceliklendir', color: '#f97316', bg: '#fff7ed' },
  { icon: '📅', label: 'Takvim Planla', desc: 'Projeyi otomatik planla', color: '#8b5cf6', bg: '#f3f0ff' },
  { icon: '👥', label: 'Ekip Dengele', desc: 'İş yükünü optimize et', color: '#22c55e', bg: '#f0fdf4' },
  { icon: '📊', label: 'Rapor Al', desc: 'Anlık durum raporu', color: '#06b6d4', bg: '#ecfeff' },
  { icon: '🔔', label: 'Uyarı Gönder', desc: 'Ekibe bildirim yolla', color: '#eab308', bg: '#fefce8' },
];

export default function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* AI Hero Banner */}
      <div className="rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #0071e3 0%, #5ac8fa 50%, #34d399 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative px-6 py-5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/30">
              <Brain size={24} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-white">AI İş Yönetim Asistanı</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block mr-1 animate-pulse" />
                  Aktif
                </span>
              </div>
              <p className="text-sm text-white/80">Sadece söyleyin — AI görev atar, proje planlar, ekibi organize eder</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-white/20 text-white border border-white/20">
              <CheckCircle2 size={12} />
              39 görev tamamlandı
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-white/20 text-white border border-white/20">
              <TrendingUp size={12} />
              %78 verimlilik
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-white/20 text-white border border-white/20">
              <Clock size={12} />
              Gerçek zamanlı
            </div>
          </div>
        </div>
      </div>

      {/* AI Quick Actions */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {AI_ACTIONS.map(action => (
          <button
            key={action.label}
            className="rounded-2xl p-3 text-center border border-border hover:scale-105 transition-all duration-150 hover:shadow-md group"
            style={{ background: action.bg }}
          >
            <div className="text-2xl mb-1.5">{action.icon}</div>
            <p className="text-xs font-bold" style={{ color: action.color }}>{action.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block leading-tight">{action.desc}</p>
          </button>
        ))}
      </div>

      {/* AI Query Bar */}
      <AIQueryBar />

      {/* KPI Bento Grid */}
      <KPIBentoGrid />

      {/* Charts row */}
      <WorkloadChartSection />

      {/* Bottom row: Risk alerts + Activity + Top engineers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
        <RiskAlertList />
        <ActivityFeed />
        <TopEngineersWorkload />
      </div>
    </div>
  );
}