
export const dashboardContent = {
  hero: {
    label: 'A webapp neve',
    title: 'Elemzés, rád szabva.',
    description: 'Személyre szabott AI-elemzés bőrtípusodra és színtípusodra. Találd meg a hozzád illő színeket és optimális bőrápolási rutinokat.',
    greeting: 'Üdv'
  },

  modules: [
    {
      id: 'ai-color-expert',
      route: '/chat',
      badge: 'AI Asszisztens',
      title: 'Színtípuselemzés',
      subtitle: 'Személyre szabott színtanácsadás',
      fullDescription: 'A megfelelő színek kiemelik, a rossz árnyalatok fáradttá teszik az arcot. Az elemzés a bőr, a haj és a szem tónusai alapján sorol be a négy évszaktípus (Tavasz, Nyár, Ősz, Tél) egyikébe. Használd az AI asszisztenst interaktív tanácsadásra: kérdezz rá konkrét ruhákra, hogy vásárláskor már csak a hozzád illő darabok mellett dönts. Az AI segít megérteni, miért áll jól egy-egy szín, és hogyan kombináld ezeket a legjobban a gardróbodban.',
      ctaText: 'Nem tom, nyomod!',
      features: [
        'Cseveg alapú tanácsadás',
        'Interaktív elemzés',
        'Videós konzultáció',
        'Azonnali vélemény',
      ],
      media: {
        type: 'placeholder', // 'video', 'image' vagy 'placeholder'
        // src: '/media/tutorials/color-analysis-tutorial.mp4',
        // poster: '/media/tutorials/color-analysis-poster.jpg',
        placeholder: 'Színtípuselemzés bemutató',
        caption: 'Nézd meg, hogyan működik a színtípuselemzés'
      }
    },
    {
      id: 'skin-analysis',
      route: '/skin-analysis',
      badge: 'Bőrápolás',
      title: 'Bőrelemzés',
      subtitle: 'AI alapú bőrtípus azonosítás',
      fullDescription: 'AI-alapú bőrelemzés, amely meghatározza a bőrtípusodat és feltérképezi a jellemző bőrhibákat. Az elemzés eredményei alapján navigálhatsz a személyre szabott rutinokhoz és összetevő-ajánlásokhoz.',
      ctaText: 'Elemezd bőröd',
      features: [
        'Bőrtípus meghatározása',
        'Bőrhibák felfedezése',
        'Eredmények áttekintése'
      ],
      media: {
        type: 'placeholder',
        // src: '/media/tutorials/skin-analysis-tutorial.mp4',
        placeholder: 'Bőrelemzés bemutató',
        caption: 'Így elemezzük a bőrtípusodat AI segítségével'
      }
    },
    {
      id: 'results',
      route: '/results',
      badge: 'Eredmények',
      title: 'Eredményeim',
      subtitle: 'Színelemzés és bőrtípus eredmények',
      fullDescription: 'Az Eredményeim oldalon egy helyen találod meg az elemzésed adatait. Megtekintheted színstípusod részletes leírását, ajánlott és kerülendő színpalettádat, és bőrtípusod elemzését. Az AI által meghatározott színtípusod (Tavasz, Nyár, Ősz vagy Tél) mellett láthatod az indoklást is, hogy miért pont ez illik hozzád legjobban. Itt érheted el gyorsan a színpalettádat, amikor vásárolsz vagy öltözködsz, és visszanézheted korábbi bőrelemzéseid eredményeit is.',
      ctaText: 'Eredményeim megtekintése',
      features: [
        'Színtípus megtekintése',
        'Ajánlott színpaletta',
        'Bőrelemzés eredmények',
        'Összes korábbi elemzés'
      ],
      media: {
        type: 'placeholder',
        // src: '/media/tutorials/results-tutorial.mp4',
        placeholder: 'Eredmények áttekintése',
        caption: 'Hogyan értelmezd az elemzési eredményeidet'
      }
    }
  ]
}

export default dashboardContent
