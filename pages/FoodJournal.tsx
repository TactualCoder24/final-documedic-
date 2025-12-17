import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Utensils, Plus, Trash2 } from '../components/icons/Icons';
import { FoodLog } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { getFoodLogs, addFoodLog, deleteFoodLog } from '../services/dataSupabase';

const FoodJournal: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshLogs = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      const data = await getFoodLogs(user.uid);
      setLogs(data);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshLogs();
  }, [refreshLogs]);

  const handleDelete = async (id: string) => {
    if (user) {
      await deleteFoodLog(user.uid, id);
      await refreshLogs();
    }
  };

  const handleAddLog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const newLog = {
        mealType: formData.get('meal-type') as FoodLog['mealType'],
        description: formData.get('meal-description') as string,
        date: new Date().toISOString(),
    };
    if (newLog.mealType && newLog.description) {
        await addFoodLog(user.uid, newLog);
        await refreshLogs();
        setIsModalOpen(false);
    }
  };

  const groupedLogs = useMemo(() => {
    return logs.reduce((acc, log) => {
        const date = new Date(log.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(log);
        return acc;
    }, {} as Record<string, FoodLog[]>);
  }, [logs]);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold font-heading">Food Journal</h1>
          <p className="text-muted-foreground">Keep a diary of your meals to stay mindful of your eating habits.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Log Meal
        </Button>
      </div>

      <div className="space-y-8">
        {isLoading ? (
            <Card>
                <CardContent className="pt-6 text-center py-20">
                    <p className="text-muted-foreground">Loading your food journal...</p>
                </CardContent>
            </Card>
        ) : Object.keys(groupedLogs).length > 0 ? (
          Object.entries(groupedLogs).map(([date, dateLogs]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle>{date}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dateLogs as FoodLog[]).map(log => (
                    <div key={log.id} className="flex items-start justify-between p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          <Utensils className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{log.mealType}</p>
                          <p className="text-sm text-muted-foreground">{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="text-foreground mt-1">{log.description}</p>
                        </div>
                      </div>
                      <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-muted-foreground hover:text-destructive flex-shrink-0" 
                          onClick={() => handleDelete(log.id)}
                          aria-label={`Delete ${log.mealType} log`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-20">
              <p className="text-muted-foreground">No meals logged yet. Click 'Log Meal' to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Modal title="Log a New Meal" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
         <form className="space-y-4" onSubmit={handleAddLog}>
            <div>
              <label htmlFor="meal-type" className="block text-sm font-medium text-foreground mb-1">Meal Type</label>
              <select 
                id="meal-type" 
                name="meal-type" 
                required 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
              </select>
            </div>
            <div>
              <label htmlFor="meal-description" className="block text-sm font-medium text-foreground mb-1">Description</label>
              <textarea
                id="meal-description"
                name="meal-description"
                rows={3}
                placeholder="e.g., Oatmeal with berries and nuts"
                required
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
               <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
               <Button type="submit">Log Meal</Button>
            </div>
         </form>
      </Modal>
    </>
  );
};

export default FoodJournal;