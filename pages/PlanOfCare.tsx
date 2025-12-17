import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Syringe, Pill, TestTube2, Target } from '../components/icons/Icons';
import { CarePlan, Medication, TestResult } from '../types';
import { useAuth } from '../hooks/useAuth';
import { getCarePlans, getMedications, getTestResults } from '../services/dataSupabase';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const PlanOfCare: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<CarePlan[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      const [plansData, medsData, testsData] = await Promise.all([
        getCarePlans(user.uid),
        getMedications(user.uid),
        getTestResults(user.uid),
      ]);
      setPlans(plansData);
      setMedications(medsData);
      setTestResults(testsData);
      if (plansData.length > 0) {
        setSelectedPlanId(plansData[0].id);
      }
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  const relatedMeds = medications.filter(m => selectedPlan?.relatedMedicationIds.includes(m.id));
  const relatedTests = testResults.filter(t => selectedPlan?.relatedTestResultIds.includes(t.id));

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
            <h1 className="text-3xl font-bold font-heading">Plan of Care</h1>
            <p className="text-muted-foreground">View information related to a specific health condition.</p>
        </div>
        {!isLoading && plans.length > 0 && (
             <select 
                value={selectedPlanId} 
                onChange={e => setSelectedPlanId(e.target.value)}
                className="flex h-10 w-full sm:w-64 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
                {plans.map(p => <option key={p.id} value={p.id}>{p.conditionName}</option>)}
            </select>
        )}
      </div>

      {isLoading ? (
        <Card><CardContent className="text-center py-10 text-muted-foreground">Loading care plans...</CardContent></Card>
      ) : selectedPlan ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Target/> Patient Goals</CardTitle></CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {selectedPlan.goals.map(goal => (
                            <li key={goal.id} className="flex items-center gap-3">
                                <input type="checkbox" checked={goal.isComplete} readOnly className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"/>
                                <span className={goal.isComplete ? 'text-muted-foreground line-through' : ''}>{goal.description}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Pill/> Related Medications</CardTitle></CardHeader>
                <CardContent>
                    {relatedMeds.length > 0 ? (
                        <ul className="space-y-3">
                            {relatedMeds.map(med => <li key={med.id}><Link to="/medications" className="font-semibold hover:underline">{med.name}</Link> ({med.dosage})</li>)}
                        </ul>
                    ) : <p className="text-muted-foreground">No medications linked to this plan.</p>}
                </CardContent>
            </Card>
             <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="flex items-center gap-2"><TestTube2/> Related Test Results</CardTitle></CardHeader>
                <CardContent>
                     {relatedTests.length > 0 ? (
                        <ul className="space-y-3">
                            {relatedTests.map(test => <li key={test.id} className="flex items-center justify-between">
                                <div><p className="font-semibold">{test.name}</p><p className="text-sm text-muted-foreground">{new Date(test.date).toLocaleDateString()}</p></div>
                                <Button asChild variant="outline" size="sm"><Link to="/test-results">View</Link></Button>
                            </li>)}
                        </ul>
                    ) : <p className="text-muted-foreground">No test results linked to this plan.</p>}
                </CardContent>
            </Card>
        </div>
      ) : (
         <Card><CardContent className="text-center py-10 text-muted-foreground">No care plans have been set up by your provider.</CardContent></Card>
      )}
    </>
  );
};

export default PlanOfCare;
