import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ParticipantConditionRow } from '@/components/participant-setup/ParticipantConditionRow'
import { Button } from '@/components/ui/Button'
import { candidateSlots } from '@/features/meeting-decision/data/candidate-slots'
import { decisionParticipants } from '@/features/meeting-decision/data/participants'
import { recommendMeeting } from '@/features/meeting-decision/engine/decision-engine'
import type {
  AttendanceType,
  ResponseOverrides,
  TimeSlotId,
} from '@/features/meeting-decision/engine/decision-engine.types'
import { mapParticipantsToSetupViewModel } from '@/features/meeting-decision/view-model/participant-setup.mapper'
import { LabResultPreview } from '@/lab/LabResultPreview'
import { RuleOrderExplanation } from '@/lab/RuleOrderExplanation'
import {
  getLabPreset,
  labPresets,
  type LabPresetId,
} from '@/lab/rule-lab-presets'
import { trackReviewEvent } from '@/review/review-analytics'
import {
  organizerPath,
  startLabProductSession,
} from '@/review/review-session.factory'

function cloneAttendance(source: Record<string, AttendanceType>) {
  return { ...source }
}

export function RuleLabScreen() {
  const navigate = useNavigate()
  const [attendanceTypes, setAttendanceTypes] = useState(() =>
    cloneAttendance(getLabPreset('coordination').attendanceTypes),
  )
  const [responseOverrides, setResponseOverrides] = useState<ResponseOverrides>(
    {},
  )
  const [activePreset, setActivePreset] = useState<LabPresetId>('coordination')

  const viewModel = useMemo(
    () => mapParticipantsToSetupViewModel({ attendanceTypes }),
    [attendanceTypes],
  )

  const recommendation = useMemo(
    () =>
      recommendMeeting({
        participants: decisionParticipants,
        candidateSlots,
        attendanceTypes,
        responseOverrides,
      }),
    [attendanceTypes, responseOverrides],
  )

  const setAttendanceType = (id: string, type: AttendanceType) => {
    setActivePreset('coordination')
    setResponseOverrides({})
    setAttendanceTypes((prev) => ({ ...prev, [id]: type }))
    trackReviewEvent('lab_condition_changed', { participantId: id, type })
  }

  const applyPreset = (id: LabPresetId) => {
    const preset = getLabPreset(id)
    setActivePreset(id)
    setAttendanceTypes(cloneAttendance(preset.attendanceTypes))
    setResponseOverrides({})
    trackReviewEvent('lab_condition_changed', { preset: id })
  }

  const simulateResponse = (response: 'approved' | 'declined') => {
    if (recommendation.status !== 'NEED_CONFIRMATION') return
    const target = recommendation.confirmationTargets[0]
    if (!target) return
    const slotId = recommendation.evaluation.slot.id as TimeSlotId
    setResponseOverrides((prev) => ({
      ...prev,
      [target.participantId]: {
        ...(prev[target.participantId] ?? {}),
        [slotId]: response,
      },
    }))
    trackReviewEvent('lab_condition_changed', {
      simulation: response,
      target: target.participantId,
    })
  }

  const openProductFlow = () => {
    const session = startLabProductSession(attendanceTypes)
    navigate(organizerPath(session.id))
  }

  return (
    <div className="min-h-screen bg-meeting-bg">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-10 max-[719px]:px-4 max-[719px]:py-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-[13px] font-medium text-meeting-text-tertiary">
              규칙 실험
            </p>
            <h1
              className="mb-2 text-[26px] font-bold leading-9 text-meeting-text"
              style={{ wordBreak: 'keep-all' }}
            >
              조건을 바꾸면 같은 엔진이 다시 계산해요
            </h1>
            <p
              className="max-w-[520px] text-[15px] leading-[23px] text-meeting-text-secondary"
              style={{ wordBreak: 'keep-all' }}
            >
              필수·선택 조건을 바꾸면 같은 결정 엔진이 새로운 결과를 계산해요.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center text-[14px] font-medium text-meeting-text-secondary underline-offset-2 hover:underline"
          >
            리뷰 랜딩
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-10 min-[960px]:grid-cols-[minmax(360px,440px)_minmax(0,1fr)] min-[960px]:gap-12">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap gap-2">
              {labPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={[
                    'inline-flex min-h-10 items-center rounded-full border px-3 text-[13px] font-medium',
                    activePreset === preset.id
                      ? 'border-meeting-text bg-meeting-text text-white'
                      : 'border-meeting-divider bg-meeting-surface text-meeting-text-secondary hover:bg-meeting-panel',
                  ].join(' ')}
                  onClick={() => applyPreset(preset.id)}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <section
              className="mb-5 overflow-hidden rounded-3xl border border-meeting-divider bg-meeting-surface"
              aria-label="참석 조건"
            >
              <ul className="divide-y divide-meeting-divider px-4">
                {viewModel.rows.map((row) => (
                  <li key={row.id}>
                    <ParticipantConditionRow
                      row={row}
                      onAttendanceTypeChange={setAttendanceType}
                    />
                  </li>
                ))}
              </ul>
            </section>

            <div className="mb-5 flex gap-2">
              <Button
                variant="secondary"
                onClick={() => applyPreset('coordination')}
              >
                초기화
              </Button>
            </div>

            <RuleOrderExplanation />
          </div>

          <LabResultPreview
            recommendation={recommendation}
            onOpenProductFlow={openProductFlow}
            onApproveSimulation={() => simulateResponse('approved')}
            onDeclineSimulation={() => simulateResponse('declined')}
          />
        </div>
      </div>
    </div>
  )
}
