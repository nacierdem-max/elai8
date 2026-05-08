'use client';
import React from 'react';

import KPIBentoGrid from './KPIBentoGrid';
import AIQueryBar from './AIQueryBar';
import WorkloadChartSection from './WorkloadChartSection';
import RiskAlertList from './RiskAlertList';
import ActivityFeed from './ActivityFeed';
import TopEngineersWorkload from './TopEngineersWorkload';
import { Brain, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { type PersonnelRoleKey } from '@/data/mockData';
import Icon from '@/components/ui/AppIcon';


const AI_ACTIONS = [
  { icon: '📋', label: 'Görev Ata', color: '#0071e3', bg: '#e8f0fb' },
  { icon: '⚠️', label: 'Risk Analiz', color: '#f97316', bg: '#fff7ed' },
  { icon: '📅', label: 'Takvim', color: '#8b5cf6', bg: '#f3f0ff' },
  { icon: '👥', label: 'Ekip Dengele', color: '#22c55e', bg: '#f0fdf4' },
  { icon: '📊', label: 'Rapor Al', color: '#06b6d4', bg: '#ecfeff' },
  { icon: '🔔', label: 'Bildirim', color: '#eab308', bg: '#fefce8' },
];

export default function DashboardContent() {
  return (
    <div className="space-y-5">
      {/* Header Banner — clean, minimal */}
      <div
        className="rounded-2xl px-6 py-5 flex items-center justify-between flex-wrap gap-4"
        style={{
          background: 'linear-gradient(135deg, #0071e3 0%, #0077ed 60%, #34aadc 100%)',
          boxShadow: '0 4px 20px rgba(0,113,227,0.2)',
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}
          >
            <Brain size={22} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-base font-bold text-white" style={{ letterSpacing: '-0.01em' }}>
                AI İş Yönetim Asistanı
              </h2>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block animate-pulse" />
                Aktif
              </span>
            </div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Söyleyin — AI görev atar, proje planlar, ekibi organize eder
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { icon: CheckCircle2, label: '39 görev tamamlandı' },
            { icon: TrendingUp, label: '%78 verimlilik' },
            { icon: Clock, label: 'Gerçek zamanlı' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
            >
              <Icon size={11} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* AI Quick Actions — compact row */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
        {AI_ACTIONS.map(action => (
          <button
            key={action.label}
            className="rounded-xl p-3 text-center transition-all duration-150 hover:scale-[1.03] hover:shadow-md active:scale-[0.98]"
            style={{
              background: action.bg,
              border: `1px solid ${action.color}20`,
            }}
          >
            <div className="text-xl mb-1.5">{action.icon}</div>
            <p className="text-xs font-semibold" style={{ color: action.color }}>{action.label}</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <RiskAlertList />
        <ActivityFeed />
        <TopEngineersWorkload />
      </div>
    </div>
  );
}