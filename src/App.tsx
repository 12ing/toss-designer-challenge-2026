import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useSearchParams,
} from 'react-router-dom'
import {
  AttendeeRespondApp,
  OrganizerSessionApp,
  PrototypeApp,
} from '@/PrototypeApp'
import { RuleLabScreen } from '@/lab/RuleLabScreen'
import { isUserTestMode } from '@/review/review-mode'
import { ReviewCompletion } from '@/review/screens/ReviewCompletion'
import { ReviewLanding } from '@/screens/ReviewLanding'

function RuleLabRoute() {
  const [searchParams] = useSearchParams()
  if (isUserTestMode(searchParams)) {
    return <Navigate to="/?usertest=1" replace />
  }
  return <RuleLabScreen />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ReviewLanding />} />
        <Route path="/lab" element={<RuleLabRoute />} />
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
