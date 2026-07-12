import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import {
  AttendeeRespondApp,
  OrganizerSessionApp,
  PrototypeApp,
} from '@/PrototypeApp'
import { RuleLabScreen } from '@/lab/RuleLabScreen'
import { ReviewCompletion } from '@/review/screens/ReviewCompletion'
import { ReviewLanding } from '@/screens/ReviewLanding'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ReviewLanding />} />
        <Route path="/lab" element={<RuleLabScreen />} />
        <Route
          path="/review/session/:sessionId/complete"
          element={<ReviewCompletion />}
        />
        <Route path="/prototype" element={<PrototypeApp />} />
        <Route
          path="/prototype/session/:sessionId/organizer"
          element={<OrganizerSessionApp />}
        />
        <Route
          path="/prototype/session/:sessionId/respond/:requestId"
          element={<AttendeeRespondApp />}
        />
        <Route
          path="/prototype/respond/:requestId"
          element={<AttendeeRespondApp />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
