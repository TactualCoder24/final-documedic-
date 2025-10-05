import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { BrainCircuit, ThumbsUp, ThumbsDown } from '../components/icons/Icons';
import { getHealthSummary } from '../services/gemini';
import Skeleton from '../components/ui/Skeleton';

const mockHealthData = `
- Patient: Priya Sharma, 35 years old
- Conditions: Hypertension, Type 2 Diabetes (controlled)
- Recent Vitals (2023-11-01): BP 130/85 mmHg, Glucose 110 mg/dL
- Medications: Lisinopril 10mg daily, Metformin 500mg twice daily
- Allergies: Penicillin
- Recent Notes: Patient reports consistent diet and exercise. No new complaints.
`;

const SmartSummary: React.FC = () => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateSummary = async () => {
    setLoading(true);
    setSummary('');
    const result = await getHealthSummary(mockHealthData);
    setSummary(result);
    setLoading(false);
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading">Smart Health Summary</h1>
        <p className="text-muted-foreground">Get an AI-powered summary of your health profile, easy to read and share.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            Your AI-Generated Summary
          </CardTitle>
          <CardDescription>
            This summary is generated based on your latest health data. It is for informational purposes only and is not a substitute for professional medical advice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
             </div>
          ) : summary ? (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-foreground prose-headings:text-foreground">
              {summary.split('\n').map((line, index) => {
                if (line.startsWith('##')) return <h2 key={index} className="font-heading text-lg font-semibold mt-4 mb-2">{line.replace('##', '').trim()}</h2>;
                if (line.startsWith('#')) return <h1 key={index} className="font-heading text-xl font-bold mt-4 mb-2">{line.replace('#', '').trim()}</h1>;
                if (line.trim().startsWith('-')) return <p key={index} className="pl-4">{line.trim()}</p>;
                return <p key={index}>{line}</p>;
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Click the button below to generate your health summary.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button onClick={handleGenerateSummary} disabled={loading}>
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                Generating...
              </>
            ) : summary ? 'Regenerate Summary' : 'Generate Summary'}
          </Button>
          {summary && !loading && (
             <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Was this summary helpful?</p>
                <Button variant="outline" size="icon" className="h-8 w-8"><ThumbsUp className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" className="h-8 w-8"><ThumbsDown className="h-4 w-4" /></Button>
             </div>
          )}
        </CardFooter>
      </Card>
    </>
  );
};

export default SmartSummary;
