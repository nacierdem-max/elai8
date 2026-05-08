'use client';
import React, { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { PERSONS, PROJECTS, TASKS, RISKS, DEPARTMENT_COLORS } from '@/data/mockData';
import { useRole } from '@/context/RoleContext';
import { Send, Sparkles, Bot, User, ChevronRight, BarChart2 } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  results?: ResultItem[];
}

interface ResultItem {
  type: 'person' | 'project' | 'task' | 'risk';
  id: string;
  name: string;
  detail: string;
  color: string;
  href: string;
}

const PRESET_QUERIES = [
  'Benim aktif görevlerim neler?',
  'Hangi projelerim var?',
  'Gecikmiş görevler hangileri?',
  'Kritik riskler neler?',
  'En yoğun mühendis kim?',
  'Bu ay tamamlanan görevler?',
];

function generateResponse(query: string, myPersonId: string | undefined, canViewAll: boolean): { text: string; results?: ResultItem[] } {
  const q = query.toLowerCase();

  const myTasks = myPersonId
    ? TASKS.filter(t => t.assigneeId === myPersonId || (t.collaboratorIds || []).includes(myPersonId))
    : [];

  const myProjects = myPersonId
    ? PROJECTS.filter(p => p.leadId === myPersonId || (p.collaboratorIds || []).includes(myPersonId))
    : [];

  if (q.includes('benim') && (q.includes('görev') || q.includes('iş'))) {
    if (!myPersonId) return { text: 'Görevlerinizi görmek için lütfen giriş yapın.' };
    const active = myTasks.filter(t => t.status !== 'Tamamlandı');
    return {
      text: `Size atanan ${active.length} aktif görev bulunuyor. ${myTasks.filter(t => t.status === 'Gecikmiş').length} gecikmiş, ${myTasks.filter(t => t.status === 'Riskli').length} riskli görev var.`,
      results: active.slice(0, 5).map(t => {
        const p = PROJECTS.find(pr => pr.id === t.projectId);
        return {
          type: 'task' as const,
          id: t.id,
          name: t.name,
          detail: `${t.status} · ${t.priority} · ${p?.name || ''}`,
          color: t.status === 'Gecikmiş' ? '#ef4444' : t.status === 'Riskli' ? '#f97316' : '#06b6d4',
          href: '/task-kanban-panel',
        };
      }),
    };
  }

  if (q.includes('benim') && q.includes('proje')) {
    if (!myPersonId) return { text: 'Projelerinizi görmek için lütfen giriş yapın.' };
    return {
      text: `${myProjects.length} projede yer alıyorsunuz. ${myProjects.filter(p => p.status === 'Kritik').length} kritik, ${myProjects.filter(p => p.status === 'Aktif').length} aktif proje var.`,
      results: myProjects.map(p => ({
        type: 'project' as const,
        id: p.id,
        name: p.name,
        detail: `${p.status} · %${p.completionPercent} tamamlandı`,
        color: p.status === 'Kritik' ? '#ef4444' : p.status === 'Aktif' ? '#22c55e' : '#3b7dd8',
        href: `/projects/${p.id}`,
      })),
    };
  }

  if (q.includes('gecikmiş')) {
    const tasks = canViewAll
      ? TASKS.filter(t => t.status === 'Gecikmiş')
      : myTasks.filter(t => t.status === 'Gecikmiş');
    return {
      text: `${tasks.length} gecikmiş görev bulunuyor.${!canViewAll ? ' (Yalnızca sizin görevleriniz)' : ''}`,
      results: tasks.map(t => {
        const assignee = PERSONS.find(p => p.id === t.assigneeId);
        return {
          type: 'task' as const,
          id: t.id,
          name: t.name,
          detail: `${assignee?.name || ''} · ${t.endDate} · ${Math.abs(t.remainingDays)} gün gecikmiş`,
          color: '#ef4444',
          href: '/task-kanban-panel',
        };
      }),
    };
  }

  if (q.includes('kritik') && q.includes('risk')) {
    const risks = canViewAll
      ? RISKS.filter(r => r.status === 'Açık' || r.status === 'Riskli')
      : RISKS.filter(r => (r.status === 'Açık' || r.status === 'Riskli') && myProjects.some(p => p.id === r.projectId));
    return {
      text: `${risks.length} aktif/kritik risk bulunuyor.`,
      results: risks.map(r => ({
        type: 'risk' as const,
        id: r.id,
        name: r.title,
        detail: `${r.status} · ${r.date}`,
        color: r.status === 'Açık' ? '#ef4444' : '#f97316',
        href: '/risks',
      })),
    };
  }

  if (q.includes('yoğun') || q.includes('mühendis')) {
    if (!canViewAll) {
      return { text: 'Tüm personel iş yükünü görmek için yönetici yetkisi gerekiyor. Kendi görevlerinizi "benim görevlerim" diye sorabilirsiniz.' };
    }
    const top5 = [...PERSONS].sort((a, b) => b.activeTasks - a.activeTasks).slice(0, 5);
    return {
      text: `En yoğun 5 mühendis:`,
      results: top5.map(p => ({
        type: 'person' as const,
        id: p.id,
        name: p.name,
        detail: `${p.activeTasks} aktif görev · ${p.department}`,
        color: DEPARTMENT_COLORS[p.department] || '#94a3b8',
        href: `/team?person=${p.id}`,
      })),
    };
  }

  if (q.includes('tamamlanan') || q.includes('bitti')) {
    const tasks = canViewAll
      ? TASKS.filter(t => t.status === 'Tamamlandı')
      : myTasks.filter(t => t.status === 'Tamamlandı');
    return {
      text: `${tasks.length} tamamlanmış görev bulunuyor.${!canViewAll ? ' (Yalnızca sizin görevleriniz)' : ''}`,
      results: tasks.slice(0, 5).map(t => {
        const assignee = PERSONS.find(p => p.id === t.assigneeId);
        return {
          type: 'task' as const,
          id: t.id,
          name: t.name,
          detail: `${assignee?.name || ''} · ${t.endDate}`,
          color: '#22c55e',
          href: '/task-kanban-panel',
        };
      }),
    };
  }

  if (q.includes('proje') && !q.includes('benim')) {
    const projects = canViewAll ? PROJECTS : myProjects;
    const kritik = projects.filter(p => p.status === 'Kritik');
    return {
      text: `${projects.length} proje görüntülenebilir. ${kritik.length} kritik durumda.`,
      results: kritik.map(p => ({
        type: 'project' as const,
        id: p.id,
        name: p.name,
        detail: `Kritik · %${p.completionPercent} tamamlandı · ${p.endDate}`,
        color: '#ef4444',
        href: `/projects/${p.id}`,
      })),
    };
  }

  return {
    text: `"${query}" sorgunuz için şu anda doğrudan bir sonuç bulunamadı. Şu konularda yardımcı olabilirim: görevleriniz, projeleriniz, gecikmiş işler, riskler, personel iş yükü.`,
  };
}

