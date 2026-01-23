
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { RefreshCw, CheckCircle2, ArrowLeft } from '../../components/icons/Icons';
import { useNavigate } from 'react-router-dom';

const MentibotSearchAdmin: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-3xl font-bold font-heading uppercase italic tracking-tighter">Search Engine <span className="text-primary">Admin</span></h1>
            </div>

            <Card variant="premium" className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
                <CardHeader>
                    <CardTitle className="text-2xl font-black uppercase">Initialize Mock Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="font-medium text-lg">
                        This module generates the necessary mock data for the retreat search feature in <code>src/mockData.js</code>.
                    </p>

                    <div className="p-6 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-xl space-y-3">
                        <h3 className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-5 w-5" />
                            Generator Status: Ready
                        </h3>
                        <p className="text-sm">The mock data file has already been created during the initial setup.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button className="flex-1 h-14 text-xl font-black uppercase italic tracking-tighter" onClick={() => navigate('/mentibot/search')}>
                            Go to Search
                        </Button>
                        <Button variant="outline" className="flex-1 h-14 text-xl font-black uppercase italic tracking-tighter gap-2">
                            <RefreshCw className="h-5 w-5" />
                            Re-generate Data
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-12 text-center text-muted-foreground uppercase tracking-widest text-xs font-bold">
                DocuMedic Administrative Console
            </div>
        </div>
    );
};

export default MentibotSearchAdmin;
