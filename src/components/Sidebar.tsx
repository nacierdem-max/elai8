'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { LayoutDashboard, AlertTriangle, BarChart3, Settings, ChevronLeft, ChevronRight, Archive, LogOut, Layers, Brain, Zap } from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import { type PersonnelRoleKey } from '@/data/mockData';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
  badgeColor?: string;
  allowedRoles?: PersonnelRoleKey[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'nav-dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'nav-workspace', label: 'Çalışma Alanı', icon: Layers, href: '/workspace', badge: 3, badgeColor: '#0071e3' },
  {
    id: 'nav-risks', label: 'Riskler', icon: AlertTriangle, href: '/risks', badge: 18, badgeColor: '#f97316',
    allowedRoles: ['proje-lideri', 'departman-lideri', 'urun-yoneticisi', 'arge-temsilcisi', 'arge-yoneticisi'],
  },
  {
    id: 'nav-logs', label: 'Log', icon: Archive, href: '/logs', badge: 11, badgeColor: '#eab308',
    allowedRoles: ['proje-lideri', 'departman-lideri', 'urun-yoneticisi', 'arge-temsilcisi', 'arge-yoneticisi'],
  },
  {
    id: 'nav-analytics', label: 'AI Asistan', icon: BarChart3, href: '/analytics',
    allowedRoles: ['departman-lideri', 'urun-yoneticisi', 'arge-temsilcisi', 'arge-yoneticisi'],
  },
];

const AI_TASKS = [
  'Görev önceliklendiriliyor',
  'Risk analizi yapılıyor',
  'Takvim optimize ediliyor',
  'Ekip yükü dengeleniyor',
  'Rapor hazırlanıyor',
];

interface SidebarProps {
  currentPath?: string;
}

export default function Sidebar({ currentPath = '/dashboard' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [aiTaskIdx, setAiTaskIdx] = useState(0);
  const [aiActive, setAiActive] = useState(true);
  const { currentRole, roleDefinition, clearRole } = useRole();
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setAiActive(false);
      setTimeout(() => {
        setAiTaskIdx(i => (i + 1) % AI_TASKS.length);
        setAiActive(true);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    clearRole();
    router.push('/');
  };

  const visibleItems = NAV_ITEMS.filter(item => {
    if (!item.allowedRoles) return true;
    if (!currentRole) return true;
    return item.allowedRoles.includes(currentRole.roleKey);
  });

  const displayName = currentRole?.name ?? 'Kullanıcı';
  const displayInitials = currentRole?.initials ?? '??';
  const roleColor = roleDefinition?.color ?? '#0071e3';
  const roleBg = roleDefinition?.bgColor ?? '#e8f0fb';

  return (
    <aside
      className="flex flex-col shrink-0 z-20 transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? '60px' : '232px',
        background: '#ffffff',
        borderRight: '1px solid #e8e8ed',
      }}
    >
      {/* Logo */}
      <div
        className={`flex items-center h-14 px-3 ${collapsed ? 'justify-center' : 'justify-between'}`}
        style={{ borderBottom: '1px solid #f0f0f5' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(145deg, #0071e3, #0077ed)', boxShadow: '0 2px 8px rgba(0,113,227,0.2)' }}
          >
            <AppLogo size={18} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="font-bold text-sm tracking-tight block" style={{ color: '#1d1d1f', letterSpacing: '-0.01em' }}>EliarArGe</span>
              <span className="text-xs block leading-none flex items-center gap-1" style={{ color: '#0071e3' }}>
                <Zap size={9} />
                AI Destekli
              </span>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-lg transition-all duration-150 hover:bg-gray-100"
            style={{ color: '#aeaeb2' }}
            title="Daralt"
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="flex justify-center py-2.5 transition-all duration-150 hover:bg-gray-50"
          style={{ color: '#aeaeb2' }}
          title="Genişlet"
        >
          <ChevronRight size={14} />
        </button>
      )}

      {/* AI Status Banner */}
      {!collapsed && (
        <div
          className="mx-3 mt-3 rounded-xl px-3 py-2.5 flex items-center gap-2.5"
          style={{ background: '#f0f7ff', border: '1px solid rgba(0,113,227,0.12)' }}
        >
          <div className="relative shrink-0">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: '#0071e3' }}
            >
              <Brain size={12} className="text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400 border-2 border-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold" style={{ color: '#0071e3' }}>AI Aktif</p>
            <p
              className={`text-xs truncate transition-opacity duration-300 ${aiActive ? 'opacity-100' : 'opacity-0'}`}
              style={{ color: '#6e6e73' }}
            >
              {AI_TASKS[aiTaskIdx]}
            </p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {!collapsed && (
          <p className="text-xs font-semibold uppercase tracking-widest px-2 pb-2 pt-1" style={{ color: '#aeaeb2', fontSize: '10px' }}>
            Modüller
          </p>
        )}
        {visibleItems.map((item) => {
          const NavIcon = item.icon;
          const active = item.href === currentPath || (item.id === 'nav-dashboard' && currentPath === '/dashboard');

          return (
            <Link
              key={item.id}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 group relative
                ${collapsed ? 'justify-center' : ''}
              `}
              style={{
                background: active ? '#e8f0fb' : 'transparent',
                color: active ? '#0071e3' : '#3a3a3c',
              }}
            >
              <NavIcon size={17} className="shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate text-sm">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5 rounded-md min-w-[20px] text-center"
                      style={{ background: `${item.badgeColor}18`, color: item.badgeColor }}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge !== undefined && (
                <span
                  className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                  style={{ background: item.badgeColor }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 space-y-0.5" style={{ borderTop: '1px solid #f0f0f5' }}>
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 hover:bg-gray-50 ${collapsed ? 'justify-center' : ''}`}
          style={{ color: '#6e6e73' }}
          title={collapsed ? 'Ayarlar' : undefined}
        >
          <Settings size={17} className="shrink-0" />
          {!collapsed && <span>Ayarlar</span>}
        </Link>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 hover:bg-red-50 ${collapsed ? 'justify-center' : ''}`}
          style={{ color: '#ef4444' }}
          title={collapsed ? 'Çıkış Yap' : undefined}
        >
          <LogOut size={17} className="shrink-0" />
          {!collapsed && <span>Çıkış Yap</span>}
        </button>

        {/* Current user/role */}
        <div
          className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl mt-1 ${collapsed ? 'justify-center' : ''}`}
          style={{ background: '#f5f5f7' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: roleBg, color: roleColor }}
          >
            {displayInitials}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: '#1d1d1f' }}>{displayName}</p>
              <p className="text-xs truncate" style={{ color: roleColor }}>{roleDefinition?.title ?? 'Rol seçilmedi'}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}