import { useMemo, useState } from 'react';
import { TRACES } from '../data/observabilityData';
import { TraceRecord } from '../types/observability';

interface TracesViewProps {
  initialTraceId?: string | null;
}

export function TracesView({ initialTraceId }: TracesViewProps) {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OK' | 'ERROR'>('ALL');
  const [selectedId, setSelectedId] = useState<string>(initialTraceId ?? TRACES[0].traceId);

  const filteredTraces = useMemo(() => {
    return TRACES.filter((t) => (statusFilter === 'ALL' ? true : t.status === statusFilter));
  }, [statusFilter]);

  const activeTrace: TraceRecord | undefined =
    TRACES.find((t) => t.traceId === selectedId) ?? filteredTraces[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Distributed Request Traces
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select a trace to inspect cross-service span timing and error propagation
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-md bg-slate-100 p-1 dark:bg-slate-800">
          {(['ALL', 'OK', 'ERROR'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === status
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {status === 'ALL' ? 'All Traces' : status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="rounded-lg border border-slate-200 bg-white lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-4 py-3 text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
            Recent Traces ({filteredTraces.length})
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTraces.map((trace) => {
              const isSelected = activeTrace?.traceId === trace.traceId;
              return (
                <button
                  key={trace.traceId}
                  type="button"
                  onClick={() => setSelectedId(trace.traceId)}
                  className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {trace.operation}
                    </div>
                    <div className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {trace.rootService} · {trace.traceId.slice(0, 12)}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-mono text-xs font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                      {trace.totalDurationMs} ms
                    </div>
                    <div
                      className={`mt-1 font-mono text-xs font-medium ${
                        trace.status === 'ERROR'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {trace.status} · {trace.spanCount} spans
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
          {activeTrace ? (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
                <div>
                  <div className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {activeTrace.operation}
                  </div>
                  <div className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                    Trace {activeTrace.traceId} · Started {activeTrace.timestamp}
                  </div>
                </div>
                <div className="font-mono text-xs font-semibold text-slate-800 tabular-nums dark:text-slate-200">
                  Total: {activeTrace.totalDurationMs} ms
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeTrace.spans.map((span) => {
                  const leftPct = (span.startOffsetMs / activeTrace.totalDurationMs) * 100;
                  const widthPct = Math.max(
                    (span.durationMs / activeTrace.totalDurationMs) * 100,
                    2.5,
                  );
                  const isChild = span.parentId !== null;
                  return (
                    <div key={span.id} className="px-5 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className={`min-w-0 ${isChild ? 'pl-4' : ''}`}>
                          <div className="truncate font-mono text-xs font-medium text-slate-900 dark:text-slate-100">
                            {span.operation}
                          </div>
                          <div className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {span.service} ·{' '}
                            {Object.entries(span.tags)
                              .map(([k, v]) => `${k}=${v}`)
                              .join(' · ')}
                          </div>
                        </div>
                        <div className="shrink-0 text-right font-mono text-xs tabular-nums">
                          <span
                            className={
                              span.status === 'ERROR'
                                ? 'font-semibold text-red-600 dark:text-red-400'
                                : 'text-slate-700 dark:text-slate-300'
                            }
                          >
                            {span.durationMs} ms
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 h-2 w-full rounded-sm bg-slate-100 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-sm ${
                            span.status === 'ERROR' ? 'bg-red-600' : 'bg-blue-600'
                          }`}
                          style={{
                            marginLeft: `${Math.min(leftPct, 97)}%`,
                            width: `${Math.min(widthPct, 100 - leftPct)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-xs text-slate-500 dark:text-slate-400">
              No trace selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
