'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { PERSONS, DEPARTMENT_COLORS } from '@/data/mockData';
import { useRole } from '@/context/RoleContext';
import { Shield, Plus, X, Check, Search, AlertTriangle, Users } from 'lucide-react';

import { useRouter } from 'next/navigation';

export default function PermissionsPage() {
  const { currentRole, isAdmin, isTeamLeader, permissionGrants, grantPermission, revokePermission, canViewAllData } = useRole();
  const router = useRouter();

  const [searchGrantee, setSearchGrantee] = useState('');
  const [searchTarget, setSearchTarget] = useState('');
  const [selectedGrantee, setSelectedGrantee] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Only admins and team leaders can access this page
  if (!isAdmin && !isTeamLeader) {
    return (
      <AppLayout currentPath="/permissions">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
            <Shield size={28} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Erişim Reddedildi</h2>
          <p className="text-muted-foreground text-sm text-center max-w-sm">
            Bu sayfaya yalnızca Ar-Ge Yöneticisi, Departman Lideri veya Proje Lideri erişebilir.
          </p>
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: '#0071e3', color: '#fff' }}>
            Dashboard'a Dön
          </button>
        </div>
      </AppLayout>
    );
  }

  const filteredGrantees = PERSONS.filter(p =>
    p.name.toLowerCase().includes(searchGrantee.toLowerCase()) ||
    p.department.toLowerCase().includes(searchGrantee.toLowerCase())
  );

  const filteredTargets = PERSONS.filter(p =>
    p.name.toLowerCase().includes(searchTarget.toLowerCase()) ||
    p.department.toLowerCase().includes(searchTarget.toLowerCase())
  );

  const handleGrant = () => {
    if (!selectedGrantee || !selectedTarget || selectedGrantee === selectedTarget) return;
    grantPermission(selectedGrantee, selectedTarget);
    const grantee = PERSONS.find(p => p.id === selectedGrantee);
    const target = PERSONS.find(p => p.id === selectedTarget);
    setSuccessMsg(`${grantee?.name} artık ${target?.name} adlı kişinin verilerini görebilir.`);
    setTimeout(() => setSuccessMsg(''), 3000);
    setSelectedGrantee(null);
    setSelectedTarget(null);
    setSearchGrantee('');
    setSearchTarget('');
  };

  const granteePersons = permissionGrants.reduce<Record<string, string[]>>((acc, g) => {
    if (!acc[g.grantedTo]) acc[g.grantedTo] = [];
    acc[g.grantedTo].push(g.targetPersonId);
    return acc;
  }, {});

  return (
    <AppLayout currentPath="/permissions">
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">İzin Yönetimi</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Personelin hangi kişilerin verilerini görebileceğini yönetin.
          </p>
        </div>

        {/* Success message */}
        {successMsg && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ background: '#f0fdf4', borderColor: '#22c55e40' }}>
            <Check size={15} style={{ color: '#22c55e', flexShrink: 0 }} />
            <p className="text-sm font-semibold" style={{ color: '#16a34a' }}>{successMsg}</p>
          </div>
        )}

        {/* Grant new permission */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Plus size={15} className="text-primary" /> Yeni İzin Ver
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Grantee selector */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Erişim Verilecek Personel</label>
              <div className="relative mb-2">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Personel ara..."
                  value={searchGrantee}
                  onChange={e => setSearchGrantee(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
              {selectedGrantee && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-2" style={{ background: '#0071e318', border: '1.5px solid #0071e340' }}>
                  {(() => {
                    const p = PERSONS.find(x => x.id === selectedGrantee);
                    return p ? (
                      <>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: DEPARTMENT_COLORS[p.department] || '#94a3b8' }}>{p.avatar.slice(0, 2)}</div>
                        <span className="text-xs font-bold text-foreground flex-1">{p.name}</span>
                        <button onClick={() => setSelectedGrantee(null)}><X size={12} className="text-muted-foreground" /></button>
                      </>
                    ) : null;
                  })()}
                </div>
              )}
              {searchGrantee && !selectedGrantee && (
                <div className="border border-border rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                  {filteredGrantees.slice(0, 8).map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedGrantee(p.id); setSearchGrantee(''); }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: DEPARTMENT_COLORS[p.department] || '#94a3b8' }}>{p.avatar.slice(0, 2)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.department}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Target selector */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Görüntülenecek Personel / Proje</label>
              <div className="relative mb-2">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Personel ara..."
                  value={searchTarget}
                  onChange={e => setSearchTarget(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
              {selectedTarget && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-2" style={{ background: '#22c55e18', border: '1.5px solid #22c55e40' }}>
                  {(() => {
                    const p = PERSONS.find(x => x.id === selectedTarget);
                    return p ? (
                      <>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: DEPARTMENT_COLORS[p.department] || '#94a3b8' }}>{p.avatar.slice(0, 2)}</div>
                        <span className="text-xs font-bold text-foreground flex-1">{p.name}</span>
                        <button onClick={() => setSelectedTarget(null)}><X size={12} className="text-muted-foreground" /></button>
                      </>
                    ) : null;
                  })()}
                </div>
              )}
              {searchTarget && !selectedTarget && (
                <div className="border border-border rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                  {filteredTargets.filter(p => p.id !== selectedGrantee).slice(0, 8).map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedTarget(p.id); setSearchTarget(''); }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: DEPARTMENT_COLORS[p.department] || '#94a3b8' }}>{p.avatar.slice(0, 2)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.department}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleGrant}
            disabled={!selectedGrantee || !selectedTarget || selectedGrantee === selectedTarget}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#0071e3', color: '#fff' }}
          >
            <Shield size={14} /> İzin Ver
          </button>
        </div>

        {/* Active permissions */}
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Users size={15} className="text-primary" />
            <span className="text-sm font-bold text-foreground">Aktif İzinler ({permissionGrants.length})</span>
          </div>
          {permissionGrants.length === 0 ? (
            <div className="p-12 text-center">
              <Shield size={28} className="mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="text-sm text-muted-foreground">Henüz özel izin tanımlanmamış.</p>
              <p className="text-xs text-muted-foreground mt-1">Yönetici ve liderler tüm verilere zaten erişebilir.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {Object.entries(granteePersons).map(([granteeId, targetIds]) => {
                const grantee = PERSONS.find(p => p.id === granteeId);
                if (!grantee) return null;
                const dc = DEPARTMENT_COLORS[grantee.department] || '#94a3b8';
                return (
                  <div key={granteeId} className="px-4 py-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: dc }}>
                        {grantee.avatar.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground">{grantee.name}</p>
                        <p className="text-xs text-muted-foreground">{grantee.title} · {grantee.department}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{targetIds.length} kişiye erişim</span>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-11">
                      {targetIds.map(targetId => {
                        const target = PERSONS.find(p => p.id === targetId);
                        if (!target) return null;
                        const tdc = DEPARTMENT_COLORS[target.department] || '#94a3b8';
                        return (
                          <div key={targetId} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-gray-50">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: tdc }}>
                              {target.avatar.slice(0, 1)}
                            </div>
                            <span className="text-xs font-semibold text-foreground">{target.name}</span>
                            <button
                              onClick={() => revokePermission(granteeId, targetId)}
                              className="ml-0.5 text-muted-foreground hover:text-red-400 transition-colors"
                              title="İzni kaldır"
                            >
                              <X size={11} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info box */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border" style={{ background: '#fffbeb', borderColor: '#eab30840' }}>
          <AlertTriangle size={15} style={{ color: '#d97706', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#92400e' }}>Erişim Kontrolü Hakkında</p>
            <p className="text-xs mt-0.5" style={{ color: '#78350f' }}>
              Ar-Ge Yöneticisi ve Temsilcisi tüm verilere erişebilir. Departman ve Proje Liderleri ekip verilerine erişebilir.
              Ar-Ge Personeli yalnızca kendi görev ve projelerini görebilir. Özel izinler bu sayfadan yönetilir.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
