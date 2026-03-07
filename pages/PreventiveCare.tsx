import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Target, ClipboardCheck, Clock, Plus } from '../components/icons/Icons';
import { PreventiveCareItem } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { getPreventiveCare, updatePreventiveCareStatus, addPreventiveCareItem } from '../services/dataSupabase';
import { useToast } from '../hooks/useToast';
import { useTranslation } from 'react-i18next';

const PreventiveCare: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const [careItems, setCareItems] = useState<PreventiveCareItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshData = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      const data = await getPreventiveCare(user.uid);
      setCareItems(data);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleMarkComplete = async (item: PreventiveCareItem) => {
    if (!user) return;
    try {
      await updatePreventiveCareStatus(user.uid, item.id, 'Up-to-date');
      toast.success(t('preventive.marked_complete', '{{name}} marked as up-to-date!', { name: item.name }));
      refreshData();
    } catch (err) {
      toast.error(t('preventive.mark_error', 'Failed to update status.'));
    }
  };

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    try {
      await addPreventiveCareItem(user.uid, {
        name: formData.get('name') as string,
        dueDate: formData.get('dueDate') as string,
      });
      toast.success(t('preventive.added', 'Preventive care item added!'));
      setIsModalOpen(false);
      refreshData();
    } catch (err) {
      toast.error(t('preventive.add_error', 'Failed to add item.'));
    }
  };

  const getStatusInfo = (status: PreventiveCareItem['status']) => {
    switch (status) {
      case 'Due': return { icon: <Clock className="h-5 w-5 text-blue-500" />, text: t('preventive.due', 'Due'), color: 'text-blue-500' };
      case 'Overdue': return { icon: <Clock className="h-5 w-5 text-red-500" />, text: t('preventive.overdue', 'Overdue'), color: 'text-red-500' };
      case 'Up-to-date': return { icon: <ClipboardCheck className="h-5 w-5 text-green-500" />, text: t('preventive.uptodate', 'Up-to-date'), color: 'text-green-500' };
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold font-heading">{t('preventive.title', 'Preventive Care')}</h1>
          <p className="text-muted-foreground">{t('preventive.subtitle', 'Keep track of routine care to stay healthy.')}</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> {t('preventive.add_item', 'Add Item')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardHeader><div className="animate-pulse bg-muted h-6 w-3/4 rounded-md"></div></CardHeader><CardContent><div className="animate-pulse bg-muted h-10 w-full rounded-md"></div></CardContent></Card>
          ))
        ) : careItems.length > 0 ? (
          careItems.map(item => {
            const statusInfo = getStatusInfo(item.status);
            return (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Target className="h-6 w-6 text-primary" />
                    <CardTitle>{item.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`flex items-center gap-2 p-3 rounded-md bg-secondary/50 border-l-4 ${item.status === 'Overdue' ? 'border-red-500' : item.status === 'Due' ? 'border-blue-500' : 'border-green-500'}`}>
                    {statusInfo.icon}
                    <div>
                      <p className={`font-semibold text-sm ${statusInfo.color}`}>{statusInfo.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.status !== 'Up-to-date' ? t('preventive.due_by', 'Due by {{date}}', { date: new Date(item.dueDate).toLocaleDateString() }) : t('preventive.completed', 'Completed {{date}}', { date: new Date(item.lastCompleted!).toLocaleDateString() })}
                      </p>
                    </div>
                  </div>
                  {item.status !== 'Up-to-date' && (
                    <Button size="sm" className="w-full mt-3" onClick={() => handleMarkComplete(item)}>
                      <ClipboardCheck className="mr-2 h-4 w-4" /> {t('preventive.mark_done', 'Mark as Up-to-date')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="col-span-full">
            <CardContent className="text-center py-10">
              <p className="text-muted-foreground">{t('preventive.no_items', 'No preventive care items found.')}</p>
              <Button className="mt-4" onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> {t('preventive.add_first', 'Add Your First Item')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('preventive.add_title', 'Add Preventive Care Item')}>
        <form onSubmit={handleAddItem} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">{t('preventive.name_label', 'Screening/Test Name')}</label>
            <Input id="name" name="name" required placeholder={t('preventive.name_placeholder', 'e.g., Annual Physical Exam')} />
          </div>
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium">{t('preventive.due_label', 'Due Date')}</label>
            <Input id="dueDate" name="dueDate" type="date" required />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>{t('common.cancel', 'Cancel')}</Button>
            <Button type="submit">{t('common.save', 'Save')}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default PreventiveCare;
