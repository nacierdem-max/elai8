'use client';
import React, { useState } from 'react';
import KanbanFilters from './KanbanFilters';
import KanbanBoard from './KanbanBoard';
import TaskDetailModal from './TaskDetailModal';
import KanbanStatsBar from './KanbanStatsBar';
import { TASKS, PROJECTS, type Task } from '@/data/mockData';
import { useRole } from '@/context/RoleContext';
import { Shield, Eye } from 'lucide-react';
import Link from 'next/link';

export type ViewMode = 'kanban' | 'list';

export default function TaskKanbanContent() {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({
    department: 'Tümü',
    project: 'Tümü',
    person: 'Tümü',
    search: '',
    priority: 'Tümü',
  });

  const { currentRole, canViewAllData, isTeamLeader, canViewProject } = useRole();

  // Role-based task filtering
  const visibleTasks = TASKS.filter(task => {
    if (canViewAllData || isTeamLeader) return true;
    if (!currentRole?.personId) return true; // fallback: show all
    const myId = currentRole.personId;
    // User can see tasks they're assigned to or collaborating on
    if (task.assigneeId === myId) return true;
    if ((task.collaboratorIds || []).includes(myId)) return true;
    // Check if user has permission to view the project
    const project = PROJECTS.find(p => p.id === task.projectId);
    if (project && canViewProject(project.leadId, project.collaboratorIds || [])) return true;
    return false;
  });

  const filteredTasks = visibleTasks.filter(task => {
    if (filters.department !== 'Tümü' && task.department !== filters.department) return false;
    if (filters.project !== 'Tümü' && task.projectId !== filters.project) return false;
    if (filters.person !== 'Tümü' && task.assigneeId !== filters.person) return false;
    if (filters.priority !== 'Tümü' && task.priority !== filters.priority) return false;
    if (filters.search && !task.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const isRestricted = !canViewAllData && !isTeamLeader;
  const myTaskCount = currentRole?.personId
    ? TASKS.filter(t => t.assigneeId === currentRole.personId || (t.collaboratorIds || []).includes(currentRole.personId!)).length
    : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Görev / Kanban Panosu</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isRestricted
              ? `${visibleTasks.length} görev (size atanan) · ${PROJECTS.filter(p => canViewProject(p.leadId, p.collaboratorIds || [])).length} proje`
              : `${TASKS.length} görev · ${PROJECTS.length} proje · 100 personel · 2026 aktif dönem`
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-muted border border-border rounded-lg p-1 gap-1">
            {(['kanban', 'list'] as ViewMode[]).map((mode) => (
              <button
                key={`view-${mode}`}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all duration-150 ${
                  viewMode === mode
                    ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode === 'kanban' ? '⊞ Kanban' : '☰ Liste'}
              </button>
            ))}
          </div>
          <button className="btn-primary text-sm flex items-center gap-2">
            + Yeni Görev
          </button>
        </div>
      </div>

      {/* Role-based access notice */}
      {isRestricted && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ background: '#f0f7ff', borderColor: '#0071e330' }}>
          <Shield size={15} style={{ color: '#0071e3', flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: '#0071e3' }}>Kişisel Görev Görünümü</p>
            <p className="text-xs" style={{ color: '#6e6e73' }}>
              Yalnızca size atanan veya katkı verdiğiniz {myTaskCount} görev görüntüleniyor.
              Ek erişim için yöneticinizle iletişime geçin.
            </p>
          </div>
          <Link href="/ai-assistant" className="text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1" style={{ background: '#0071e3', color: '#fff' }}>
            <Eye size={11} /> AI Asistan
          </Link>
        </div>
      )}

      {/* Stats bar */}
      <KanbanStatsBar tasks={filteredTasks} />

      {/* Filters */}
      <KanbanFilters filters={filters} onFiltersChange={setFilters} />

      {/* Board or List */}
      <KanbanBoard
        tasks={filteredTasks}
        viewMode={viewMode}
        onTaskClick={setSelectedTask}
      />

      {/* Task detail modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}