import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DictionaryPage } from './pages/DictionaryPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/pali-sinhalese-dictionary/"
          element={<DictionaryPage slug="pali-sinhalese-dictionary" searchPlaceholder="Search Pali word... / පාලි වචනය සොයන්න..." />}
        />
        <Route
          path="/sinhala-dictionary/"
          element={<DictionaryPage slug="sinhala-dictionary" searchPlaceholder="Search Sinhala word... / වචනය සොයන්න..." />}
        />
        <Route path="/" element={<Navigate to="/sinhala-dictionary/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
