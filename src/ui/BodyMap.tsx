import type { CSSProperties, KeyboardEvent, ReactNode } from 'react'
import type { Level, ZoneId } from '../engine/types'
import { LEVEL_UI, StatusIcon } from './level'

export interface ZoneView {
  level: Level
  /** Current reading in a few words. */
  value: string
}

interface Props {
  zones: Record<ZoneId, ZoneView>
  onOpen: (id: ZoneId) => void
  /** Beats and breaths per minute drive the heart and lung motion. */
  heartRate: number
  breathRate: number
}

const W = 736
const H = 730
const CHIP_W = 200
const CHIP_H = 72
/** The figure is drawn around x = 380 and shifted to the centre of the view box. */
const SHIFT = W / 2 - 380

interface ChipDef {
  id: ZoneId
  title: string
  side: 'left' | 'right'
  y: number
  /** Point on the body the leader line reaches. Omitted for the environment rings. */
  anchor?: [number, number]
}

const CHIPS: ChipDef[] = [
  { id: 'brain', title: 'Brain & mind', side: 'left', y: 30, anchor: [356, 80] },
  { id: 'lungs', title: 'Lungs', side: 'left', y: 172, anchor: [344, 238] },
  { id: 'blood', title: 'Blood', side: 'left', y: 300, anchor: [268, 338] },
  { id: 'bones', title: 'Bones & muscles', side: 'left', y: 470, anchor: [322, 512] },
  { id: 'air', title: 'Cabin air', side: 'left', y: 650 },
  { id: 'eyes', title: 'Eyes', side: 'right', y: 62, anchor: [404, 108] },
  { id: 'heart', title: 'Heart', side: 'right', y: 196, anchor: [416, 236] },
  { id: 'skin', title: 'Temperature', side: 'right', y: 326, anchor: [490, 316] },
  { id: 'radiation', title: 'Radiation', side: 'right', y: 650 },
]

// Right half of the silhouette (viewer's right); the left half is its mirror image.
const HALF_OUTLINE =
  'M392 138 C392 146 393 152 394 157 C398 163 406 166 416 169 C430 173 444 176 454 181 C470 187 483 200 487 220 C490 250 492 280 494 306 C500 332 506 370 508 404 C512 418 514 440 509 456 C505 468 494 474 488 466 C484 458 486 440 484 424 C481 384 474 352 470 322 C466 296 462 268 458 246 C457 274 451 302 447 330 C444 350 446 366 452 384 C458 400 462 424 462 448 C462 490 456 530 450 562 C454 590 454 620 448 650 C446 664 444 676 444 684 C446 694 454 700 456 706 C456 712 440 712 420 712 L408 712 C404 704 406 692 407 684 C408 650 410 610 406 580 C404 570 404 560 405 552 C404 520 398 486 390 462 C388 456 384 452 380 452'
const HALF_FILL = `M380 138 ${HALF_OUTLINE.slice(1)} Z`
// Half of the head, from the crown down the jaw to the chin.
const HALF_HEAD = 'M380 48 C403 48 417 66 417 92 C417 104 414 114 409 123 C403 134 393 143 380 144'
// Quiet anatomical hints: collarbone, chest, ribs, hip line, knee.
const HALF_DETAIL =
  'M386 173 C402 168 424 171 444 180 M380 204 C398 214 428 214 448 232 M388 296 C408 300 432 292 446 270 M390 322 C408 324 430 316 444 300 M380 432 C402 428 436 410 454 384 M414 556 C422 548 436 548 444 556'

const zoneStyle = (level: Level): CSSProperties => ({ '--z': LEVEL_UI[level].color }) as CSSProperties

function Zone({
  id,
  level,
  label,
  onOpen,
  children,
  hit,
}: {
  id: ZoneId
  level: Level
  label: string
  onOpen: (id: ZoneId) => void
  children: ReactNode
  hit: ReactNode
}) {
  return (
    <g
      className={`zone zone-${level}`}
      style={zoneStyle(level)}
      role="button"
      tabIndex={-1}
      aria-label={label}
      onClick={() => onOpen(id)}
    >
      {children}
      <g className="zone-hit">{hit}</g>
    </g>
  )
}

