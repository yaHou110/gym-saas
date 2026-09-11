import React from 'react';
import { Athlete, CheckIn, Language, AuditLog } from '../../types';
import { translations } from '../../i18n/translations';
import {
  Users,
  FileCode2,
  TrendingUp,
  Shield,
  Activity,
  Search,
} from 'lucide-react';

interface AdminPortalProps {
  athletes: Athlete[];
  checkIns: CheckIn[];
  activeTab: string;
  language: Language;
  auditLogs: AuditLog[];
}

const statusStyles: Record<Athlete['status'], string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  at_risk: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  pending_checkin: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  paused: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
};

export const AdminPortal: React.FC<AdminPortalProps> = ({
  athletes,
  checkIns,
  activeTab,
  language,
  auditLogs,
}) => {
  const t = translations[language];
  const [search, setSearch] = React.useState('');

  const sortedLogs = React.useMemo(() => {
    const ts = (v: string) => {
      const n = Date.parse(v);
      return Number.isFinite(n) ? n : 0;
    };
    return [...auditLogs].sort((a, b) => ts(b.timestamp) - ts(a.timestamp));
  }, [auditLogs]);

  const formatTs = React.useCallback(
    (iso: string) => {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      const locale = language === 'fa' ? 'fa-IR' : 'en-US';
      return d.toLocaleString(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    [language]
  );

  const avgCompliance = Math.round(
    athletes.reduce((acc, a) => acc + a.complianceRate, 0) / (athletes.length || 1)
  );
  const activeProgramCount = athletes.filter((a) => a.activeProgramId).length;

  const filteredAthletes = athletes.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  // ============ ADMIN OVERVIEW ============
  if (activeTab === 'adminOverview') {
    const kpis = [
      { label: t.admin.totalAthletes, value: athletes.length, icon: Users, color: 'text-emerald-400' },
      { label: t.admin.activePrograms, value: activeProgramCount, icon: FileCode2, color: 'text-sky-400' },
      { label: t.admin.platformCompliance, value: `${avgCompliance}%`, icon: TrendingUp, color: 'text-violet-400' },
      { label: t.checkIns.title, value: checkIns.length, icon: Activity, color: 'text-amber-400' },
    ];

    return (
      <div className="space-y-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h1 className="text-xl sm:text-2xl font-black text-white">{t.admin.overviewTitle}</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">{t.admin.overviewSubtitle}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <Icon className={`w-5 h-5 ${color}`} />
              <div className="text-2xl sm:text-3xl font-black text-white mt-2">{value}</div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============ ADMIN ROSTER ============
  if (activeTab === 'roster') {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-black text-white">{t.admin.rosterTitle}</h1>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.common.search}
              className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 w-full sm:w-64"
            />
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <th className="px-5 py-3 font-bold">{language === 'fa' ? 'ورزشکار' : 'Athlete'}</th>
                <th className="px-5 py-3 font-bold">{t.common.weight}</th>
                <th className="px-5 py-3 font-bold">{t.coachDashboard.avgCompliance}</th>
                <th className="px-5 py-3 font-bold">Streak</th>
                <th className="px-5 py-3 font-bold">{language === 'fa' ? 'وضعیت' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAthletes.map((a) => (
                <tr key={a.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={a.avatar} alt={a.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-white text-xs">
                          {language === 'fa' ? a.nameFa : a.name}
                        </div>
                        <div className="text-[11px] text-slate-500">{a.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-300 text-xs">{a.weightKg} kg</td>
                  <td className="px-5 py-3 text-slate-300 text-xs">{a.complianceRate}%</td>
                  <td className="px-5 py-3 text-slate-300 text-xs">{a.currentStreakDays}d</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${statusStyles[a.status]}`}>
                      {a.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ============ ADMIN AUDIT ============
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center gap-3">
        <Shield className="w-6 h-6 text-emerald-400" />
        <h1 className="text-xl sm:text-2xl font-black text-white">{t.admin.auditTitle}</h1>
      </div>

      {sortedLogs.length === 0 ? (
        <div className="bg-slate-900 p-10 rounded-2xl border border-slate-800 text-center text-sm text-slate-500">
          {t.admin.auditEmpty}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedLogs.map((log) => (
            <div key={log.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-white">
                  {log.actorName}{' '}
                  <span className="text-[10px] uppercase font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {log.actorRole}
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-1">{log.action}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{log.details}</div>
              </div>
              <span className="text-[10px] text-slate-500 whitespace-nowrap">{formatTs(log.timestamp)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
