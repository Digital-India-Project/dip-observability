import { ChevronDown, ChevronRight, Pause, Play, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SERVICES } from '../data/observabilityData';
import { LogEntry, LogLevel } from '../types/observability';

interface LogsExplorerProps {
  logs: LogEntry[];
  onAppendLog: (entry: LogEntry) => void;
  onInspectTrace: (traceId: string) => void;
}

const STREAM_SAMPLES: Array<Omit<LogEntry, 'id' | 'timestamp'>> = [
  {
    level: 'INFO',
    service: 'auth-gateway',
    traceId: '77c812e940b19a03',
    message: 'Token introspection passed for service account dip-portal-bff',
    attributes: { clientId: 'dip-portal-bff', durationMs: 11, statusCode: 200 },
  },
  {
    level: 'WARN',
    service: 'digilocker-sync',
    traceId: '91a0e4d12c38f014',
    message: 'Retry 1/3 scheduled after transient 504 from state issuer endpoint',
    attributes: { issuer: 'MH-EDU', durationMs: 405, attempt: 1 },
  },
  {
    level: 'ERROR',
    service: 'search-indexer',
    traceId: '4f9c2a18b7e401d2',
    message: 'Shard flush delayed: JVM old-gen GC pause exceeded 420ms',
    attributes: { node: 'os-data-04', gcPauseMs: 428, heapUsedPct: 90.1 },
  },
];

export function LogsExplorer({ logs, onAppendLog, onInspectTrace }: LogsExplorerProps) {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<'ALL' | LogLevel>('ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(logs[0]?.id ?? null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (!isStreaming) return;
    const timer = window.setInterval(() => {
      const sample = STREAM_SAMPLES[Math.floor(Math.random() * STREAM_SAMPLES.length)];
      const now = new Date();
      const ts = `${now.toTimeString().slice(0, 8)}.${String(now.getMilliseconds()).padStart(3, '0')}`;
      onAppendLog({
        ...sample,
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: ts,
      });
    }, 2500);
    return () => window.clearInterval(timer);
  }, [isStreaming, onAppendLog]);

  const filteredLogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((entry) => {
      if (levelFilter !== 'ALL' && entry.level !== levelFilter) return false;
      if (serviceFilter !== 'ALL' && entry.service !== serviceFilter) return false;
      if (!q) return true;
      return (
        entry.message.toLowerCase().includes(q) ||
        entry.service.toLowerCase().includes(q) ||
        entry.traceId.toLowerCase().includes(q)
      );
    });
  }, [logs, search, levelFilter, serviceFilter]);

  const handleEmitTestLog = () => {
    const now = new Date();
    const ts = `${now.toTimeString().slice(0, 8)}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    onAppendLog({
      id: `log-${Date.now()}`,
      timestamp: ts,
      level: 'INFO',
      service: 'citizen-registry',
      traceId: '18f440c9a277e509',
      message: 'Synthetic health check probe verified primary and replica lag < 15ms',
      attributes: { lagMs: 12, synthetic: true, region: 'ap-south-1' },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1 max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter logs by message, service, or trace ID..."
              aria-label="Filter logs"
              className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pr-3 pl-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-900"
            />
          </div>

          <div className="flex items-center gap-1 rounded-md bg-slate-100 p-1 dark:bg-slate-800">
            {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  levelFilter === lvl
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-slate-100'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {lvl === 'ALL' ? 'All Levels' : lvl}
              </button>
            ))}
          </div>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            aria-label="Filter by service"
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Services</option>
            {SERVICES.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsStreaming((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              isStreaming
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {isStreaming ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isStreaming ? 'Pause Tail' : 'Live Tail'}
          </button>

          <button
            type="button"
            onClick={handleEmitTestLog}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Emit Probe Log
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span>
            Showing <strong className="font-mono text-slate-900 tabular-nums dark:text-slate-100">{filteredLogs.length}</strong> of{' '}
            <span className="font-mono tabular-nums">{logs.length}</span> log events
          </span>
          <span>Click any row to inspect structured attributes</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              No log events match the active filters
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Reset your search query, severity filter, or service scope to inspect incoming logs.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setLevelFilter('ALL');
                setServiceFilter('ALL');
              }}
              className="mt-4 rounded-md border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLogs.map((entry) => {
              const isOpen = expandedId === entry.id;
              return (
                <div key={entry.id}>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : entry.id)}
                    className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span className="mt-0.5 text-slate-400">
                      {isOpen ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <span className="w-24 shrink-0 font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
                      {entry.timestamp}
                    </span>
                    <span
                      className={`w-12 shrink-0 font-mono text-xs font-semibold ${
                        entry.level === 'ERROR'
                          ? 'text-red-600 dark:text-red-400'
                          : entry.level === 'WARN'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {entry.level}
                    </span>
                    <span className="w-36 shrink-0 truncate font-mono text-xs font-medium text-slate-700 dark:text-slate-300">
                      {entry.service}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-900 dark:text-slate-100">
                      {entry.message}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50 px-11 py-3.5 dark:border-slate-800 dark:bg-slate-950/60">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 text-xs">
                        <div className="font-mono text-slate-600 dark:text-slate-400">
                          Trace ID: <span className="text-slate-900 dark:text-slate-100">{entry.traceId}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onInspectTrace(entry.traceId)}
                          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                          View Distributed Trace →
                        </button>
                      </div>
                      <pre className="overflow-x-auto rounded-md border border-slate-200 bg-white p-3 font-mono text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                        {JSON.stringify(entry.attributes, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
