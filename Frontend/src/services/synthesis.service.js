/**
 * Synthesis Service - Intelligens profil kombináció
 * Kombinálja a színtípus és bőrtípus adatokat személyre szabott tanácsokká
 */

// Színtípus tulajdonságok
const SEASON_TRAITS = {
  spring: {
    warmth: 'warm',
    intensity: 'bright',
    depth: 'light',
    displayName: 'Tavasz',
    preferredFinish: 'fresh_glow',
    bronzerLove: 'medium',
    bestMetals: ['arany', 'pezsgő'],
    undertone: 'meleg, barackos-aranyló'
  },
  summer: {
    warmth: 'cool',
    intensity: 'muted',
    depth: 'light',
    displayName: 'Nyár',
    preferredFinish: 'soft_matte',
    bronzerLove: 'low',
    bestMetals: ['ezüst', 'fehérarany'],
    undertone: 'hideg, rózsaszínes-acélo'
  },
  autumn: {
    warmth: 'warm',
    intensity: 'muted',
    depth: 'deep',
    displayName: 'Ősz',
    preferredFinish: 'velvet_matte',
    bronzerLove: 'high',
    bestMetals: ['antik arany', 'bronz', 'réz'],
    undertone: 'meleg, aranyló-olíva'
  },
  winter: {
    warmth: 'cool',
    intensity: 'bright',
    depth: 'deep',
    displayName: 'Tél',
    preferredFinish: 'glass_skin',
    bronzerLove: 'low',
    bestMetals: ['ezüst', 'platina'],
    undertone: 'hideg, olíva vagy porcelán'
  }
}

// Bőrtípus tulajdonságok
const SKIN_TRAITS = {
  oily: {
    displayName: 'Zsíros',
    needsMattifying: true,
    tZoneOily: true,
    uZoneDry: false,
    preferredTexture: 'powder',
    avoidTexture: 'heavy_cream',
    setSpray: 'mattifying',
    primerType: 'pórusfinomító mattító'
  },
  dry: {
    displayName: 'Száraz',
    needsMattifying: false,
    tZoneOily: false,
    uZoneDry: true,
    preferredTexture: 'cream',
    avoidTexture: 'heavy_powder',
    setSpray: 'dewy_hydrating',
    primerType: 'tápláló olaj-bázisú'
  },
  normal: {
    displayName: 'Normál',
    needsMattifying: false,
    tZoneOily: false,
    uZoneDry: false,
    preferredTexture: 'any',
    avoidTexture: null,
    setSpray: 'natural_finish',
    primerType: 'ragyogásfokozó (illuminating)'
  },
  combination: {
    displayName: 'Kombinált',
    needsMattifying: true, // csak T-zóna
    tZoneOily: true,
    uZoneDry: true,
    preferredTexture: 'hybrid',
    avoidTexture: null,
    setSpray: 'long_lasting',
    primerType: 'kettős (zónázó)'
  }
}

/**
 * Generálja a szintetizált profilt
 */
export function generateSynthesizedProfile(seasonName, skinType) {
  const season = SEASON_TRAITS[seasonName] || SEASON_TRAITS.autumn
  const skin = SKIN_TRAITS[skinType] || SKIN_TRAITS.combination

  return {
    metaData: {
      userProfile: `${season.displayName} színtípus + ${skin.displayName} bőr`,
      synthesisId: `${seasonName.toUpperCase()}_${skinType.toUpperCase()}_V2`,
      displayTitle: 'A Te Személyre Szabott Beauty Stratégiád'
    },

    goldenSynergyRule: generateGoldenRule(season, skin),

    smartMakeupRoutine: {
      baseStrategy: generateBaseStrategy(season, skin),
      cheekAndContour: generateCheekStrategy(season, skin),
      highlighterAlert: generateHighlighterStrategy(season, skin),
      lipStrategy: generateLipStrategy(season, skin)
    },

    skincareColorCorrection: generateColorCorrection(season, skin),

    quickFixShoppingList: generateShoppingList(season, skin),

    synergyCards: generateSynergyCards(season, skin)
  }
}

