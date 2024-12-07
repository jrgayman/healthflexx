import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function TakeButton({ recordId, onTaken }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTake = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/medications/take/${recordId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to record medication');
      }

      const data = await response.json();
      onTaken?.(data.record);
      toast.success('Medication recorded');
    } catch (error) {
      console.error('Error recording medication:', error);
      toast.error('Failed to record medication');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      onClick={handleTake}
      disabled={isSubmitting}
      className="text-primary hover:text-primary-dark text-lg font-bold leading-none"
      title="Take medication"
    >
      +
    </button>
  );
}