import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { TestTube2, Plus, Trash2 } from '../components/icons/Icons';
import { TestResult, TestResultDetail } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { getTestResults, addTestResult } from '../services/dataSupabase';
import { useToast } from '../hooks/useToast';
import { useTranslation } from 'react-i18next';

const TestResults: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [details, setDetails] = useState<TestResultDetail[]>([{ name: '', value: '', referenceRange: '', isAbnormal: false }]);

  const refreshResults = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      const data = await getTestResults(user.uid);
      setResults(data);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshResults();
  }, [refreshResults]);

  const handleAddDetail = () => {
    setDetails([...details, { name: '', value: '', referenceRange: '', isAbnormal: false }]);
  };

  const handleRemoveDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleDetailChange = (index: number, field: keyof TestResultDetail, value: any) => {
    const updated = [...details];
    (updated[index] as any)[field] = value;
    setDetails(updated);
  };

  const handleAddTestResult = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);

    const validDetails = details.filter(d => d.name && d.value);
    if (validDetails.length === 0) {
      toast.error(t('test.need_detail', 'Please add at least one test detail.'));
      return;
    }

    try {
      await addTestResult(user.uid, {
        name: formData.get('test-name') as string,
        date: formData.get('test-date') as string,
        status: formData.get('test-status') as 'Final' | 'Pending',
        provider: formData.get('test-provider') as string,
        details: validDetails,
      });
      toast.success(t('test.added_success', 'Test result added!'));
      setIsAddModalOpen(false);
      setDetails([{ name: '', value: '', referenceRange: '', isAbnormal: false }]);
      refreshResults();
    } catch (err) {
      toast.error(t('test.add_error', 'Failed to add test result.'));
    }
  };

  const ResultDetailRow: React.FC<{ detail: TestResultDetail }> = ({ detail }) => (
    <tr className={detail.isAbnormal ? 'bg-destructive/10' : ''}>
      <td className="p-2 font-semibold">{detail.name}</td>
      <td className={`p-2 font-bold ${detail.isAbnormal ? 'text-destructive' : ''}`}>{detail.value}</td>
      <td className="p-2 text-muted-foreground">{detail.referenceRange}</td>
    </tr>
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold font-heading">{t('test.title', 'Test Results')}</h1>
          <p className="text-muted-foreground">{t('test.subtitle', 'View results from your lab tests and procedures.')}</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> {t('test.add_result', 'Add Test Result')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('test.your_results', 'Your Results')}</CardTitle>
          {!isLoading && <CardDescription>{t('test.count', 'You have {{count}} test results on file.', { count: results.length })}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-muted-foreground text-center py-10">{t('test.loading', 'Loading results...')}</p>
            ) : results.length > 0 ? (
              results.map(result => (
                <div key={result.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="flex items-center gap-4">
                    <TestTube2 className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-semibold">{result.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(result.date).toLocaleDateString()} - {t('test.status_label', 'Status:')} <span className={`font-medium ${result.status === 'Final' ? 'text-green-500' : 'text-yellow-500'}`}>{result.status}</span>
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedResult(result)} disabled={result.status !== 'Final'}>
                    {t('common.view_details', 'View Details')}
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">{t('test.no_results', 'No test results found.')}</p>
                <Button className="mt-4" onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> {t('test.add_first', 'Add Your First Test Result')}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Details Modal */}
      <Modal title={selectedResult?.name || t('test.modal_title', 'Test Result')} isOpen={!!selectedResult} onClose={() => setSelectedResult(null)}>
        {selectedResult && (
          <div className="space-y-4">
            <div>
              <p className="text-sm"><span className="text-muted-foreground">{t('test.date_label', 'Date:')}</span> {new Date(selectedResult.date).toLocaleDateString()}</p>
              <p className="text-sm"><span className="text-muted-foreground">{t('test.provider_label', 'Ordering Provider:')}</span> {selectedResult.provider}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary">
                  <tr>
                    <th className="p-2">{t('test.th_test', 'Test')}</th>
                    <th className="p-2">{t('test.th_result', 'Result')}</th>
                    <th className="p-2">{t('test.th_range', 'Reference Range')}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedResult.details.map(detail => <ResultDetailRow key={detail.name} detail={detail} />)}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">{t('test.disclaimer', 'This is not medical advice. Please consult your provider to discuss your results.')}</p>
          </div>
        )}
      </Modal>

      {/* Add Test Result Modal */}
      <Modal title={t('test.add_title', 'Add Test Result')} isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <form onSubmit={handleAddTestResult} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="test-name" className="block text-sm font-medium">{t('test.name_label', 'Test Name')}</label>
              <Input id="test-name" name="test-name" required placeholder={t('test.name_placeholder', 'e.g., Complete Blood Count')} />
            </div>
            <div>
              <label htmlFor="test-date" className="block text-sm font-medium">{t('test.date_input_label', 'Date')}</label>
              <Input id="test-date" name="test-date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="test-provider" className="block text-sm font-medium">{t('test.provider_input_label', 'Provider')}</label>
              <Input id="test-provider" name="test-provider" required placeholder={t('test.provider_placeholder', 'e.g., Dr. Smith')} />
            </div>
            <div>
              <label htmlFor="test-status" className="block text-sm font-medium">{t('test.status_input_label', 'Status')}</label>
              <select id="test-status" name="test-status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="Final">{t('test.status_final', 'Final')}</option>
                <option value="Pending">{t('test.status_pending', 'Pending')}</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium">{t('test.details_label', 'Test Details')}</label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddDetail}>
                <Plus className="mr-1 h-3 w-3" /> {t('test.add_detail', 'Add Row')}
              </Button>
            </div>
            <div className="space-y-3">
              {details.map((d, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <Input className="col-span-3" placeholder={t('test.detail_name', 'Test name')} value={d.name} onChange={e => handleDetailChange(i, 'name', e.target.value)} />
                  <Input className="col-span-2" placeholder={t('test.detail_value', 'Value')} value={d.value} onChange={e => handleDetailChange(i, 'value', e.target.value)} />
                  <Input className="col-span-3" placeholder={t('test.detail_range', 'Ref range')} value={d.referenceRange} onChange={e => handleDetailChange(i, 'referenceRange', e.target.value)} />
                  <label className="col-span-3 flex items-center gap-1 text-xs">
                    <input type="checkbox" checked={d.isAbnormal} onChange={e => handleDetailChange(i, 'isAbnormal', e.target.checked)} className="rounded" />
                    {t('test.abnormal', 'Abnormal')}
                  </label>
                  <Button type="button" variant="ghost" size="icon" className="col-span-1 h-8 w-8" onClick={() => handleRemoveDetail(i)} disabled={details.length === 1}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>{t('common.cancel', 'Cancel')}</Button>
            <Button type="submit">{t('test.save_result', 'Save Test Result')}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default TestResults;
