import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Syringe, Pill, TestTube2, Target, Plus, Trash2 } from '../components/icons/Icons';
import { CarePlan, Medication, TestResult } from '../types';
import { useAuth } from '../hooks/useAuth';
import { getCarePlans, getMedications, getTestResults, addCarePlan, updateCarePlanGoal } from '../services/dataSupabase';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useToast } from '../hooks/useToast';
import { useTranslation } from 'react-i18next';

const PlanOfCare: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const [plans, setPlans] = useState<CarePlan[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoals, setNewGoals] = useState<string[]>(['']);

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
      if (plansData.length > 0 && !selectedPlanId) {
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
  const relatedTests = testResults.filter(tr => selectedPlan?.relatedTestResultIds.includes(tr.id));

  const handleToggleGoal = async (goalId: string, isComplete: boolean) => {
    if (!user || !selectedPlan) return;
    try {
      await updateCarePlanGoal(user.uid, selectedPlan.id, goalId, !isComplete);
      refreshData();
    } catch (err) {
      toast.error(t('plan.goal_error', 'Failed to update goal.'));
    }
  };

  const handleCreatePlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const conditionName = formData.get('condition') as string;
    const selectedMedIds = Array.from(formData.getAll('meds')) as string[];
    const selectedTestIds = Array.from(formData.getAll('tests')) as string[];
    const validGoals = newGoals.filter(g => g.trim());

    if (validGoals.length === 0) {
      toast.error(t('plan.need_goal', 'Please add at least one goal.'));
      return;
    }

    try {
      await addCarePlan(user.uid, {
        conditionName,
        relatedMedicationIds: selectedMedIds,
        relatedTestResultIds: selectedTestIds,
        goals: validGoals.map((g, i) => ({
          id: `goal-${Date.now()}-${i}`,
          description: g,
          isComplete: false,
        })),
      });
      toast.success(t('plan.created', 'Care plan created!'));
      setIsModalOpen(false);
      setNewGoals(['']);
      refreshData();
    } catch (err) {
      toast.error(t('plan.create_error', 'Failed to create care plan.'));
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold font-heading">{t('plan.title', 'Plan of Care')}</h1>
          <p className="text-muted-foreground">{t('plan.subtitle', 'View information related to a specific health condition.')}</p>
        </div>
        <div className="flex items-center gap-3">
          {!isLoading && plans.length > 0 && (
            <select
              value={selectedPlanId}
              onChange={e => setSelectedPlanId(e.target.value)}
              className="flex h-10 w-full sm:w-64 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {plans.map(p => <option key={p.id} value={p.id}>{p.conditionName}</option>)}
            </select>
          )}
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> {t('plan.new_plan', 'New Plan')}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card><CardContent className="text-center py-10 text-muted-foreground">{t('plan.loading', 'Loading care plans...')}</CardContent></Card>
      ) : selectedPlan ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Target /> {t('plan.goals', 'Patient Goals')}</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {selectedPlan.goals.map(goal => (
                  <li key={goal.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => handleToggleGoal(goal.id, goal.isComplete)}>
                    <input
                      type="checkbox"
                      checked={goal.isComplete}
                      readOnly
                      className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className={`${goal.isComplete ? 'text-muted-foreground line-through' : ''} group-hover:text-primary transition-colors`}>{goal.description}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Pill /> {t('plan.related_meds', 'Related Medications')}</CardTitle></CardHeader>
            <CardContent>
              {relatedMeds.length > 0 ? (
                <ul className="space-y-3">
                  {relatedMeds.map(med => <li key={med.id}><Link to="/medications" className="font-semibold hover:underline">{med.name}</Link> ({med.dosage})</li>)}
                </ul>
              ) : <p className="text-muted-foreground">{t('plan.no_related_meds', 'No medications linked to this plan.')}</p>}
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="flex items-center gap-2"><TestTube2 /> {t('plan.related_tests', 'Related Test Results')}</CardTitle></CardHeader>
            <CardContent>
              {relatedTests.length > 0 ? (
                <ul className="space-y-3">
                  {relatedTests.map(test => <li key={test.id} className="flex items-center justify-between">
                    <div><p className="font-semibold">{test.name}</p><p className="text-sm text-muted-foreground">{new Date(test.date).toLocaleDateString()}</p></div>
                    <Button asChild variant="outline" size="sm"><Link to="/test-results">{t('common.view', 'View')}</Link></Button>
                  </li>)}
                </ul>
              ) : <p className="text-muted-foreground">{t('plan.no_related_tests', 'No test results linked to this plan.')}</p>}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-10">
            <p className="text-muted-foreground">{t('plan.no_plans', 'No care plans yet.')}</p>
            <Button className="mt-4" onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> {t('plan.create_first', 'Create Your First Plan')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Plan Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('plan.create_title', 'Create Care Plan')}>
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <div>
            <label htmlFor="condition" className="block text-sm font-medium">{t('plan.condition_label', 'Condition')}</label>
            <Input id="condition" name="condition" required placeholder={t('plan.condition_placeholder', 'e.g., Hypertension, Diabetes')} />
          </div>

          {medications.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">{t('plan.link_meds', 'Link Medications (optional)')}</label>
              <div className="max-h-32 overflow-y-auto space-y-1 border rounded-md p-2">
                {medications.map(m => (
                  <label key={m.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="meds" value={m.id} className="rounded" />
                    {m.name} ({m.dosage})
                  </label>
                ))}
              </div>
            </div>
          )}

          {testResults.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">{t('plan.link_tests', 'Link Test Results (optional)')}</label>
              <div className="max-h-32 overflow-y-auto space-y-1 border rounded-md p-2">
                {testResults.map(tr => (
                  <label key={tr.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="tests" value={tr.id} className="rounded" />
                    {tr.name} ({new Date(tr.date).toLocaleDateString()})
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">{t('plan.goals_label', 'Goals')}</label>
              <Button type="button" variant="outline" size="sm" onClick={() => setNewGoals([...newGoals, ''])}>
                <Plus className="mr-1 h-3 w-3" /> {t('plan.add_goal', 'Add Goal')}
              </Button>
            </div>
            <div className="space-y-2">
              {newGoals.map((g, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder={t('plan.goal_placeholder', 'e.g., Maintain BP below 130/80')}
                    value={g}
                    onChange={e => { const u = [...newGoals]; u[i] = e.target.value; setNewGoals(u); }}
                  />
                  {newGoals.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => setNewGoals(newGoals.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>{t('common.cancel', 'Cancel')}</Button>
            <Button type="submit">{t('plan.save_plan', 'Create Plan')}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default PlanOfCare;
