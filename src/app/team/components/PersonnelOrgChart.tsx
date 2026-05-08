'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ZoomIn, ZoomOut, Maximize, Map as MapIcon,
  Briefcase, Monitor, Factory, User, RefreshCw, Layers,
  Plus, Trash2, X, Users
} from 'lucide-react';
import { PERSONS, DEPARTMENT_COLORS, type Department } from '@/data/mockData';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface OrgNode {
  id: string;
  name: string;
  role: string;
  type: 'director' | 'leader' | 'manager' | 'staff';
  x: number;
  y: number;
  department?: Department;
  personId?: string;
}

export interface OrgEdge {
  id: string;
  source: string;
  target: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const NODE_WIDTH = 200;
const NODE_HEIGHT = 90;
const H_GAP = 40;   // horizontal gap between nodes
const V_GAP = 60;   // vertical gap between rows

const ROLE_STYLES: Record<string, { bgClass: string; borderClass: string; shadowClass: string; textClass: string }> = {
  director: {
    bgClass: 'bg-primary',
    borderClass: 'border-primary',
    shadowClass: 'shadow-primary/20',
    textClass: 'text-primary-foreground',
  },
  leader: {
    bgClass: 'bg-emerald-500',
    borderClass: 'border-emerald-400',
    shadowClass: 'shadow-emerald-500/20',
    textClass: 'text-white',
  },
  manager: {
    bgClass: 'bg-amber-500',
    borderClass: 'border-amber-400',
    shadowClass: 'shadow-amber-500/20',
    textClass: 'text-white',
  },
  staff: {
    bgClass: 'bg-card',
    borderClass: 'border-border',
    shadowClass: 'shadow-card',
    textClass: 'text-foreground',
  },
};

const ROLE_ICONS: Record<string, React.ElementType> = {
  director: Briefcase,
  leader: Monitor,
  manager: Factory,
  staff: User,
};

// ─── Edge color palette per department ───────────────────────────────────────
const DEPT_EDGE_COLORS: Record<string, string> = {
  'Yazılım':        '#6366f1', // indigo
  'Tasarım':        '#ec4899', // pink
  'Pazarlama':      '#f59e0b', // amber
  'İnsan Kaynakları': '#10b981', // emerald
  'Finans':         '#14b8a6', // teal
  'Operasyon':      '#f97316', // orange
  'Ar-Ge':          '#8b5cf6', // violet
  'Satış':          '#06b6d4', // cyan
  'Hukuk':          '#84cc16', // lime
  'Lojistik':       '#e11d48', // rose
};
const DIRECTOR_EDGE_COLOR = '#0071e3'; // primary blue for director→leader edges
const DEFAULT_EDGE_COLOR  = '#a78bfa'; // fallback

function getEdgeColor(edge: OrgEdge, nodes: OrgNode[]): string {
  // Director → leader connection
  if (edge.source === 'nuh-bey') return DIRECTOR_EDGE_COLOR;
  // Leader → staff: use the target node's department color
  const targetNode = nodes.find(n => n.id === edge.target);
  const dept = targetNode?.department;
  if (dept && DEPT_EDGE_COLORS[dept]) return DEPT_EDGE_COLORS[dept];
  // Fallback: source node department
  const sourceNode = nodes.find(n => n.id === edge.source);
  const srcDept = sourceNode?.department;
  if (srcDept && DEPT_EDGE_COLORS[srcDept]) return DEPT_EDGE_COLORS[srcDept];
  return DEFAULT_EDGE_COLOR;
}

// ─── Bezier curve generator ───────────────────────────────────────────────────
function getWirePath(sx: number, sy: number, tx: number, ty: number): string {
  const distY = Math.max(Math.abs(ty - sy) * 0.5, 50);
  return `M ${sx} ${sy} C ${sx} ${sy + distY}, ${tx} ${ty - distY}, ${tx} ${ty}`;
}

// ─── Build initial nodes from PERSONS (no overlap layout) ────────────────────
function buildInitialData(): { nodes: OrgNode[]; edges: OrgEdge[] } {
  const nodes: OrgNode[] = [];
  const edges: OrgEdge[] = [];

  // Group persons by department
  const deptMap: Record<string, typeof PERSONS> = {};
  PERSONS.forEach(p => {
    if (!deptMap[p.department]) deptMap[p.department] = [];
    deptMap[p.department].push(p);
  });

  const departments = Object.keys(deptMap) as Department[];

  // Calculate column widths per department (no overlap)
  // Each dept column width = max staff per row * (NODE_WIDTH + H_GAP)
  const STAFF_PER_ROW = 3;
  const deptColWidths = departments.map(dept => {
    const staffCount = Math.max(0, deptMap[dept].length - 1);
    const cols = Math.min(staffCount, STAFF_PER_ROW);
    return Math.max(NODE_WIDTH + H_GAP, cols * (NODE_WIDTH + H_GAP));
  });

  // Total canvas width
  const totalWidth = deptColWidths.reduce((a, b) => a + b, 0) + (departments.length - 1) * H_GAP * 2;
  const canvasStartX = 2000 - totalWidth / 2;

  // Top node: Nuh Bey (director) — centered
  nodes.push({
    id: 'nuh-bey',
    name: 'Nuh Bey',
    role: 'Genel Müdür',
    type: 'director',
    x: 2000 - NODE_WIDTH / 2,
    y: 80,
  });

  let cursorX = canvasStartX;

  departments.forEach((dept, deptIdx) => {
    const persons = deptMap[dept];
    const colWidth = deptColWidths[deptIdx];
    const deptCenterX = cursorX + colWidth / 2;

    // Find department leader
    const leader = persons.find(p =>
      p.title === 'Departman Lideri' || p.title === 'Ar-Ge Direktörü' || p.title === 'Proje Yöneticisi'
    ) || persons[0];

    const leaderId = `dept-${dept}`;
    nodes.push({
      id: leaderId,
      name: leader.name,
      role: `${dept} Lideri`,
      type: 'leader',
      x: deptCenterX - NODE_WIDTH / 2,
      y: 280,
      department: dept,
      personId: leader.id,
    });

    // Edge: Nuh Bey -> dept leader
    edges.push({ id: `e-nuh-${dept}`, source: 'nuh-bey', target: leaderId });

    // Staff nodes — grid layout, no overlap
    const staffPersons = persons.filter(p => p.id !== leader.id);
    staffPersons.forEach((person, idx) => {
      const col = idx % STAFF_PER_ROW;
      const row = Math.floor(idx / STAFF_PER_ROW);
      const staffCount = Math.min(staffPersons.length, STAFF_PER_ROW);
      const rowWidth = staffCount * NODE_WIDTH + (staffCount - 1) * H_GAP;
      const rowStartX = deptCenterX - rowWidth / 2;
      const nodeId = `staff-${person.id}`;
      nodes.push({
        id: nodeId,
        name: person.name,
        role: person.title,
        type: 'staff',
        x: rowStartX + col * (NODE_WIDTH + H_GAP),
        y: 280 + NODE_HEIGHT + V_GAP + row * (NODE_HEIGHT + V_GAP),
        department: dept,
        personId: person.id,
      });
      edges.push({ id: `e-${leaderId}-${nodeId}`, source: leaderId, target: nodeId });
    });

    cursorX += colWidth + H_GAP * 2;
  });

  return { nodes, edges };
}

const INITIAL_DATA = buildInitialData();

// ─── Component ────────────────────────────────────────────────────────────────
export default function PersonnelOrgChart() {
  const [nodes, setNodes] = useState<OrgNode[]>(INITIAL_DATA.nodes);
  const [edges, setEdges] = useState<OrgEdge[]>(INITIAL_DATA.edges);
  const [view, setView] = useState({ x: 0, y: 20, k: 0.22 });
  const [dragNode, setDragNode] = useState<{
    id: string;
    startX: number;
    startY: number;
    initialPositions: Record<string, { x: number; y: number }>;
  } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showMinimap, setShowMinimap] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newNodeData, setNewNodeData] = useState({ name: '', role: '', type: 'staff' as OrgNode['type'] });
  const [wiring, setWiring] = useState<{
    source: string;
    startX: number;
    startY: number;
    currX: number;
    currY: number;
  } | null>(null);
  const [viewportSize, setViewportSize] = useState({ w: 800, h: 600 });
  // Hover highlight state
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const activePointers = useRef(new Map<number, { x: number; y: number }>());

  // Compute highlighted node ids and edge ids based on hovered node
  const highlightedNodeIds = useCallback((hovered: string | null): Set<string> => {
    if (!hovered) return new Set();
    const connected = new Set<string>([hovered]);
    edges.forEach(e => {
      if (e.source === hovered) connected.add(e.target);
      if (e.target === hovered) connected.add(e.source);
    });
    return connected;
  }, [edges]);

  const highlightedEdgeIds = useCallback((hovered: string | null): Set<string> => {
    if (!hovered) return new Set();
    const connected = new Set<string>();
    edges.forEach(e => {
      if (e.source === hovered || e.target === hovered) connected.add(e.id);
    });
    return connected;
  }, [edges]);

  const hoveredNodes = hoveredNodeId ? highlightedNodeIds(hoveredNodeId) : new Set<string>();
  const hoveredEdges = hoveredNodeId ? highlightedEdgeIds(hoveredNodeId) : new Set<string>();

  // Init viewport size on client
  useEffect(() => {
    const update = () => {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        setViewportSize({ w: rect.width, h: rect.height });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Center view on mount
  useEffect(() => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setView({ x: rect.width / 2 - 2000 * 0.22, y: 20, k: 0.22 });
      setViewportSize({ w: rect.width, h: rect.height });
    }
  }, []);

  // Keyboard delete
  const deleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    setNodes(prev => prev.filter(n => !selectedIds.has(n.id)));
    setEdges(prev => prev.filter(e =>
      !selectedIds.has(e.id) && !selectedIds.has(e.source) && !selectedIds.has(e.target)
    ));
    setSelectedIds(new Set());
  }, [selectedIds]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        (e.target as HTMLElement).tagName !== 'INPUT' &&
        (e.target as HTMLElement).tagName !== 'TEXTAREA' &&
        (e.target as HTMLElement).tagName !== 'SELECT'
      ) {
        deleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected]);

  const performZoom = useCallback((delta: number, cursorX?: number, cursorY?: number) => {
    const cx = cursorX ?? viewportSize.w / 2;
    const cy = cursorY ?? viewportSize.h / 2;
    setView(prev => {
      const s = delta > 0 ? 1.15 : 0.87;
      const newK = Math.min(Math.max(prev.k * s, 0.05), 3);
      const newX = cx - ((cx - prev.x) / prev.k) * newK;
      const newY = cy - ((cy - prev.y) / prev.k) * newK;
      return { k: newK, x: newX, y: newY };
    });
  }, [viewportSize]);

  const screenToWorld = useCallback((sx: number, sy: number) => {
    if (!wrapperRef.current) return { x: 0, y: 0 };
    const rect = wrapperRef.current.getBoundingClientRect();
    return {
      x: (sx - rect.left - view.x) / view.k,
      y: (sy - rect.top - view.y) / view.k,
    };
  }, [view]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.handle-dot')) return;
    if (!wrapperRef.current) return;
    wrapperRef.current.setPointerCapture(e.pointerId);
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const nodeEl = (e.target as HTMLElement).closest('[data-node-id]') as HTMLElement | null;
    if (nodeEl) {
      const nid = nodeEl.dataset.nodeId!;
      const newSel = new Set(e.shiftKey ? selectedIds : []);
      if (e.shiftKey && selectedIds.has(nid)) newSel.delete(nid); else newSel.add(nid);
      setSelectedIds(newSel);
      const initialPositions: Record<string, { x: number; y: number }> = {};
      nodes.forEach(nd => { if (newSel.has(nd.id)) initialPositions[nd.id] = { x: nd.x, y: nd.y }; });
      setDragNode({ id: nid, startX: e.clientX, startY: e.clientY, initialPositions });
      return;
    }
    if (!e.shiftKey) setSelectedIds(new Set());
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (wiring) {
      const pos = screenToWorld(e.clientX, e.clientY);
      setWiring(prev => prev ? { ...prev, currX: pos.x, currY: pos.y } : null);
      return;
    }
    if (!activePointers.current.has(e.pointerId)) return;
    const p = activePointers.current.get(e.pointerId)!;
    const curr = { x: e.clientX, y: e.clientY };
    activePointers.current.set(e.pointerId, curr);

    if (dragNode) {
      const dx = (curr.x - dragNode.startX) / view.k;
      const dy = (curr.y - dragNode.startY) / view.k;
      setNodes(ns => ns.map(n =>
        dragNode.initialPositions[n.id]
          ? {
              ...n,
              x: Math.round((dragNode.initialPositions[n.id].x + dx) / 10) * 10,
              y: Math.round((dragNode.initialPositions[n.id].y + dy) / 10) * 10,
            }
          : n
      ));
      return;
    }
    if (activePointers.current.size === 1 && !(e.target as HTMLElement).closest('.minimap-panel')) {
      setView(v => ({ ...v, x: v.x + (curr.x - p.x), y: v.y + (curr.y - p.y) }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    activePointers.current.delete(e.pointerId);
    setDragNode(null);
    setWiring(null);
  };

  const startWiring = (e: React.PointerEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const startX = node.x + NODE_WIDTH / 2;
    const startY = node.y + NODE_HEIGHT;
    setWiring({ source: nodeId, startX, startY, currX: startX, currY: startY });
  };

  const finishWiring = (e: React.PointerEvent, targetNodeId: string) => {
    e.stopPropagation();
    if (wiring && wiring.source !== targetNodeId) {
      // Allow multiple parents: only prevent exact duplicate edges
      const exists = edges.some(ed => ed.source === wiring.source && ed.target === targetNodeId);
      if (!exists) {
        setEdges(prev => [...prev, { id: `e_${Date.now()}`, source: wiring.source, target: targetNodeId }]);
      }
    }
    setWiring(null);
  };

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    const centerX = -view.x / view.k + viewportSize.w / view.k / 2 - NODE_WIDTH / 2;
    const centerY = -view.y / view.k + viewportSize.h / view.k / 2 - NODE_HEIGHT / 2;
    const newNode: OrgNode = {
      id: `n_${Date.now()}`,
      ...newNodeData,
      x: centerX,
      y: centerY,
    };
    setNodes(prev => [...prev, newNode]);
    setIsAddModalOpen(false);
    setNewNodeData({ name: '', role: '', type: 'staff' });
    setSelectedIds(new Set([newNode.id]));
  };

  const resetLayout = () => {
    setNodes(INITIAL_DATA.nodes);
    setEdges(INITIAL_DATA.edges);
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setView({ x: rect.width / 2 - 2000 * 0.22, y: 20, k: 0.22 });
    }
    setSelectedIds(new Set());
    setHoveredNodeId(null);
  };

  const fitView = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setView({ x: rect.width / 2 - 2000 * 0.22, y: 20, k: 0.22 });
    }
  };

  // Wheel handler: zoom always (no Ctrl required), prevent page scroll
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    let cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? -1 : 1;
    setView(prev => {
      const s = delta > 0 ? 1.12 : 0.89;
      const newK = Math.min(Math.max(prev.k * s, 0.05), 3);
      const newX = cursorX - ((cursorX - prev.x) / prev.k) * newK;
      const newY = cursorY - ((cursorY - prev.y) / prev.k) * newK;
      return { k: newK, x: newX, y: newY };
    });
  }, []);

  // Attach wheel listener as non-passive to allow preventDefault
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  return (
    <div className="relative w-full rounded-2xl border border-border overflow-hidden bg-background" style={{ height: '75vh', minHeight: 520 }}>
      {/* Background dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'radial-gradient(var(--border) 1.5px, transparent 1.5px)',
          backgroundSize: `${24 * view.k}px ${24 * view.k}px`,
          backgroundPosition: `${view.x}px ${view.y}px`,
        }}
      />

      {/* ── TOP TOOLBAR ── */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-card/95 backdrop-blur-md rounded-2xl px-3 py-2 shadow-elevated border border-border">
        <div className="flex items-center gap-2 mr-1">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg"><Layers size={15} /></div>
          <span className="font-bold text-foreground text-sm hidden sm:block">Personel Atama</span>
        </div>
        <div className="h-5 w-px bg-border" />

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold transition-colors shadow-sm"
        >
          <Plus size={14} /> Ekle
        </button>

        {selectedIds.size > 0 && (
          <button
            onClick={deleteSelected}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            <Trash2 size={14} /> Sil ({selectedIds.size})
          </button>
        )}

        <div className="h-5 w-px bg-border mx-0.5" />

        <button onClick={() => performZoom(-1)} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors" title="Uzaklaş"><ZoomOut size={16} /></button>
        <span className="text-xs font-bold w-10 text-center text-muted-foreground">{Math.round(view.k * 100)}%</span>
        <button onClick={() => performZoom(1)} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors" title="Yakınlaş"><ZoomIn size={16} /></button>

        <div className="h-5 w-px bg-border mx-0.5" />
        <button onClick={fitView} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors" title="Ekrana Sığdır"><Maximize size={16} /></button>
        <button onClick={resetLayout} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors" title="Sıfırla"><RefreshCw size={16} /></button>
        <button
          onClick={() => setShowMinimap(!showMinimap)}
          className={`p-1.5 rounded-lg transition-colors ${showMinimap ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
          title="Harita"
        >
          <MapIcon size={16} />
        </button>
      </div>

      {/* ── ADD MODAL ── */}
      {isAddModalOpen && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onPointerDown={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-card w-full max-w-sm rounded-2xl shadow-modal border border-border overflow-hidden"
            onPointerDown={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h2 className="font-bold text-foreground flex items-center gap-2"><Users size={16} /> Yeni Personel Ekle</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddNode} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Ad Soyad</label>
                <input
                  autoFocus required type="text"
                  className="input-base"
                  value={newNodeData.name}
                  onChange={e => setNewNodeData({ ...newNodeData, name: e.target.value })}
                  placeholder="Örn: Veli Yılmaz"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Unvan / Rol</label>
                <input
                  required type="text"
                  className="input-base"
                  value={newNodeData.role}
                  onChange={e => setNewNodeData({ ...newNodeData, role: e.target.value })}
                  placeholder="Örn: Veri Analisti"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Seviye</label>
                <select
                  className="input-base"
                  value={newNodeData.type}
                  onChange={e => setNewNodeData({ ...newNodeData, type: e.target.value as OrgNode['type'] })}
                >
                  <option value="staff">Personel</option>
                  <option value="leader">Ekip Lideri</option>
                  <option value="manager">Yönetici</option>
                  <option value="director">Direktör</option>
                </select>
              </div>
              <button type="submit" className="btn-primary w-full">
                Ekle
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MINIMAP ── */}
      {showMinimap && nodes.length > 0 && (
        <MinimapPanel
          nodes={nodes}
          view={view}
          viewportSize={viewportSize}
          selectedIds={selectedIds}
          onViewChange={setView}
        />
      )}

      {/* ── CANVAS ── */}
      <div
        ref={wrapperRef}
        className={`absolute inset-0 ${dragNode ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={() => { activePointers.current.clear(); setDragNode(null); setWiring(null); }}
        style={{ touchAction: 'none' }}
      >
        <div
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
            transformOrigin: '0 0',
            position: 'absolute',
            top: 0,
            left: 0,
            willChange: 'transform',
          }}
        >
          {/* SVG Edges */}
          <svg className="overflow-visible absolute top-0 left-0 pointer-events-none" style={{ width: 1, height: 1, zIndex: 0 }}>
            {edges.map(edge => {
              const sN = nodes.find(n => n.id === edge.source);
              const tN = nodes.find(n => n.id === edge.target);
              if (!sN || !tN) return null;
              const sx = sN.x + NODE_WIDTH / 2;
              const sy = sN.y + NODE_HEIGHT;
              const tx = tN.x + NODE_WIDTH / 2;
              const ty = tN.y;
              const path = getWirePath(sx, sy, tx, ty);
              const isSel = selectedIds.has(edge.id);
              const isHighlighted = hoveredEdges.has(edge.id);
              const isDimmed = hoveredNodeId !== null && !isHighlighted && !isSel;
              const edgeBaseColor = getEdgeColor(edge, nodes);
              const edgeColor = isSel ? '#ef4444' : isHighlighted ? edgeBaseColor : isDimmed ? '#d2d2d7' : edgeBaseColor;

              return (
                <g
                  key={edge.id}
                  className="pointer-events-auto cursor-pointer"
                  onPointerDown={evt => { evt.stopPropagation(); setSelectedIds(new Set([edge.id])); }}
                >
                  <path d={path} fill="none" stroke="transparent" strokeWidth="20" />
                  <path
                    d={path}
                    fill="none"
                    stroke={edgeColor}
                    strokeWidth={isSel ? 4 : isHighlighted ? 3.5 : 2}
                    strokeLinecap="round"
                    opacity={isDimmed ? 0.2 : 0.85}
                    style={{ transition: 'stroke 0.15s, opacity 0.15s, stroke-width 0.15s' }}
                  />
                  <circle cx={sx} cy={sy} r="4" fill={edgeColor} opacity={isDimmed ? 0.2 : 0.85} />
                  <circle cx={tx} cy={ty} r="4" fill={edgeColor} opacity={isDimmed ? 0.2 : 0.85} />
                </g>
              );
            })}
            {wiring && (
              <path
                d={getWirePath(wiring.startX, wiring.startY, wiring.currX, wiring.currY)}
                fill="none"
                stroke="#0071e3"
                strokeWidth="3"
                strokeDasharray="6,5"
                opacity="0.8"
              />
            )}
          </svg>

          {/* Nodes */}
          {nodes.map(node => {
            const style = ROLE_STYLES[node.type] || ROLE_STYLES.staff;
            const IconComponent = ROLE_ICONS[node.type] || User;
            const isSel = selectedIds.has(node.id);
            const isHovered = node.id === hoveredNodeId;
            const isConnected = hoveredNodes.has(node.id) && !isHovered;
            const isDimmed = hoveredNodeId !== null && !hoveredNodes.has(node.id);
            const deptColor = node.department ? DEPARTMENT_COLORS[node.department] : undefined;

            return (
              <div
                key={node.id}
                data-node-id={node.id}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className={`absolute rounded-2xl border-2 flex flex-col select-none group
                  ${style.bgClass} ${style.borderClass}
                  ${isSel ? 'ring-4 ring-primary/50 scale-105 z-50 shadow-modal' : ''}
                  ${isHovered ? 'ring-4 ring-primary/60 z-50 shadow-modal scale-105' : ''}
                  ${isConnected ? 'ring-2 ring-primary/30 z-30 shadow-elevated' : ''}
                  ${!isSel && !isHovered ? `z-10 shadow-card ${style.shadowClass}` : ''}
                `}
                style={{
                  transform: `translate(${node.x}px, ${node.y}px)`,
                  width: NODE_WIDTH,
                  height: NODE_HEIGHT,
                  opacity: isDimmed ? 0.3 : 1,
                  transition: 'opacity 0.15s, box-shadow 0.15s',
                }}
              >
                {/* Dept color accent bar */}
                {deptColor && node.type !== 'director' && (
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                    style={{ backgroundColor: deptColor }}
                  />
                )}

                {/* Top handle (input) */}
                <div
                  className="handle-dot absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center cursor-crosshair z-20 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
                  onPointerUp={e => finishWiring(e, node.id)}
                >
                  <div className="w-3 h-3 bg-emerald-400 border-2 border-white rounded-full shadow hover:scale-150 transition-transform" />
                </div>

                {/* Content */}
                <div className="flex flex-col items-center justify-center h-full px-3 pointer-events-none">
                  <div className={`mb-1.5 p-1.5 rounded-full bg-black/10 ${style.textClass}`}>
                    <IconComponent size={16} strokeWidth={2.5} />
                  </div>
                  <p className={`font-bold text-[12px] leading-tight text-center truncate w-full ${style.textClass}`}>{node.name}</p>
                  <p className={`text-[10px] mt-0.5 text-center opacity-75 truncate w-full ${style.textClass}`}>{node.role}</p>
                  {node.department && (
                    <span
                      className="mt-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={deptColor ? { backgroundColor: `${deptColor}25`, color: deptColor } : {}}
                    >
                      {node.department}
                    </span>
                  )}
                </div>

                {/* Bottom handle (output) */}
                <div
                  className="handle-dot absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center cursor-crosshair z-20 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
                  onPointerDown={e => startWiring(e, node.id)}
                >
                  <div className="w-3 h-3 bg-blue-400 border-2 border-white rounded-full shadow hover:scale-150 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-card/95 backdrop-blur-md rounded-xl px-3 py-2 border border-border shadow-card text-xs">
        {[
          { label: 'Direktör', colorClass: 'bg-primary' },
          { label: 'Lider', colorClass: 'bg-emerald-500' },
          { label: 'Yönetici', colorClass: 'bg-amber-500' },
          { label: 'Personel', colorClass: 'bg-muted' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-full ${item.colorClass}`} />
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
        <div className="h-3 w-px bg-border mx-1" />
        <span className="text-muted-foreground text-[10px]">Scroll = Zoom · Alt noktayı sürükle = Bağla</span>
      </div>
    </div>
  );
}

// ─── Minimap ──────────────────────────────────────────────────────────────────
function MinimapPanel({
  nodes,
  view,
  viewportSize,
  selectedIds,
  onViewChange,
}: {
  nodes: OrgNode[];
  view: { x: number; y: number; k: number };
  viewportSize: { w: number; h: number };
  selectedIds: Set<string>;
  onViewChange: (v: { x: number; y: number; k: number }) => void;
}) {
  const minX = Math.min(...nodes.map(n => n.x));
  const maxX = Math.max(...nodes.map(n => n.x + NODE_WIDTH));
  const minY = Math.min(...nodes.map(n => n.y));
  const maxY = Math.max(...nodes.map(n => n.y + NODE_HEIGHT));
  const bw = Math.max(2000, maxX - minX + 400);
  const bh = Math.max(1000, maxY - minY + 400);
  const mmW = 200;
  const mmH = 130;
  const scale = Math.min(mmW / bw, mmH / bh);
  const ox = mmW / 2 - (bw / 2 + minX - 200) * scale;
  const oy = mmH / 2 - (bh / 2 + minY - 200) * scale;

  const vwLeft = -view.x / view.k;
  const vwTop = -view.y / view.k;
  const vwWidth = viewportSize.w / view.k;
  const vwHeight = viewportSize.h / view.k;

  return (
    <div className="minimap-panel absolute bottom-3 right-3 z-20 rounded-xl border border-border shadow-elevated overflow-hidden bg-card/95 backdrop-blur-md" style={{ width: mmW, height: mmH }}>
      <div className="relative w-full h-full">
        {nodes.map(n => (
          <div
            key={n.id}
            className={`absolute rounded-sm ${selectedIds.has(n.id) ? 'bg-primary' : (n.type === 'director' ? 'bg-primary' : n.type === 'leader' ? 'bg-emerald-500' : n.type === 'manager' ? 'bg-amber-500' : 'bg-muted-foreground/40')}`}
            style={{
              left: ox + n.x * scale,
              top: oy + n.y * scale,
              width: Math.max(NODE_WIDTH * scale, 2),
              height: Math.max(NODE_HEIGHT * scale, 2),
            }}
          />
        ))}
        <div
          className="absolute border-2 border-primary bg-primary/10 cursor-move"
          style={{
            left: ox + vwLeft * scale,
            top: oy + vwTop * scale,
            width: vwWidth * scale,
            height: vwHeight * scale,
          }}
          onPointerDown={e => {
            e.stopPropagation();
            const startX = e.clientX;
            const startY = e.clientY;
            const startViewX = view.x;
            const startViewY = view.y;
            const onMove = (me: PointerEvent) => {
              const dx = (me.clientX - startX) / scale * view.k;
              const dy = (me.clientY - startY) / scale * view.k;
              onViewChange({ ...view, x: startViewX - dx, y: startViewY - dy });
            };
            const onUp = () => {
              window.removeEventListener('pointermove', onMove);
              window.removeEventListener('pointerup', onUp);
            };
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
          }}
        />
      </div>
    </div>
  );
}
