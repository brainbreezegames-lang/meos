'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Types
interface AnalyticsData {
  overview: {
    visitors: number;
    visitorsChange: number;
    pageViews: number;
    pageViewsChange: number;
    avgTime: string;
    avgTimeChange: number;
  };
  sources: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  visitorTypes: {
    recruiters: { count: number; percentage: number };
    visitors: { count: number; percentage: number };
    skipped: { count: number; percentage: number };
  };
  topContent: Array<{
    name: string;
    opens: number;
    change: number;
  }>;
  recruiterFunnel: {
    visited: number;
    viewedWork: number;
    downloadedCV: number;
    contacted: number;
  };
  liveVisitors: Array<{
    location: string;
    viewing: string;
    duration: string;
  }>;
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
}

type TimeRange = 'today' | '7days' | '30days' | 'alltime';

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7days', label: '7 Days' },
  { value: '30days', label: '30 Days' },
  { value: 'alltime', label: 'All Time' },
];

function ProgressBar({ percentage, color = 'blue' }: { percentage: number; color?: string }) {
  const colors: Record<string, string> = {
    blue: 'rgba(59, 130, 246, 0.8)',
    green: 'rgba(34, 197, 94, 0.8)',
    purple: 'rgba(168, 85, 247, 0.8)',
    orange: 'rgba(249, 115, 22, 0.8)',
  };

  return (
    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: colors[color] || colors.blue }}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
}

