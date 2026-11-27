import { useState } from 'react';
import { METRIC_SERIES_BY_RANGE, SERVICES } from '../data/observabilityData';
import { TimeRange } from '../types/observability';
import { SparklineChart } from './SparklineChart';

interface MetricsViewProps {
  timeRange: TimeRange;
}

export function MetricsView({ timeRange }: MetricsViewProps) {
  const [selectedService, setSelectedService] = useState<string>('all');
  const series = METRIC_SERIES_BY_RANGE[timeRange];

  const visibleServices =
    selectedService === 'all' ? SERVICES : SERVICES.filter((s) => s.id === selectedService);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Performance Metrics Explorer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Time-series telemetry across throughput, tail latency, error ratio, and CPU saturation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="metrics-service-select" className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Service scope
          </label>
          <select
            id="metrics-service-select"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">All Services ({SERVICES.length})</option>
            {SERVICES.map((svc) => (
              <option key={svc.id} value={svc.id}>
                {svc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SparklineChart
          title="Requests Per Second"
          subtitle={`Ingress volume (${timeRange})`}
          currentValue={`${series.throughput[series.throughput.length - 1].value.toLocaleString()} req/s`}
          unit=" req/s"
          data={series.throughput}
          strokeColor="#2563EB"
          fillColor="rgba(37, 99, 235, 0.08)"
        />
        <SparklineChart
          title="P95 Latency"
          subtitle={`95th percentile execution duration (${timeRange})`}
          currentValue={`${series.p95Latency[series.p95Latency.length - 1].value} ms`}
          unit=" ms"
          data={series.p95Latency}
          strokeColor="#D97706"
          fillColor="rgba(217, 119, 6, 0.08)"
        />
        <SparklineChart
          title="HTTP 5xx Error Rate"
          subtitle={`Percentage of failed requests (${timeRange})`}
          currentValue={`${series.errorRate[series.errorRate.length - 1].value.toFixed(2)}%`}
          unit="%"
          data={series.errorRate}
          strokeColor="#DC2626"
          fillColor="rgba(220, 38, 38, 0.08)"
        />
        <SparklineChart
          title="CPU Saturation"
          subtitle={`Mean container CPU usage (${timeRange})`}
          currentValue={`${series.cpuUtilization[series.cpuUtilization.length - 1].value}%`}
          unit="%"
          data={series.cpuUtilization}
          strokeColor="#16A34A"
          fillColor="rgba(22, 163, 74, 0.08)"
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Host & Container Resource Breakdown
          </h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {visibleServices.map((svc) => (
            <div
              key={svc.id}
              className="grid grid-cols-1 items-center gap-4 px-5 py-3.5 sm:grid-cols-12"
            >
              <div className="sm:col-span-4">
                <div className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {svc.name}
                </div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {svc.region} · {svc.status}
                </div>
              </div>
              <div className="sm:col-span-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">CPU</span>
                  <span className="font-mono text-slate-800 tabular-nums dark:text-slate-200">
                    {svc.cpuPct}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-sm bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full ${
                      svc.cpuPct >= 85
                        ? 'bg-red-600'
                        : svc.cpuPct >= 75
                          ? 'bg-amber-600'
                          : 'bg-blue-600'
                    }`}
                    style={{ width: `${svc.cpuPct}%` }}
                  />
                </div>
              </div>
              <div className="sm:col-span-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Memory</span>
                  <span className="font-mono text-slate-800 tabular-nums dark:text-slate-200">
                    {svc.memoryPct}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-sm bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full ${
                      svc.memoryPct >= 85
                        ? 'bg-red-600'
                        : svc.memoryPct >= 75
                          ? 'bg-amber-600'
                          : 'bg-emerald-600'
                    }`}
                    style={{ width: `${svc.memoryPct}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
