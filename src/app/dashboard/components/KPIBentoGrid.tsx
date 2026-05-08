'use client';
import React from 'react';
import Link from 'next/link';
import { ClipboardList, AlertTriangle, Users, FileText, TrendingDown, Zap } from 'lucide-react';

const KPI_CARDS = [
  {
    id: 'kpi-aktif-gorev',
    label: 'Aktif Görev',
    value: '920',
    sub: '+16 plan dışı',
    subColor: '#8b5cf6',
    trend: '+8% bu ay',
    trendUp: false,
    icon: ClipboardList,
    iconColor: '#0071e3',
    iconBg: '#e8f0fb',
    href: '/task-kanban-panel',
    hero: true,
    breakdown: [
      { label: 'Yapılıyor', value: 350, color: '#06b6d4' },
      { label: 'Plan', value: 240, color: '#0071e3' },
      { label: 'Test', value: 131, color: '#eab308' },
      { label: 'Gecikmiş', value: 39, color: '#ef4444' },
      { label: 'Tamamlandı', value: 120, color: '#22c55e' },
      { label: 'Riskli', value: 24, color: '#f97316' },
    ],
  },
  {
    id: 'kpi-gecikme',
    label: 'Gecikmiş Görev',
    value: '39',
    sub: '12 kritik öncelikli',
    subColor: '#ef4444',
    trend: '+5 bu hafta',
    trendUp: false,
    icon: TrendingDown,
    iconColor: '#ef4444',
    iconBg: '#fef2f2',
    href: '/task-kanban-panel',
  },
  {
    id: 'kpi-risk',
    label: 'Açık Risk',
    value: '29',
    sub: '18 kritik · 12 kapalı',
    subColor: '#f97316',
    trend: '+3 bu hafta',
    trendUp: false,
    icon: AlertTriangle,
    iconColor: '#f97316',
    iconBg: '#fff7ed',
    href: '/risks',
  },
  {
    id: 'kpi-plandisi',
    label: 'Plan Dışı İş',
    value: '16',
    sub: '+4 bu ay',
    subColor: '#8b5cf6',
    trend: '+4 bu ay',
    trendUp: false,
    icon: Zap,
    iconColor: '#8b5cf6',
    iconBg: '#f3f0ff',
    href: '/task-kanban-panel',
  },
  {
    id: 'kpi-personel',
    label: 'Toplam Personel',
    value: '100',
    sub: '10 departman',
    subColor: '#22c55e',
    trend: 'Tam kadro',
    trendUp: true,
    icon: Users,
    iconColor: '#22c55e',
    iconBg: '#f0fdf4',
    href: '/team',
  },
  {
    id: 'kpi-dosya',
    label: 'Dosya & Mesaj',
    value: '5.650',
    sub: '4.300 dosya · 1.350 mesaj',
    subColor: '#06b6d4',
    trend: '+127 bu hafta',
    trendUp: true,
    icon: FileText,
    iconColor: '#06b6d4',
    iconBg: '#ecfeff',
    href: '/files',
    wide: true,
  },
];

export default function KPIBentoGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {KPI_CARDS?.map((card) => {
        const CardIcon = card?.icon;
        return (
          <Link
            key={card?.id}
            href={card?.href}
            className={`group rounded-xl p-4 transition-all duration-150 hover:shadow-sm
              ${card?.hero ? 'col-span-2' : ''}
              ${card?.wide ? 'col-span-2' : ''}
            `}
            style={{
              background: '#ffffff',
              border: '1px solid #e8e8ed',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: card?.iconBg }}
              >
                <CardIcon size={15} style={{ color: card?.iconColor }} />
              </div>
            </div>
            <p className="text-xs font-medium mb-1" style={{ color: '#aeaeb2' }}>
              {card?.label}
            </p>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span
                className="font-bold tabular-nums leading-none"
                style={{
                  color: '#1d1d1f',
                  fontSize: card?.hero ? '36px' : '24px',
                  letterSpacing: '-0.02em',
                }}
              >
                {card?.value}
              </span>
            </div>
            <p className="text-xs" style={{ color: card?.subColor }}>
              {card?.sub}
            </p>
            {/* Hero breakdown bars */}
            {card?.hero && card?.breakdown && (
              <div className="mt-4 space-y-2">
                <div className="flex gap-0.5 h-1 rounded-full overflow-hidden">
                  {card?.breakdown?.map((b) => (
                    <div
                      key={`breakdown-${card?.id}-${b?.label}`}
                      style={{
                        backgroundColor: b?.color,
                        width: `${(b?.value / 920) * 100}%`,
                        minWidth: '3px',
                      }}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {card?.breakdown?.map((b) => (
                    <div key={`legend-${card?.id}-${b?.label}`} className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: b?.color }} />
                      <span className="text-xs" style={{ color: '#6e6e73' }}>{b?.label}</span>
                      <span className="text-xs font-semibold tabular-nums" style={{ color: '#1d1d1f' }}>{b?.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}