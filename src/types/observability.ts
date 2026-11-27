export type NavSection = 'overview' | 'logs' | 'metrics' | 'traces' | 'errors' | 'uptime';

export type TimeRange = '15m' | '1h' | '6h' | '24h';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export type HealthState = 'Healthy' | 'Degraded' | 'Critical';

export interface ServiceHealth {
  id: string;
  name: string;
  region: string;
  rps: number;
  p95LatencyMs: number;
  errorRatePct: number;
  cpuPct: number;
  memoryPct: number;
  status: HealthState;
}

export interface MetricPoint {
  label: string;
  value: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: string;
  traceId: string;
  message: string;
  attributes: Record<string, string | number | boolean>;
}

export interface TraceSpan {
  id: string;
  parentId: string | null;
  service: string;
  operation: string;
  startOffsetMs: number;
  durationMs: number;
  status: 'OK' | 'ERROR';
  tags: Record<string, string>;
}

export interface TraceRecord {
  traceId: string;
  rootService: string;
  operation: string;
  timestamp: string;
  totalDurationMs: number;
  spanCount: number;
  status: 'OK' | 'ERROR';
  spans: TraceSpan[];
}

export type ErrorStatus = 'Open' | 'Acknowledged' | 'Resolved';

export interface ErrorGroup {
  id: string;
  exceptionType: string;
  message: string;
  service: string;
  firstSeen: string;
  lastSeen: string;
  eventsCount: number;
  affectedUsers: number;
  status: ErrorStatus;
  stackTrace: string[];
  environment: string;
}

export interface UptimeMonitor {
  id: string;
  name: string;
  endpoint: string;
  region: string;
  uptimePct: number;
  responseMs: number;
  status: 'Up' | 'Degraded' | 'Down';
  lastChecked: string;
  history: Array<'up' | 'degraded' | 'down'>;
}

export type AlertSeverity = 'Critical' | 'Warning';
export type AlertState = 'Firing' | 'Acknowledged' | 'Resolved';

export interface AlertIncident {
  id: string;
  ruleName: string;
  service: string;
  severity: AlertSeverity;
  state: AlertState;
  triggeredAt: string;
  metricSummary: string;
}

export interface AlertRule {
  id: string;
  name: string;
  service: string;
  metric: string;
  condition: string;
  severity: AlertSeverity;
  enabled: boolean;
}