export default function AIAssistantPage() {
  const { currentRole, currentPerson, canViewAllData, isTeamLeader } = useRole();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Merhaba${currentPerson ? ` ${currentPerson.name.split(' ')[0]}` : ''}! Ben EliarArGe AI Asistanınızım. Size projeleriniz, görevleriniz ve Ar-Ge merkezi hakkında sorular sorabilirsiniz.`,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (query: string) => {
    if (!query.trim()) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));

    const response = generateResponse(query, currentRole?.personId, canViewAllData || isTeamLeader);
    const assistantMsg: Message = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: response.text,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      results: response.results,
    };
    setMessages(prev => [...prev, assistantMsg]);
    setIsTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <AppLayout currentPath="/ai-assistant">
      <div className="flex flex-col h-[calc(100vh-120px)] max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0071e3, #5856d6)' }}>
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">AI Asistan</h1>
            <p className="text-xs text-muted-foreground">
              {canViewAllData ? 'Tüm verilere erişim · Yönetici modu' : isTeamLeader ? 'Ekip verilerine erişim · Lider modu' : 'Kişisel veri erişimi · Personel modu'}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: msg.role === 'assistant' ? 'linear-gradient(135deg, #0071e3, #5856d6)' : '#f5f5f7' }}
              >
                {msg.role === 'assistant'
                  ? <Bot size={14} className="text-white" />
                  : <User size={14} className="text-muted-foreground" />
                }
              </div>
              <div className={`flex-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                <div
                  className="px-4 py-3 rounded-2xl text-sm"
                  style={{
                    background: msg.role === 'user' ? '#0071e3' : '#ffffff',
                    color: msg.role === 'user' ? '#fff' : '#1d1d1f',
                    border: msg.role === 'assistant' ? '1px solid #e8e8ed' : 'none',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  }}
                >
                  {msg.content}
                </div>
                {msg.results && msg.results.length > 0 && (
                  <div className="w-full space-y-1.5">
                    {msg.results.map(result => (
                      <Link
                        key={result.id}
                        href={result.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all"
                        style={{ background: '#fff' }}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${result.color}18` }}>
                          <BarChart2 size={13} style={{ color: result.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{result.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{result.detail}</p>
                        </div>
                        <ChevronRight size={12} className="text-muted-foreground shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}
                <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #0071e3, #5856d6)' }}>
                <Bot size={14} className="text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white border border-border" style={{ borderRadius: '18px 18px 18px 4px' }}>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Preset queries */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          {PRESET_QUERIES.map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border border-border hover:border-primary/40 hover:bg-primary/5 transition-all shrink-0"
              style={{ background: '#fff', color: '#3a3a3c' }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Bir soru sorun... (örn: benim gecikmiş görevlerim neler?)"
            className="flex-1 px-4 py-3 rounded-2xl border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
            style={{ background: '#fff' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all disabled:opacity-40"
            style={{ background: '#0071e3' }}
          >
            <Send size={16} className="text-white" />
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
