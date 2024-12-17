import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

export function useProviders() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  async function fetchProviders() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('healthcare_providers')
        .select('id, name')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
      setError(error.message);
      toast.error('Failed to load providers');
    } finally {
      setLoading(false);
    }
  }

  return {
    providers,
    loading,
    error,
    refreshProviders: fetchProviders
  };
}