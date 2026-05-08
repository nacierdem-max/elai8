'use client';
import React, { useState } from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { useRole } from '@/context/RoleContext';

export default function Topbar() {
  const [searchVal, setSearchVal] = useState('');
  const { currentRole, roleDefinition } = useRole();

  const displayName = currentRole?.name ?? 'Kullanıcı';
  const displayInitials = currentRole?.initials ?? '??';
  const roleColor = roleDefinition?.color ?? '#0071e3';
  const roleBg = roleDefinition?.bgColor ?? '#e8f0fb';

  return (
    <header
      className="h-14 flex items-center gap-4 px-6 shrink-0"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e8e8ed',
      }}
    >
      {/* Search */}
      <div className="flex-1 max-w-xs relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#aeaeb2' }} />
        <input
          type="text"
          placeholder="Ara..."
          value={searchVal}
          onChange={(e) => setSearchVal(e?.target?.value)}
          className="w-full rounded-lg pl-8 pr-4 py-2 text-sm focus:outline-none transition-colors"
          style={{
            background: '#f5f5f7',
            border: '1px solid transparent',
            color: '#1d1d1f',
            fontSize: '13px',
          }}
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg transition-colors hover:bg-gray-50"
          style={{ color: '#6e6e73' }}
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>

        {/* User */}
        <button
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors hover:bg-gray-50"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: roleBg, color: roleColor }}
          >
            {displayInitials}
          </div>
          <span className="text-sm font-medium hidden md:block" style={{ color: '#1d1d1f', fontSize: '13px' }}>{displayName}</span>
          <ChevronDown size={12} className="hidden md:block" style={{ color: '#aeaeb2' }} />
        </button>
      </div>
    </header>
  );
}