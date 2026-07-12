import { useEffect, useMemo, useRef, useState } from 'react'
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

function isResultInViewport(el: HTMLElement | null) {
  if (!el) return true
  const rect = el.getBoundingClientRect()
  return rect.top < window.innerHeight * 0.85 && rect.bottom > 72
}

export function RuleLabScreen() {
  const navigate = useNavigate()
  const resultRef = useRef<HTMLDivElement>(null)
  const [showResultJump, setShowResultJump] = useState(false)
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

  useEffect(() => {
    trackReviewEvent('rule_lab_opened')
  }, [])

  useEffect(() => {
    const update = () => {
      setShowResultJump(!isResultInViewport(resultRef.current))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [recommendation])

  const setAttendanceType = (id: string, type: AttendanceType) => {
    setActivePreset('coordination')
    setResponseOverrides({})
    setAttendanceTypes((prev) => ({ ...prev, [id]: type }))
    trackReviewEvent('lab_condition_changed', { participantId: id, type })
    // Defer jump hint until layout settles — never auto-scroll.
    window.requestAnimationFrame(() => {
      setShowResultJump(!isResultInViewport(resultRef.current))
    })
  }

  const applyPreset = (id: LabPresetId) => {
    const preset = getLabPreset(id)
    setActivePreset(id)
    setAttendanceTypes(cloneAttendance(preset.attendanceTypes))
    setResponseOverrides({})
    trackReviewEvent('lab_condition_changed', { preset: id })
    window.requestAnimationFrame(() => {
      setShowResultJump(!isResultInViewport(resultRef.current))
    })
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

  const jumpToResult = () => {
    resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setShowResultJump(false)
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-meeting-bg">
      <div className="@container/lab mx-auto w-full max-w-[1200px] px-4 py-8 min-[640px]:px-6 min-[640px]:py-10">
        <div className="mb-8 flex min-w-0 flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-[640px]">
            <p className="mb-2 text-[13px] font-medium text-meeting-text-tertiary">
              결정 규칙 실험
            </p>
            <h1
              className="mb-2 text-[clamp(1.35rem,3vw,1.625rem)] font-bold leading-9 text-meeting-text"
              style={{ wordBreak: 'keep-all' }}
            >
              조건을 바꾸면 같은 기준으로 다시 계산해요
            </h1>
            <p
              className="text-[15px] leading-[23px] text-meeting-text-secondary"
              style={{ wordBreak: 'keep-all' }}
            >
              필수·선택 조건에 따라 추천 시간과 필요한 다음 행동이 어떻게
              달라지는지 확인해보세요.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center text-[14px] font-medium text-meeting-text-secondary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
          >
            소개로 돌아가기
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 min-w-0 @[1100px]/lab:grid-cols-[minmax(0,420px)_minmax(0,1fr)] @[1100px]/lab:gap-12">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap gap-2" aria-label="대표 조건 프리셋">
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
              className="mb-4 overflow-hidden rounded-3xl border border-meeting-divider bg-meeting-surface"
              aria-label="참석자 조건"
            >
              <ul className="divide-y divide-meeting-divider px-4">
                {viewModel.rows.map((row) => (
                  <li key={row.id} className="min-w-0">
                    <ParticipantConditionRow
                      row={row}
                      compact
                      onAttendanceTypeChange={setAttendanceType}
                    />
                  </li>
                ))}
              </ul>
            </section>

            <div className="mb-4 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="whitespace-nowrap"
                onClick={() => applyPreset('coordination')}
              >
                초기화
              </Button>
            </div>

            <div className="mb-2 @[1100px]/lab:mb-0">
              <RuleOrderExplanation />
            </div>
          </div>

          <div ref={resultRef} className="min-w-0">
            <LabResultPreview
              recommendation={recommendation}
              onOpenProductFlow={openProductFlow}
              onApproveSimulation={() => simulateResponse('approved')}
              onDeclineSimulation={() => simulateResponse('declined')}
            />
          </div>
        </div>
      </div>

      {showResultJump ? (
        <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 min-[1100px]:hidden">
          <button
            type="button"
            className="inline-flex min-h-11 items-center rounded-full border border-meeting-divider bg-meeting-surface px-4 text-[14px] font-semibold text-meeting-text shadow-[0_8px_24px_rgba(0,27,55,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
            onClick={jumpToResult}
          >
            계산 결과 보기
          </button>
        </div>
      ) : null}
    </div>
  )
}
