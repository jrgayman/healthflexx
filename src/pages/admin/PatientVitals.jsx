import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ReadingFilters from '../../components/ReadingFilters';
import ReadingsGrid from '../../components/readings/ReadingsGrid';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function PatientVitals() {
  const { patient } = useOutletContext();
  const [readings, setReadings] = useState([]);
  const [readingTypes, setReadingTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readingTypeFilter, setReadingTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('month');

  useEffect(() => {
    if (patient?.id) {
      fetchReadingTypes();
    }
  }, [patient]);

  useEffect(() => {
    if (patient?.id) {
      fetchReadings();
    }
  }, [patient, readingTypeFilter, dateFilter]);

  async function fetchReadingTypes() {
    try {
      const { data, error } = await supabase
        .from('reading_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setReadingTypes(data || []);
    } catch (error) {
      console.error('Error fetching reading types:', error);
      toast.error('Failed to load reading types');
    }
  }

  async function fetchReadings() {
    try {
      let query = supabase
        .from('medical_readings')
        .select(`
          *,
          reading_types (
            id,
            name,
            code,
            unit,
            value_type,
            icon,
            normal_min,
            normal_max,
            critical_low,
            critical_high
          )
        `)
        .eq('user_id', patient.id)
        .order('reading_date', { ascending: false });

      if (readingTypeFilter) {
        query = query.eq('reading_type_id', readingTypeFilter);
      }

      // Apply date filter
      const now = new Date();
      let startDate = new Date();

      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        query = query.gte('reading_date', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setReadings(data || []);
    } catch (error) {
      console.error('Error fetching readings:', error);
      toast.error('Failed to load readings');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading readings..." />;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Medical Readings</h2>
      <ReadingFilters
        readingTypeFilter={readingTypeFilter}
        onReadingTypeChange={setReadingTypeFilter}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
        readingTypes={readingTypes}
      />
      <ReadingsGrid 
        readings={readings}
        readingTypes={readingTypes}
      />
    </div>
  );
}