export function BodyMap({ zones, onOpen, heartRate, breathRate }: Props) {
  // Quantise so the animation speed does not twitch with every live sample.
  const beat = 60 / Math.max(30, Math.round(heartRate / 4) * 4)
  const breath = 60 / Math.max(6, Math.round(breathRate / 2) * 2)
  const label = (id: ZoneId, title: string) => `${title}: ${LEVEL_UI[zones[id].level].word}. ${zones[id].value}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="group" aria-label="Body map. Choose a body zone to see how to measure it, why it matters and what to do.">
      <defs>
        <linearGradient id="body-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#18233a" />
          <stop offset="1" stopColor="#0d1424" />
        </linearGradient>
        <radialGradient id="body-core" cx="0.5" cy="0.35" r="0.6">
          <stop offset="0" stopColor="#8ea8ff" stopOpacity="0.1" />
          <stop offset="1" stopColor="#8ea8ff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* The crew member inside their environment: cabin air (solid ring) and radiation (dashed ring). */}
      <circle className="env-ring" style={zoneStyle(zones.air.level)} cx={W / 2} cy="372" r="318" />
      <circle className="env-ring env-ring-dashed" style={zoneStyle(zones.radiation.level)} cx={W / 2} cy="372" r="344" />

      <g transform={`translate(${SHIFT} 0)`}>
      {/* Silhouette. The outline itself is the skin and temperature zone. */}
      <g>
        <path d={HALF_FILL} fill="url(#body-fill)" />
        <path d={HALF_FILL} fill="url(#body-fill)" transform="translate(760 0) scale(-1 1)" />
        <path d={`${HALF_HEAD} Z`} fill="url(#body-fill)" />
        <path d={`${HALF_HEAD} Z`} fill="url(#body-fill)" transform="translate(760 0) scale(-1 1)" />
        <ellipse cx="380" cy="300" rx="70" ry="150" fill="url(#body-core)" />
        <g className="body-detail">
          <path d={HALF_DETAIL} />
          <path d={HALF_DETAIL} transform="translate(760 0) scale(-1 1)" />
          <path d="M380 176V300" />
          <circle cx="380" cy="388" r="2" />
        </g>
      </g>
      <g
        className={`zone zone-outline zone-${zones.skin.level}`}
        style={zoneStyle(zones.skin.level)}
        role="button"
        tabIndex={-1}
        aria-label={label('skin', 'Temperature')}
        onClick={() => onOpen('skin')}
      >
        <path className="draw" pathLength={1} d={HALF_OUTLINE} />
        <path className="draw" pathLength={1} d={HALF_OUTLINE} transform="translate(760 0) scale(-1 1)" />
        <path className="draw" pathLength={1} d={HALF_HEAD} />
        <path className="draw" pathLength={1} d={HALF_HEAD} transform="translate(760 0) scale(-1 1)" />
      </g>

      <Zone id="brain" level={zones.brain.level} label={label('brain', 'Brain and mind')} onOpen={onOpen} hit={<ellipse cx="380" cy="76" rx="40" ry="30" />}>
        <path d="M380 58c-9-6-24-2-26 9-6 4-5 14 2 17 2 9 15 12 24 7 9 5 22 2 24-7 7-3 8-13 2-17-2-11-17-15-26-9Z" />
        <path className="zone-detail" d="M380 58v33M366 66c3 3 3 8 0 11M394 66c-3 3-3 8 0 11" />
      </Zone>

      <Zone id="eyes" level={zones.eyes.level} label={label('eyes', 'Eyes')} onOpen={onOpen} hit={<rect x="350" y="95" width="60" height="26" rx="13" />}>
        <path d="M356 108c5-7 15-7 20 0-5 7-15 7-20 0ZM384 108c5-7 15-7 20 0-5 7-15 7-20 0Z" />
        <circle className="zone-dot" cx="366" cy="108" r="2.4" />
        <circle className="zone-dot" cx="394" cy="108" r="2.4" />
      </Zone>

      <Zone id="lungs" level={zones.lungs.level} label={label('lungs', 'Lungs')} onOpen={onOpen} hit={<rect x="330" y="184" width="100" height="104" rx="30" />}>
        <g className="breathe" style={{ animationDuration: `${breath}s` }}>
          <path d="M372 192c-16 0-30 24-32 58-1 20 6 30 18 28 10-2 14-10 14-22Z" />
          <path d="M388 192c16 0 30 24 32 58 1 20-6 30-18 28-10-2-14-10-14-22Z" />
          <path className="zone-detail" d="M380 178v26M372 204l-10 10M388 204l10 10" />
        </g>
      </Zone>

      <Zone id="heart" level={zones.heart.level} label={label('heart', 'Heart')} onOpen={onOpen} hit={<circle cx="397" cy="238" r="30" />}>
        <g className="beat" style={{ animationDuration: `${beat}s` }}>
          <path
            className="zone-solid"
            d="M397 258c-22-15-25-33-14-39 8-4 13 1 14 6 1-5 6-10 14-6 11 6 8 24-14 39Z"
          />
        </g>
      </Zone>

      <Zone id="blood" level={zones.blood.level} label={label('blood', 'Blood')} onOpen={onOpen} hit={<circle cx="280" cy="338" r="30" />}>
        <path className="zone-detail" d="M291 246 280 322M278 356l-9 68" />
        <path d="M280 318c-8 12-13 19-13 26a13 13 0 0 0 26 0c0-7-5-14-13-26Z" />
      </Zone>

      <Zone
        id="bones"
        level={zones.bones.level}
        label={label('bones', 'Bones and muscles')}
        onOpen={onOpen}
        hit={
          <>
            <rect x="300" y="462" width="64" height="208" rx="26" />
            <rect x="396" y="462" width="64" height="208" rx="26" />
          </>
        }
      >
        {[427, 333].map((x) => (
          <g key={x}>
            <path className="zone-bone" d={`M${x} 480V546M${x} 578V652`} />
            <circle cx={x} cy="476" r="6.5" />
            <circle cx={x} cy="562" r="8" />
            <circle cx={x} cy="656" r="5.5" />
          </g>
        ))}
      </Zone>

      </g>

      {/* Call-outs: the large touch targets. */}
      {CHIPS.map((chip) => {
        const zone = zones[chip.id]
        const x = chip.side === 'left' ? 4 : W - 4 - CHIP_W
        const anchor = chip.anchor ? [chip.anchor[0] + SHIFT, chip.anchor[1]] : null
        const edgeX = chip.side === 'left' ? x + CHIP_W : x
        const midY = chip.y + CHIP_H / 2
        const color = LEVEL_UI[zone.level].color
        const onKey = (event: KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onOpen(chip.id)
          }
        }
        return (
          <g key={chip.id}>
            {anchor && (
              <>
                <path d={`M${edgeX} ${midY} L${anchor[0]} ${anchor[1]}`} stroke={color} strokeWidth="1.2" opacity="0.45" />
                <circle cx={anchor[0]} cy={anchor[1]} r="3" fill={color} />
              </>
            )}
            <g
              className={`chip chip-${zone.level}`}
              style={zoneStyle(zone.level)}
              role="button"
              tabIndex={0}
              aria-label={`${chip.title}: ${LEVEL_UI[zone.level].word}. ${zone.value}. Open details.`}
              onClick={() => onOpen(chip.id)}
              onKeyDown={onKey}
            >
              <rect x={x} y={chip.y} width={CHIP_W} height={CHIP_H} rx="16" strokeDasharray={chip.id === 'radiation' ? '6 5' : undefined} />
              <StatusIcon level={zone.level} size={28} x={x + 13} y={chip.y + 22} />
              <text className="chip-title" x={x + 52} y={chip.y + 31}>
                {chip.title}
              </text>
              <text className="chip-value" x={x + 52} y={chip.y + 54}>
                {zone.value}
              </text>
            </g>
          </g>
        )
      })}
    </svg>
  )
}
