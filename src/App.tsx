import {
  Activity,
  AlertOctagon,
  BarChart3,
  Bell,
  GitFork,
  Menu,
  Moon,
  ScrollText,
  Sun,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ErrorsView } from './components/ErrorsView';
import { LogsExplorer } from './components/LogsExplorer';
import { MetricsView } from './components/MetricsView';
import { OverviewDashboard } from './components/OverviewDashboard';
import { TracesView } from './components/TracesView';
import { UptimeAlertsView } from './components/UptimeAlertsView';
import {
  INITIAL_ALERT_RULES,
  INITIAL_ALERTS,
  INITIAL_ERRORS,
  INITIAL_LOGS,
} from './data/observabilityData';
import {
  AlertIncident,
  AlertRule,
  AlertState,
  ErrorGroup,
  ErrorStatus,
  LogEntry,
  NavSection,
  TimeRange,
} from './types/observability';

const NAV_ITEMS: Array<{ id: NavSection; label: string; icon: typeof Activity }> = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'logs', label: 'Logs', icon: ScrollText },
  { id: 'metrics', label: 'Metrics', icon: BarChart3 },
  { id: 'traces', label: 'Traces', icon: GitFork },
  { id: 'errors', label: 'Errors', icon: AlertOctagon },
  { id: 'uptime', label: 'Uptime & Alerts', icon: Bell },
];

const SECTION_TITLES: Record<NavSection, string> = {
  overview: 'Overview',
  logs: 'Centralized Logs',
  metrics: 'Metrics & Performance',
  traces: 'Distributed Traces',
  errors: 'Error Tracking',
  uptime: 'Uptime & Alerts',
};

export default function App() {
  const [section, setSection] = useState<NavSection>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [errors, setErrors] = useState<ErrorGroup[]>(INITIAL_ERRORS);
  const [incidents, setIncidents] = useState<AlertIncident[]>(INITIAL_ALERTS);
  const [rules, setRules] = useState<AlertRule[]>(INITIAL_ALERT_RULES);
  const [inspectedTraceId, setInspectedTraceId] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const handleAppendLog = useCallback((entry: LogEntry) => {
    setLogs((prev) => [entry, ...prev].slice(0, 120));
  }, []);

  const handleInspectTrace = useCallback((traceId: string) => {
    setInspectedTraceId(traceId);
    setSection('traces');
  }, []);

  const handleUpdateErrorStatus = useCallback((id: string, nextStatus: ErrorStatus) => {
    setErrors((prev) =>
      prev.map((err) => (err.id === id ? { ...err, status: nextStatus } : err)),
    );
  }, []);

  const handleUpdateIncident = useCallback((id: string, nextState: AlertState) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, state: nextState } : inc)),
    );
  }, []);

  const handleToggleRule = useCallback((id: string) => {
    setRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule)),
    );
  }, []);

  const handleCreateRule = useCallback((rule: Omit<AlertRule, 'id'>) => {
    setRules((prev) => [
      { ...rule, id: `rule-${Date.now()}` },
      ...prev,
    ]);
  }, []);

  const firingAlertsCount = incidents.filter((i) => i.state === 'Firing').length;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-14 items-center border-b border-slate-200 px-5 dark:border-slate-800">
          <span className="text-sm font-bold tracking-tight text-slate-900 whitespace-nowrap dark:text-slate-100">
            DIP Observability
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </span>
                {item.id === 'uptime' && firingAlertsCount > 0 && (
                  <span className="font-mono text-[11px] font-semibold text-red-600 tabular-nums dark:text-red-400">
                    {firingAlertsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 px-5 py-3.5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <div className="font-medium text-slate-700 dark:text-slate-300">Digital India Project</div>
          <div className="mt-0.5">Production · ap-south</div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/50"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-50 flex w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-14 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                DIP Observability
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation"
                className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSection(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium ${
                      active
                        ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation"
              className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 truncate text-xs text-slate-500 dark:text-slate-400">
              <span className="hidden sm:inline">dip-observability</span>
              <span className="hidden sm:inline" aria-hidden="true">
                /
              </span>
              <span className="truncate font-semibold text-slate-900 dark:text-slate-100">
                {SECTION_TITLES[section]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div
              className="flex items-center gap-0.5 rounded-md bg-slate-100 p-1 dark:bg-slate-800"
              role="group"
              aria-label="Time window"
            >
              {(['15m', '1h', '6h', '24h'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  className={`rounded px-2 py-1 font-mono text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    timeRange === range
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-slate-100'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="rounded-md border border-slate-200 p-1.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 p-5 lg:p-6">
          {section === 'overview' && (
            <OverviewDashboard
              timeRange={timeRange}
              activeAlerts={incidents}
              errors={errors}
              onNavigate={setSection}
            />
          )}
          {section === 'logs' && (
            <LogsExplorer
              logs={logs}
              onAppendLog={handleAppendLog}
              onInspectTrace={handleInspectTrace}
            />
          )}
          {section === 'metrics' && <MetricsView timeRange={timeRange} />}
          {section === 'traces' && (
            <TracesView key={inspectedTraceId ?? 'default'} initialTraceId={inspectedTraceId} />
          )}
          {section === 'errors' && (
            <ErrorsView errors={errors} onUpdateStatus={handleUpdateErrorStatus} />
          )}
          {section === 'uptime' && (
            <UptimeAlertsView
              incidents={incidents}
              rules={rules}
              onUpdateIncident={handleUpdateIncident}
              onToggleRule={handleToggleRule}
              onCreateRule={handleCreateRule}
            />
          )}
        </main>
      </div>
    </div>
  );
}
