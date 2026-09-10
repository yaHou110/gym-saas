import React from 'react';
import { UserRole, Language } from '../types';
import { translations } from '../i18n/translations';
import {
  Users,
  FileCode2,
  BookOpen,
  Apple,
  ClipboardCheck,
  BarChart3,
  Dumbbell,
  CalendarDays,
  Shield,
  Activity,
} from 'lucide-react';

interface NavigationProps {
  currentRole: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
  language: Language;
  pendingCheckInsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentRole,
  activeTab,
  onTabChange,
  language,
  pendingCheckInsCount,
}) => {
  const t = translations[language];

  interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }

  let items: NavItem[] = [];

  if (currentRole === 'coach') {
    items = [
      { id: 'roster', label: t.nav.athletes, icon: Users },
      { id: 'programs', label: t.nav.programs, icon: FileCode2 },
      { id: 'exercises', label: t.nav.exercises, icon: BookOpen },
      { id: 'checkins', label: t.nav.checkins, icon: ClipboardCheck, badge: pendingCheckInsCount },
      { id: 'nutrition', label: t.nav.nutrition, icon: Apple },
      { id: 'analytics', label: t.nav.analytics, icon: BarChart3 },
    ];
  } else if (currentRole === 'athlete') {
    items = [
      { id: 'today', label: t.nav.todayWorkout, icon: Dumbbell },
      { id: 'nutrition', label: t.nav.myNutrition, icon: Apple },
      { id: 'checkin', label: t.nav.myCheckIn, icon: CalendarDays },
      { id: 'progress', label: t.nav.myProgress, icon: Activity },
      { id: 'exercises', label: t.nav.exercises, icon: BookOpen },
    ];
  } else if (currentRole === 'dietitian') {
    items = [
      { id: 'nutrition', label: t.nav.nutrition, icon: Apple },
      { id: 'roster', label: t.nav.athletes, icon: Users },
      { id: 'checkins', label: t.nav.checkins, icon: ClipboardCheck },
    ];
  } else if (currentRole === 'admin') {
    items = [
      { id: 'adminOverview', label: t.nav.adminOverview, icon: BarChart3 },
      { id: 'roster', label: t.nav.athletes, icon: Users },
      { id: 'adminAudit', label: t.nav.adminAudit, icon: Shield },
    ];
  }

  return (
    <nav className="bg-slate-900 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none">
        {items.map(({ id, label, icon: Icon, badge }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              id={`nav-tab-${id}`}
              onClick={() => onTabChange(id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{label}</span>
              {typeof badge === 'number' && badge > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
