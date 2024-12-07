import { useState } from 'react';
import toast from 'react-hot-toast';

export default function useTrackingForm(record, onClose, onUpdate) {
  const [status, setStatus] = useState(record?.status || 'pending');
  const [notes, setNotes] = useState(record?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/medications/track/${record.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, notes })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const data = await response.json();
      toast.success('Status updated successfully');
      onUpdate?.(data.record);
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    status,
    notes,
    isSubmitting,
    setStatus,
    setNotes,
    handleSubmit
  };
}