import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { TestTube2 } from '../components/icons/Icons';
import { TestResult, TestResultDetail } from '../types';
import Modal from '../components/ui/Modal';
import { useAuth } from '../hooks/useAuth';
import { getTestResults } from '../services/dataSupabase';

const TestResults: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

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

  const ResultDetailRow: React.FC<{ detail: TestResultDetail }> = ({ detail }) => (
    <tr className={detail.isAbnormal ? 'bg-destructive/10' : ''}>
        <td className="p-2 font-semibold">{detail.name}</td>
        <td className={`p-2 font-bold ${detail.isAbnormal ? 'text-destructive' : ''}`}>{detail.value}</td>
        <td className="p-2 text-muted-foreground">{detail.referenceRange}</td>
    </tr>
  );

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading">Test Results</h1>
        <p className="text-muted-foreground">View results from your lab tests and procedures.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Results</CardTitle>
          {!isLoading && <CardDescription>You have {results.length} test results on file.</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
                <p className="text-muted-foreground text-center py-10">Loading results...</p>
            ) : results.length > 0 ? (
                results.map(result => (
                <div key={result.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                    <div className="flex items-center gap-4">
                        <TestTube2 className="h-6 w-6 text-primary" />
                        <div>
                            <p className="font-semibold">{result.name}</p>
                            <p className="text-sm text-muted-foreground">
                                {new Date(result.date).toLocaleDateString()} - Status: <span className={`font-medium ${result.status === 'Final' ? 'text-green-500' : 'text-yellow-500'}`}>{result.status}</span>
                            </p>
                        </div>
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedResult(result)}
                        disabled={result.status !== 'Final'}
                    >
                        View Details
                    </Button>
                </div>
                ))
            ) : (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No test results found.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal title={selectedResult?.name || 'Test Result'} isOpen={!!selectedResult} onClose={() => setSelectedResult(null)}>
         {selectedResult && (
            <div className="space-y-4">
                <div>
                    <p className="text-sm"><span className="text-muted-foreground">Date:</span> {new Date(selectedResult.date).toLocaleDateString()}</p>
                    <p className="text-sm"><span className="text-muted-foreground">Ordering Provider:</span> {selectedResult.provider}</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary">
                            <tr>
                                <th className="p-2">Test</th>
                                <th className="p-2">Result</th>
                                <th className="p-2">Reference Range</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedResult.details.map(detail => <ResultDetailRow key={detail.name} detail={detail} />)}
                        </tbody>
                    </table>
                </div>
                <p className="text-xs text-muted-foreground">This is not medical advice. Please consult your provider to discuss your results.</p>
            </div>
         )}
      </Modal>
    </>
  );
};

export default TestResults;
