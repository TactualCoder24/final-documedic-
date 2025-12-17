import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Download, UploadCloud, Trash2, Share2, Link as LinkIcon, ShieldCheck, Clock, Smartphone } from '../components/icons/Icons';
import { useAuth } from '../hooks/useAuth';
import { getFullUserData, importUserData, deleteUserData } from '../services/dataSupabase';
import Modal from '../components/ui/Modal';
import { useNavigate } from 'react-router-dom';
import { AccessLogEntry } from '../types';
import Input from '../components/ui/Input';

const mockAccessLog: AccessLogEntry[] = [
    { id: '1', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), accessor: 'You', action: 'Shared record via temporary link' },
    { id: '2', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), accessor: 'Dr. Priya Sharma', action: 'Accessed record via Swasthya Connect' },
    { id: '3', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), accessor: 'Emergency Services', action: 'Viewed emergency profile' },
];

const mockConnections = [
    { name: 'City Hospital', connected: true },
    { name: 'National Diagnostics Lab', connected: false },
    { name: 'Wellness Clinic', connected: true },
];

const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAccessLogModalOpen, setIsAccessLogModalOpen] = useState(false);
  const [sharingAuthorized, setSharingAuthorized] = useState(true);
  const [connections, setConnections] = useState(mockConnections);
  const [shareLink, setShareLink] = useState('');
  const [deviceConnections, setDeviceConnections] = useState({
      appleHealth: true,
      fitbit: false,
      withings: false,
  });
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
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

  const handleImportClick = () => importInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files?.[0]) return;
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      if (result) {
        const success = await importUserData(user.uid, result);
        alert(success ? 'Data imported successfully! The page will now reload.' : 'Import failed. The file may be invalid.');
        if (success) window.location.reload();
      }
    };
    reader.readAsText(file);
  };
  
  const handleDeleteData = async () => {
    if (!user) return;
    await deleteUserData(user.uid);
    alert('All your data has been deleted.');
    await signOut();
    navigate('/login');
  };

  const generateShareLink = () => {
    setShareLink(`${window.location.origin}${window.location.pathname}#/share/${Math.random().toString(36).substring(2, 10)}`);
    setIsShareModalOpen(true);
  };

  const copyShareLink = () => navigator.clipboard.writeText(shareLink).then(() => alert('Link copied!'));
  const toggleConnection = (name: string) => setConnections(conns => conns.map(c => c.name === name ? {...c, connected: !c.connected} : c));
  const toggleDeviceConnection = (device: keyof typeof deviceConnections) => setDeviceConnections(prev => ({ ...prev, [device]: !prev[device] }));
  const getAccessIcon = (accessor: string) => {
    if (accessor === 'You') return <Share2 className="h-5 w-5 text-primary" />;
    if (accessor.startsWith('Dr.')) return <LinkIcon className="h-5 w-5 text-green-500" />;
    return <ShieldCheck className="h-5 w-5 text-red-500" />;
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading">Settings</h1>
        <p className="text-muted-foreground">Manage your account, data, and sharing preferences.</p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Sharing & Permissions</CardTitle>
            <CardDescription>Control how your health information is shared with providers and services.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
                <div>
                    <h4 className="font-semibold">Link Health Accounts (Swasthya Connect)</h4>
                    <p className="text-sm text-muted-foreground mt-1">Connect to other healthcare organizations.</p>
                </div>
                <Button onClick={() => setIsConnectModalOpen(true)} variant="outline" className="mt-2 sm:mt-0 w-full sm:w-auto">Manage</Button>
            </div>
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
                <div>
                    <h4 className="font-semibold">Share My Record</h4>
                    <p className="text-sm text-muted-foreground mt-1">Generate a temporary link for any provider to view your record.</p>
                </div>
                <Button onClick={generateShareLink} variant="outline" className="mt-2 sm:mt-0 w-full sm:w-auto">Generate Link</Button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
                <div>
                    <h4 className="font-semibold">Access History</h4>
                    <p className="text-sm text-muted-foreground mt-1">See a log of who has viewed your information.</p>
                </div>
                <Button onClick={() => setIsAccessLogModalOpen(true)} variant="outline" className="mt-2 sm:mt-0 w-full sm:w-auto">View Log</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Connected Devices & Apps</CardTitle><CardDescription>Automatically record information from your personal devices.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                {[{id: 'appleHealth', name: 'Apple Health'}, {id: 'fitbit', name: 'Fitbit'}, {id: 'withings', name: 'Withings'}].map(device => (
                     <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3"><Smartphone className="h-5 w-5 text-muted-foreground" /><span className="font-semibold">{device.name}</span></div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={deviceConnections[device.id as keyof typeof deviceConnections]} onChange={() => toggleDeviceConnection(device.id as keyof typeof deviceConnections)} />
                            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                ))}
            </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Account Data</CardTitle><CardDescription>Export your data for backup or import to overwrite current data.</CardDescription></CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <Button onClick={handleExport} variant="outline"><Download className="mr-2 h-4 w-4" />Export My Data</Button>
            <Button onClick={handleImportClick} variant="outline"><UploadCloud className="mr-2 h-4 w-4" />Import Data</Button>
            <input type="file" ref={importInputRef} className="hidden" accept="application/json" onChange={handleFileChange}/>
          </CardContent>
        </Card>

        <Card className="border-destructive">
            <CardHeader><CardTitle className="text-destructive">Danger Zone</CardTitle><CardDescription>This is a permanent action and cannot be undone.</CardDescription></CardHeader>
            <CardFooter><Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)}><Trash2 className="mr-2 h-4 w-4" />Delete All My Data</Button></CardFooter>
        </Card>
      </div>

      <Modal title="Manage Swasthya Connect" isOpen={isConnectModalOpen} onClose={() => setIsConnectModalOpen(false)}>
        <p className="text-sm text-muted-foreground mb-4">Connect your account to other healthcare providers.</p>
        <div className="space-y-3">
            {connections.map(conn => (
                <div key={conn.name} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <p className="font-medium">{conn.name}</p>
                    <Button size="sm" variant={conn.connected ? 'secondary' : 'default'} onClick={() => toggleConnection(conn.name)}>{conn.connected ? 'Disconnect' : 'Connect'}</Button>
                </div>
            ))}
        </div>
      </Modal>

      <Modal title="Share Your Record" isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)}>
        <p className="text-sm text-muted-foreground mb-4">Share this secure, temporary link. It will expire in 24 hours.</p>
        <div className="flex items-center gap-2"><Input value={shareLink} readOnly /><Button onClick={copyShareLink}>Copy</Button></div>
      </Modal>

      <Modal title="Access History" isOpen={isAccessLogModalOpen} onClose={() => setIsAccessLogModalOpen(false)}>
        <div className="space-y-4">
            {mockAccessLog.map(log => (
                <div key={log.id} className="flex items-start gap-4">
                    <div className="mt-1">{getAccessIcon(log.accessor)}</div>
                    <div>
                        <p className="font-medium">{log.accessor} <span className="font-normal text-muted-foreground">{log.action}</span></p>
                        <p className="text-sm text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                </div>
            ))}
        </div>
      </Modal>

      <Modal title="Confirm Data Deletion" isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Are you sure? This action is irreversible.</p>
            <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDeleteData}>Yes, Delete Everything</Button></div>
        </div>
      </Modal>
    </>
  );
};

export default Settings;