const stage1Icon = new URL('../../pictures/marker_stage1_ponton.svg', import.meta.url).href
const stage2Icon = new URL('../../pictures/marker_stage2_the_lake.svg', import.meta.url).href
const stage3Icon = new URL('../../pictures/marker_stage3_the_club.svg', import.meta.url).href
const stage4Icon = new URL('../../pictures/marker_stage4_hangar.svg', import.meta.url).href

function normalizeName(name) {
  return String(name || '').trim().toLowerCase()
}

export function getStageIconForName(name) {
  const key = normalizeName(name)

  if (key === 'poton' || key === 'ponton') return stage1Icon
  if (key === 'the lake') return stage2Icon
  if (key === 'the club') return stage3Icon
  if (key === 'hanggar' || key === 'hangar') return stage4Icon

  return stage1Icon
}

export function createLiveLocationSvg() {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r="14" fill="#2c9bff" fill-opacity="0.22"/>
      <circle cx="28" cy="28" r="7" fill="#2c9bff" stroke="#ffffff" stroke-width="3"/>
    </svg>
  `)}`
}
