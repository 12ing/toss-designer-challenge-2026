import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PrototypeApp } from '@/PrototypeApp'
import { ReviewLanding } from '@/screens/ReviewLanding'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ReviewLanding />} />
        <Route path="/prototype" element={<PrototypeApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