function StatCard({ value, label, change }: { value: string | number; label: string; change?: number }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="text-xs text-white/50 mt-1">{label}</div>
      {change !== undefined && (
        <div className={`text-xs mt-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
        </div>
      )}
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-20 h-10" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="rgba(59, 130, 246, 0.8)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with time range */}
      <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {TIME_RANGES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTimeRange(value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                timeRange === value
                  ? 'bg-white/20 text-white'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-green-400">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Live
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5 space-y-6">
          {/* Overview Stats */}
          <section>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Overview</h3>
            <div className="grid grid-cols-3 gap-4">
              <StatCard value={data.overview.visitors} label="Visitors" change={data.overview.visitorsChange} />
              <StatCard value={data.overview.pageViews} label="Page Views" change={data.overview.pageViewsChange} />
              <StatCard value={data.overview.avgTime} label="Avg. Time" change={data.overview.avgTimeChange} />
            </div>
          </section>

          {/* Visitors Sparkline */}
          <section className="p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white/80">Visitors</div>
                <div className="text-xs text-white/50 mt-0.5">Today: 34 visitors</div>
                <div className="text-xs text-white/50">Peak: 2-3 PM (12)</div>
              </div>
              <Sparkline data={[5, 8, 12, 9, 15, 12, 18, 14]} />
            </div>
          </section>

          {/* Top Sources */}
          <section>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Top Sources</h3>
            <div className="space-y-3">
              {data.sources.map((source) => (
                <div key={source.name} className="flex items-center gap-3">
                  <span className="text-sm text-white/80 w-20 truncate">{source.name}</span>
                  <span className="text-xs text-white/50 w-8">{source.count}</span>
                  <ProgressBar percentage={source.percentage} />
                  <span className="text-xs text-white/50 w-10 text-right">{source.percentage}%</span>
                </div>
              ))}
            </div>
          </section>

          {/* Visitor Type */}
          <section>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Visitor Type</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm w-28">👔 Recruiters</span>
                <span className="text-xs text-white/50 w-8">{data.visitorTypes.recruiters.count}</span>
                <ProgressBar percentage={data.visitorTypes.recruiters.percentage} color="purple" />
                <span className="text-xs text-white/50 w-10 text-right">{data.visitorTypes.recruiters.percentage}%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm w-28">👋 Visitors</span>
                <span className="text-xs text-white/50 w-8">{data.visitorTypes.visitors.count}</span>
                <ProgressBar percentage={data.visitorTypes.visitors.percentage} color="blue" />
                <span className="text-xs text-white/50 w-10 text-right">{data.visitorTypes.visitors.percentage}%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm w-28">⏭ Skipped</span>
                <span className="text-xs text-white/50 w-8">{data.visitorTypes.skipped.count}</span>
                <ProgressBar percentage={data.visitorTypes.skipped.percentage} color="orange" />
                <span className="text-xs text-white/50 w-10 text-right">{data.visitorTypes.skipped.percentage}%</span>
              </div>
            </div>
          </section>

          {/* Top Content */}
          <section>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Top Content</h3>
            <div className="space-y-2">
              {data.topContent.map((item, i) => (
                <div
                  key={item.name}
                  className="flex items-center gap-3 p-2 rounded-lg"
                  style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                >
                  <span className="text-xs text-white/40 w-4">{i + 1}.</span>
                  <span className="text-sm text-white/80 flex-1 truncate">{item.name}</span>
                  <span className="text-xs text-white/50">{item.opens} opens</span>
                  <span className={`text-xs ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {item.change >= 0 ? '↑' : '↓'} {Math.abs(item.change)}%
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Recruiter Funnel */}
          <section>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Recruiter Funnel</h3>
            <div className="space-y-3">
              {[
                { label: 'Visited', value: data.recruiterFunnel.visited, total: data.recruiterFunnel.visited },
                { label: 'Viewed work', value: data.recruiterFunnel.viewedWork, total: data.recruiterFunnel.visited },
                { label: 'Downloaded CV', value: data.recruiterFunnel.downloadedCV, total: data.recruiterFunnel.visited },
                { label: 'Contacted', value: data.recruiterFunnel.contacted, total: data.recruiterFunnel.visited },
              ].map((step) => {
                const percentage = Math.round((step.value / step.total) * 100);
                return (
                  <div key={step.label} className="flex items-center gap-3">
                    <span className="text-sm text-white/80 w-28">{step.label}</span>
                    <span className="text-xs text-white/50 w-8">{step.value}</span>
                    <ProgressBar percentage={percentage} color="green" />
                    <span className="text-xs text-white/50 w-10 text-right">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Live Visitors */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Live Visitors</h3>
              <span className="text-xs text-white/50">{data.liveVisitors.length} now</span>
            </div>
            <div className="space-y-2">
              {data.liveVisitors.length === 0 ? (
                <p className="text-sm text-white/40 text-center py-4">No live visitors right now</p>
              ) : (
                data.liveVisitors.map((visitor, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-lg"
                    style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                  >
                    <span className="text-sm">🌍</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white/80 truncate">{visitor.location}</div>
                      <div className="text-xs text-white/50">Viewing {visitor.viewing}</div>
                    </div>
                    <span className="text-xs text-white/40">{visitor.duration}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Demo data generator
export function generateDemoAnalytics(): AnalyticsData {
  return {
    overview: {
      visitors: 247,
      visitorsChange: 12,
      pageViews: 1203,
      pageViewsChange: 8,
      avgTime: '3m 42s',
      avgTimeChange: 15,
    },
    sources: [
      { name: 'LinkedIn', count: 52, percentage: 41 },
      { name: 'Direct', count: 34, percentage: 27 },
      { name: 'Twitter', count: 23, percentage: 18 },
      { name: 'Google', count: 18, percentage: 14 },
    ],
    visitorTypes: {
      recruiters: { count: 89, percentage: 36 },
      visitors: { count: 127, percentage: 51 },
      skipped: { count: 31, percentage: 13 },
    },
    topContent: [
      { name: 'Projects window', opens: 89, change: 12 },
      { name: 'About Me window', opens: 67, change: 5 },
      { name: 'Spotify Case Study', opens: 45, change: 23 },
      { name: 'Contact window', opens: 34, change: -2 },
      { name: 'Resume download', opens: 28, change: 8 },
    ],
    recruiterFunnel: {
      visited: 89,
      viewedWork: 78,
      downloadedCV: 45,
      contacted: 12,
    },
    liveVisitors: [
      { location: 'San Francisco', viewing: 'Projects', duration: '2 min' },
      { location: 'London', viewing: 'About Me', duration: 'Just now' },
    ],
  };
}

export type { AnalyticsData };
