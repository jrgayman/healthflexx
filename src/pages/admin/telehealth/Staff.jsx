import React, { Suspense } from 'react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import StaffContent from './StaffContent';

export default function Staff() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading telehealth staff..." />}>
      <StaffContent />
    </Suspense>
  );
}