import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getDoctorAnalytics, PracticeAnalytics, getReviewsForDoctor } from '../../services/dataSupabase';
import { Review } from '../../types';
import { Users, CalendarDays, CheckCircle2, TrendingUp, Star } from '../icons/Icons';

interface PracticeAnalyticsTabProps {
  doctorId: string;
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

const PracticeAnalyticsTab: React.FC<PracticeAnalyticsTabProps> = ({ doctorId }) => {
  const [data, setData] = useState<PracticeAnalytics | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [result, reviewData] = await Promise.all([
        getDoctorAnalytics(doctorId),
        getReviewsForDoctor(doctorId),
      ]);
      setData(result);
      setReviews(reviewData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="text-center p-12 text-muted-foreground">Loading analytics...</div>;
  if (!data) return null;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Patients" value={data.totalPatients} icon={Users} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-500" />
        <StatCard label="Total Appointments" value={data.totalAppointments} icon={CalendarDays} iconBg="bg-indigo-50 dark:bg-indigo-900/20" iconColor="text-indigo-500" />
        <StatCard label="Completion Rate" value={`${data.completionRate}%`} icon={CheckCircle2} iconBg="bg-emerald-50 dark:bg-emerald-900/20" iconColor="text-emerald-500" />
        <StatCard label="Revenue (6 mo)" value={`₹${data.monthlyRevenue.reduce((s, m) => s + m.total, 0).toFixed(0)}`} icon={TrendingUp} iconBg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Patient Volume (New Patients / Month)">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.monthlyPatientCounts}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
              <Bar dataKey="count" name="New Patients" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

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

        <ChartCard title="Top Diagnoses">
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

      <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold font-heading">Patient Reviews</h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
              {avgRating.toFixed(1)} <span className="text-muted-foreground font-normal">({reviews.length} review{reviews.length === 1 ? '' : 's'})</span>
            </div>
          )}
        </div>
        {reviews.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm border border-dashed rounded-xl">
            No patient reviews yet.
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.slice(0, 10).map(review => (
              <div key={review.id} className="p-3 rounded-xl bg-secondary/40 border border-border/30">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={`h-3.5 w-3.5 ${star <= review.rating ? 'fill-yellow-400 text-yellow-500' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground flex-shrink-0">{new Date(review.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}</p>
                </div>
                {review.comment && <p className="text-sm mt-1.5">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeAnalyticsTab;
