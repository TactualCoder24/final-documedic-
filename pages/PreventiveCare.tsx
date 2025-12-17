import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Target, ClipboardCheck, Clock } from '../components/icons/Icons';
import { PreventiveCareItem } from '../types';
import { useAuth } from '../hooks/useAuth';
import { getPreventiveCare } from '../services/dataSupabase';

const PreventiveCare: React.FC = () => {
  const { user } = useAuth();
  const [careItems, setCareItems] = useState<PreventiveCareItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
  
  const getStatusInfo = (status: PreventiveCareItem['status']) => {
    switch(status) {
        case 'Due': return { icon: <Clock className="h-5 w-5 text-blue-500" />, text: 'Due', color: 'text-blue-500' };
        case 'Overdue': return { icon: <Clock className="h-5 w-5 text-red-500" />, text: 'Overdue', color: 'text-red-500' };
        case 'Up-to-date': return { icon: <ClipboardCheck className="h-5 w-5 text-green-500" />, text: 'Up-to-date', color: 'text-green-500' };
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading">Preventive Care</h1>
        <p className="text-muted-foreground">Keep track of routine care to stay healthy.</p>
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
                                        {item.status !== 'Up-to-date' ? `Due by ${new Date(item.dueDate).toLocaleDateString()}` : `Completed ${new Date(item.lastCompleted!).toLocaleDateString()}`}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })
        ) : (
            <Card className="col-span-full">
                <CardContent className="text-center py-10">
                    <p className="text-muted-foreground">No preventive care items found.</p>
                </CardContent>
            </Card>
        )}
      </div>
    </>
  );
};

export default PreventiveCare;
