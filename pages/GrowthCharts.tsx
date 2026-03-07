import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Baby } from '../components/icons/Icons';
import { GrowthRecord } from '../types';
import { useAuth } from '../hooks/useAuth';
import { getGrowthRecords } from '../services/dataSupabase';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

const GrowthCharts: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      const data = await getGrowthRecords(user.uid);
      setRecords(data);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const ChartCard: React.FC<{ dataKey: keyof GrowthRecord; name: string; unit: string; color: string }> = ({ dataKey, name, unit, color }) => (
    <Card>
      <CardHeader>
        <CardTitle>{t('growth.chart_title', '{{name}} Chart', { name })}</CardTitle>
        <CardDescription>{t('growth.chart_desc', 'Growth tracking for {{name}} over time.', { name: name.toLowerCase() })}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={records}>
            <defs>
              <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="age" name={t('common.age', 'Age')} unit={` ${t('common.months_short', 'mos')}`} stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" domain={['dataMin - 2', 'dataMax + 2']} fontSize={12} unit={` ${unit}`} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
              labelFormatter={(label) => t('growth.age_months', 'Age: {{label}} months', { label })}
            />
            <Legend />
            <Area type="monotone" dataKey={dataKey} name={name} stroke={color} fillOpacity={1} fill={`url(#color-${dataKey})`} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading">{t('growth.title', 'Growth Charts')}</h1>
        <p className="text-muted-foreground">{t('growth.subtitle', "Track your children's growth and compare to others in their age group.")}</p>
      </div>

      {isLoading ? (
        <Card><CardContent className="text-center py-10 text-muted-foreground">{t('growth.loading', 'Loading growth data...')}</CardContent></Card>
      ) : records.length > 0 ? (
        <div className="space-y-6">
          <ChartCard dataKey="weight" name={t('growth.weight', 'Weight')} unit="kg" color="hsl(var(--primary))" />
          <ChartCard dataKey="height" name={t('growth.height', 'Height')} unit="cm" color="#3b82f6" />
          <ChartCard dataKey="headCircumference" name={t('growth.head_circumference', 'Head Circumference')} unit="cm" color="#10b981" />
        </div>
      ) : (
        <Card><CardContent className="text-center py-10 text-muted-foreground">{t('growth.no_records', 'No growth records found.')}</CardContent></Card>
      )}
    </>
  );
};

export default GrowthCharts;
