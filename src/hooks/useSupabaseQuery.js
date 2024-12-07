import { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function useSupabaseQuery(query, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { dependencies = [], transform, onError } = options;

  async function executeQuery() {
    try {
      setLoading(true);
      const { data: result, error: queryError } = await query();

      if (queryError) {
        const errorMessage = await handleSupabaseError(queryError);
        throw new Error(errorMessage);
      }

      const transformedData = transform ? transform(result) : result;
      setData(transformedData);
      setError(null);
    } catch (err) {
      setError(err);
      const message = err.message || 'An error occurred while fetching data';
      if (onError) {
        onError(err);
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    executeQuery();
  }, dependencies);

  return { data, loading, error, refetch: executeQuery };
}