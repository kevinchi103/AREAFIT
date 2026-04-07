export const WEEKS = [
  {
    week: 1, name: 'Activación', phase: 'Principiante',
    workouts: [
      { id:'w1d1', name:'Movilidad total', emoji:'🌀', exercises:[{name:'Rotación hombros',reps:'20',rest:30},{name:'Sentadilla aire',reps:'10',rest:45},{name:'Puente glúteo',reps:'10',rest:45}] },
      { id:'w1d2', name:'Fuerza base', emoji:'💪', exercises:[{name:'Flexión rodillas',reps:'8',rest:60},{name:'Sentadilla',reps:'12',rest:60},{name:'Plancha',reps:'20 seg',rest:60}] },
      { id:'w1d3', name:'Cardio suave', emoji:'🚶', exercises:[{name:'Marcha sitio',reps:'2 min',rest:30},{name:'Jumping jack lento',reps:'15',rest:45},{name:'Estiramiento',reps:'3 min',rest:0}] },
    ]
  },
  {
    week: 2, name: 'Fundamentos', phase: 'Principiante',
    workouts: [
      { id:'w2d1', name:'Tren superior', emoji:'🏋️', exercises:[{name:'Flexión rodillas',reps:'10',rest:60},{name:'Pike push-up',reps:'8',rest:60},{name:'Extensión tríceps',reps:'12',rest:45}] },
      { id:'w2d2', name:'Tren inferior', emoji:'🦵', exercises:[{name:'Sentadilla',reps:'15',rest:60},{name:'Zancada',reps:'10 c/lado',rest:60},{name:'Elevación talones',reps:'20',rest:30}] },
      { id:'w2d3', name:'Core básico', emoji:'🔥', exercises:[{name:'Plancha',reps:'25 seg',rest:60},{name:'Crunch',reps:'15',rest:45},{name:'Superman',reps:'12',rest:45}] },
    ]
  },
  {
    week: 3, name: 'Resistencia I', phase: 'Principiante',
    workouts: [
      { id:'w3d1', name:'Circuito A', emoji:'⚡', exercises:[{name:'Flexión',reps:'8',rest:45},{name:'Sentadilla',reps:'15',rest:45},{name:'Plancha',reps:'30 seg',rest:45}] },
      { id:'w3d2', name:'Cardio activo', emoji:'🏃', exercises:[{name:'Trote sitio',reps:'1 min',rest:30},{name:'Burpee modificado',reps:'8',rest:60},{name:'Salto tijera',reps:'20',rest:45}] },
      { id:'w3d3', name:'Fuerza y Core', emoji:'💥', exercises:[{name:'Flexión',reps:'10',rest:60},{name:'Crunch bici',reps:'20',rest:45},{name:'Puente glúteo',reps:'15',rest:45}] },
    ]
  },
  {
    week: 4, name: 'Consolidación', phase: 'Principiante',
    workouts: [
      { id:'w4d1', name:'Full body I', emoji:'🌟', exercises:[{name:'Flexión completa',reps:'6',rest:60},{name:'Sentadilla',reps:'18',rest:60},{name:'Remo silla',reps:'12',rest:60}] },
      { id:'w4d2', name:'HIIT suave', emoji:'🔥', exercises:[{name:'Jumping jack',reps:'30',rest:30},{name:'Sentadilla rápida',reps:'15',rest:30},{name:'Montañero lento',reps:'20',rest:45}] },
      { id:'w4d3', name:'Movilidad activa', emoji:'🧘', exercises:[{name:'Hip flexor',reps:'45 seg',rest:20},{name:'Cat-cow',reps:'15',rest:20},{name:'Pigeon pose',reps:'40 seg',rest:20}] },
    ]
  },
  {
    week: 5, name: 'Potencia I', phase: 'Intermedio',
    workouts: [
      { id:'w5d1', name:'Push day', emoji:'💪', exercises:[{name:'Flexión completa',reps:'12',rest:60},{name:'Fondos silla',reps:'12',rest:60},{name:'Pike push-up',reps:'10',rest:60}] },
      { id:'w5d2', name:'Pull y Core', emoji:'🏋️', exercises:[{name:'Remo invertido',reps:'10',rest:60},{name:'Dead bug',reps:'10 c/lado',rest:45},{name:'Plancha lateral',reps:'30 seg',rest:45}] },
      { id:'w5d3', name:'Piernas potencia', emoji:'🦵', exercises:[{name:'Sentadilla salto',reps:'10',rest:75},{name:'Zancada reversa',reps:'12 c/lado',rest:60},{name:'Glute bridge',reps:'20',rest:45}] },
    ]
  },
  {
    week: 6, name: 'Volumen I', phase: 'Intermedio',
    workouts: [
      { id:'w6d1', name:'Pecho y Tríceps', emoji:'💥', exercises:[{name:'Flexión ancha',reps:'14',rest:60},{name:'Flexión diamante',reps:'10',rest:60},{name:'Fondos estrecho',reps:'12',rest:60}] },
      { id:'w6d2', name:'Espalda y Bíceps', emoji:'🔝', exercises:[{name:'Remo invertido',reps:'12',rest:60},{name:'Curl bíceps toalla',reps:'15',rest:45},{name:'Pull-up asistido',reps:'5',rest:90}] },
      { id:'w6d3', name:'Piernas y Glúteos', emoji:'🍑', exercises:[{name:'Sentadilla búlgara',reps:'10 c/lado',rest:75},{name:'Hip thrust',reps:'15',rest:60},{name:'Peso muerto rumano',reps:'12',rest:60}] },
    ]
  },
  {
    week: 7, name: 'Intensidad I', phase: 'Intermedio',
    workouts: [
      { id:'w7d1', name:'HIIT 20-10', emoji:'⚡', exercises:[{name:'Burpee',reps:'20 seg x4',rest:10},{name:'Sentadilla salto',reps:'20 seg x4',rest:10},{name:'Montañero',reps:'20 seg x4',rest:10}] },
      { id:'w7d2', name:'Fuerza máxima', emoji:'🏋️', exercises:[{name:'Flexión archer',reps:'6 c/lado',rest:90},{name:'Pistol squat asist.',reps:'6 c/lado',rest:90},{name:'Plancha RKC',reps:'20 seg x3',rest:60}] },
      { id:'w7d3', name:'Recuperación', emoji:'🌊', exercises:[{name:'Yoga flow',reps:'5 min',rest:0},{name:'Foam roll piernas',reps:'3 min',rest:0},{name:'Respiración',reps:'3 min',rest:0}] },
    ]
  },
  {
    week: 8, name: 'Test Intermedio', phase: 'Intermedio',
    workouts: [
      { id:'w8d1', name:'Test fuerza', emoji:'🎯', exercises:[{name:'Flexión máx 1 min',reps:'máx',rest:120},{name:'Sentadilla máx 1 min',reps:'máx',rest:120},{name:'Plancha máx',reps:'máx seg',rest:0}] },
      { id:'w8d2', name:'Test cardio', emoji:'🏃', exercises:[{name:'Burpee 3 min',reps:'máx',rest:0},{name:'Salto cuerda aire',reps:'2 min',rest:60},{name:'Montañero 1 min',reps:'máx',rest:0}] },
      { id:'w8d3', name:'Descanso activo', emoji:'😴', exercises:[{name:'Caminar',reps:'20 min',rest:0},{name:'Estiramiento',reps:'10 min',rest:0},{name:'Meditación',reps:'5 min',rest:0}] },
    ]
  },
  {
    week: 9, name: 'Fuerza II', phase: 'Avanzado',
    workouts: [
      { id:'w9d1', name:'Push avanzado', emoji:'💪', exercises:[{name:'Flexión declinada',reps:'12',rest:75},{name:'Flexión arquero',reps:'8 c/lado',rest:75},{name:'Fondos paralelas',reps:'10',rest:75}] },
      { id:'w9d2', name:'Pull avanzado', emoji:'🔝', exercises:[{name:'Pull-up',reps:'5',rest:90},{name:'Remo TRX',reps:'12',rest:75},{name:'Face pull toalla',reps:'15',rest:60}] },
      { id:'w9d3', name:'Piernas avanzado', emoji:'🦵', exercises:[{name:'Pistol squat',reps:'5 c/lado',rest:90},{name:'Nordic curl asist.',reps:'6',rest:90},{name:'Box jump',reps:'8',rest:75}] },
    ]
  },
  {
    week: 10, name: 'Potencia II', phase: 'Avanzado',
    workouts: [
      { id:'w10d1', name:'Explosivo upper', emoji:'⚡', exercises:[{name:'Flexión palma',reps:'8',rest:90},{name:'Push-up salto',reps:'6',rest:90},{name:'Fondos salto',reps:'5',rest:90}] },
      { id:'w10d2', name:'Explosivo lower', emoji:'💥', exercises:[{name:'Sentadilla salto',reps:'12',rest:75},{name:'Box jump',reps:'10',rest:75},{name:'Sprint sitio 10 seg',reps:'x6',rest:60}] },
      { id:'w10d3', name:'Core atlético', emoji:'🔥', exercises:[{name:'Dragon flag asist.',reps:'5',rest:90},{name:'Hollow hold',reps:'30 seg',rest:60},{name:'L-sit asistido',reps:'10 seg x5',rest:60}] },
    ]
  },
  {
    week: 11, name: 'Volumen II', phase: 'Avanzado',
    workouts: [
      { id:'w11d1', name:'Chest y Shoulders', emoji:'🏋️', exercises:[{name:'Flexión declinada',reps:'15',rest:60},{name:'Pike push-up',reps:'15',rest:60},{name:'Pseudo plancha push',reps:'10',rest:75}] },
      { id:'w11d2', name:'Back y Biceps', emoji:'💪', exercises:[{name:'Pull-up',reps:'8',rest:90},{name:'Remo invertido',reps:'15',rest:60},{name:'Curl isométrico',reps:'30 seg',rest:45}] },
      { id:'w11d3', name:'Legs y Glutes', emoji:'🦵', exercises:[{name:'Pistol squat',reps:'8 c/lado',rest:90},{name:'Hip thrust cargado',reps:'20',rest:60},{name:'Sentadilla búlgara',reps:'12 c/lado',rest:75}] },
    ]
  },
  {
    week: 12, name: 'Resistencia II', phase: 'Avanzado',
    workouts: [
      { id:'w12d1', name:'AMRAP 20 min', emoji:'🔥', exercises:[{name:'Flexión x10',reps:'AMRAP',rest:0},{name:'Sentadilla x15',reps:'AMRAP',rest:0},{name:'Burpee x5',reps:'AMRAP',rest:0}] },
      { id:'w12d2', name:'Tabata total', emoji:'⚡', exercises:[{name:'Tabata montañero',reps:'8 rondas',rest:10},{name:'Tabata squat',reps:'8 rondas',rest:10},{name:'Tabata push-up',reps:'8 rondas',rest:10}] },
      { id:'w12d3', name:'Movilidad pro', emoji:'🧘', exercises:[{name:'Splits progresión',reps:'3 min',rest:0},{name:'Shoulder dislocate',reps:'15',rest:30},{name:'Crab walk',reps:'2 min',rest:0}] },
    ]
  },
  {
    week: 13, name: 'Especialización I', phase: 'Élite',
    workouts: [
      { id:'w13d1', name:'Calistenia upper', emoji:'🌟', exercises:[{name:'Muscle-up asistido',reps:'3',rest:120},{name:'Front lever tucked',reps:'5 seg x5',rest:90},{name:'Planche lean',reps:'10 seg x5',rest:90}] },
      { id:'w13d2', name:'Calistenia lower', emoji:'💥', exercises:[{name:'Pistol squat',reps:'10 c/lado',rest:90},{name:'Shrimp squat asist.',reps:'5 c/lado',rest:90},{name:'Nordic curl',reps:'5',rest:120}] },
      { id:'w13d3', name:'Skills y Flow', emoji:'🎯', exercises:[{name:'Handstand wall',reps:'30 seg x3',rest:90},{name:'Bridge push-up',reps:'8',rest:90},{name:'Planche lean hold',reps:'15 seg x4',rest:75}] },
    ]
  },
  {
    week: 14, name: 'Fuerza máxima', phase: 'Élite',
    workouts: [
      { id:'w14d1', name:'Max push', emoji:'💪', exercises:[{name:'Flexión 1 brazo asist.',reps:'5 c/lado',rest:120},{name:'Push-up palma',reps:'10',rest:90},{name:'Dips profundo',reps:'12',rest:75}] },
      { id:'w14d2', name:'Max pull', emoji:'🏋️', exercises:[{name:'Pull-up lastrado',reps:'5',rest:120},{name:'L-sit pull-up',reps:'4',rest:120},{name:'Australian row',reps:'15',rest:75}] },
      { id:'w14d3', name:'Max legs', emoji:'🦵', exercises:[{name:'Pistol squat',reps:'12 c/lado',rest:90},{name:'Shrimp squat',reps:'6 c/lado',rest:90},{name:'Jump squat máx',reps:'10',rest:75}] },
    ]
  },
  {
    week: 15, name: 'Potencia III', phase: 'Élite',
    workouts: [
      { id:'w15d1', name:'Pliométrico upper', emoji:'⚡', exercises:[{name:'Clapping push-up',reps:'8',rest:90},{name:'Push-up salto manos',reps:'5',rest:90},{name:'Fondos explosivos',reps:'6',rest:90}] },
      { id:'w15d2', name:'Pliométrico lower', emoji:'💥', exercises:[{name:'Depth jump',reps:'8',rest:90},{name:'Box jump alt.',reps:'10',rest:75},{name:'Split jump',reps:'10 c/lado',rest:75}] },
      { id:'w15d3', name:'Core élite', emoji:'🔥', exercises:[{name:'Dragon flag',reps:'5',rest:90},{name:'Hollow body rock',reps:'20',rest:60},{name:'L-sit',reps:'15 seg x5',rest:60}] },
    ]
  },
  {
    week: 16, name: 'Skills avanzados', phase: 'Élite',
    workouts: [
      { id:'w16d1', name:'Handstand', emoji:'🤸', exercises:[{name:'Handstand kick-up',reps:'10 intentos',rest:60},{name:'Handstand wall hold',reps:'45 seg x3',rest:90},{name:'Pike push-up elevado',reps:'12',rest:75}] },
      { id:'w16d2', name:'Front lever', emoji:'🌟', exercises:[{name:'Tuck front lever',reps:'8 seg x5',rest:90},{name:'One leg front lever',reps:'5 seg x5',rest:90},{name:'Remo frontlever',reps:'5',rest:120}] },
      { id:'w16d3', name:'Planche prog.', emoji:'💪', exercises:[{name:'Planche lean',reps:'20 seg x4',rest:90},{name:'Tuck planche',reps:'5 seg x5',rest:90},{name:'Pseudo planche push',reps:'10',rest:75}] },
    ]
  },
  {
    week: 17, name: 'Resistencia élite', phase: 'Élite',
    workouts: [
      { id:'w17d1', name:'EMOM 30 min', emoji:'🔥', exercises:[{name:'5 pull-up cada min',reps:'30 min',rest:0},{name:'10 push-up cada min',reps:'30 min',rest:0},{name:'15 squat cada min',reps:'30 min',rest:0}] },
      { id:'w17d2', name:'Density training', emoji:'⚡', exercises:[{name:'10 min pistol squat',reps:'máx reps',rest:0},{name:'10 min pull-up',reps:'máx reps',rest:0},{name:'10 min push-up',reps:'máx reps',rest:0}] },
      { id:'w17d3', name:'Movilidad élite', emoji:'🧘', exercises:[{name:'Pancake stretch',reps:'3 min',rest:0},{name:'Shoulder bridge',reps:'10',rest:30},{name:'Full body flow',reps:'10 min',rest:0}] },
    ]
  },
  {
    week: 18, name: 'Peak I', phase: 'Élite',
    workouts: [
      { id:'w18d1', name:'Max effort push', emoji:'💪', exercises:[{name:'Mejor set flexiones',reps:'máx',rest:120},{name:'Mejor set dips',reps:'máx',rest:120},{name:'Mejor set pike',reps:'máx',rest:120}] },
      { id:'w18d2', name:'Max effort pull', emoji:'🏋️', exercises:[{name:'Mejor set pull-up',reps:'máx',rest:120},{name:'Mejor set row',reps:'máx',rest:120},{name:'Mejor set L-pull',reps:'máx',rest:120}] },
      { id:'w18d3', name:'Max effort legs', emoji:'🦵', exercises:[{name:'Mejor set pistol',reps:'máx',rest:120},{name:'Mejor set squat jmp',reps:'máx',rest:120},{name:'Mejor set nordic',reps:'máx',rest:120}] },
    ]
  },
  {
    week: 19, name: 'Peak II', phase: 'Élite',
    workouts: [
      { id:'w19d1', name:'Skills showcase', emoji:'🎯', exercises:[{name:'Handstand libre',reps:'3 intentos',rest:120},{name:'Front lever',reps:'5 seg x3',rest:120},{name:'Muscle-up',reps:'3',rest:120}] },
      { id:'w19d2', name:'Fuerza-resistencia', emoji:'🔥', exercises:[{name:'100 pull-up total',reps:'en sets',rest:60},{name:'200 push-up total',reps:'en sets',rest:60},{name:'300 squat total',reps:'en sets',rest:60}] },
      { id:'w19d3', name:'Preparación final', emoji:'🌟', exercises:[{name:'Visualización',reps:'10 min',rest:0},{name:'Activación suave',reps:'15 min',rest:0},{name:'Estiramiento',reps:'10 min',rest:0}] },
    ]
  },
  {
    week: 20, name: 'Final Test', phase: 'Élite',
    workouts: [
      { id:'w20d1', name:'Test final fuerza', emoji:'🏆', exercises:[{name:'Pull-up máximo',reps:'1 set máx',rest:180},{name:'Flexión máximo',reps:'1 set máx',rest:180},{name:'Pistol squat',reps:'1 set máx',rest:180}] },
      { id:'w20d2', name:'Test final skills', emoji:'🎯', exercises:[{name:'Handstand hold',reps:'máx seg',rest:120},{name:'L-sit hold',reps:'máx seg',rest:120},{name:'Front lever',reps:'máx seg',rest:120}] },
      { id:'w20d3', name:'Celebración', emoji:'🎉', exercises:[{name:'Workout favorito',reps:'el que quieras',rest:0},{name:'Fotos de progreso',reps:'hazlas',rest:0},{name:'Descanso merecido',reps:'relájate',rest:0}] },
    ]
  },
];

export const PHASE_COLORS = {
  'Principiante': '#C8FF00',
  'Intermedio':   '#00E5FF',
  'Avanzado':     '#FF6B35',
  'Élite':        '#A855F7',
};

export const TEST_EXERCISES = [
  { id:'t1', name:'Flexiones', emoji:'💪', desc:'Haz el máximo que puedas. Pecho al suelo, brazos completos.', pass:5,  unit:'reps', skipTo:5 },
  { id:'t2', name:'Sentadillas', emoji:'🦵', desc:'Baja hasta paralelo. Cuántas puedes en 1 minuto.', pass:20, unit:'reps', skipTo:5 },
  { id:'t3', name:'Plancha', emoji:'🧘', desc:'Aguanta en posición de plancha el máximo tiempo posible.', pass:30, unit:'seg', skipTo:5 },
  { id:'t4', name:'Burpees', emoji:'🔥', desc:'Haz el máximo en 1 minuto. Movimiento completo.', pass:8,  unit:'reps', skipTo:9 },
  { id:'t5', name:'Pull-up o remo', emoji:'🏋️', desc:'Cuelga de una barra o mesa. Sube el pecho. Cuántas?', pass:3,  unit:'reps', skipTo:13 },
];