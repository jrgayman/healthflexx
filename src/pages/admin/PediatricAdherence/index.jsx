import React, { Suspense } from 'react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import PediatricAdherenceContent from './PediatricAdherenceContent';

export default function PediatricAdherence() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading adherence tracking..." />}>
      <PediatricAdherenceContent />
    </Suspense>
  );
}