function generateGoldenRule(season, skin) {
  const rules = {
    // Meleg színtípusok (Tavasz, Ősz)
    warm_oily: {
      title: 'A "Kontrollált Ragyogás" Elve',
      description: `Meleg színtípusként (${season.displayName}) a bőrödnek szüksége van az aranyló fényre, de a zsíros bőrtípusod ezt könnyen "olajos csillogássá" torzíthatja. A titok: Matt alapozás + Arany fényű por highlighter. Így megmarad a melegség, de a textúra tiszta és bársonyos marad.`
    },
    warm_dry: {
      title: 'A "Golden Hour" Hatás',
      description: `Ez a tökéletes párosítás! A száraz bőröd szomjazza a krémes textúrákat, a ${season.displayName} színeid pedig imádják a fényt. Használj folyékony arany/bronz highlightert és krémes pirosítót – az arcod olyan lesz, mintha belülről sugározna.`
    },
    warm_combination: {
      title: 'A "Meleg Egyensúly" Stratégia',
      description: `A legizgalmasabb kihívás: ${season.displayName}ként a földszínek és arany tónusok állnak jól, de a kombinált bőröd "kétarcú". A szabályod: Mattítsd a T-zónát (hogy a meleg színek ne tűnjenek izzadt hatásúnak), de az orcákon hagyd meg a bőr természetes, hidratált fényét.`
    },
    warm_normal: {
      title: 'A "Természetes Istennő" Look',
      description: `Szerencsés csillagzat alatt születtél. Normál bőrrel és ${season.displayName} színekkel a célod csak annyi, hogy ne fedd el a bőröd. Használj áttetsző, színezett hidratálót és sok bronzosítót!`
    },
    // Hideg színtípusok (Nyár, Tél)
    cool_oily: {
      title: 'A "Porcelán Matt" Szabály',
      description: `A hideg színtípusok (${season.displayName}) eleganciáját a zsíros bőr fénye néha "zajossá" teheti. A te fegyvered a tökéletes, selyem-matt (semi-matte) finish. Ez emeli ki legjobban a hideg, arisztokratikus vonásaidat.`
    },
    cool_dry: {
      title: 'A hideg típusok jellemzője',
      description: `Száraz bőröd hajlamos lehet fakónak tűnni, ami a hideg színtípusokat öregítheti. A megoldás: Extra hidratálás alá, és gyöngyházfényű/ezüstös folyékony highlighterek a tetejére. A cél a vizes, üvegszerű (glass skin) hatás.`
    },
    cool_combination: {
      title: 'A "Hűvös Harmónia" Taktika',
      description: `A ${season.displayName} típus hűvös színei (rózsaszín, szürke, kék) tisztaságot igényelnek. A T-zóna zsírosodása ezt "piszkossá" teheti. Használj célzott púderezést középen, de az orcáidat hagyd üdén és fényesen – ez adja a legszebb kontrasztot.`
    },
    cool_normal: {
      title: 'A "Tiszta Elegancia" Elve',
      description: `Normál bőrrel és ${season.displayName} típussal a "kevesebb több" elvét kövesd. Nincs szükséged erős korrekcióra. A hideg, tiszta színek (ezüst, rózsa) önmagukban öltöztetnek.`
    }
  }

  const key = `${season.warmth}_${skin.needsMattifying && skin.uZoneDry ? 'combination' : skin.needsMattifying ? 'oily' : skin.uZoneDry ? 'dry' : 'normal'}`
  return rules[key] || rules[`${season.warmth}_normal`]
}

