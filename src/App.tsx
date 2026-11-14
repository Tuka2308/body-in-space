import { useEffect } from 'react'
import { go, useRoute } from './state/route'
import { resetDemo, useApp } from './state/store'
import { Dashboard } from './ui/Dashboard'
import { Komek } from './ui/Komek'
import { Lab } from './ui/Lab'
import { Measure } from './ui/Measure'
import { OrganCard, isZone } from './ui/OrganCard'
import { NavRail } from './ui/NavRail'
import { Sos } from './ui/sos/Sos'
import { Tests } from './ui/Tests'
import { TopBar } from './ui/TopBar'

export function App() {
  const [view = '', param] = useRoute()

  // Mission clock and wearable feed: one tick per second.
  useEffect(() => {
    const { tick } = useApp.getState()
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [])

  // Demo keys. D: crew member deteriorates. T: demo time ×60. Shift+R: reset everything.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const key = event.key.toLowerCase()
      if (key === 'd') {
        useApp.getState().startScenario()
        go('')
      } else if (key === 't') {
        const state = useApp.getState()
        state.setTimeScale(state.timeScale === 1 ? 60 : 1)
      } else if (key === 'r' && event.shiftKey) {
        resetDemo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex h-full flex-col">
      {view === 'sos' ? (
        <div className="min-h-0 flex-1">
          <Sos />
        </div>
      ) : (
        <>
          <TopBar />
          <div className="flex min-h-0 flex-1">
            <NavRail />
            <main className="min-w-0 flex-1">
              {view === 'organ' && isZone(param) ? (
                <OrganCard key={param} zone={param} />
              ) : view === 'lab' ? (
                <Lab />
              ) : view === 'tests' ? (
                <Tests key={param ?? 'menu'} test={param} />
              ) : view === 'measure' ? (
                <Measure key={param ?? 'all'} focus={param} />
              ) : (
                <Dashboard />
              )}
            </main>
          </div>
        </>
      )}
      <Komek />
      <footer className="flex h-[34px] shrink-0 items-center justify-between gap-4 border-t border-line-soft bg-hull px-4 text-[0.8rem] text-dim" style={{ fontStretch: '88%' }}>
        <span className="font-semibold text-star">Educational prototype. Not a medical device.</span>
        <span className="hidden truncate lg:block">
          Vital signs are simulated. Thresholds: RCP NEWS2, NASA-STD-3001, NASA HRP. Lab data: NASA OSDR OSD-569, OSD-575, OSD-656. Space weather: NASA DONKI.
        </span>
      </footer>
    </div>
  )
}
