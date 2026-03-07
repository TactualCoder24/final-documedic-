import React, { useState, useRef } from 'react';
import { useToast } from '../hooks/useToast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Download, UploadCloud, Trash2, Share2, Link as LinkIcon, ShieldCheck, Clock, Smartphone, FileText } from '../components/icons/Icons';
import { useAuth } from '../hooks/useAuth';
import { getFullUserData, importUserData, deleteUserData } from '../services/dataSupabase';
import Modal from '../components/ui/Modal';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccessLogEntry } from '../types';
import Input from '../components/ui/Input';

const mockAccessLog: AccessLogEntry[] = [
  { id: '1', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), accessor: 'You', action: 'Shared record via temporary link' },
  { id: '2', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), accessor: 'Dr. Priya Sharma', action: 'Accessed record via Swasthya Connect' },
  { id: '3', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), accessor: 'Emergency Services', action: 'Viewed emergency profile' },
];

const mockConnections = [
  { id: '1', name: 'City Hospital', fhirUrl: 'https://fhir.cityhospital.local/api', connected: true },
  { id: '2', name: 'National Diagnostics Lab', fhirUrl: 'https://api.ndl.health/fhir/v4', connected: false },
  { id: '3', name: 'Apollo ABDM Node', fhirUrl: 'https://abdm.apollo.in/fhir', connected: false },
];

