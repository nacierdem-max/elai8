'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { LayoutDashboard, AlertTriangle, BarChart3, Settings, ChevronLeft, ChevronRight, Archive, LogOut, Layers } from 'lucide-react';
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
  { id: 'nav-workspace', label: 'Çalışma Alanı', icon: Layers, href: '/workspace' },
  {
    id: 'nav-risks', label: 'Riskler', icon: AlertTriangle, href: '/risks', badge: 18,
    allowedRoles: ['proje-lideri', 'departman-lideri', 'urun-yoneticisi', 'arge-temsilcisi', 'arge-yoneticisi'],
  },
  {
    id: 'nav-logs', label: 'Log', icon: Archive, href: '/logs',
    allowedRoles: ['proje-lideri', 'departman-lideri', 'urun-yoneticisi', 'arge-temsilcisi', 'arge-yoneticisi'],
  },
  {
    id: 'nav-analytics', label: 'AI Asistan', icon: BarChart3, href: '/analytics',
    allowedRoles: ['departman-lideri', 'urun-yoneticisi', 'arge-temsilcisi', 'arge-yoneticisi'],
  },
];

interface SidebarProps {
  currentPath?: string;
}

export default function Sidebar({ currentPath = '/dashboard' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { currentRole, roleDefinition, clearRole } = useRole();
  const router = useRouter();

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
        width: collapsed ? '56px' : '220px',
        background: '#ffffff',
        borderRight: '1px solid #e8e8ed',
      }}
    >
      {/* Logo */}
      <div
        className={`flex items-center h-14 px-3 ${collapsed ? 'justify-center' : 'justify-between'}`}
        style={{ borderBottom: '1px solid #f0f0f5' }}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: '#0071e3' }}
            >
              <AppLogo size={16} />
            </div>
            <span className="font-semibold text-sm" style={{ color: '#1d1d1f', letterSpacing: '-0.01em' }}>EliarArGe</span>
          </div>
        )}
        {collapsed && (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: '#0071e3' }}
          >
            <AppLogo size={16} />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-md transition-colors hover:bg-gray-100"
            style={{ color: '#aeaeb2' }}
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="flex justify-center py-2 transition-colors hover:bg-gray-50"
          style={{ color: '#aeaeb2' }}
        >
          <ChevronRight size={14} />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {visibleItems.map((item) => {
          const NavIcon = item.icon;
          const active = item.href === currentPath;

          return (
            <Link
              key={item.id}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors
                ${collapsed ? 'justify-center' : ''}
              `}
              style={{
                background: active ? '#f0f7ff' : 'transparent',
                color: active ? '#0071e3' : '#3a3a3c',
              }}
            >
              <NavIcon size={16} className="shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5 rounded-md tabular-nums"
                      style={{ background: '#fef2f2', color: '#ef4444' }}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 space-y-0.5" style={{ borderTop: '1px solid #f0f0f5' }}>
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50 ${collapsed ? 'justify-center' : ''}`}
          style={{ color: '#6e6e73' }}
          title={collapsed ? 'Ayarlar' : undefined}
        >
          <Settings size={16} className="shrink-0" />
          {!collapsed && <span>Ayarlar</span>}
        </Link>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-red-50 ${collapsed ? 'justify-center' : ''}`}
          style={{ color: '#ef4444' }}
          title={collapsed ? 'Çıkış Yap' : undefined}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Çıkış Yap</span>}
        </button>

        {/* Current user */}
        {!collapsed && (
          <div
            className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg mt-1"
            style={{ background: '#f5f5f7' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: roleBg, color: roleColor }}
            >
              {displayInitials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: '#1d1d1f' }}>{displayName}</p>
              <p className="text-xs truncate" style={{ color: '#6e6e73' }}>{roleDefinition?.title ?? 'Rol seçilmedi'}</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center py-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: roleBg, color: roleColor }}
            >
              {displayInitials}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}