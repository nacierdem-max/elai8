'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { type PersonnelRoleKey, PERSONNEL_ROLES, type PersonnelRoleDefinition, PERSONS, type Person } from '@/data/mockData';

export interface RoleUser {
  roleKey: PersonnelRoleKey;
  name: string;
  initials: string;
  personId?: string; // linked to PERSONS data
}

// Permission grant: admin/team-leader grants user X to view user Y's data
export interface PermissionGrant {
  grantedTo: string;   // personId who gets access
  targetPersonId: string; // personId whose data can be viewed
  grantedBy: string;   // personId of admin/leader who granted
  grantedAt: string;
}

interface RoleContextValue {
  currentRole: RoleUser | null;
  roleDefinition: PersonnelRoleDefinition | null;
  currentPerson: Person | null;
  setRole: (role: RoleUser) => void;
  clearRole: () => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isTeamLeader: boolean;
  canViewAllData: boolean;
  // Permission grants
  permissionGrants: PermissionGrant[];
  grantPermission: (grantedTo: string, targetPersonId: string) => void;
  revokePermission: (grantedTo: string, targetPersonId: string) => void;
  canViewPerson: (targetPersonId: string) => boolean;
  canViewProject: (projectLeadId: string, collaboratorIds: string[]) => boolean;
}

const RoleContext = createContext<RoleContextValue>({
  currentRole: null,
  roleDefinition: null,
  currentPerson: null,
  setRole: () => {},
  clearRole: () => {},
  isLoggedIn: false,
  isAdmin: false,
  isTeamLeader: false,
  canViewAllData: false,
  permissionGrants: [],
  grantPermission: () => {},
  revokePermission: () => {},
  canViewPerson: () => false,
  canViewProject: () => false,
});

// Map role keys to default person IDs for demo
const ROLE_TO_PERSON_ID: Record<PersonnelRoleKey, string> = {
  'arge-yoneticisi': 'p-001',   // Derya Koç - Ar-Ge Direktörü
  'departman-lideri': 'p-017',  // Aytem Çelik - Departman Lideri (Yazılım)
  'proje-lideri': 'p-076',      // Hande Koç - Proje Yöneticisi
  'urun-yoneticisi': 'p-084',   // Pakize Kaya - Proje Yöneticisi (Lojistik)
  'arge-temsilcisi': 'p-029',   // Barış Özdemir - Kıdemli Mühendis
  'arge-personeli': 'p-003',    // Fatih Yıldız - Mühendis
};

const ADMIN_ROLES: PersonnelRoleKey[] = ['arge-yoneticisi', 'arge-temsilcisi'];
const TEAM_LEADER_ROLES: PersonnelRoleKey[] = ['departman-lideri', 'proje-lideri'];

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<RoleUser | null>(null);
  const [permissionGrants, setPermissionGrants] = useState<PermissionGrant[]>([]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('eliar_role');
      if (stored) setCurrentRole(JSON.parse(stored));
      const storedGrants = sessionStorage.getItem('eliar_grants');
      if (storedGrants) setPermissionGrants(JSON.parse(storedGrants));
    } catch {}
  }, []);

  const setRole = (role: RoleUser) => {
    // Auto-assign personId if not provided
    const personId = role.personId ?? ROLE_TO_PERSON_ID[role.roleKey];
    const enriched = { ...role, personId };
    setCurrentRole(enriched);
    try { sessionStorage.setItem('eliar_role', JSON.stringify(enriched)); } catch {}
  };

  const clearRole = () => {
    setCurrentRole(null);
    try {
      sessionStorage.removeItem('eliar_role');
      sessionStorage.removeItem('eliar_grants');
    } catch {}
  };

  const roleDefinition = currentRole
    ? PERSONNEL_ROLES.find(r => r.key === currentRole.roleKey) ?? null
    : null;

  const currentPerson = currentRole?.personId
    ? PERSONS.find(p => p.id === currentRole.personId) ?? null
    : null;

  const isAdmin = currentRole ? ADMIN_ROLES.includes(currentRole.roleKey) : false;
  const isTeamLeader = currentRole ? TEAM_LEADER_ROLES.includes(currentRole.roleKey) : false;
  const canViewAllData = isAdmin;

  const grantPermission = (grantedTo: string, targetPersonId: string) => {
    if (!currentRole?.personId) return;
    const newGrant: PermissionGrant = {
      grantedTo,
      targetPersonId,
      grantedBy: currentRole.personId,
      grantedAt: new Date().toLocaleString('tr-TR'),
    };
    setPermissionGrants(prev => {
      const filtered = prev.filter(g => !(g.grantedTo === grantedTo && g.targetPersonId === targetPersonId));
      const updated = [...filtered, newGrant];
      try { sessionStorage.setItem('eliar_grants', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const revokePermission = (grantedTo: string, targetPersonId: string) => {
    setPermissionGrants(prev => {
      const updated = prev.filter(g => !(g.grantedTo === grantedTo && g.targetPersonId === targetPersonId));
      try { sessionStorage.setItem('eliar_grants', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const canViewPerson = (targetPersonId: string): boolean => {
    if (!currentRole?.personId) return false;
    if (canViewAllData) return true;
    if (isTeamLeader) return true; // team leaders can view their team
    if (currentRole.personId === targetPersonId) return true;
    // Check explicit grants
    return permissionGrants.some(
      g => g.grantedTo === currentRole.personId && g.targetPersonId === targetPersonId
    );
  };

  const canViewProject = (projectLeadId: string, collaboratorIds: string[]): boolean => {
    if (!currentRole?.personId) return false;
    if (canViewAllData) return true;
    if (isTeamLeader) return true;
    const myId = currentRole.personId;
    if (projectLeadId === myId) return true;
    if (collaboratorIds.includes(myId)) return true;
    // Check if any collaborator has granted access
    return permissionGrants.some(
      g => g.grantedTo === myId && (g.targetPersonId === projectLeadId || collaboratorIds.includes(g.targetPersonId))
    );
  };

  return (
    <RoleContext.Provider value={{
      currentRole,
      roleDefinition,
      currentPerson,
      setRole,
      clearRole,
      isLoggedIn: !!currentRole,
      isAdmin,
      isTeamLeader,
      canViewAllData,
      permissionGrants,
      grantPermission,
      revokePermission,
      canViewPerson,
      canViewProject,
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
