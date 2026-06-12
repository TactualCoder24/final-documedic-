import React, { useEffect, useState, useCallback } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { ClinicCommerceSettings } from '../../types';
import { getClinicCommerceSettings, upsertClinicCommerceSettings } from '../../services/dataSupabase';
import { useToast } from '../../hooks/useToast';
import { Boxes, Pill, TestTube2 } from '../icons/Icons';

interface CommerceSettingsTabProps {
  clinicId: string;
}

const DEFAULTS: Omit<ClinicCommerceSettings, 'clinicId' | 'updatedAt'> = {
  commerceEnabled: false,
  pharmacyEnabled: false,
  labEnabled: false,
  pharmacyMarkupPercent: 0,
  labMarkupPercent: 0,
  deliveryFee: 0,
};

const ToggleRow: React.FC<{ label: string; description: string; checked: boolean; onChange: (v: boolean) => void; icon?: React.ReactNode }> = ({ label, description, checked, onChange, icon }) => (
  <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border/40">
    <div className="flex items-start gap-3">
      {icon && <div className="mt-0.5 text-emerald-500">{icon}</div>}
      <div>
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`text-[10px] font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full flex-shrink-0 ${checked ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-secondary text-muted-foreground'}`}
    >
      {checked ? 'Enabled' : 'Disabled'}
    </button>
  </div>
);

const CommerceSettingsTab: React.FC<CommerceSettingsTabProps> = ({ clinicId }) => {
  const { success, error: toastError } = useToast();
  const [settings, setSettings] = useState<Omit<ClinicCommerceSettings, 'clinicId' | 'updatedAt'>>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClinicCommerceSettings(clinicId);
      if (data) {
        setSettings({
          commerceEnabled: data.commerceEnabled,
          pharmacyEnabled: data.pharmacyEnabled,
          labEnabled: data.labEnabled,
          pharmacyMarkupPercent: data.pharmacyMarkupPercent,
          labMarkupPercent: data.labMarkupPercent,
          deliveryFee: data.deliveryFee,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertClinicCommerceSettings(clinicId, settings);
      success('Commerce settings saved');
    } catch (e) {
      console.error(e);
      toastError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center p-6 text-muted-foreground">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-card border border-border/50 flex items-start gap-3">
        <Boxes className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Configure pharmacy and lab partner integrations, markup, and delivery fees. Turn off "Clinic Commerce" entirely if your clinic stays consult-only.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm space-y-3">
        <ToggleRow
          label="Clinic Commerce"
          description="Master switch for pharmacy and lab fulfillment features across the clinic."
          checked={settings.commerceEnabled}
          onChange={v => setSettings(s => ({ ...s, commerceEnabled: v }))}
          icon={<Boxes className="h-4 w-4" />}
        />
        <ToggleRow
          label="Pharmacy Fulfillment"
          description="Enable medicine dispensing and home delivery from your pharmacy inventory."
          checked={settings.pharmacyEnabled}
          onChange={v => setSettings(s => ({ ...s, pharmacyEnabled: v }))}
          icon={<Pill className="h-4 w-4" />}
        />
        <ToggleRow
          label="Lab Sample Collection"
          description="Enable lab order routing and home sample collection."
          checked={settings.labEnabled}
          onChange={v => setSettings(s => ({ ...s, labEnabled: v }))}
          icon={<TestTube2 className="h-4 w-4" />}
        />
      </div>

      <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
        <h3 className="font-bold font-heading mb-3 text-sm">Markup &amp; Delivery</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Pharmacy markup (%)</label>
            <Input type="number" min="0" step="0.1" value={settings.pharmacyMarkupPercent} onChange={e => setSettings(s => ({ ...s, pharmacyMarkupPercent: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Lab markup (%)</label>
            <Input type="number" min="0" step="0.1" value={settings.labMarkupPercent} onChange={e => setSettings(s => ({ ...s, labMarkupPercent: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Delivery fee (₹)</label>
            <Input type="number" min="0" step="0.01" value={settings.deliveryFee} onChange={e => setSettings(s => ({ ...s, deliveryFee: parseFloat(e.target.value) || 0 }))} />
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving}>Save Commerce Settings</Button>
    </div>
  );
};

export default CommerceSettingsTab;