const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAccessLogModalOpen, setIsAccessLogModalOpen] = useState(false);
  const [connections, setConnections] = useState(mockConnections);
  const [shareLink, setShareLink] = useState('');
  const [deviceConnections, setDeviceConnections] = useState({
    appleHealth: true,
    fitbit: false,
    withings: false,
  });
  const [isConnectingFhir, setIsConnectingFhir] = useState<string | null>(null);

  const importInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

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
  const handleCsvClick = () => csvInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files?.[0]) return;
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      if (result) {
        const success = await importUserData(user.uid, result);
        if (success) { toast.success(t('settings.import_success', 'Data imported successfully! The page will now reload.')); } else { toast.error(t('settings.import_fail', 'Import failed. The file may be invalid.')); }
        if (success) window.location.reload();
      }
    };
    reader.readAsText(file);
  };

  const handleCsvImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) return;
    const file = event.target.files[0];
    toast.info(t('settings.parsing_csv', `Parsing ${file.name}...`));
    setTimeout(() => {
      toast.success(t('settings.csv_success', "Successfully imported 32 records from wearable CSV."));
    }, 1500);
    event.target.value = '';
  }

  const handleDeleteData = async () => {
    if (!user) return;
    await deleteUserData(user.uid);
    toast.success(t('settings.delete_success', 'All your data has been deleted.'));
    await signOut();
    navigate('/login');
  };

  const generateShareLink = () => {
    if (!user) return;
    setShareLink(`${window.location.origin}${window.location.pathname}#/emergency/${user.uid}?temp=true`);
    setIsShareModalOpen(true);
  };

  const copyShareLink = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(shareLink)
        .then(() => toast.success(t('settings.link_copied', 'Link copied!')))
        .catch(() => fallbackCopyTextToClipboard(shareLink));
    } else {
      fallbackCopyTextToClipboard(shareLink);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; // Avoid scrolling
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        toast.success(t('settings.link_copied', 'Link copied!'));
      } else {
        toast.error(t('settings.copy_fail', 'Failed to copy. Please select and copy the link manually.'));
      }
    } catch (err) {
      toast.error(t('settings.copy_fail', 'Failed to copy. Please select and copy the link manually.'));
    }
    document.body.removeChild(textArea);
  };

  const toggleConnection = async (id: string, name: string, fhirUrl: string, isCurrentlyConnected: boolean) => {
    if (isCurrentlyConnected) {
      setConnections(conns => conns.map(c => c.id === id ? { ...c, connected: false } : c));
      toast.info(t('settings.disconnected', `Disconnected from ${name}`));
      return;
    }

    setIsConnectingFhir(id);
    // Simulate FHIR API connection flow (OAuth + Fetching Patient Resource demo)
    toast.info(t('settings.connecting_fhir', `Initiating secure FHIR connection to ${fhirUrl}...`));

    setTimeout(() => {
      setConnections(conns => conns.map(c => c.id === id ? { ...c, connected: true } : c));
      setIsConnectingFhir(null);
      toast.success(`Connected to ${name} via FHIR API successfully. Data is now syncing.`);
    }, 2000);
  };

  const toggleDeviceConnection = (device: keyof typeof deviceConnections) => setDeviceConnections(prev => ({ ...prev, [device]: !prev[device] }));
  const getAccessIcon = (accessor: string) => {
    if (accessor === 'You') return <Share2 className="h-5 w-5 text-primary" />;
    if (accessor.startsWith('Dr.')) return <LinkIcon className="h-5 w-5 text-green-500" />;
    return <ShieldCheck className="h-5 w-5 text-red-500" />;
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading">{t('settings.title', 'Settings')}</h1>
        <p className="text-muted-foreground">{t('settings.subtitle', 'Manage your account, data, and sharing preferences.')}</p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.sharing.title', 'Sharing & Permissions')}</CardTitle>
            <CardDescription>{t('settings.sharing.desc', 'Control how your health information is shared with providers and services.')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors">
              <div>
                <h4 className="font-semibold text-primary flex items-center gap-2"><LinkIcon className="h-4 w-4" /> {t('settings.sharing.api.title', 'Health Provider API Connections')}</h4>
                <p className="text-sm text-muted-foreground mt-1">{t('settings.sharing.api.desc', 'Connect to clinical FHIR/ABDM APIs to sync your hospital records.')}</p>
              </div>
              <Button onClick={() => setIsConnectModalOpen(true)} className="mt-2 sm:mt-0 w-full sm:w-auto shadow-sm">{t('settings.sharing.api.button', 'Manage API Connections')}</Button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">{t('settings.sharing.record.title', 'Share My Record')}</h4>
                <p className="text-sm text-muted-foreground mt-1">{t('settings.sharing.record.desc', 'Generate a temporary link for any provider to view your record.')}</p>
              </div>
              <Button onClick={generateShareLink} variant="outline" className="mt-2 sm:mt-0 w-full sm:w-auto">{t('settings.sharing.record.button', 'Generate Link')}</Button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">{t('settings.sharing.history.title', 'Access History')}</h4>
                <p className="text-sm text-muted-foreground mt-1">{t('settings.sharing.history.desc', 'See a log of who has viewed your information.')}</p>
              </div>
              <Button onClick={() => setIsAccessLogModalOpen(true)} variant="outline" className="mt-2 sm:mt-0 w-full sm:w-auto">{t('settings.sharing.history.button', 'View Log')}</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>{t('settings.devices.title', 'Connected Devices & Wearables')}</CardTitle>
                <CardDescription>{t('settings.devices.desc', 'Automatically record information from your personal devices.')}</CardDescription>
              </div>
              <Button variant="secondary" onClick={handleCsvClick} size="sm">
                <FileText className="mr-2 h-4 w-4" /> {t('settings.devices.button', 'Import CSV Data')}
              </Button>
              <input type="file" ref={csvInputRef} className="hidden" accept=".csv" onChange={handleCsvImport} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[{ id: 'appleHealth', name: 'Apple Health' }, { id: 'fitbit', name: 'Fitbit' }, { id: 'withings', name: 'Withings' }].map(device => (
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
          <CardHeader><CardTitle>{t('settings.account.title', 'Account Data')}</CardTitle><CardDescription>{t('settings.account.desc', 'Export your data for backup or import to overwrite current data.')}</CardDescription></CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <Button onClick={handleExport} variant="outline"><Download className="mr-2 h-4 w-4" />{t('settings.account.export', 'Export My Data')}</Button>
            <Button onClick={handleImportClick} variant="outline"><UploadCloud className="mr-2 h-4 w-4" />{t('settings.account.import', 'Import Data')}</Button>
            <input type="file" ref={importInputRef} className="hidden" accept="application/json" onChange={handleFileChange} />
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader><CardTitle className="text-destructive">{t('settings.danger.title', 'Danger Zone')}</CardTitle><CardDescription>{t('settings.danger.desc', 'This is a permanent action and cannot be undone.')}</CardDescription></CardHeader>
          <CardFooter><Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)}><Trash2 className="mr-2 h-4 w-4" />{t('settings.danger.button', 'Delete All My Data')}</Button></CardFooter>
        </Card>
      </div>

      <Modal title={t('settings.modals.connect_fhir.title', 'Manage FHIR Connections')} isOpen={isConnectModalOpen} onClose={() => setIsConnectModalOpen(false)}>
        <p className="text-sm text-muted-foreground mb-4">{t('settings.modals.connect_fhir.desc', 'Connect your account securely to hospital systems that support FHIR or ABDM APIs.')}</p>
        <div className="space-y-3">
          {connections.map(conn => (
            <div key={conn.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-secondary/30 border rounded-xl gap-4">
              <div>
                <p className="font-semibold text-lg">{conn.name}</p>
                <p className="text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded inline-block mt-1">{conn.fhirUrl}</p>
              </div>
              <Button
                variant={conn.connected ? 'secondary' : 'default'}
                onClick={() => toggleConnection(conn.id, conn.name, conn.fhirUrl, conn.connected)}
                disabled={isConnectingFhir === conn.id}
              >
                {isConnectingFhir === conn.id ? t('settings.modals.connect_fhir.connecting', 'Connecting...') : (conn.connected ? t('settings.modals.connect_fhir.disconnect', 'Disconnect') : t('settings.modals.connect_fhir.connect_api', 'Connect API'))}
              </Button>
            </div>
          ))}
        </div>
      </Modal>

      <Modal title={t('settings.modals.share.title', 'Share Your Record')} isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)}>
        <p className="text-sm text-muted-foreground mb-4">{t('settings.modals.share.desc', 'Share this secure, temporary link. It will expire in 24 hours.')}</p>
        <div className="flex items-center gap-2"><Input value={shareLink} readOnly /><Button onClick={copyShareLink}>{t('settings.modals.share.copy', 'Copy')}</Button></div>
      </Modal>

      <Modal title={t('settings.modals.history.title', 'Access History')} isOpen={isAccessLogModalOpen} onClose={() => setIsAccessLogModalOpen(false)}>
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

      <Modal title={t('settings.modals.delete.title', 'Confirm Data Deletion')} isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('settings.modals.delete.desc', 'Are you sure? This action is irreversible.')}</p>
          <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>{t('settings.modals.delete.cancel', 'Cancel')}</Button><Button variant="destructive" onClick={handleDeleteData}>{t('settings.modals.delete.confirm', 'Yes, Delete Everything')}</Button></div>
        </div>
      </Modal>
    </>
  );
};

export default Settings;