function generateBaseStrategy(season, skin) {
  let finish = 'Természetes Szatén'
  if (skin.needsMattifying && !skin.uZoneDry) finish = 'Soft Matte (Puha Matt)'
  else if (!skin.needsMattifying && skin.uZoneDry) finish = 'Dewy (Ragyogó/Hidratált)'
  else if (skin.tZoneOily && skin.uZoneDry) finish = 'Velvet (Bársonyos - középen matt, szélen fényes)'

  const undertone = season.warmth === 'warm' ? 'Meleg (Warm/Golden)' : 'Hideg/Semleges (Cool/Neutral)'

  let applicationHack = ''
  if (skin.tZoneOily && skin.uZoneDry) { // Kombinált
    applicationHack = `Zónázó Alapozás: A T-zónába ütögess be egy pórusfinomító primert. Az alapozót az orcáidon hagyd ragyogni, de a homlokot/orrot/állat fixáld le ${season.warmth === 'warm' ? 'meleg tónusú (bézs)' : 'színtelen (translucent)'} púderrel.`
  } else if (skin.needsMattifying) { // Zsíros
    applicationHack = `Tartóssági Tipp: Alapozás előtt használj mattító spray-t (setting spray) primerként! Ez "lezárja" az olajat, mielőtt az alapozó felkerülne. A végén púderezz.`
  } else if (skin.uZoneDry) { // Száraz
    applicationHack = `Hidratáló Tipp: Sose tegyél púdert a szemed alá vagy az orcákra, mert "betörik" és öregít. Használj krémes alapozót, és dolgozd el nedves szivaccsal a lédús hatásért.`
  } else { // Normál
    applicationHack = `Pro Tipp: Az alapozót csak az arcod közepére vidd fel, és kifelé halványítsd el. Nem kell maszkot viselned, a bőröd szép!`
  }

  return {
    productType: `${finish} finishű alapozó`,
    shadeGuide: `Keresd a "${undertone}" altónusú termékeket.`,
    applicationHack,
    whyThisWorks: skin.tZoneOily
      ? `A mattítás megakadályozza, hogy a ${season.displayName} színeid "lefolyjanak", miközben a megfelelő altónus kiemeli a természetes színeidet.`
      : `Ez a technika visszaadja a ${season.displayName} típusodra jellemző ragyogást anélkül, hogy kiemelné a száraz részeket.`
  }
}

function generateCheekStrategy(season, skin) {
  // Logika: Zsírosra inkább por, Szárazra inkább krém
  const texture = skin.uZoneDry ? 'Krémpirosító (Cream Blush)' : skin.needsMattifying ? 'Por állagú pirosító' : 'Folyékony vagy Por'

  const colorMap = {
    spring: ['Korall', 'Barack', 'Lazac'],
    summer: ['Mályva (Mauve)', 'Hideg Rózsa', 'Bababrózsaszín'],
    autumn: ['Terrakotta', 'Téglavörös', 'Mély Barack', 'Bronzosító'],
    winter: ['Élénk Pink', 'Fukszia', 'Vörösbor']
  }

  const seasonKey = Object.keys(SEASON_TRAITS).find(k => SEASON_TRAITS[k].displayName === season.displayName) || 'autumn'
  const colors = colorMap[seasonKey] || colorMap.autumn

  let bronzerAdvice = ''
  if (season.bronzerLove === 'high') { // Ősz, Tavasz
    bronzerAdvice = skin.tZoneOily
      ? `A bronzosító szuperül áll, DE a zsíros T-zónát kerüld el vele! Ha az orrodra is teszel, "koszosnak" hathat. Csak a homlok szélére és az arccsont alá kerüljön.`
      : `Neked a bronzosító a legjobb barátod! Melegíti az arcot és dimenziót ad. Használd bátran a "3-as" vonalban (homlok-arccsont-áll).`
  } else if (season.bronzerLove === 'medium') { // Tavasz
    bronzerAdvice = `Egy kevés, fényes bronzosító üdévé tesz, de ne vidd túlzásba.`
  } else { // Nyár, Tél
    bronzerAdvice = `Vigyázz a bronzosítóval! A legtöbb túl sárgás neked és "sáros" hatást kelt. Inkább hideg tónusú kontúr púdert (szürkésbarna) használj az árnyékoláshoz.`
  }

  return {
    textureRecommendation: `${texture} - ez illeszkedik legjobban a bőröd viselkedéséhez.`,
    colorRecommendation: `Színek, amik ragyognak rajtad: ${colors.join(', ')}`,
    bronzerStrategy: bronzerAdvice
  }
}

