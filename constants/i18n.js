// constants/i18n.js — Traducciones CA / ES / EN

const translations = {
  // ─── TABS ─────────────────────────────────────────────────────
  tabs: {
    today:    { ca: 'AVUI',    es: 'HOY',     en: 'TODAY' },
    leagues:  { ca: 'LLIGUES', es: 'LIGAS',   en: 'LEAGUES' },
    map:      { ca: 'MAPA',    es: 'MAPA',    en: 'MAP' },
    profile:  { ca: 'PERFIL',  es: 'PERFIL',  en: 'PROFILE' },
    admin:    { ca: 'ADMIN',   es: 'ADMIN',   en: 'ADMIN' },
  },

  // ─── LOGIN / REGISTER ────────────────────────────────────────
  auth: {
    appName:            { ca: 'AREAFIT',                          es: 'AREAFIT',                          en: 'AREAFIT' },
    tagline:            { ca: 'La teva transformació en 20 setmanes', es: 'Tu transformacion en 20 semanas', en: 'Your transformation in 20 weeks' },
    createAccount:      { ca: 'Crear compte',                     es: 'Crear cuenta',                     en: 'Create account' },
    haveAccount:        { ca: 'Ja tinc compte',                   es: 'Ya tengo cuenta',                  en: 'I have an account' },
    welcomeBack:        { ca: 'Benvingut de nou',                 es: 'Bienvenido de vuelta',             en: 'Welcome back' },
    loginSubtitle:      { ca: 'Inicia sessió per continuar',      es: 'Inicia sesion para continuar',     en: 'Sign in to continue' },
    email:              { ca: 'EMAIL',                             es: 'EMAIL',                            en: 'EMAIL' },
    emailPlaceholder:   { ca: 'el-teu@email.com',                 es: 'tu@email.com',                     en: 'your@email.com' },
    password:           { ca: 'CONTRASENYA',                      es: 'CONTRASEÑA',                       en: 'PASSWORD' },
    passwordPlaceholder:{ ca: 'La teva contrasenya',              es: 'Tu contraseña',                    en: 'Your password' },
    enter:              { ca: 'Entrar',                            es: 'Entrar',                           en: 'Sign in' },
    entering:           { ca: 'Entrant...',                        es: 'Entrando...',                      en: 'Signing in...' },
    noAccount:          { ca: 'No tens compte?',                   es: '¿No tienes cuenta?',               en: "Don't have an account?" },
    register:           { ca: "Registra't",                        es: 'Registrate',                       en: 'Sign up' },
    hasAccount:         { ca: 'Ja tens compte?',                   es: '¿Ya tienes cuenta?',               en: 'Already have an account?' },
    login:              { ca: 'Inicia sessió',                     es: 'Inicia sesion',                    en: 'Sign in' },
    step1of2:           { ca: 'PAS 1 DE 2',                        es: 'PASO 1 DE 2',                      en: 'STEP 1 OF 2' },
    step2of2:           { ca: 'PAS 2 DE 2',                        es: 'PASO 2 DE 2',                      en: 'STEP 2 OF 2' },
    createYourAccount:  { ca: 'Crea el teu compte',                es: 'Crea tu cuenta',                   en: 'Create your account' },
    tellUsAboutYou:     { ca: 'Explica\'ns sobre tu',              es: 'Cuentanos sobre ti',               en: 'Tell us about yourself' },
    name:               { ca: 'NOM',                               es: 'NOMBRE',                           en: 'NAME' },
    namePlaceholder:    { ca: 'Com et dius?',                      es: '¿Como te llamas?',                 en: 'What is your name?' },
    goalOptional:       { ca: 'OBJECTIU (OPCIONAL)',               es: 'OBJETIVO (OPCIONAL)',               en: 'GOAL (OPTIONAL)' },
    loseWeight:         { ca: 'Perdre pes',                        es: 'Perder peso',                      en: 'Lose weight' },
    gainMuscle:         { ca: 'Guanyar múscul',                    es: 'Ganar musculo',                    en: 'Gain muscle' },
    getInShape:         { ca: 'Posar-me en forma',                 es: 'Ponerme en forma',                 en: 'Get in shape' },
    next:               { ca: 'Següent →',                         es: 'Siguiente →',                      en: 'Next →' },
    choosePassword:     { ca: 'Tria la teva contrasenya',          es: 'Elige tu contraseña',              en: 'Choose your password' },
    min6chars:          { ca: 'Mínim 6 caràcters',                 es: 'Minimo 6 caracteres',              en: 'At least 6 characters' },
    repeatPassword:     { ca: 'REPETIR CONTRASENYA',               es: 'REPETIR CONTRASEÑA',               en: 'REPEAT PASSWORD' },
    repeatPlaceholder:  { ca: 'Repeteix la contrasenya',           es: 'Repite la contraseña',             en: 'Repeat password' },
    creating:           { ca: 'Creant compte...',                  es: 'Creando cuenta...',                en: 'Creating account...' },
    passwordsNoMatch:   { ca: 'Les contrasenyes no coincideixen', es: 'Las contraseñas no coinciden',      en: 'Passwords do not match' },
    weak:               { ca: 'Feble',   es: 'Debil',    en: 'Weak' },
    medium:             { ca: 'Mitjana', es: 'Media',    en: 'Medium' },
    good:               { ca: 'Bona',    es: 'Buena',    en: 'Good' },
    strong:             { ca: 'Forta',   es: 'Fuerte',   en: 'Strong' },
    // Features
    feat1:              { ca: 'Entrenaments personalitzats',       es: 'Entrenamientos personalizados',    en: 'Personalized workouts' },
    feat2:              { ca: 'Competeix en lligues setmanals',    es: 'Compite en ligas semanales',       en: 'Compete in weekly leagues' },
    feat3:              { ca: 'Segueix el teu progrés real',       es: 'Sigue tu progreso real',           en: 'Track your real progress' },
    feat4:              { ca: 'Ratxes i recompenses',              es: 'Rachas y recompensas',             en: 'Streaks and rewards' },
    // Errors
    errFillFields:      { ca: 'Omple email i contrasenya',        es: 'Rellena email y contraseña',       en: 'Fill in email and password' },
    errName:            { ca: 'Escriu el teu nom',                 es: 'Escribe tu nombre',                en: 'Enter your name' },
    errEmail:           { ca: 'Escriu el teu email',               es: 'Escribe tu email',                 en: 'Enter your email' },
    errEmailInvalid:    { ca: 'Email no vàlid',                    es: 'Email no valido',                  en: 'Invalid email' },
    errPassword:        { ca: 'Escriu una contrasenya',            es: 'Escribe una contraseña',           en: 'Enter a password' },
    errPasswordShort:   { ca: 'Mínim 6 caràcters',                 es: 'Minimo 6 caracteres',              en: 'At least 6 characters' },
    error:              { ca: 'Error',                              es: 'Error',                            en: 'Error' },
  },

  // ─── ONBOARDING ──────────────────────────────────────────────
  onboarding: {
    tagline:       { ca: 'La teva transformació en 20 setmanes', es: 'Tu transformación en 20 semanas', en: 'Your transformation in 20 weeks' },
    subtitle:      { ca: "El programa que s'adapta a tu.\nSense gimnàs. Sense excuses.", es: 'El programa que se adapta a ti.\nSin gimnasio. Sin excusas.', en: 'The program that adapts to you.\nNo gym. No excuses.' },
    start:         { ca: 'Començar →',      es: 'Comenzar →',     en: 'Start →' },
    whatName:      { ca: 'Com et dius?',     es: '¿Cómo te llamas?', en: 'What is your name?' },
    yourName:      { ca: 'El teu nom...',    es: 'Tu nombre...',   en: 'Your name...' },
    hello:         { ca: 'Hola',             es: 'Hola',           en: 'Hello' },
    continue:      { ca: 'Continuar →',      es: 'Continuar →',    en: 'Continue →' },
    experience:    { ca: 'tens experiència entrenant?', es: 'tienes experiencia entrenando?', en: 'do you have training experience?' },
    beHonest:      { ca: "Sigues sincer/a. El programa s'adaptarà al teu nivell.", es: 'Sé sincero/a. El programa se adaptará a tu nivel.', en: 'Be honest. The program will adapt to your level.' },
    fromZero:      { ca: 'Començar des de zero', es: 'Empezar desde cero', en: 'Start from zero' },
    fromZeroDesc:  { ca: "Mai he entrenat o fa molt que estic parat", es: 'Nunca he entrenado o llevo mucho tiempo parado', en: "I've never trained or been inactive for a long time" },
    doTest:        { ca: 'Fer el test de nivell', es: 'Hacer el test de nivel', en: 'Take the level test' },
    doTestDesc:    { ca: 'Tinc experiència i vull saltar setmanes', es: 'Tengo experiencia y quiero saltar semanas', en: 'I have experience and want to skip weeks' },
    testNote:      { ca: "El test consisteix a fer els exercicis reals\ni dir quants has pogut fer. Sigues honest/a!", es: 'El test consiste en hacer los ejercicios reales\ny decir cuántos pudiste hacer. ¡Sé honesto/a!', en: 'The test consists of doing the real exercises\nand saying how many you could do. Be honest!' },
  },

  // ─── HOME (index) ────────────────────────────────────────────
  home: {
    hello:        { ca: 'Hola',           es: 'Hola',           en: 'Hello' },
    week:         { ca: 'Setmana',        es: 'Semana',         en: 'Week' },
    weeklyStreak: { ca: 'Ratxa setmanal', es: 'Racha semanal',  en: 'Weekly streak' },
    consecutiveDays: { ca: 'dies consecutius', es: 'días consecutivos', en: 'consecutive days' },
    level:        { ca: 'Nivell',         es: 'Nivel',          en: 'Level' },
    workouts:     { ca: 'ENTRENAMENTS',   es: 'ENTRENAMIENTOS', en: 'WORKOUTS' },
    exercises:    { ca: 'exercicis',      es: 'ejercicios',     en: 'exercises' },
    loading:      { ca: 'Carregant...',   es: 'Cargando...',    en: 'Loading...' },
  },

  // ─── WORKOUT ─────────────────────────────────────────────────
  workout: {
    notFound:      { ca: 'Entrenament no trobat',  es: 'Entrenamiento no encontrado', en: 'Workout not found' },
    back:          { ca: 'Tornar',                  es: 'Volver',                      en: 'Go back' },
    exerciseOf:    { ca: 'EXERCICI',                es: 'EJERCICIO',                   en: 'EXERCISE' },
    of:            { ca: 'DE',                      es: 'DE',                          en: 'OF' },
    reps:          { ca: 'repeticions',             es: 'repeticiones',                en: 'reps' },
    rest:          { ca: 'descans',                 es: 'descanso',                    en: 'rest' },
    restLabel:     { ca: 'DESCANS',                 es: 'DESCANSO',                    en: 'REST' },
    skipRest:      { ca: 'Saltar descans',          es: 'Saltar descanso',             en: 'Skip rest' },
    nextUp:        { ca: 'SEGÜENT',                 es: 'SIGUIENTE',                   en: 'NEXT' },
    complete:      { ca: 'Completar',               es: 'Completar',                   en: 'Complete' },
    allExercises:  { ca: 'TOTS ELS EXERCICIS',      es: 'TODOS LOS EJERCICIOS',        en: 'ALL EXERCISES' },
    start:         { ca: 'COMENÇAR',                es: 'EMPEZAR',                     en: 'START' },
    pause:         { ca: 'PAUSAR',                  es: 'PAUSAR',                      en: 'PAUSE' },
    resume:        { ca: 'CONTINUAR',               es: 'CONTINUAR',                   en: 'RESUME' },
    timeComplete:  { ca: 'Temps completat',         es: 'Tiempo completado',           en: 'Time complete' },
    finished:      { ca: 'Entrenament completat',   es: 'Entreno completado',          en: 'Workout complete' },
    exercisesDone: { ca: 'exercicis acabats',       es: 'ejercicios terminados',       en: 'exercises done' },
    saveAndBack:   { ca: 'Desar i tornar',          es: 'Guardar y volver',            en: 'Save and go back' },
  },

  // ─── LEAGUES ─────────────────────────────────────────────────
  leagues: {
    title:       { ca: 'LLIGUES',            es: 'LIGAS',              en: 'LEAGUES' },
    live:        { ca: 'EN DIRECTE',         es: 'EN VIVO',            en: 'LIVE' },
    myLeague:    { ca: 'LA MEVA LLIGA',      es: 'MI LIGA',            en: 'MY LEAGUE' },
    position:    { ca: 'Posició',            es: 'Posición',           en: 'Position' },
    thisWeek:    { ca: 'aquesta setmana',    es: 'esta semana',        en: 'this week' },
    xpWeek:      { ca: 'XP setmana',         es: 'XP semana',          en: 'XP week' },
    daysReset:   { ca: 'dies reset',         es: 'días reset',         en: 'days reset' },
    xpToRise:    { ca: 'XP per pujar',       es: 'XP para subir',      en: 'XP to rank up' },
    maxLeague:   { ca: 'Lliga màxima assolida', es: 'Liga máxima alcanzada', en: 'Max league reached' },
    loadingRank: { ca: 'Carregant ranking...', es: 'Cargando ranking...', en: 'Loading ranking...' },
    beFirst:     { ca: 'Sigues el primer aquesta setmana', es: 'Sé el primero esta semana', en: 'Be the first this week' },
    completeOne: { ca: 'Completa un entrenament avui per aparèixer al ranking', es: 'Completa un entreno hoy para aparecer en el ranking', en: 'Complete a workout today to appear in the ranking' },
    leagueEmpty: { ca: 'Lliga buida',        es: 'Liga vacía',          en: 'Empty league' },
    nobodyYet:   { ca: 'Ningú en aquesta lliga aquesta setmana', es: 'Nadie en esta liga esta semana todavía', en: 'Nobody in this league yet this week' },
    top3up:      { ca: 'Top 3 — pugen de lliga', es: 'Top 3 — suben de liga', en: 'Top 3 — rank up' },
    last3down:   { ca: 'Últims 3 — baixen de lliga', es: 'Últimos 3 — bajan de liga', en: 'Last 3 — rank down' },
    howItWorks:  { ca: 'COM FUNCIONEN LES LLIGUES', es: 'CÓMO FUNCIONAN LAS LIGAS', en: 'HOW LEAGUES WORK' },
    rule1:       { ca: 'El ranking es reinicia cada dilluns a les 00:00', es: 'El ranking se reinicia cada lunes a las 00:00', en: 'Rankings reset every Monday at 00:00' },
    rule2:       { ca: 'Top 3 de cada lliga pugen a la següent', es: 'Top 3 de cada liga suben a la siguiente', en: 'Top 3 of each league rank up' },
    rule3:       { ca: 'Últims 3 baixen a la lliga inferior', es: 'Últimos 3 bajan a la liga inferior', en: 'Last 3 rank down' },
    rule4:       { ca: 'Cada entrenament completat suma 100 XP base', es: 'Cada entreno completado suma 100 XP base', en: 'Each workout gives 100 base XP' },
    rule5:       { ca: 'La ratxa suma fins a +125 XP de bonus diari', es: 'La racha suma hasta +125 XP de bonus diario', en: 'Streaks give up to +125 daily bonus XP' },
    you:         { ca: 'TU',       es: 'TÚ',      en: 'YOU' },
    noStreak:    { ca: 'sense ratxa', es: 'sin racha', en: 'no streak' },
    // League names
    bronze:      { ca: 'Bronze',    es: 'Bronce',    en: 'Bronze' },
    silver:      { ca: 'Plata',     es: 'Plata',     en: 'Silver' },
    gold:        { ca: 'Or',        es: 'Oro',       en: 'Gold' },
    diamond:     { ca: 'Diamant',   es: 'Diamante',  en: 'Diamond' },
  },

  // ─── MAP ─────────────────────────────────────────────────────
  map: {
    title:       { ca: 'MAPA DEL PROGRAMA', es: 'MAPA DEL PROGRAMA', en: 'PROGRAM MAP' },
    week:        { ca: 'Setmana',   es: 'Semana',     en: 'Week' },
    current:     { ca: 'ACTUAL',    es: 'ACTUAL',      en: 'CURRENT' },
    completed:   { ca: 'COMPLETAT', es: 'COMPLETADO',  en: 'COMPLETED' },
    locked:      { ca: 'BLOQUEJAT', es: 'BLOQUEADO',   en: 'LOCKED' },
    nextWeek:    { ca: 'Avançar setmana', es: 'Avanzar semana', en: 'Advance week' },
    // Phases
    beginner:    { ca: 'Principiant', es: 'Principiante', en: 'Beginner' },
    intermediate:{ ca: 'Intermedi',   es: 'Intermedio',   en: 'Intermediate' },
    advanced:    { ca: 'Avançat',     es: 'Avanzado',     en: 'Advanced' },
    elite:       { ca: 'Èlit',        es: 'Élite',        en: 'Elite' },
  },

  // ─── PROFILE ─────────────────────────────────────────────────
  profile: {
    streak:        { ca: 'Ratxa',          es: 'Racha',          en: 'Streak' },
    totalXP:       { ca: 'XP total',       es: 'XP total',       en: 'Total XP' },
    days:          { ca: 'Dies',           es: 'Días',           en: 'Days' },
    personalData:  { ca: 'DADES PERSONALS', es: 'DATOS PERSONALES', en: 'PERSONAL DATA' },
    name:          { ca: 'Nom',            es: 'Nombre',         en: 'Name' },
    height:        { ca: 'Alçada (cm)',    es: 'Altura (cm)',    en: 'Height (cm)' },
    startWeight:   { ca: 'Pes inicial (kg)', es: 'Peso inicial (kg)', en: 'Starting weight (kg)' },
    goal:          { ca: 'Objectiu',       es: 'Objetivo',       en: 'Goal' },
    edit:          { ca: 'Editar',         es: 'Editar',         en: 'Edit' },
    save:          { ca: 'Desar',          es: 'Guardar',        en: 'Save' },
    weightControl: { ca: 'CONTROL DE PES', es: 'CONTROL DE PESO', en: 'WEIGHT TRACKING' },
    currentWeight: { ca: 'Pes actual (kg)', es: 'Peso actual (kg)', en: 'Current weight (kg)' },
    addWeight:     { ca: '+ Afegir',       es: '+ Añadir',       en: '+ Add' },
    current:       { ca: 'actual',         es: 'actual',         en: 'current' },
    fromStart:     { ca: 'des de l\'inici', es: 'desde el inicio', en: 'from start' },
    firstWeight:   { ca: 'Registra el teu primer pes', es: 'Registra tu primer peso', en: 'Record your first weight' },
    settings:      { ca: 'CONFIGURACIÓ',   es: 'CONFIGURACIÓN',  en: 'SETTINGS' },
    language:      { ca: 'Idioma',         es: 'Idioma',         en: 'Language' },
    theme:         { ca: 'Tema',           es: 'Tema',           en: 'Theme' },
    darkMode:      { ca: 'Mode fosc',      es: 'Modo oscuro',    en: 'Dark mode' },
    lightMode:     { ca: 'Mode clar',      es: 'Modo claro',     en: 'Light mode' },
    subscription:  { ca: 'Subscripció',    es: 'Suscripción',    en: 'Subscription' },
    free:          { ca: 'Gratuït',        es: 'Gratuito',       en: 'Free' },
    premium:       { ca: 'Premium',        es: 'Premium',        en: 'Premium' },
    premiumPrice:  { ca: '14,99€/mes',     es: '14,99€/mes',     en: '€14.99/mo' },
    premiumYear:   { ca: '89,99€/any',     es: '89,99€/año',     en: '€89.99/yr' },
    logout:        { ca: 'Tancar sessió',  es: 'Cerrar sesión',  en: 'Log out' },
    logoutConfirm: { ca: 'Segur que vols tancar sessió?', es: '¿Seguro que quieres cerrar sesión?', en: 'Are you sure you want to log out?' },
    cancel:        { ca: 'Cancel·lar',     es: 'Cancelar',       en: 'Cancel' },
    version:       { ca: 'Versió',         es: 'Versión',        en: 'Version' },
    notifications: { ca: 'Notificacions',  es: 'Notificaciones', en: 'Notifications' },
    deleteAccount: { ca: 'Eliminar compte', es: 'Eliminar cuenta', en: 'Delete account' },
    privacyPolicy: { ca: 'Política de privadesa', es: 'Política de privacidad', en: 'Privacy policy' },
    termsOfService:{ ca: "Termes d'ús",    es: 'Términos de uso', en: 'Terms of service' },
    catalan:       { ca: 'Català',          es: 'Catalán',        en: 'Catalan' },
    spanish:       { ca: 'Castellà',        es: 'Castellano',     en: 'Spanish' },
    english:       { ca: 'Anglès',          es: 'Inglés',         en: 'English' },
    monthly:       { ca: 'Mensual',         es: 'Mensual',        en: 'Monthly' },
    yearly:        { ca: 'Anual',           es: 'Anual',          en: 'Yearly' },
    perMonth:      { ca: '/mes',            es: '/mes',           en: '/mo' },
    perYear:       { ca: '/any',            es: '/año',           en: '/yr' },
    savingsPercent:{ ca: 'Estalvia un 50%', es: 'Ahorra un 50%', en: 'Save 50%' },
    comingSoon:    { ca: 'Properament',     es: 'Próximamente',   en: 'Coming soon' },
    comingSoonMsg: { ca: 'Les subscripcions Premium estaran disponibles aviat!', es: '¡Las suscripciones Premium estarán disponibles pronto!', en: 'Premium subscriptions will be available soon!' },
    currentPlan:   { ca: 'Pla actual',      es: 'Plan actual',    en: 'Current plan' },
    account:       { ca: 'COMPTE',          es: 'CUENTA',         en: 'ACCOUNT' },
    deleteConfirm: { ca: 'Segur que vols eliminar el teu compte?', es: '¿Seguro que quieres eliminar tu cuenta?', en: 'Are you sure you want to delete your account?' },
    deleteMsg:     { ca: 'Aquesta acció no es pot desfer.', es: 'Esta acción no se puede deshacer.', en: 'This action cannot be undone.' },
    level:         { ca: 'Nivell',          es: 'Nivel',          en: 'Level' },
    week:          { ca: 'Setmana',         es: 'Semana',         en: 'Week' },
    permissions:   { ca: 'Permisos',        es: 'Permisos',       en: 'Permissions' },
    galleryAccess: { ca: 'Necessitem accés a la teva galeria', es: 'Necesitamos acceso a tu galería', en: 'We need access to your gallery' },
    invalidWeight: { ca: 'Introdueix un pes vàlid', es: 'Introduce un peso válido', en: 'Enter a valid weight' },
    yourName:      { ca: 'El teu nom',      es: 'Tu nombre',      en: 'Your name' },
    on:            { ca: 'Activades',       es: 'Activadas',      en: 'On' },
    off:           { ca: 'Desactivades',    es: 'Desactivadas',   en: 'Off' },
    recommended:   { ca: 'Recomanat',       es: 'Recomendado',    en: 'Recommended' },
  },

  // ─── COMMON ──────────────────────────────────────────────────
  common: {
    loading:  { ca: 'Carregant...', es: 'Cargando...', en: 'Loading...' },
    error:    { ca: 'Error',        es: 'Error',       en: 'Error' },
    ok:       { ca: "D'acord",      es: 'Aceptar',     en: 'OK' },
    cancel:   { ca: 'Cancel·lar',   es: 'Cancelar',    en: 'Cancel' },
    yes:      { ca: 'Sí',           es: 'Sí',          en: 'Yes' },
    no:       { ca: 'No',           es: 'No',          en: 'No' },
    confirm:  { ca: 'Confirmar',    es: 'Confirmar',   en: 'Confirm' },
  },

  // ─── DAYS ────────────────────────────────────────────────────
  days: {
    short: {
      ca: ['Dl', 'Dm', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'],
      es: ['L',  'M',  'X',  'J',  'V',  'S',  'D'],
      en: ['M',  'T',  'W',  'T',  'F',  'S',  'S'],
    },
  },
};

/**
 * Returns a translation function for the given language.
 * Usage: const t = createT('es'); t('home.hello') → 'Hola'
 */
export function createT(lang = 'es') {
  return function t(key) {
    const parts = key.split('.');
    let obj = translations;
    for (const p of parts) {
      obj = obj?.[p];
      if (!obj) return key; // fallback to key
    }
    if (typeof obj === 'object' && obj[lang] !== undefined) return obj[lang];
    if (typeof obj === 'object' && obj.es !== undefined) return obj.es; // fallback ES
    return key;
  };
}

/**
 * Get days array for language
 */
export function getDays(lang = 'es') {
  return translations.days.short[lang] || translations.days.short.es;
}

export default translations;
