import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Bot, Lightbulb, Stethoscope, MapPin } from '../components/icons/Icons';
import Input from '../components/ui/Input';

type Step = 'start' | 'questions' | 'result';

const SymptomChecker: React.FC = () => {
    const [step, setStep] = useState<Step>('start');
    const [symptom, setSymptom] = useState('');
    const [result, setResult] = useState({ title: '', recommendation: '', icon: Stethoscope });
    const [isLoading, setIsLoading] = useState(false);

    const handleStart = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const mainSymptom = formData.get('symptom') as string;
        if(mainSymptom) {
            setSymptom(mainSymptom);
            setStep('questions');
        }
    };
    
    const handleGetResult = () => {
        setIsLoading(true);
        // Simulate AI processing
        setTimeout(() => {
            // Mock logic to determine recommendation based on symptom
            if (symptom.toLowerCase().includes('chest pain')) {
                 setResult({
                    title: 'Emergency Care Recommended',
                    recommendation: 'Based on your symptoms, it is highly recommended to seek immediate medical attention. Please visit the nearest Emergency Room.',
                    icon: MapPin,
                });
            } else if (symptom.toLowerCase().includes('fever')) {
                 setResult({
                    title: 'Consult a Doctor',
                    recommendation: 'Your symptoms suggest it would be best to consult with a doctor. You can schedule an appointment or find urgent care for a prompt evaluation.',
                    icon: Stethoscope,
                });
            } else {
                 setResult({
                    title: 'Self-Care May Be Appropriate',
                    recommendation: 'For your symptoms, self-care at home may be appropriate. Rest, stay hydrated, and monitor your symptoms. Consult a doctor if they worsen or do not improve.',
                    icon: Lightbulb,
                });
            }
            setStep('result');
            setIsLoading(false);
        }, 1500);
    };

    const handleReset = () => {
        setStep('start');
        setSymptom('');
    };

    return (
        <>
        <div className="mb-6">
            <h1 className="text-3xl font-bold font-heading">Symptom Checker</h1>
            <p className="text-muted-foreground">Answer questions to receive a recommendation for care.</p>
        </div>

        <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
                <Bot className="h-10 w-10 mx-auto text-primary" />
                <CardTitle>AI-Powered Symptom Checker</CardTitle>
                <CardDescription>This tool does not provide a diagnosis. It is for informational purposes only.</CardDescription>
            </CardHeader>
            <CardContent>
                {step === 'start' && (
                    <form onSubmit={handleStart} className="space-y-4">
                        <label htmlFor="symptom" className="font-semibold">What is your primary symptom?</label>
                        <Input id="symptom" name="symptom" placeholder="e.g., Sore throat, headache, fever" required />
                        <Button type="submit" className="w-full">Start</Button>
                    </form>
                )}
                {step === 'questions' && (
                    <div className="space-y-6 text-center">
                        <p className="font-semibold">Your primary symptom: <span className="text-primary">{symptom}</span></p>
                        <p className="text-sm text-muted-foreground">(In a real scenario, you would be asked a series of follow-up questions here to narrow down the potential causes.)</p>
                        <Button onClick={handleGetResult} disabled={isLoading} className="w-full">
                            {isLoading ? 'Analyzing...' : 'Get Recommendation'}
                        </Button>
                    </div>
                )}
                {step === 'result' && (
                    <div className="text-center space-y-4">
                        <div className="flex items-center justify-center h-16 w-16 mx-auto rounded-full bg-primary/10 text-primary">
                            <result.icon className="h-8 w-8"/>
                        </div>
                        <h3 className="text-xl font-bold">{result.title}</h3>
                        <p className="text-muted-foreground">{result.recommendation}</p>
                        <div className="flex gap-4 justify-center pt-4">
                            <Button onClick={handleReset} variant="outline">Start Over</Button>
                            {result.title.includes('Emergency') && <Button variant="destructive">Find Nearest ER</Button>}
                            {result.title.includes('Doctor') && <Button>Schedule Appointment</Button>}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
        </>
    );
};

export default SymptomChecker;