function generateHighlighterStrategy(season, skin) {
  const colorMap = {
    warm: ['Pezsgő (Champagne)', 'Arany (Gold)', 'Bronz'],
    cool: ['Ezüst (Silver)', 'Gyöngyház (Pearl)', 'Jeges Rózsaszín']
  }

  const colors = colorMap[season.warmth]

  let placementWarning = ''
  let placement = ''

  if (skin.tZoneOily) {
    placementWarning = `FIGYELEM: A T-zónád (homlok, orr, áll) napközben magától is fényleni fog. Ha ide teszel highlightert, az "izzadt" hatást kelt. Hagyd ki ezeket a részeket!`
    placement = 'KIZÁRÓLAG az arccsont legtetejére és esetleg a szemzugba.'
  } else if (skin.uZoneDry) { // Száraz
    placement = 'Arccsont, orrnyereg, Ámor-ív, és egy pici a homlok közepére a "healthy glow" hatásért.'
  } else {
    placement = 'A klasszikus C-vonal: arccsont és halánték.'
  }

  return {
    color: colors[0], // Visszaállítva String-re (a tömb első eleme)
    alternatives: colors.slice(1), // Visszaállítva Array-re (ez okozta a hibát!)
    placement: placement,
    warning: placementWarning
  }
}

function generateLipStrategy(season, skin) {
  const dailyMap = {
    spring: ['Barackos Nude', 'Meleg Rózsaszín'],
    summer: ['Fáradt Rózsaszín', 'Hűvös Nude'],
    autumn: ['Barnás Nude', 'Fahéj', 'Karamell'],
    winter: ['Jeges Rózsaszín', 'Színtelen Fény']
  }

  const dramaticMap = {
    spring: ['Pipacs Piros', 'Korall'],
    summer: ['Málnapiros', 'Szilva'],
    autumn: ['Téglavörös', 'Rozsdabarna', 'Csokoládé'],
    winter: ['Vérvörös', 'Fukszia', 'Mélybordó']
  }

  const seasonKey = Object.keys(SEASON_TRAITS).find(k => SEASON_TRAITS[k].displayName === season.displayName) || 'autumn'

  // Textúra a bőrtípus alapján
  let textureAdvice = ''
  if (skin.needsMattifying) {
    textureAdvice = 'A Matt folyékony rúzsok a barátaid - a zsírosabb bőrön is helyben maradnak, és nem folynak szét a száj körül.'
  } else if (skin.uZoneDry) {
    textureAdvice = 'Kerüld a szárító, tartós rúzsokat. Válassz krémes (Satin) rúzsokat vagy szájfényt, ami hidratálja az ajkaidat.'
  } else {
    textureAdvice = 'Bármilyen textúra jöhet! Nappalra egy színezett ajakápoló, estére egy tartós matt rúzs.'
  }

  return {
    dailyShades: dailyMap[seasonKey],
    dramaticShades: dramaticMap[seasonKey],
    textureAdvice
  }
}

function generateColorCorrection(season, skin) {
  // Csak akkor kell korrekció, ha van pirosság/probléma, amit a zsíros/kombinált bőr gyakran jelez
  if (!skin.tZoneOily) {
    return {
      title: 'Bőrtökéletesítés',
      problem: 'A bőröd textúrája valószínűleg egyenletesebb.',
      solution: `Nincs szükséged erős színkorrekcióra. Egy könnyű, ${season.warmth === 'warm' ? 'sárgás' : 'rózsás'} tónusú primer elég a ragyogáshoz.`
    }
  }

  return {
    title: 'Színkorrekció (Color Correction)',
    problem: `A ${skin.displayName.toLowerCase()} bőr T-zónájában gyakoriak a gyulladások vagy a pirosság.`,
    solution: season.warmth === 'warm'
      ? 'PRO TIPP: Használj ZÖLD korrektort a piros pöttyökre. Mivel meleg (sárgás) az alaptónusod, a piros foltok nagyon elütnek. A zöld semlegesíti a pirosat, így a meleg alapozód tökéletesen fog fedni.'
      : 'PRO TIPP: Ha a bőröd hűvös tónusú, a pirosság néha lilásnak hathat. Használj világos zöld vagy sárgás korrektort a semlegesítésre, mielőtt felvinnéd a hideg tónusú alapozót.'
  }
}

