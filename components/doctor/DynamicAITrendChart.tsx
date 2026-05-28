import React from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartConfig } from '../../services/aiService';

interface DynamicAITrendChartProps {
  config: ChartConfig;
}

const DynamicAITrendChart: React.FC<DynamicAITrendChartProps> = ({ config }) => {
  if (!config || !config.data || config.data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground border border-dashed rounded-xl bg-card">
        No data available to plot this trend.
      </div>
    );
  }

  const renderChart = () => {
    switch (config.chartType) {
      case 'BarChart':
        return (
          <BarChart data={config.data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey={config.xAxisKey} stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
            <Legend />
            {config.series.map((s, i) => (
              <Bar key={i} dataKey={s.dataKey} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        );
      case 'AreaChart':
        return (
          <AreaChart data={config.data}>
            <defs>
              {config.series.map((s, i) => (
                <linearGradient key={i} id={`color-${s.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.5} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey={config.xAxisKey} stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
            <Legend />
            {config.series.map((s, i) => (
              <Area key={i} type="monotone" dataKey={s.dataKey} name={s.name} stroke={s.color} fillOpacity={1} fill={`url(#color-${s.dataKey})`} strokeWidth={2} activeDot={{ r: 5 }} />
            ))}
          </AreaChart>
        );
      case 'LineChart':
      default:
        return (
          <LineChart data={config.data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey={config.xAxisKey} stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
            <Legend />
            {config.series.map((s, i) => (
              <Line key={i} type="monotone" dataKey={s.dataKey} name={s.name} stroke={s.color} strokeWidth={2} activeDot={{ r: 5 }} />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
      <div className="mb-6">
        <h3 className="font-bold font-heading text-lg text-foreground">{config.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default DynamicAITrendChart;
