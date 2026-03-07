
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Moon, Plus, Trash2, Clock } from '../components/icons/Icons';
import { SleepLog } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { getSleepLogs, addSleepLog, deleteSleepLog } from '../services/dataSupabase';
import { useToast } from '../hooks/useToast';
import { useTranslation } from 'react-i18next';

const qualityColors: Record<string, string> = {
    Poor: 'bg-red-500/20 text-red-600',
    Fair: 'bg-yellow-500/20 text-yellow-600',
    Good: 'bg-green-500/20 text-green-600',
    Excellent: 'bg-emerald-500/20 text-emerald-600',
};

const qualityEmoji: Record<string, string> = {
    Poor: '😴',
    Fair: '😐',
    Good: '😊',
    Excellent: '🌟',
};

const SleepTracker: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const toast = useToast();
    const [logs, setLogs] = useState<SleepLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const refreshData = useCallback(async () => {
        if (user) {
            setIsLoading(true);
            try {
                const data = await getSleepLogs(user.uid);
                setLogs(data);
            } catch (err) {
                console.error(err);
            }
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;
        const form = e.currentTarget;
        const formData = new FormData(form);

        const bedtime = formData.get('bedtime') as string;
        const wakeTime = formData.get('wakeTime') as string;

        // Calculate hours from bedtime/waketime
        let hours = parseFloat(formData.get('hours') as string);
        if (bedtime && wakeTime && !hours) {
            const [bH, bM] = bedtime.split(':').map(Number);
            const [wH, wM] = wakeTime.split(':').map(Number);
            let diff = (wH * 60 + wM) - (bH * 60 + bM);
            if (diff < 0) diff += 24 * 60; // overnight
            hours = Math.round(diff / 6) / 10; // round to 0.1
        }

        try {
            await addSleepLog(user.uid, {
                date: formData.get('date') as string,
                hours: hours,
                quality: formData.get('quality') as SleepLog['quality'],
                bedtime: bedtime || undefined,
                wakeTime: wakeTime || undefined,
                notes: (formData.get('notes') as string) || undefined,
            });
            toast.success(t('sleep.toast_added', 'Sleep log added!'));
            setIsModalOpen(false);
            refreshData();
        } catch (err) {
            toast.error(t('sleep.toast_error', 'Failed to add sleep log.'));
        }
    };

    const handleDelete = async (id: string) => {
        if (!user) return;
        try {
            await deleteSleepLog(user.uid, id);
            toast.success(t('sleep.toast_deleted', 'Sleep log deleted.'));
            refreshData();
        } catch (err) {
            toast.error(t('sleep.toast_delete_error', 'Failed to delete sleep log.'));
        }
    };

    // Stats
    const avgHours = logs.length > 0 ? (logs.reduce((sum, l) => sum + l.hours, 0) / logs.length).toFixed(1) : '—';
    const bestNight = logs.length > 0 ? logs.reduce((max, l) => l.hours > max.hours ? l : max, logs[0]) : null;
    const qualityCounts = logs.reduce((acc, l) => { acc[l.quality] = (acc[l.quality] || 0) + 1; return acc; }, {} as Record<string, number>);
    const mostCommonQuality = Object.entries(qualityCounts).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || '—';

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-heading">{t('sleep.title', '🌙 Sleep Tracker')}</h1>
                    <p className="text-muted-foreground">{t('sleep.subtitle', 'Track your sleep patterns to improve rest quality.')}</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> {t('sleep.log_sleep', 'Log Sleep')}
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-primary">{avgHours}</p>
                        <p className="text-sm text-muted-foreground">{t('sleep.avg_hours', 'Avg Hours/Night')}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-blue-500">{logs.length}</p>
                        <p className="text-sm text-muted-foreground">{t('sleep.total_logs', 'Total Logs')}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-green-500">{bestNight ? `${bestNight.hours}h` : '—'}</p>
                        <p className="text-sm text-muted-foreground">{t('sleep.best_night', 'Best Night')}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold">{qualityEmoji[mostCommonQuality] || '—'}</p>
                        <p className="text-sm text-muted-foreground">{t('sleep.common_quality', 'Most Common: {{quality}}', { quality: mostCommonQuality })}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Sleep Log List */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('sleep.history_title', 'Sleep History')}</CardTitle>
                    <CardDescription>{t('sleep.history_desc', 'Your recent sleep entries.')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {isLoading ? (
                            <p className="text-center text-muted-foreground py-10">{t('sleep.loading', 'Loading sleep logs...')}</p>
                        ) : logs.length > 0 ? (
                            logs.map(log => (
                                <div key={log.id} className="flex items-center justify-between p-4 rounded-xl border bg-secondary/20 hover:bg-secondary/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <Moon className="h-6 w-6 text-indigo-400" />
                                        <div>
                                            <p className="font-semibold">{new Date(log.date).toLocaleDateString([], { dateStyle: 'medium' })}</p>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                                <span className="font-medium text-foreground">{log.hours}h</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${qualityColors[log.quality]}`}>
                                                    {qualityEmoji[log.quality]} {log.quality}
                                                </span>
                                                {log.bedtime && log.wakeTime && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" /> {log.bedtime} → {log.wakeTime}
                                                    </span>
                                                )}
                                            </div>
                                            {log.notes && <p className="text-xs text-muted-foreground mt-1 italic">{log.notes}</p>}
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(log.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <Moon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                <p className="text-muted-foreground">{t('sleep.no_logs', 'No sleep logs yet. Start tracking to see your patterns!')}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Add Sleep Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('sleep.add_title', 'Log Sleep')}>
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium">{t('sleep.date_label', 'Date')}</label>
                        <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="bedtime" className="block text-sm font-medium">{t('sleep.bedtime_label', 'Bedtime')}</label>
                            <Input id="bedtime" name="bedtime" type="time" placeholder="22:30" />
                        </div>
                        <div>
                            <label htmlFor="wakeTime" className="block text-sm font-medium">{t('sleep.wake_label', 'Wake Time')}</label>
                            <Input id="wakeTime" name="wakeTime" type="time" placeholder="06:30" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="hours" className="block text-sm font-medium">{t('sleep.hours_label', 'Hours Slept (or auto-calculated)')}</label>
                        <Input id="hours" name="hours" type="number" step="0.1" min="0" max="24" placeholder={t('sleep.hours_placeholder', 'e.g., 7.5')} />
                    </div>
                    <div>
                        <label htmlFor="quality" className="block text-sm font-medium">{t('sleep.quality_label', 'Sleep Quality')}</label>
                        <select id="quality" name="quality" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option value="Poor">{t('sleep.quality_poor', '😴 Poor')}</option>
                            <option value="Fair">{t('sleep.quality_fair', '😐 Fair')}</option>
                            <option value="Good" selected>{t('sleep.quality_good', '😊 Good')}</option>
                            <option value="Excellent">{t('sleep.quality_excellent', '🌟 Excellent')}</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium">{t('sleep.notes_label', 'Notes (optional)')}</label>
                        <Input id="notes" name="notes" placeholder={t('sleep.notes_placeholder', 'Any sleep disturbances, dreams, etc.')} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>{t('common.cancel', 'Cancel')}</Button>
                        <Button type="submit">{t('sleep.save', 'Save Sleep Log')}</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default SleepTracker;