function generateShoppingList(season, skin) {
  // Dinamikus bevásárlólista generálás

  // 1. Alapozó
  let foundationParams = ''
  if (skin.tZoneOily && skin.uZoneDry) foundationParams = 'Szatén/Velvet finish (Kombinált bőrre)'
  else if (skin.needsMattifying) foundationParams = 'Matt/Oil-free formula'
  else if (skin.uZoneDry) foundationParams = 'Hidratáló/Luminous formula'
  else foundationParams = 'Természetes/Natural finish'

  const undertone = season.warmth === 'warm' ? '+ Meleg (Warm/Yellow) altónus' : '+ Hideg (Cool/Pink) altónus'

  // 2. Pirosító
  const blushTexture = skin.uZoneDry ? 'Krémes (Stick/Cream)' : 'Por (Powder)'
  const blushColorMap = {
    spring: 'Korall/Barack',
    summer: 'Mályva/Rózsa',
    autumn: 'Terrakotta/Rozsda',
    winter: 'Pink/Bordó'
  }
  const seasonKey = Object.keys(SEASON_TRAITS).find(k => SEASON_TRAITS[k].displayName === season.displayName) || 'autumn'

  // 3. Púder
  let powderType = ''
  if (season.warmth === 'warm') powderType = 'Meleg tónusú (pl. Banana) vagy Bézs púder'
  else powderType = 'Áttetsző (Translucent) vagy Világos púder'

  const powderNote = skin.tZoneOily ? '(a T-zóna mattítására)' : '(csak fixáláshoz)'

  // 4. Rúzs
  const lipTexture = skin.needsMattifying ? 'Tartós Matt' : 'Krémes/Fényes'
  const lipColorMap = {
    spring: 'Barack',
    summer: 'Rózsafa',
    autumn: 'Fahéj',
    winter: 'Vörös'
  }

  return {
    foundation: `${foundationParams} ${undertone}`,
    blush: `${blushTexture} pirosító - Árnyalat: ${blushColorMap[seasonKey]}`,
    powder: `${powderType} ${powderNote}`,
    lips: `${lipTexture} rúzs - Árnyalat: ${lipColorMap[seasonKey]}`
  }
}

function generateSynergyCards(season, skin) {
  return [
    {
      id: 'base',
      title: 'Az Alapozás Titka',
      skinContribution: skin.tZoneOily && skin.uZoneDry ? 'Zónázás: Matt közép, Fényes szélek'
        : skin.needsMattifying ? 'Tartós mattítás (Olajkontroll)'
          : skin.uZoneDry ? 'Extra hidratálás és fény'
            : 'Természetes fedés',
      colorContribution: `${season.displayName} típus: ${season.warmth === 'warm' ? 'Meleg, aranyló' : 'Hűvös, tiszta'} tónus`
    },
    {
      id: 'cheeks',
      title: 'Orcák & Szín',
      skinContribution: skin.uZoneDry ? 'Krémes textúra (nem emeli ki a szárazságot)' : 'Por textúra (tartós a zsíros bőrön)',
      colorContribution: season.warmth === 'warm'
        ? 'Napcsókolta árnyalatok (Barack, Bronz)'
        : 'Hűvös árnyalatok (Rózsa, Mályva)'
    },
    {
      id: 'focus',
      title: 'Kiemelés (Highlight)',
      skinContribution: skin.tZoneOily ? 'Csak óvatosan! Kerüld a T-zónát.' : 'Bátran ragyoghatsz!',
      colorContribution: `Fém: ${season.bestMetals[0]} (Harmonizál a bőröddel)`
    }
  ]
}

export default {
  generateSynthesizedProfile,
  SEASON_TRAITS,
  SKIN_TRAITS
}