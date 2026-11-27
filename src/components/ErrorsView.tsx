import { useMemo, useState } from 'react';
import { ErrorGroup, ErrorStatus } from '../types/observability';

interface ErrorsViewProps {
  errors: ErrorGroup[];
  onUpdateStatus: (id: string, nextStatus: ErrorStatus) => void;
}

export function ErrorsView({ errors, onUpdateStatus }: ErrorsViewProps) {
  const [statusFilter, setStatusFilter] = useState<'ALL' | ErrorStatus>('ALL');
  const [selectedId, setSelectedId] = useState<string>(errors[0]?.id ?? '');

  const filteredErrors = useMemo(() => {
    return errors.filter((e) => (statusFilter === 'ALL' ? true : e.status === statusFilter));
  }, [errors, statusFilter]);

  const activeError =
    errors.find((e) => e.id === selectedId) ?? filteredErrors[0] ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Error Tracking & Exception Inbox
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Grouped runtime exceptions with stack traces, affected user counts, and triage state
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-md bg-slate-100 p-1 dark:bg-slate-800">
          {(['ALL', 'Open', 'Acknowledged', 'Resolved'] as const).map((status) => (
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
              {status === 'ALL' ? 'All Issues' : status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="rounded-lg border border-slate-200 bg-white lg:col-span-6 dark:border-slate-800 dark:bg-slate-900">
          {filteredErrors.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                No exceptions in this state
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Switch back to All Issues to inspect resolved or acknowledged groups.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredErrors.map((err) => {
                const isSelected = activeError?.id === err.id;
                return (
                  <button
                    key={err.id}
                    type="button"
                    onClick={() => setSelectedId(err.id)}
                    className={`flex w-full items-start justify-between gap-4 px-5 py-3.5 text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {err.exceptionType}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                          {err.service}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-600 dark:text-slate-300">
                        {err.message}
                      </p>
                      <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        First seen {err.firstSeen} · Last seen {err.lastSeen}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div
                        className={`text-xs font-semibold ${
                          err.status === 'Open'
                            ? 'text-red-600 dark:text-red-400'
                            : err.status === 'Acknowledged'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {err.status}
                      </div>
                      <div className="mt-1 font-mono text-xs text-slate-700 tabular-nums dark:text-slate-300">
                        {err.eventsCount} events
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white lg:col-span-6 dark:border-slate-800 dark:bg-slate-900">
          {activeError ? (
            <div className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
                <div>
                  <h3 className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {activeError.exceptionType}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    {activeError.message}
                  </p>
                  <div className="mt-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {activeError.service} · {activeError.environment}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {activeError.status !== 'Acknowledged' && activeError.status !== 'Resolved' && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(activeError.id, 'Acknowledged')}
                      className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Acknowledge
                    </button>
                  )}
                  {activeError.status !== 'Resolved' ? (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(activeError.id, 'Resolved')}
                      className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 whitespace-nowrap"
                    >
                      Resolve Issue
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(activeError.id, 'Open')}
                      className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-b border-slate-200 py-3.5 text-xs dark:border-slate-800">
                <div>
                  <div className="text-slate-500 dark:text-slate-400">Events</div>
                  <div className="mt-0.5 font-mono text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                    {activeError.eventsCount}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 dark:text-slate-400">Affected Users</div>
                  <div className="mt-0.5 font-mono text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                    {activeError.affectedUsers}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 dark:text-slate-400">Triage State</div>
                  <div className="mt-0.5 font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {activeError.status}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  Stack Trace
                </div>
                <pre className="overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-3.5 font-mono text-xs leading-6 text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  {activeError.stackTrace.join('\n')}
                </pre>
              </div>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-xs text-slate-500 dark:text-slate-400">
              Select an error group to inspect its stack trace.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
