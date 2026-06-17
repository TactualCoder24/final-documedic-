import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Users, Plus, QrCode, Shield, Trash2, RefreshCw, ChevronDown, Pill, CalendarDays, AlertTriangle, Syringe, X } from '../components/icons/Icons';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
    generateFamilyPin,
    connectViaFamilyPin,
    getFamilyConnections,
    removeFamilyConnection,
    getFamilyMemberHealth,
    FamilyConnection,
    FamilyMemberHealth,
} from '../services/dataSupabase';

type Tab = 'members' | 'share' | 'connect';

const RELATIONSHIPS = ['Spouse / Partner', 'Child', 'Parent', 'Sibling', 'Grandparent', 'Other'];

const FamilyAccess: React.FC = () => {
    const { user } = useAuth();
    const toast = useToast();

    const [tab, setTab] = useState<Tab>('members');
    const [connections, setConnections] = useState<{ asCaregiver: FamilyConnection[]; asPatient: FamilyConnection[] }>({ asCaregiver: [], asPatient: [] });
    const [loading, setLoading] = useState(true);

    // Share-my-data state
    const [shareRelationship, setShareRelationship] = useState(RELATIONSHIPS[0]);
    const [sharePermission, setSharePermission] = useState<'view_only' | 'manage'>('view_only');
    const [generatedPin, setGeneratedPin] = useState<string | null>(null);
    const [pinLoading, setPinLoading] = useState(false);
    const [pinExpiry, setPinExpiry] = useState<Date | null>(null);

    // Connect-to-member state
    const [enteredPin, setEnteredPin] = useState('');
    const [connectLoading, setConnectLoading] = useState(false);

    // Member health view
    const [expandedMember, setExpandedMember] = useState<string | null>(null);
    const [memberHealth, setMemberHealth] = useState<Record<string, FamilyMemberHealth>>({});
    const [healthLoading, setHealthLoading] = useState<Record<string, boolean>>({});

    const load = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getFamilyConnections(user.uid);
            setConnections(data);
        } catch {
            toast.error('Failed to load family connections.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { load(); }, [load]);

    // Auto-expire PIN display
    useEffect(() => {
        if (!pinExpiry) return;
        const t = setTimeout(() => { setGeneratedPin(null); setPinExpiry(null); }, pinExpiry.getTime() - Date.now());
        return () => clearTimeout(t);
    }, [pinExpiry]);

    const handleGeneratePin = async () => {
        if (!user) return;
        setPinLoading(true);
        try {
            const pin = await generateFamilyPin(user.uid, shareRelationship, sharePermission);
            setGeneratedPin(pin);
            const expiry = new Date(Date.now() + 30 * 60000);
            setPinExpiry(expiry);
        } catch (e: any) {
            toast.error(e?.message || 'Failed to generate PIN.');
        } finally {
            setPinLoading(false);
        }
    };

    const handleConnect = async () => {
        if (!user || enteredPin.trim().length < 6) return toast.error('Enter a valid 6-digit PIN.');
        setConnectLoading(true);
        try {
            await connectViaFamilyPin(user.uid, enteredPin.trim());
            toast.success('Connected successfully!');
            setEnteredPin('');
            setTab('members');
            await load();
        } catch (e: any) {
            toast.error(e?.message || 'Invalid or expired PIN.');
        } finally {
            setConnectLoading(false);
        }
    };

    const handleRemove = async (id: string, name?: string) => {
        if (!confirm(`Remove ${name || 'this connection'}?`)) return;
        try {
            await removeFamilyConnection(id);
            toast.success('Connection removed.');
            await load();
            if (expandedMember === id) setExpandedMember(null);
        } catch {
            toast.error('Failed to remove connection.');
        }
    };

    const toggleMemberHealth = async (conn: FamilyConnection) => {
        const id = conn.id;
        if (expandedMember === id) { setExpandedMember(null); return; }
        setExpandedMember(id);
        if (memberHealth[id]) return; // already loaded
        setHealthLoading(h => ({ ...h, [id]: true }));
        try {
            const data = await getFamilyMemberHealth(conn.patient_id);
            setMemberHealth(h => ({ ...h, [id]: data }));
        } catch {
            toast.error('Could not load health data. Make sure the database policies are applied.');
        } finally {
            setHealthLoading(h => ({ ...h, [id]: false }));
        }
    };

    const qrShareLink = `${window.location.origin}${window.location.pathname}#/emergency/${user?.uid}`;

    return (
        <>
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading">Family Health Vault</h1>
                    <p className="text-muted-foreground">Manage care for loved ones — connect accounts with a PIN, view their health at a glance.</p>
                </div>
                <Button onClick={() => setTab('share')} variant="secondary" className="shrink-0">
                    <QrCode className="mr-2 h-4 w-4" /> Share My Health Data
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-secondary/60 rounded-xl p-1 mb-6 w-fit">
                {(['members', 'share', 'connect'] as Tab[]).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        {t === 'members' ? '👨‍👩‍👧 My Family' : t === 'share' ? '🔗 Share My Data' : '➕ Add Member'}
                    </button>
                ))}
            </div>

            {/* ── Tab: Members ─────────────────────────────────────────────── */}
            {tab === 'members' && (
                <div className="space-y-6">
                    {/* As caregiver */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Members I Manage</CardTitle>
                            <CardDescription>Family accounts you're connected to — tap to see their health summary.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="py-8 text-center text-muted-foreground animate-pulse">Loading…</div>
                            ) : connections.asCaregiver.length === 0 ? (
                                <div className="py-10 text-center text-muted-foreground">
                                    <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                    <p>No family members connected yet.</p>
                                    <Button variant="outline" size="sm" className="mt-3" onClick={() => setTab('connect')}>
                                        <Plus className="h-4 w-4 mr-1" /> Add a Family Member
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {connections.asCaregiver.map(conn => (
                                        <div key={conn.id} className="border border-border rounded-xl overflow-hidden">
                                            {/* Member row */}
                                            <div
                                                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-secondary/30 transition-colors"
                                                onClick={() => toggleMemberHealth(conn)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                                                        {(conn.patientName || '?')[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{conn.patientName || 'Unknown'}</p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <span>{conn.relationship}</span>
                                                            <span>·</span>
                                                            <Shield className="h-3 w-3" />
                                                            <span>{conn.permission_level === 'manage' ? 'Full Access' : 'View Only'}</span>
                                                            {conn.patientBloodType && <><span>·</span><span className="font-medium text-red-500">{conn.patientBloodType}</span></>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={e => { e.stopPropagation(); handleRemove(conn.id, conn.patientName); }}
                                                        className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                                                        title="Remove connection"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedMember === conn.id ? 'rotate-180' : ''}`} />
                                                </div>
                                            </div>

                                            {/* Health summary panel */}
                                            {expandedMember === conn.id && (
                                                <div className="border-t border-border bg-secondary/20 px-4 py-4 space-y-4">
                                                    {healthLoading[conn.id] ? (
                                                        <div className="py-4 text-center text-muted-foreground animate-pulse text-sm">Loading health data…</div>
                                                    ) : memberHealth[conn.id] ? (
                                                        <MemberHealthView health={memberHealth[conn.id]} />
                                                    ) : (
                                                        <div className="py-4 text-center text-muted-foreground text-sm">
                                                            <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-amber-500" />
                                                            Could not load health data. Make sure the Supabase RLS policies are applied.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* As patient — who can access MY data */}
                    {connections.asPatient.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-emerald-500" /> Who Can Access My Data</CardTitle>
                                <CardDescription>These people have been granted access to your health records.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {connections.asPatient.map(conn => (
                                        <div key={conn.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/40">
                                            <div>
                                                <p className="font-medium text-sm">{conn.caregiverName || 'A family member'}</p>
                                                <p className="text-xs text-muted-foreground">{conn.relationship} · {conn.permission_level === 'manage' ? 'Full Access' : 'View Only'}</p>
                                            </div>
                                            <button
                                                onClick={() => handleRemove(conn.id)}
                                                className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                                                title="Revoke access"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* ── Tab: Share My Data ────────────────────────────────────────── */}
            {tab === 'share' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Generate a Family PIN</CardTitle>
                            <CardDescription>Share this 6-digit PIN with a family member. They enter it under "Add Member" to connect to your health data. PIN expires in 30 minutes.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium block mb-1">Their Relationship to You</label>
                                <select
                                    value={shareRelationship}
                                    onChange={e => setShareRelationship(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                >
                                    {RELATIONSHIPS.map(r => <option key={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-1">Access Level</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['view_only', 'manage'] as const).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setSharePermission(p)}
                                            className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${sharePermission === p ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}
                                        >
                                            {p === 'view_only' ? '👁️ View Only' : '✏️ Full Manage'}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {sharePermission === 'view_only' ? 'They can see your records, medications, and appointments.' : 'They can also book appointments and manage medications on your behalf.'}
                                </p>
                            </div>
                            <Button className="w-full" onClick={handleGeneratePin} disabled={pinLoading}>
                                {pinLoading ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Generating…</> : '🔐 Generate PIN'}
                            </Button>

                            {generatedPin && (
                                <div className="mt-2 bg-primary/5 border border-primary/20 rounded-2xl p-5 text-center">
                                    <p className="text-xs text-muted-foreground mb-1">Your Family PIN</p>
                                    <p className="text-5xl font-bold font-mono tracking-[0.3em] text-primary mb-2">{generatedPin}</p>
                                    <p className="text-xs text-muted-foreground">Share this with your {shareRelationship.toLowerCase()}. Expires in 30 minutes.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Emergency QR Code</CardTitle>
                            <CardDescription>Scan to open your emergency health info. Share with family or first responders.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4 py-4">
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-border">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrShareLink)}`}
                                    alt="Emergency QR"
                                    className="w-44 h-44"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground text-center max-w-xs">{qrShareLink}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ── Tab: Connect ─────────────────────────────────────────────── */}
            {tab === 'connect' && (
                <div className="max-w-md mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> Connect to a Family Member</CardTitle>
                            <CardDescription>Ask your family member to generate a PIN from their "Share My Data" tab, then enter it below.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium block mb-1">6-Digit Family PIN</label>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="Enter PIN"
                                    value={enteredPin}
                                    onChange={e => setEnteredPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="text-center text-2xl font-mono tracking-[0.4em] h-14"
                                />
                            </div>
                            <Button className="w-full" onClick={handleConnect} disabled={connectLoading || enteredPin.length < 6}>
                                {connectLoading ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Connecting…</> : '🔗 Connect Account'}
                            </Button>
                            <p className="text-xs text-muted-foreground text-center">The PIN is valid for 30 minutes from when it was generated.</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
};

/* ── Member Health Summary Sub-component ──────────────────────────────────── */
const MemberHealthView: React.FC<{ health: FamilyMemberHealth }> = ({ health }) => {
    const upcoming = health.appointments.filter(a => new Date(a.dateTime) >= new Date() && a.status !== 'Cancelled').slice(0, 3);
    const activeMeds = health.medications.slice(0, 5);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Medications */}
            <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5"><Pill className="h-3.5 w-3.5" /> Medications</h4>
                {activeMeds.length === 0 ? (
                    <p className="text-xs text-muted-foreground">None recorded.</p>
                ) : (
                    <div className="space-y-1.5">
                        {activeMeds.map(m => (
                            <div key={m.id} className="flex items-center gap-2 bg-background rounded-lg px-3 py-1.5">
                                <span className="text-primary text-xs">💊</span>
                                <div>
                                    <p className="text-xs font-semibold">{m.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{m.dosage} · {m.frequency}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upcoming Appointments */}
            <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Upcoming Appointments</h4>
                {upcoming.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No upcoming appointments.</p>
                ) : (
                    <div className="space-y-1.5">
                        {upcoming.map(a => (
                            <div key={a.id} className="bg-background rounded-lg px-3 py-1.5">
                                <p className="text-xs font-semibold">{a.doctorName}</p>
                                <p className="text-[10px] text-muted-foreground">{new Date(a.dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Allergies */}
            {health.allergies.length > 0 && (
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-red-500" /> Allergies</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {health.allergies.map(a => (
                            <span key={a.id} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${a.severity === 'Severe' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' : a.severity === 'Moderate' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'}`}>
                                {a.name} ({a.severity})
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Vaccinations */}
            {health.immunizations.length > 0 && (
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5"><Syringe className="h-3.5 w-3.5 text-emerald-500" /> Vaccinations</h4>
                    <div className="space-y-1">
                        {health.immunizations.slice(0, 4).map(i => (
                            <div key={i.id} className="flex items-center gap-2 text-xs">
                                <span className="text-emerald-500">✓</span>
                                <span className="font-medium">{i.name}</span>
                                <span className="text-muted-foreground">{i.date ? new Date(i.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FamilyAccess;
