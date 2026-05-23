const stage1Icon = new URL('../../pictures/marker_stage1_ponton.svg',   import.meta.url).href
const stage2Icon = new URL('../../pictures/marker_stage2_the_lake.svg', import.meta.url).href
const stage3Icon = new URL('../../pictures/marker_stage3_the_club.svg', import.meta.url).href
const stage4Icon = new URL('../../pictures/marker_stage4_hangar.svg',   import.meta.url).href

const facilityIcons = {
  bar:           new URL('../../pictures/marker_bar.svg',           import.meta.url).href,
  entrance_exit: new URL('../../pictures/marker_entrance_exit.svg', import.meta.url).href,
  first_aid:     new URL('../../pictures/marker_first_aid.svg',     import.meta.url).href,
  food:          new URL('../../pictures/marker_food.svg',          import.meta.url).href,
  ice_cream:     new URL('../../pictures/marker_ice_cream.svg',     import.meta.url).href,
  locker:        new URL('../../pictures/marker_locker.svg',        import.meta.url).href,
  merchandise:   new URL('../../pictures/marker_merchandise.svg',   import.meta.url).href,
  toilet:        new URL('../../pictures/marker_toilet.svg',        import.meta.url).href,
}

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

export function getFacilityIcon(type) {
  return facilityIcons[type] ?? facilityIcons.bar
}
