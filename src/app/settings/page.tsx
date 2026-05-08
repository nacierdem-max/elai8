'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { useRole } from '@/context/RoleContext';
import { DEPARTMENT_COLORS } from '@/data/mockData';
import { User, Shield, Bell, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SettingsPage() {
  const { currentRole, roleDefinition, currentPerson, clearRole } = useRole();
  const router = useRouter();

  const handleLogout = () => {
    clearRole();
    router?.push('/');
  };

  return (
    <AppLayout currentPath="/settings">
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ayarlar</h1>
          <p className="text-muted-foreground text-sm mt-1">Hesap ve uygulama ayarları</p>
        </div>

        {/* Current user card */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <User size={15} className="text-primary" /> Aktif Oturum
          </h2>
          {currentPerson ? (
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white shrink-0"
                style={{ background: DEPARTMENT_COLORS?.[currentPerson?.department] || '#0071e3' }}
              >
                {currentPerson?.avatar?.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-foreground">{currentPerson?.name}</p>
                <p className="text-sm text-muted-foreground">{currentPerson?.title} · {currentPerson?.department}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{currentPerson?.email}</p>
              </div>
              {roleDefinition && (
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: roleDefinition?.bgColor, color: roleDefinition?.color }}>
                    {roleDefinition?.icon} {roleDefinition?.title}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Oturum bilgisi bulunamadı.</p>
          )}
        </div>

        {/* Role info */}
        {roleDefinition && (
          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield size={15} className="text-primary" /> Rol & Yetkiler
            </h2>
            <div className="flex items-start gap-3 p-4 rounded-xl mb-4" style={{ background: roleDefinition?.bgColor }}>
              <span className="text-2xl">{roleDefinition?.icon}</span>
              <div>
                <p className="text-sm font-bold" style={{ color: roleDefinition?.color }}>{roleDefinition?.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{roleDefinition?.description}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Sorumluluklar</p>
              {roleDefinition?.responsibilities?.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: roleDefinition?.color }} />
                  <p className="text-xs text-foreground">{r}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Bell size={15} className="text-primary" /> Hızlı Erişim
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Dashboard', href: '/dashboard', color: '#0071e3' },
              { label: 'Projelerim', href: '/projects', color: '#8b5cf6' },
              { label: 'Görevlerim', href: '/task-kanban-panel', color: '#06b6d4' },
              { label: 'AI Asistan', href: '/ai-assistant', color: '#22c55e' },
            ]?.map(link => (
              <Link key={link?.href} href={link?.href} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all">
                <div className="w-2 h-2 rounded-full" style={{ background: link?.color }} />
                <span className="text-sm font-semibold text-foreground">{link?.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-red-50"
          style={{ color: '#ef4444', border: '1px solid #ef444430' }}
        >
          <LogOut size={15} /> Çıkış Yap
        </button>
      </div>
    </AppLayout>
  );
}
