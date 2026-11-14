import { useMemo } from 'react'
import { crewById } from '../data/crew'
import { EXERCISE, RADIATION } from '../data/thresholds'
import type { Assessment } from '../engine/assess'
import { go } from '../state/route'
import { useAllAssessments, useEnvStatus, useReadings, type EnvStatus } from '../state/selectors'
import { useApp } from '../state/store'
import type { ZoneId } from '../engine/types'
import { BodyMap, type ZoneView } from './BodyMap'
import { CrewRail } from './CrewRail'
import { linkText } from './EarthLink'
import { ScorePanel } from './ScorePanel'

/** A few words per zone for the call-outs around the body. */
export function zoneViews(a: Assessment, envStatus: EnvStatus, exerciseToday: number): Record<ZoneId, ZoneView> {
  const m = a.metrics
  const fixed = (value: number | undefined, decimals = 0) => (value === undefined ? '–' : value.toFixed(decimals))
  return {
    brain: {
      level: a.organs.brain.level,
      value: m.consciousness && m.consciousness !== 'A' ? 'Not fully alert' : `Slept ${fixed(m.sleepH, 1)} h`,
    },
    eyes: { level: a.organs.eyes.level, value: a.organs.eyes.level === 'ok' ? 'No change' : 'Change noted' },
    heart: { level: a.organs.heart.level, value: `${fixed(m.hr)} bpm, ${fixed(m.sbp)}/${fixed(m.dbp)}` },
    lungs: { level: a.organs.lungs.level, value: `${fixed(m.rr)}/min, SpO2 ${fixed(m.spo2)}%` },
    blood: { level: a.organs.blood.level, value: `Glucose ${fixed(m.glucose)} mg/dL` },
    bones: { level: a.organs.bones.level, value: `${exerciseToday} of ${EXERCISE.planMin} min` },
    skin: { level: a.organs.skin.level, value: `${fixed(m.temp, 1)} °C` },
    air: { level: envStatus.air.level, value: `CO2 ${envStatus.env.co2HourMean.toFixed(1)} mmHg` },
    radiation: {
      level: envStatus.radiation.level,
      value: `${Math.round(envStatus.careerMsv)} of ${RADIATION.careerLimit} mSv`,
    },
  }
}

export function Dashboard() {
  const selectedId = useApp((s) => s.selectedCrewId)
  const exerciseToday = useApp((s) => s.exerciseToday[selectedId] ?? 0)
  const member = crewById(selectedId)
  const assessments = useAllAssessments()
  const assessment = assessments[selectedId]
  const readings = useReadings(selectedId)
  const envStatus = useEnvStatus(selectedId)
  const zones = useMemo(() => zoneViews(assessment, envStatus, exerciseToday), [assessment, envStatus, exerciseToday])
  const link = linkText(envStatus.env)

  return (
    <div className="grid h-full min-h-0 grid-cols-[clamp(216px,17vw,270px)_minmax(0,1fr)_clamp(300px,24vw,380px)] gap-5 p-4">
      <CrewRail assessments={assessments} />

      <section className="relative flex min-h-0 flex-col overflow-hidden" aria-label={`Body map of ${member.name}`}>
        <span className="label pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-full border border-line bg-void px-2.5 py-0.5">
          Simulated live feed
        </span>
        <div className="min-h-0 flex-1 px-2 pt-1">
          <BodyMap
            zones={zones}
            onOpen={(id) => go(`organ/${id}`)}
            heartRate={assessment.metrics.hr ?? 70}
            breathRate={assessment.metrics.rr ?? 15}
            scanKey={selectedId}
          />
        </div>
        <dl className="grid grid-cols-3 border-t border-line text-[0.9rem]">
          <div className="px-4 py-2">
            <dt className="label">If you call {envStatus.env.linkTarget ?? 'Earth'}</dt>
            <dd className="font-medium">{link.reply}</dd>
          </div>
          <div className="px-4 py-2">
            <dt className="label">Evacuation</dt>
            <dd className={`font-medium ${envStatus.env.evacPossible ? '' : 'text-caution'}`}>{envStatus.env.evacuation}</dd>
          </div>
          <div className="px-4 py-2">
            <dt className="label">Gravity and dose rate</dt>
            <dd className="font-medium">
              {envStatus.env.gravity}, {envStatus.env.doseRateMsvDay} mSv/day{envStatus.env.doseIsReference ? ' (reference value)' : ''}
            </dd>
          </div>
        </dl>
      </section>

      <ScorePanel member={member} assessment={assessment} readings={readings} />
    </div>
  )
}
