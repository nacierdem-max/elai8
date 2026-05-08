'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, Shield } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { PERSONNEL_ROLES, type PersonnelRoleKey } from '@/data/mockData';
import { useRole } from '@/context/RoleContext';

const ROLE_DEFAULT_NAMES: Record<PersonnelRoleKey, { name: string; initials: string }> = {
  'arge-personeli': { name: 'Ar-Ge Personeli', initials: 'AP' },
  'proje-lideri': { name: 'Proje Lideri', initials: 'PL' },
  'departman-lideri': { name: 'Departman Lideri', initials: 'DL' },
  'urun-yoneticisi': { name: 'Ürün Yöneticisi', initials: 'ÜY' },
  'arge-temsilcisi': { name: 'Pınar Tüzün', initials: 'PT' },
  'arge-yoneticisi': { name: 'Ar-Ge Merkezi Yöneticisi', initials: 'AY' },
};

// Admin role is the priority/default
const ADMIN_ROLE_KEY: PersonnelRoleKey = 'arge-yoneticisi';

// Separate admin from other roles
const adminRole = PERSONNEL_ROLES.find(r => r.key === ADMIN_ROLE_KEY)!;
const otherRoles = PERSONNEL_ROLES.filter(r => r.key !== ADMIN_ROLE_KEY);

export default function LoginPageClient() {
  const router = useRouter();
  const { setRole } = useRole();
  const [selectedRoleKey, setSelectedRoleKey] = useState<PersonnelRoleKey>(ADMIN_ROLE_KEY);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtherRoles, setShowOtherRoles] = useState(false);

  const handleEnter = async () => {
    if (!selectedRoleKey) return;
    setIsLoading(true);
    const defaults = ROLE_DEFAULT_NAMES[selectedRoleKey];
    setRole({ roleKey: selectedRoleKey, name: defaults.name, initials: defaults.initials });
    await new Promise(resolve => setTimeout(resolve, 400));
    router.push('/dashboard');
  };

  const selectedRoleDef = PERSONNEL_ROLES.find(r => r.key === selectedRoleKey);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: '#f5f5f7' }}
    >
      {/* Subtle background texture */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,113,227,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
            style={{ background: 'linear-gradient(145deg, #0071e3, #0077ed)', boxShadow: '0 8px 24px rgba(0,113,227,0.25)' }}
          >
            <AppLogo size={36} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#1d1d1f', letterSpacing: '-0.02em' }}>
            EliarArGe
          </h1>
          <p className="text-sm mt-1.5" style={{ color: '#6e6e73' }}>
            Eliar Elektrik A.Ş. — Akıllı Ar-Ge Yönetim Platformu
          </p>
        </div>

        {/* Main Card */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: '#ffffff',
            border: '1px solid #d2d2d7',
            boxShadow: '0 2px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          {/* Admin Section — Priority */}
          <div className="p-6 pb-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={13} style={{ color: '#0071e3' }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#0071e3' }}>
                Yönetici Girişi
              </span>
              <span
                className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: '#e8f0fb', color: '#0071e3' }}
              >
                Önerilen
              </span>
            </div>

            {adminRole && (
              <button
                type="button"
                onClick={() => setSelectedRoleKey(adminRole.key)}
                className="w-full flex items-center gap-4 rounded-2xl p-4 text-left transition-all duration-200 active:scale-[0.99]"
                style={{
                  background: selectedRoleKey === adminRole.key
                    ? 'linear-gradient(135deg, #e8f0fb, #f0f7ff)'
                    : '#f5f5f7',
                  border: `2px solid ${selectedRoleKey === adminRole.key ? '#0071e3' : '#e8e8ed'}`,
                  boxShadow: selectedRoleKey === adminRole.key ? '0 0 0 4px rgba(0,113,227,0.08)' : 'none',
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{
                    background: selectedRoleKey === adminRole.key ? '#0071e3' : '#e8e8ed',
                    boxShadow: selectedRoleKey === adminRole.key ? '0 4px 12px rgba(0,113,227,0.3)' : 'none',
                  }}
                >
                  <span style={{ filter: selectedRoleKey === adminRole.key ? 'brightness(10)' : 'none' }}>
                    {adminRole.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: selectedRoleKey === adminRole.key ? '#0071e3' : '#1d1d1f' }}>
                    {adminRole.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#6e6e73' }}>
                    {adminRole.subtitle}
                  </p>
                </div>
                {selectedRoleKey === adminRole.key && (
                  <CheckCircle2 size={18} style={{ color: '#0071e3', flexShrink: 0 }} />
                )}
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="mx-6 flex items-center gap-3" style={{ borderTop: '1px solid #e8e8ed' }}>
            <button
              type="button"
              onClick={() => setShowOtherRoles(v => !v)}
              className="flex items-center gap-1.5 py-3 text-xs font-medium transition-all duration-150"
              style={{ color: '#6e6e73' }}
            >
              <span>{showOtherRoles ? 'Diğer rolleri gizle' : 'Diğer rolleri göster'}</span>
              <span
                className="transition-transform duration-200"
                style={{ transform: showOtherRoles ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}
              >
                ▾
              </span>
            </button>
          </div>

          {/* Other Roles — Collapsible */}
          {showOtherRoles && (
            <div className="px-6 pb-5">
              <div className="grid grid-cols-1 gap-2">
                {otherRoles.map((role) => {
                  const isSelected = selectedRoleKey === role.key;
                  return (
                    <button
                      key={role.key}
                      type="button"
                      onClick={() => setSelectedRoleKey(role.key)}
                      className="flex items-center gap-3 rounded-xl p-3 text-left transition-all duration-150 active:scale-[0.99]"
                      style={{
                        background: isSelected ? role.bgColor : '#f5f5f7',
                        border: `1.5px solid ${isSelected ? role.color : '#e8e8ed'}`,
                      }}
                    >
                      <span className="text-lg shrink-0">{role.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: isSelected ? role.color : '#1d1d1f' }}>
                          {role.title}
                        </p>
                        <p className="text-xs" style={{ color: '#6e6e73' }}>{role.subtitle}</p>
                      </div>
                      {isSelected && <CheckCircle2 size={15} style={{ color: role.color, flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Enter Button */}
          <div className="px-6 pb-6 pt-2">
            <button
              type="button"
              onClick={handleEnter}
              disabled={isLoading || !selectedRoleKey}
              className="w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-2xl transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: selectedRoleDef ? selectedRoleDef.color : '#0071e3',
                color: '#ffffff',
                boxShadow: `0 4px 16px ${selectedRoleDef ? selectedRoleDef.color + '40' : 'rgba(0,113,227,0.25)'}`,
                fontSize: '15px',
                minHeight: '52px',
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Giriş yapılıyor...</span>
                </>
              ) : (
                <>
                  <span>Platforma Giriş Yap</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <p className="text-center text-xs mt-4" style={{ color: '#aeaeb2' }}>
              Demo ortamı — kimlik doğrulama gerekmez
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs mt-6" style={{ color: '#aeaeb2' }}>
          © 2026 Eliar Elektrik A.Ş. — EliarArGe v2.0
        </p>
      </div>
    </div>
  );
}