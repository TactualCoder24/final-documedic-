import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Bell, Plus, Trash2 } from '../components/icons/Icons';
import { Reminder } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { getReminders, addReminder, deleteReminder } from '../services/data';

const Reminders: React.FC = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshReminders = React.useCallback(() => {
    if (user) {
      setReminders(getReminders(user.uid));
    }
  }, [user]);

  useEffect(() => {
    refreshReminders();
  }, [refreshReminders]);

  const handleDelete = (id: string) => {
    if (user) {
      deleteReminder(user.uid, id);
      refreshReminders();
    }
  };

  const handleAddReminder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const newReminder = {
        title: formData.get('reminder-title') as string,
        time: formData.get('reminder-time') as string,
        description: formData.get('reminder-desc') as string,
    };
    if (newReminder.title && newReminder.time) {
        addReminder(user.uid, newReminder);
        refreshReminders();
        setIsModalOpen(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold font-heading">Reminders & Alerts</h1>
          <p className="text-muted-foreground">Stay on top of appointments, medication refills, and more.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Reminder
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Reminders</CardTitle>
          <CardDescription>You have {reminders.length} upcoming reminders.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reminders.map(reminder => (
              <div key={reminder.id} className="flex items-start justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{reminder.title}</p>
                    <p className="text-sm font-bold text-primary">{new Date(reminder.time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    <p className="text-sm text-muted-foreground mt-1">{reminder.description}</p>
                  </div>
                </div>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-muted-foreground hover:text-destructive flex-shrink-0" 
                    onClick={() => handleDelete(reminder.id)}
                    aria-label={`Delete reminder for ${reminder.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {reminders.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No reminders set. Create one to get started.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal title="Create New Reminder" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
         <form className="space-y-4" onSubmit={handleAddReminder}>
            <div>
              <label htmlFor="reminder-title" className="block text-sm font-medium text-foreground mb-1">Title</label>
              <Input id="reminder-title" name="reminder-title" placeholder="e.g., Doctor's Appointment" required />
            </div>
            <div>
              <label htmlFor="reminder-time" className="block text-sm font-medium text-foreground mb-1">Date & Time</label>
              <Input id="reminder-time" name="reminder-time" type="datetime-local" required />
            </div>
            <div>
              <label htmlFor="reminder-desc" className="block text-sm font-medium text-foreground mb-1">Description (Optional)</label>
              <Input id="reminder-desc" name="reminder-desc" placeholder="e.g., Annual check-up" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
               <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
               <Button type="submit">Create Reminder</Button>
            </div>
         </form>
      </Modal>
    </>
  );
};

export default Reminders;
