```jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Staff from './Staff';
import Admin from './Admin';

export default function TelehealthRoutes() {
  return (
    <Routes>
      <Route path="/staff" element={<Staff />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
```