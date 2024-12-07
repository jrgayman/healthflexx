import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function NotificationPreferences({ patientId }) {
  const [preferences, setPreferences] = useState({
    notify_by_phone: false,
    notify_by_email: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, [patientId]);

  async function fetchPreferences() {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', patientId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  }

  async function handlePreferenceChange(field) {
    setSaving(true);
    try {
      const updates = {
        ...preferences,
        [field]: !preferences[field]
      };

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: patientId,
          ...updates
        });

      if (error) throw error;
      setPreferences(updates);
      toast.success('Preferences updated');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
      <div className="space-y-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={preferences.notify_by_phone}
            onChange={() => handlePreferenceChange('notify_by_phone')}
            disabled={saving}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="ml-2 text-sm text-gray-700">Notify by Phone</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={preferences.notify_by_email}
            onChange={() => handlePreferenceChange('notify_by_email')}
            disabled={saving}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="ml-2 text-sm text-gray-700">Notify by Email</span>
        </label>
      </div>
    </div>
  );
}