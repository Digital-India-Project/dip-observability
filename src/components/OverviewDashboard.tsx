import { ArrowRight } from 'lucide-react';
import { METRIC_SERIES_BY_RANGE, SERVICES } from '../data/observabilityData';
import { AlertIncident, ErrorGroup, NavSection, TimeRange } from '../types/observability';
import { SparklineChart } from './SparklineChart';

interface OverviewDashboardProps {
  timeRange: TimeRange;
  activeAlerts: AlertIncident[];
  errors: ErrorGroup[];
  onNavigate: (section: NavSection) => void;
}

export function OverviewDashboard({
  timeRange,
  activeAlerts,
  errors,
  onNavigate,
}: OverviewDashboardProps) {
  const series = METRIC_SERIES_BY_RANGE[timeRange];
  const totalRps = SERVICES.reduce((acc, s) => acc + s.rps, 0);
  const avgP95 = Math.round(
    SERVICES.reduce((acc, s) => acc + s.p95LatencyMs, 0) / SERVICES.length,
  );
  const latestErrRate = series.errorRate[series.errorRate.length - 1]?.value ?? 0;
  const firingCount = activeAlerts.filter((a) => a.state === 'Firing').length;
  const openErrorsCount = errors.filter((e) => e.status === 'Open').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Cluster Throughput
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums dark:text-slate-100">
            {totalRps.toLocaleString()} req/s
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Across {SERVICES.length} services · Window {timeRange}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Mean P95 Latency
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums dark:text-slate-100">
            {avgP95} ms
          </div>
          <div className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            digilocker-sync & search-indexer elevated
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            5xx Error Rate
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums dark:text-slate-100">
            {latestErrRate.toFixed(2)}%
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {openErrorsCount} open error groups
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Active Incidents
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold text-red-600 tabular-nums dark:text-red-400">
            {firingCount} Firing
          </div>
          <button
            type="button"
            onClick={() => onNavigate('uptime')}
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Inspect alerts & uptime <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SparklineChart
          title="Request Throughput"
          subtitle={`Aggregate ingress rate (${timeRange} window)`}
          currentValue={`${series.throughput[series.throughput.length - 1].value.toLocaleString()} req/s`}
          unit=" req/s"
          data={series.throughput}
          strokeColor="#2563EB"
          fillColor="rgba(37, 99, 235, 0.08)"
        />
        <SparklineChart
          title="P95 Response Latency"
          subtitle={`End-to-end gateway latency (${timeRange} window)`}
          currentValue={`${series.p95Latency[series.p95Latency.length - 1].value} ms`}
          unit=" ms"
          data={series.p95Latency}
          strokeColor="#D97706"
          fillColor="rgba(217, 119, 6, 0.08)"
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Service Health Matrix
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Live throughput, tail latency, resource saturation, and error ratios per service
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('logs')}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Open Log Stream
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="px-5 py-3">Service</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Throughput</th>
                <th className="px-4 py-3 text-right">P95 Latency</th>
                <th className="px-4 py-3 text-right">Error Rate</th>
                <th className="px-5 py-3 text-right">CPU / Mem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {SERVICES.map((svc) => (
                <tr
                  key={svc.id}
                  className="h-11 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-5 py-2.5 font-mono text-xs font-medium text-slate-900 dark:text-slate-100">
                    {svc.name}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {svc.region}
                  </td>
                  <td className="px-4 py-2.5 text-xs font-medium">
                    <span
                      className={
                        svc.status === 'Healthy'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : svc.status === 'Degraded'
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-red-700 dark:text-red-400'
                      }
                    >
                      {svc.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-700 tabular-nums dark:text-slate-300">
                    {svc.rps.toLocaleString()} req/s
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-700 tabular-nums dark:text-slate-300">
                    {svc.p95LatencyMs} ms
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right font-mono text-xs tabular-nums ${
                      svc.errorRatePct >= 2
                        ? 'font-semibold text-red-600 dark:text-red-400'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {svc.errorRatePct.toFixed(2)}%
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono text-xs text-slate-600 tabular-nums dark:text-slate-400">
                    {svc.cpuPct}% / {svc.memoryPct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
