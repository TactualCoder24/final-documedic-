import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Bot, Lightbulb, Stethoscope, MapPin, Search } from '../components/icons/Icons';
import Input from '../components/ui/Input';
import { chatWithSymptomChecker } from '../services/aiService';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type Step = 'start' | 'chat' | 'result';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

const SymptomChecker: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [step, setStep] = useState<Step>('start');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [result, setResult] = useState({ title: '', recommendation: '', triageLevel: '', action: '', icon: Stethoscope });
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (step === 'chat') {
            scrollToBottom();
        }
    }, [messages, step]);

    const handleStart = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const mainSymptom = formData.get('symptom') as string;
        if (mainSymptom) {
            const initialMessages: ChatMessage[] = [{ role: 'user', content: mainSymptom }];
            setMessages(initialMessages);
            setStep('chat');
            await processTurn(initialMessages);
        }
    };

    const processTurn = async (currentMessages: ChatMessage[]) => {
        setIsLoading(true);
        try {
            const conversationText = currentMessages.map(m => `${m.role === 'user' ? 'Patient' : 'Assistant'}: ${m.content}`).join('\n');
            const mockProfile = "User is an adult, no known major conditions. (Mock Profile)";

            const responseText = await chatWithSymptomChecker(conversationText, mockProfile);
            const data = JSON.parse(responseText);

            if (data.type === 'question') {
                setMessages(prev => [...prev, { role: 'assistant', content: data.question }]);
            } else if (data.type === 'result') {
                setResult({
                    title: data.title,
                    recommendation: data.recommendation,
                    triageLevel: data.triageLevel,
                    action: data.action,
                    icon: data.triageLevel === 'Emergency' ? MapPin : (data.triageLevel === 'Routine' ? Search : (data.triageLevel === 'Self-care' ? Lightbulb : Stethoscope)),
                });
                setStep('result');
            }
        } catch (error) {
            console.error("Failed to parse AI response", error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'An error occurred. Please answer the question again or restart.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: inputValue.trim() }];
        setMessages(newMessages);
        setInputValue('');
        await processTurn(newMessages);
    };

    const handleReset = () => {
        setStep('start');
        setMessages([]);
        setInputValue('');
    };

    const handleAction = () => {
        if (result.action === 'FindER') {
            navigate('/find-care?type=er');
        } else if (result.action === 'ScheduleAppointment') {
            navigate('/appointments'); // Or wherever appropriate
        } else {
            // For self-care, we can just reset or stay here
            navigate('/');
        }
    };

    return (
        <>
            <div className="mb-6">
                <h1 className="text-3xl font-bold font-heading">{t('symptom_checker.title', 'Symptom Checker')}</h1>
                <p className="text-muted-foreground">{t('symptom_checker.subtitle', 'Answer questions to receive a recommendation for care.')}</p>
            </div>

            <Card className="max-w-2xl mx-auto h-[600px] flex flex-col">
                <CardHeader className="text-center shrink-0">
                    <Bot className="h-10 w-10 mx-auto text-primary" />
                    <CardTitle>{t('symptom_checker.card_title', 'AI-Powered Symptom Checker')}</CardTitle>
                    <CardDescription>{t('symptom_checker.card_desc', 'This tool does not provide a diagnosis. It is for informational purposes only.')}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden flex flex-col relative">
                    {step === 'start' && (
                        <div className="flex-1 flex items-center justify-center">
                            <form onSubmit={handleStart} className="space-y-4 w-full max-w-md">
                                <label htmlFor="symptom" className="font-semibold block text-center">{t('symptom_checker.start_prompt', 'What is your primary symptom?')}</label>
                                <Input id="symptom" name="symptom" placeholder={t('symptom_checker.start_placeholder', 'e.g., Sore throat, headache, fever')} required className="text-center" />
                                <Button type="submit" className="w-full">{t('symptom_checker.start_btn', 'Start Analysis')}</Button>
                            </form>
                        </div>
                    )}

                    {step === 'chat' && (
                        <>
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted text-foreground rounded-tl-none'}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="max-w-[80%] rounded-xl px-4 py-2 text-sm bg-muted text-muted-foreground rounded-tl-none animate-pulse">
                                            {t('symptom_checker.typing', 'Typing...')}
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="pt-4 mt-auto border-t">
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <Input
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder={t('symptom_checker.type_answer', 'Type your answer...')}
                                        disabled={isLoading}
                                        className="flex-1"
                                    />
                                    <Button type="submit" disabled={isLoading || !inputValue.trim()}>{t('symptom_checker.send', 'Send')}</Button>
                                </form>
                            </div>
                        </>
                    )}

                    {step === 'result' && (
                        <div className="text-center space-y-4 flex-1 flex flex-col items-center justify-center">
                            <div className="flex items-center justify-center h-16 w-16 mx-auto rounded-full bg-primary/10 text-primary">
                                <result.icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold">{result.title}</h3>
                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${result.triageLevel === 'Emergency' ? 'bg-destructive/10 text-destructive' :
                                result.triageLevel === 'Urgent' ? 'bg-orange-500/10 text-orange-600' :
                                    result.triageLevel === 'Routine' ? 'bg-blue-500/10 text-blue-600' :
                                        'bg-green-500/10 text-green-600'
                                }`}>
                                {result.triageLevel} {t('symptom_checker.triage', 'Triage')}
                            </div>
                            <p className="text-muted-foreground max-w-md mx-auto">{result.recommendation}</p>
                            <div className="flex gap-4 justify-center pt-8">
                                <Button onClick={handleReset} variant="outline">{t('symptom_checker.start_over', 'Start Over')}</Button>
                                {result.action === 'FindER' && <Button variant="destructive" onClick={handleAction}>{t('symptom_checker.find_er', 'Find Nearest ER')}</Button>}
                                {result.action === 'ScheduleAppointment' && <Button onClick={handleAction}>{t('symptom_checker.schedule', 'Schedule Appointment')}</Button>}
                                {result.action === 'SelfCare' && <Button onClick={handleAction}>{t('symptom_checker.explore', 'Explore Health Library')}</Button>}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
};

export default SymptomChecker;
