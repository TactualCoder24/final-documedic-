import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Lightbulb } from '../components/icons/Icons';
import { getLifestyleTips } from '../services/aiService';
import Skeleton from '../components/ui/Skeleton';
import { useAuth } from '../hooks/useAuth';
import { getProfile, getSymptoms, getFoodLogs } from '../services/dataSupabase';

interface Tip {
  title: string;
  description: string;
}

const LifestyleTips: React.FC = () => {
  const { user } = useAuth();
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTips = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setTips([]);
    try {
      const profile = await getProfile(user.uid);
      const symptoms = await getSymptoms(user.uid);
      const foodLogs = await getFoodLogs(user.uid);
      const recentSymptoms = symptoms.slice(0, 3).map(s => `${s.name} (severity ${s.severity}/10)`).join(', ') || 'None recently';
      const recentMeals = foodLogs.slice(0, 3).map(f => `${f.mealType}: ${f.description}`).join('; ') || 'None recently';

      const userInfo = `
            - Age: ${profile.age || 'Not specified'}
            - Conditions: ${profile.conditions || 'Not specified'}
            - Goals: ${profile.goals || 'General wellness'}
            - Recent Symptoms: ${recentSymptoms}
            - Recent Meals: ${recentMeals}
        `;
      const result = await getLifestyleTips(userInfo);
      const parsedTips = JSON.parse(result);
      setTips(parsedTips);
    } catch (e) {
      console.error("Failed to fetch or parse tips:", e);
      setTips([]); // Set to empty array on error
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading">Personalized Lifestyle Tips</h1>
        <p className="text-muted-foreground">AI-powered suggestions to help you live a healthier life.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))
        ) : tips && tips.length > 0 ? (
          tips.map((tip, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader className="flex flex-row items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Lightbulb className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <CardTitle>{tip.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{tip.description}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Could not load tips at this time. Please try again later, or ensure your profile is filled out on the Dashboard.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-6 text-center">
        <Button onClick={fetchTips} disabled={loading}>
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
              Refreshing...
            </>
          ) : 'Get New Tips'}
        </Button>
      </div>
    </>
  );
};

export default LifestyleTips;