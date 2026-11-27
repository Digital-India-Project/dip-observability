import { Plus, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { SERVICES, UPTIME_MONITORS } from '../data/observabilityData';
import {
  AlertIncident,
  AlertRule,
  AlertSeverity,
  AlertState,
} from '../types/observability';

interface UptimeAlertsViewProps {
  incidents: AlertIncident[];
  rules: AlertRule[];
  onUpdateIncident: (id: string, nextState: AlertState) => void;
  onToggleRule: (id: string) => void;
  onCreateRule: (rule: Omit<AlertRule, 'id'>) => void;
}

export function UptimeAlertsView({
  incidents,
  rules,
  onUpdateIncident,
  onToggleRule,
  onCreateRule,
}: UptimeAlertsViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleService, setRuleService] = useState(SERVICES[0].name);
  const [ruleMetric, setRuleMetric] = useState('error_rate_pct');
  const [ruleCondition, setRuleCondition] = useState('> 2.5% for 5m');
  const [ruleSeverity, setRuleSeverity] = useState<AlertSeverity>('Critical');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;
    onCreateRule({
      name: ruleName.trim(),
      service: ruleService,
      metric: ruleMetric,
      condition: ruleCondition.trim() || '> threshold',
      severity: ruleSeverity,
      enabled: true,
    });
    setRuleName('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Endpoint Uptime Monitors
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            30-interval synthetic availability checks across Mumbai and Hyderabad probe regions
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {UPTIME_MONITORS.map((mon) => (
            <div
              key={mon.id}
              className="grid grid-cols-1 items-center gap-4 px-5 py-4 lg:grid-cols-12"
            >
              <div className="lg:col-span-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {mon.name}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span
                    className={`text-xs font-semibold ${
                      mon.status === 'Up'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : mon.status === 'Degraded'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {mon.status}
                  </span>
                </div>
                <div className="mt-0.5 truncate font-mono text-xs text-slate-500 dark:text-slate-400">
                  {mon.endpoint}
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="flex items-center gap-1" aria-label="30-interval uptime history">
                  {mon.history.map((tick, idx) => (
                    <span
                      key={idx}
                      className={`h-5 flex-1 rounded-xs ${
                        tick === 'up'
                          ? 'bg-emerald-500/90'
                          : tick === 'degraded'
                            ? 'bg-amber-500'
                            : 'bg-red-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 text-right lg:col-span-3 lg:justify-end">
                <div>
                  <div className="font-mono text-xs font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                    {mon.uptimePct.toFixed(2)}%
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {mon.region}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xs font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                    {mon.responseMs} ms
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Checked {mon.lastChecked}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Alert Incidents
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Triggered threshold breaches requiring acknowledgment or remediation
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="px-5 py-3">Incident</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Triggered</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3">
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {inc.ruleName}
                    </div>
                    <div className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {inc.metricSummary}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">
                    {inc.service}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold">
                    <span
                      className={
                        inc.severity === 'Critical'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }
                    >
                      {inc.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">
                    {inc.state}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
                    {inc.triggeredAt}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      {inc.state === 'Firing' && (
                        <button
                          type="button"
                          onClick={() => onUpdateIncident(inc.id, 'Acknowledged')}
                          className="rounded border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          Acknowledge
                        </button>
                      )}
                      {inc.state !== 'Resolved' && (
                        <button
                          type="button"
                          onClick={() => onUpdateIncident(inc.id, 'Resolved')}
                          className="rounded bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 whitespace-nowrap"
                        >
                          Resolve
                        </button>
                      )}
                      {inc.state === 'Resolved' && (
                        <span className="text-xs text-slate-400">Closed</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Configured Alert Rules
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Threshold definitions evaluated every 30 seconds
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            New Alert Rule
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5"
            >
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {rule.name}
                </div>
                <div className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                  {rule.service} · {rule.metric} {rule.condition} · {rule.severity}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToggleRule(rule.id)}
                className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  rule.enabled
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {rule.enabled ? 'Enabled' : 'Paused'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-alert-title"
        >
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h3
                id="create-alert-title"
                className="text-sm font-semibold text-slate-900 dark:text-slate-100"
              >
                Create Alert Rule
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close dialog"
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label
                  htmlFor="rule-name"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Rule name
                </label>
                <input
                  id="rule-name"
                  type="text"
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Citizen Registry High CPU"
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="rule-service"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    Service
                  </label>
                  <select
                    id="rule-service"
                    value={ruleService}
                    onChange={(e) => setRuleService(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {SERVICES.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="rule-severity"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    Severity
                  </label>
                  <select
                    id="rule-severity"
                    value={ruleSeverity}
                    onChange={(e) => setRuleSeverity(e.target.value as AlertSeverity)}
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="Critical">Critical</option>
                    <option value="Warning">Warning</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="rule-metric"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    Metric
                  </label>
                  <select
                    id="rule-metric"
                    value={ruleMetric}
                    onChange={(e) => setRuleMetric(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="error_rate_pct">error_rate_pct</option>
                    <option value="p95_latency_ms">p95_latency_ms</option>
                    <option value="cpu_utilization_pct">cpu_utilization_pct</option>
                    <option value="http_5xx_count">http_5xx_count</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="rule-condition"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    Threshold condition
                  </label>
                  <input
                    id="rule-condition"
                    type="text"
                    value={ruleCondition}
                    onChange={(e) => setRuleCondition(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-md border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
