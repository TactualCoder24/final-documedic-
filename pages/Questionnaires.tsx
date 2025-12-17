import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { MessageSquareQuestion, ClipboardCheck, Clock } from '../components/icons/Icons';
import { Questionnaire } from '../types';
import Modal from '../components/ui/Modal';
import { useAuth } from '../hooks/useAuth';
import { getQuestionnaires } from '../services/dataSupabase';

const Questionnaires: React.FC = () => {
  const { user } = useAuth();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);

  const refreshData = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      const data = await getQuestionnaires(user.uid);
      setQuestionnaires(data);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleStart = (q: Questionnaire) => {
    setSelectedQuestionnaire(q);
    setIsModalOpen(true);
  };
  
  const handleSubmit = () => {
    alert("Thank you for submitting your questionnaire. This is a demo feature.");
    setIsModalOpen(false);
    setSelectedQuestionnaire(null);
  };

  const getStatusIcon = (status: Questionnaire['status']) => {
    if (status === 'Completed') return <ClipboardCheck className="h-5 w-5 text-green-500" />;
    return <Clock className="h-5 w-5 text-yellow-500" />;
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading">Questionnaires</h1>
        <p className="text-muted-foreground">Respond to questions from your healthcare provider.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Questionnaires</CardTitle>
          {!isLoading && <CardDescription>You have {questionnaires.length} questionnaires.</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
                <p className="text-muted-foreground text-center py-10">Loading questionnaires...</p>
            ) : questionnaires.length > 0 ? (
                questionnaires.map(q => (
                <div key={q.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-4">
                        {getStatusIcon(q.status)}
                        <div>
                            <p className="font-semibold">{q.title}</p>
                            <p className="text-sm text-muted-foreground">From: {q.provider} | Due: {new Date(q.dueDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                    {q.status === 'Pending' && <Button variant="outline" size="sm" onClick={() => handleStart(q)}>Start</Button>}
                </div>
                ))
            ) : (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">You have no pending questionnaires.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal title={selectedQuestionnaire?.title || 'Questionnaire'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <p className="text-sm text-muted-foreground mb-4">Please answer the following questions. Your responses will be securely sent to your provider. (This is a demo).</p>
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Have you experienced any new symptoms in the last 2 weeks?</label>
                <div className="flex gap-4 mt-2"><Button variant="outline" size="sm">Yes</Button><Button variant="outline" size="sm">No</Button></div>
            </div>
             <div>
                <label className="block text-sm font-medium">On a scale of 1-10, how would you rate your overall health today?</label>
                <input type="range" min="1" max="10" defaultValue="7" className="w-full mt-2 accent-primary"/>
            </div>
        </div>
        <div className="flex justify-end pt-6">
            <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </Modal>
    </>
  );
};

export default Questionnaires;
