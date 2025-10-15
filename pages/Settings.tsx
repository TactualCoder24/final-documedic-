import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Download, UploadCloud, Trash2 } from '../components/icons/Icons';
import { useAuth } from '../hooks/useAuth';
import { getFullUserData, importUserData, deleteUserData } from '../services/data';
import Modal from '../components/ui/Modal';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const success = await importUserData(user.uid, result);
          if (success) {
            alert('Data imported successfully! The page will now reload.');
            window.location.reload();
          } else {
            alert('Import failed. The file may be invalid or corrupted.');
          }
        }
      };
      reader.readAsText(file);
    }
  };
  
  const handleDeleteData = async () => {
    if (!user) return;
    await deleteUserData(user.uid);
    alert('All your data has been deleted.');
    // Sign out and navigate to login as the user's state is now gone.
    signOut().then(() => {
        navigate('/login');
    });
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading">Settings</h1>
        <p className="text-muted-foreground">Manage your application data and preferences.</p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Your data is stored in the cloud. You can export it for backup or import it to overwrite your current data.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <Button onClick={handleExport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export My Data
            </Button>
            <Button onClick={handleImportClick} variant="outline">
              <UploadCloud className="mr-2 h-4 w-4" />
              Import Data
            </Button>
            <input
              type="file"
              ref={importInputRef}
              className="hidden"
              accept="application/json"
              onChange={handleFileChange}
            />
          </CardContent>
        </Card>

        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                    This is a permanent action. Once you delete your data, it cannot be recovered unless you have an exported backup.
                </CardDescription>
            </CardHeader>
            <CardFooter>
                 <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete All My Data
                </Button>
            </CardFooter>
        </Card>
      </div>

      <Modal
        title="Confirm Data Deletion"
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Are you absolutely sure you want to delete all of your data? This action is irreversible.
            </p>
            <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
                    Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteData}>
                    Yes, Delete Everything
                </Button>
            </div>
        </div>
      </Modal>
    </>
  );
};

export default Settings;