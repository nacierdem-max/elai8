'use client';
import React, { useState, useEffect } from 'react';
import { Search, Bell, ChevronDown, Brain, RefreshCw, Sparkles } from 'lucide-react';
import { useRole } from '@/context/RoleContext';

const AI_STATUS_MESSAGES = [
  'Görevler analiz ediliyor...',
  'Risk tespiti yapıldı',
  'Proje takvimi güncellendi',
  'Ekip iş yükü dengelendi',
  'Gecikme uyarısı gönderildi',
  'Yeni öneri hazırlandı',
];

export default function Topbar() {
  const [searchVal, setSearchVal] = useState('');
  const [aiStatusIdx, setAiStatusIdx] = useState(0);
  const [aiPulse, setAiPulse] = useState(false);
  const { currentRole, roleDefinition } = useRole();

  const displayName = currentRole?.name ?? 'Kullanıcı';
  const displayInitials = currentRole?.initials ?? '??';
  const roleColor = roleDefinition?.color ?? '#0071e3';
  const roleBg = roleDefinition?.bgColor ?? '#e8f0fb';

  useEffect(() => {
    const interval = setInterval(() => {
      setAiPulse(true);
      setTimeout(() => {
        setAiStatusIdx(i => (i + 1) % AI_STATUS_MESSAGES?.length);
        setAiPulse(false);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="h-14 flex items-center gap-4 px-6 shrink-0"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid #d2d2d7',
      }}
    >
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6e6e73' }} />
        <input
          type="text"
          placeholder="Proje, görev, kişi ara... (⌘K)"
          value={searchVal}
          onChange={(e) => setSearchVal(e?.target?.value)}
          className="w-full rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none transition-all duration-150"
          style={{
            background: '#f5f5f7',
            border: '1px solid #d2d2d7',
            color: '#1d1d1f',
          }}
        />
      </div>
      <div className="flex items-center gap-2 ml-auto">
        {/* AI Status ticker */}
        <div
          className="hidden lg:flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl transition-all duration-300"
          style={{ background: '#f0f7ff', color: '#0071e3', border: '1px solid #0071e320' }}
        >
          <Brain size={12} className="shrink-0" />
          <span className={`transition-opacity duration-300 ${aiPulse ? 'opacity-0' : 'opacity-100'} max-w-[160px] truncate`}>
            {AI_STATUS_MESSAGES?.[aiStatusIdx]}
          </span>
        </div>

        {/* Last updated */}
        <div className="hidden md:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl" style={{ background: '#f5f5f7', color: '#6e6e73', border: '1px solid #e8e8ed' }}>
          <RefreshCw size={12} className="text-green-500" />
          <span>05.05.2026 14:21</span>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Canlı
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-xl transition-all duration-150 hover:bg-muted/50"
          style={{ color: '#6e6e73' }}
        >
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
        </button>

        {/* AI Assistant button */}
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 hover:opacity-90 hover:scale-105 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #0071e3, #5ac8fa)', color: 'white' }}
        >
          <Sparkles size={14} />
          AI Asistan
        </button>

        {/* Role badge */}
        {roleDefinition && (
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold"
            style={{ background: roleBg, color: roleColor, border: `1px solid ${roleColor}30` }}
          >
            <span>{roleDefinition?.icon}</span>
            <span className="hidden lg:inline">{roleDefinition?.title}</span>
          </div>
        )}

        {/* User */}
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-150 hover:bg-gray-100">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: roleBg, color: roleColor }}
          >
            {displayInitials}
          </div>
          <span className="text-sm font-medium hidden md:block" style={{ color: '#1d1d1f' }}>{displayName}</span>
          <ChevronDown size={14} className="hidden md:block" style={{ color: '#6e6e73' }} />
        </button>
      </div>
    </header>
  );
}