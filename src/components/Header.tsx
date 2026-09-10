import React from 'react';
import {
  UserRole,
  Language,
} from '../types';
import { translations } from '../i18n/translations';
import {
  Dumbbell,
  Globe,
  RotateCcw,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  Apple,
  Crown,
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onResetData: () => void;
  onOpenAICoach: () => void;
  onOpenChat: () => void;
  unreadCount: number;
  pendingCheckInsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  language,
  onLanguageChange,
  onResetData,
  onOpenAICoach,
  onOpenChat,
  unreadCount,
  pendingCheckInsCount,
}) => {
  const t = translations[language];

  const roles: { role: UserRole; label: string; icon: React.ElementType }[] = [
    { role: 'coach', label: t.roles.coach, icon: Dumbbell },
    { role: 'athlete', label: t.roles.athlete, icon: UserCheck },
    { role: 'dietitian', label: t.roles.dietitian, icon: Apple },
    { role: 'admin', label: t.roles.admin, icon: Crown },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Dumbbell className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
                  {t.appName}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  PRO SaaS
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Persona Switcher Buttons */}
          <div className="hidden lg:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
            <span className="text-xs font-medium text-slate-400 px-2 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              {t.common.switchRole}
            </span>
            <div className="flex gap-1">
              {roles.map(({ role, label, icon: Icon }) => {
                const isActive = currentRole === role;
                return (
                  <button
                    key={role}
                    id={`persona-btn-${role}`}
                    onClick={() => onRoleChange(role)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                    {role === 'coach' && pendingCheckInsCount > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                        {pendingCheckInsCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Persona Select */}
          <div className="lg:hidden flex items-center">
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {roles.map(({ role, label }) => (
                <option key={role} value={role}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Actions: AI Co-Pilot, Chat, Language, Reset */}
          <div className="flex items-center gap-2">
            {/* Chat Drawer Button */}
            <button
              id="header-chat-btn"
              onClick={onOpenChat}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title={t.nav.messages}
            >
              <MessageSquare className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 font-bold rounded-full text-[10px] flex items-center justify-center ring-2 ring-slate-900">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <button
              id="header-lang-btn"
              onClick={() => onLanguageChange(language === 'en' ? 'fa' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition"
              title={t.common.language}
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{language === 'en' ? 'فارسی' : 'English'}</span>
            </button>

            {/* Reset Seed Data */}
            <button
              id="header-reset-btn"
              onClick={onResetData}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
              title={t.common.resetData}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
