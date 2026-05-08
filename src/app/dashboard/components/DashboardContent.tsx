'use client';
import React from 'react';

import KPIBentoGrid from './KPIBentoGrid';
import AIQueryBar from './AIQueryBar';
import WorkloadChartSection from './WorkloadChartSection';
import RiskAlertList from './RiskAlertList';
import ActivityFeed from './ActivityFeed';
import TopEngineersWorkload from './TopEngineersWorkload';

export default function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: '#1d1d1f', letterSpacing: '-0.02em' }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: '#6e6e73' }}>Ar-Ge Merkezi genel durumu</p>
      </div>

      {/* KPI Grid */}
      <KPIBentoGrid />

      {/* AI Query Bar */}
      <AIQueryBar />

      {/* Charts */}
      <WorkloadChartSection />

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <RiskAlertList />
        <ActivityFeed />
        <TopEngineersWorkload />
      </div>
    </div>
  );
}