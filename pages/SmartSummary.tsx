
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { BrainCircuit, ThumbsUp, ThumbsDown } from '../components/icons/Icons';
import { getHealthSummary } from '../services/aiService';
import Skeleton from '../components/ui/Skeleton';
import { useAuth } from '../hooks/useAuth';
import { getFullUserData, getWaterIntake } from '../services/dataSupabase';

const SmartSummary: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleGenerateSummary = async () => {
    if (!user) return;

    setLoading(true);
    setSummary('');
    setStatusMessage('Compiling your data and generating AI health summary...');

    const userData = await getFullUserData(user.uid);
    const today = new Date().toISOString().split('T')[0];
    const waterIntake = await getWaterIntake(user.uid, today);
    const waterGoal = userData.profile.waterGoal || 8;

    // Construct a detailed string of the user's health data for the AI.
    let healthDataString = `
- Patient Profile: Age ${userData.profile.age || 'N/A'}, Conditions: ${userData.profile.conditions || 'None specified'}, Goals: ${userData.profile.goals || 'None specified'}, Target Blood Sugar: ${userData.profile.targetBloodSugar || 'N/A'}
- Today's Water Intake: ${waterIntake} out of ${waterGoal} glasses.
- Vitals: ${userData.vitals.length > 0 ? userData.vitals.slice(-7).map(v => `On ${v.date}, Blood Sugar was ${v.sugar} mg/dL`).join('; ') : 'No vitals logged.'}
- Medications: ${userData.medications.length > 0 ? userData.medications.map(m => `${m.name} (${m.dosage}, ${m.frequency})`).join(', ') : 'No medications listed.'}
- Recent Symptoms: ${userData.symptoms.length > 0 ? userData.symptoms.slice(0, 5).map(s => `${s.name} (Severity: ${s.severity}/10) on ${new Date(s.date).toLocaleDateString()}`).join('; ') : 'No symptoms logged.'}
- Recent Meals: ${userData.foodLogs.length > 0 ? userData.foodLogs.slice(0, 3).map(f => `${f.mealType}: ${f.description}`).join('; ') : 'No meals logged recently.'}
- Recent Records: ${userData.records.length > 0 ? userData.records.slice(0, 3).map(r => `${r.name} (${r.type} from ${r.date})`).join(', ') : 'No records available.'}
    `;

    const result = await getHealthSummary(healthDataString);
    setSummary(result);
    setLoading(false);
    setStatusMessage('Your health summary has been generated.');
  };

  const handleDownloadSummary = () => {
    if (!summary) return;
    const plainTextSummary = summary.replace(/##/g, '').replace(/#/g, '');
    const blob = new Blob([plainTextSummary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documedic_summary_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadRecord = async () => {
    if (!user) return;
    const userData = await getFullUserData(user.uid);
    const jsonString = JSON.stringify(userData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documedic_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </div>
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
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <Button onClick={handleGenerateSummary} disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                  Generating...
                </>
              ) : summary ? 'Regenerate Summary' : 'Generate Summary'}
            </Button>
            {summary && !loading && (
              <>
                <Button onClick={handleDownloadSummary} variant="outline">Download Summary</Button>
                <Button onClick={handleDownloadRecord} variant="outline">Download Full Record</Button>
              </>
            )}
          </div>
          {summary && !loading && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <p className="text-sm text-muted-foreground">Was this summary helpful?</p>
              <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Helpful"><ThumbsUp className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Not helpful"><ThumbsDown className="h-4 w-4" /></Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </>
  );
};

export default SmartSummary;