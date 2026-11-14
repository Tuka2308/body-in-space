import { useEffect } from 'react'
import { ENVIRONMENTS } from '../data/environments'
import { SEC, durationText } from '../state/time'
import { Mark } from './icons'

/** Opening screen: the one fact the whole product is built around. */
export function Intro({ onStart }: { onStart: () => void }) {
  const oneWay = durationText(ENVIRONMENTS.transit.linkOneWayS * SEC)
  const replyMin = Math.round((ENVIRONMENTS.transit.linkOneWayS * 2) / 60)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onStart()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onStart])

  return (
    <div className="flex h-full flex-col bg-void px-[6vw] py-[5vh]">
      <header className="flex items-center gap-3">
        <Mark size={40} />
        <span className="heading text-[1.5rem]">Body in Space</span>
      </header>

      <main className="flex flex-1 flex-col justify-center gap-[4vh]">
        {/* A question leaves the ship; the answer cannot be back before two signal trips. */}
        <svg viewBox="0 0 1000 120" className="w-full max-w-[1100px]" role="img" aria-label={`A signal takes ${oneWay} from the spacecraft to Earth and the same time back.`}>
          <path d="M70 60H930" stroke="var(--color-line)" strokeWidth="3" strokeDasharray="3 12" strokeLinecap="round" />
          <path d="M22 60l34-24v48Z" fill="var(--color-star)" />
          <circle cx="958" cy="60" r="30" fill="var(--color-link-deep)" stroke="var(--color-link)" strokeWidth="3" />
          <path d="M936 54c9 7 15-6 24 0s11 12 22 5" fill="none" stroke="var(--color-link)" strokeWidth="2.5" strokeLinecap="round" />
          <circle r="9" cy="60" fill="var(--color-link)">
            <animate attributeName="cx" values="70;920;70" keyTimes="0;0.5;1" dur="7s" repeatCount="indefinite" />
          </circle>
          <text x="70" y="108" fontSize="20" fill="var(--color-dim)" style={{ fontStretch: '84%' }}>
            Spacecraft, day 90
          </text>
          <text x="500" y="34" textAnchor="middle" fontSize="22" fill="var(--color-link)" style={{ fontStretch: '84%', fontWeight: 600 }}>
            {oneWay} each way
          </text>
          <text x="925" y="108" textAnchor="end" fontSize="20" fill="var(--color-dim)" style={{ fontStretch: '84%' }}>
            Earth
          </text>
        </svg>

        <div>
          <h1 className="heading max-w-[18ch] text-[clamp(2.6rem,6.2vw,5.6rem)]">Halfway to Mars. Earth’s answer is {replyMin} minutes away.</h1>
          <p className="mt-[2vh] max-w-[46ch] text-[clamp(1.1rem,1.7vw,1.5rem)] text-dim">
            If a crewmate collapses now, the crew is on its own. This tablet is the onboard doctor for that gap: it shows what to measure, what it means and what to do.
          </p>
        </div>

        <button className="tap tap-primary h-[76px] self-start px-10 text-[1.35rem]" onClick={onStart} autoFocus>
          Open the crew dashboard
        </button>
      </main>

      <footer className="flex flex-wrap justify-between gap-x-8 gap-y-1 text-[0.85rem] text-dim" style={{ fontStretch: '88%' }}>
        <span className="font-semibold text-star">Educational prototype. Not a medical device.</span>
        <span>Vital signs are simulated. Data: NASA HRP, NASA-STD-3001, NASA OSDR OSD-569 and OSD-575, NASA DONKI.</span>
      </footer>
    </div>
  )
}
