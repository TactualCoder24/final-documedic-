import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getClinicAnalytics, ClinicAnalytics } from '../../services/dataSupabase';
import { Users, CalendarDays, CheckCircle2, Stethoscope } from '../icons/Icons';

interface ClinicAnalyticsTabProps {
  clinicId: string;
}

const StatCard: React.FC<{ label: string; value: string | number; icon: React.FC<any>; iconBg: string; iconColor: string }> = ({ label, value, icon: Icon, iconBg, iconColor }) => (
  <div className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border/50 shadow-sm">
    <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${iconBg}`}>
      <Icon className={`h-5 w-5 ${iconColor}`} />
    </div>
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold font-heading">{value}</p>
    </div>
  </div>
);

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
    <h3 className="font-bold font-heading mb-4">{title}</h3>
    {children}
  </div>
);

const ClinicAnalyticsTab: React.FC<ClinicAnalyticsTabProps> = ({ clinicId }) => {
  const [data, setData] = useState<ClinicAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getClinicAnalytics(clinicId);
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="text-center p-12 text-muted-foreground">Loading clinic analytics...</div>;
  if (!data) return null;

  if (data.totalDoctors === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-2xl">
        Add active doctors to your staff to see clinic-wide analytics.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Doctors" value={data.totalDoctors} icon={Stethoscope} iconBg="bg-purple-50 dark:bg-purple-900/20" iconColor="text-purple-500" />
        <StatCard label="Total Patients" value={data.totalPatients} icon={Users} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-500" />
        <StatCard label="Total Appointments" value={data.totalAppointments} icon={CalendarDays} iconBg="bg-indigo-50 dark:bg-indigo-900/20" iconColor="text-indigo-500" />
        <StatCard label="Completion Rate" value={`${data.completionRate}%`} icon={CheckCircle2} iconBg="bg-emerald-50 dark:bg-emerald-900/20" iconColor="text-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Appointment Trends">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.monthlyAppointmentCounts}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
              <Line type="monotone" dataKey="count" name="Appointments" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue Trend">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} unit="₹" />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
              <Bar dataKey="total" name="Revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Doctor Utilization (Appointments)">
          {data.doctorUtilization.length === 0 ? (
            <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm border border-dashed rounded-xl">
              No appointment data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.doctorUtilization} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="doctorName" stroke="hsl(var(--muted-foreground))" fontSize={11} width={120} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                <Bar dataKey="appointments" name="Appointments" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Top Diagnoses (Clinic-wide)">
          {data.topDiagnoses.length === 0 ? (
            <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm border border-dashed rounded-xl">
              No prescription data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.topDiagnoses} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="diagnosis" stroke="hsl(var(--muted-foreground))" fontSize={11} width={140} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                <Bar dataKey="count" name="Cases" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
};

export default ClinicAnalyticsTab;
