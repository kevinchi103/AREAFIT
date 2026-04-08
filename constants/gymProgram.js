// Programa de 20 semanas para GYM
// Equipamiento: cinta, remo, elíptica, mancuernas, máquinas guiadas, barras, poleas

export const GYM_WEEKS = [
  {
    week: 1, name: 'Adaptación', phase: 'Principiante',
    workouts: [
      { id:'w1d1_gym', name:'Cardio + Máquinas', emoji:'🏃', exercises:[
        {name:'Cinta de correr', reps:'10 min suave', rest:0},
        {name:'Leg press', reps:'3x12', rest:60},
        {name:'Jalón al pecho', reps:'3x12', rest:60},
        {name:'Press pecho máquina', reps:'3x12', rest:60},
      ]},
      { id:'w1d2_gym', name:'Fuerza Inicial', emoji:'💪', exercises:[
        {name:'Elíptica', reps:'8 min', rest:0},
        {name:'Curl bíceps mancuernas', reps:'3x12', rest:45},
        {name:'Extensión tríceps polea', reps:'3x12', rest:45},
        {name:'Remo en polea baja', reps:'3x12', rest:60},
      ]},
      { id:'w1d3_gym', name:'Piernas + Core', emoji:'🦵', exercises:[
        {name:'Extensión cuádriceps máquina', reps:'3x15', rest:45},
        {name:'Curl femoral máquina', reps:'3x15', rest:45},
        {name:'Elevación de talones máquina', reps:'3x20', rest:30},
        {name:'Crunch en polea', reps:'3x15', rest:45},
      ]},
    ]
  },
  {
    week: 2, name: 'Fundamentos', phase: 'Principiante',
    workouts: [
      { id:'w2d1_gym', name:'Tren Superior A', emoji:'🏋️', exercises:[
        {name:'Press pecho máquina', reps:'3x12', rest:60},
        {name:'Jalón al pecho agarre ancho', reps:'3x12', rest:60},
        {name:'Press hombros mancuernas', reps:'3x12', rest:60},
        {name:'Curl bíceps barra', reps:'3x12', rest:45},
      ]},
      { id:'w2d2_gym', name:'Tren Inferior A', emoji:'🦵', exercises:[
        {name:'Leg press', reps:'4x12', rest:75},
        {name:'Extensión cuádriceps máquina', reps:'3x15', rest:45},
        {name:'Curl femoral máquina', reps:'3x15', rest:45},
        {name:'Elevación de talones máquina', reps:'4x20', rest:30},
      ]},
      { id:'w2d3_gym', name:'Core + Cardio', emoji:'🔥', exercises:[
        {name:'Cinta de correr', reps:'15 min ritmo moderado', rest:0},
        {name:'Crunch en polea', reps:'3x15', rest:45},
        {name:'Plancha', reps:'3x30 seg', rest:45},
        {name:'Elevación de piernas paralelas', reps:'3x12', rest:45},
      ]},
    ]
  },
  {
    week: 3, name: 'Resistencia I', phase: 'Principiante',
    workouts: [
      { id:'w3d1_gym', name:'Push día A', emoji:'💪', exercises:[
        {name:'Press banca mancuernas', reps:'3x12', rest:60},
        {name:'Aperturas pecho mancuernas', reps:'3x12', rest:60},
        {name:'Press hombros máquina', reps:'3x12', rest:60},
        {name:'Extensión tríceps polea', reps:'3x15', rest:45},
      ]},
      { id:'w3d2_gym', name:'Pull día A', emoji:'🔝', exercises:[
        {name:'Remo en máquina', reps:'3x12', rest:60},
        {name:'Jalón al pecho agarre estrecho', reps:'3x12', rest:60},
        {name:'Face pull polea', reps:'3x15', rest:45},
        {name:'Curl bíceps mancuernas', reps:'3x12', rest:45},
      ]},
      { id:'w3d3_gym', name:'Piernas + Cardio', emoji:'🦵', exercises:[
        {name:'Elíptica', reps:'15 min', rest:0},
        {name:'Leg press', reps:'4x15', rest:60},
        {name:'Zancada con mancuernas', reps:'3x12 c/lado', rest:60},
        {name:'Curl femoral máquina', reps:'3x15', rest:45},
      ]},
    ]
  },
  {
    week: 4, name: 'Consolidación', phase: 'Principiante',
    workouts: [
      { id:'w4d1_gym', name:'Full Body I', emoji:'🌟', exercises:[
        {name:'Press pecho máquina', reps:'4x12', rest:60},
        {name:'Jalón al pecho', reps:'4x12', rest:60},
        {name:'Leg press', reps:'4x15', rest:60},
        {name:'Remo en polea baja', reps:'4x12', rest:60},
      ]},
      { id:'w4d2_gym', name:'Circuito Cardio', emoji:'🔥', exercises:[
        {name:'Remo máquina', reps:'10 min', rest:0},
        {name:'Cinta de correr inclinada', reps:'10 min', rest:0},
        {name:'Elíptica', reps:'10 min', rest:0},
      ]},
      { id:'w4d3_gym', name:'Movilidad Activa', emoji:'🧘', exercises:[
        {name:'Estiramientos cuádriceps', reps:'2 min c/lado', rest:0},
        {name:'Estiramientos pectoral', reps:'2 min', rest:0},
        {name:'Foam roller espalda', reps:'3 min', rest:0},
        {name:'Movilidad hombros', reps:'2 min', rest:0},
      ]},
    ]
  },
  {
    week: 5, name: 'Potencia I', phase: 'Intermedio',
    workouts: [
      { id:'w5d1_gym', name:'Push Intermedio', emoji:'💪', exercises:[
        {name:'Press banca barra', reps:'4x10', rest:75},
        {name:'Press inclinado mancuernas', reps:'3x10', rest:75},
        {name:'Press hombros mancuernas', reps:'4x10', rest:75},
        {name:'Fondos en paralelas', reps:'3x10', rest:60},
      ]},
      { id:'w5d2_gym', name:'Pull + Core', emoji:'🏋️', exercises:[
        {name:'Dominadas asistidas', reps:'4x8', rest:90},
        {name:'Remo con barra', reps:'4x10', rest:75},
        {name:'Curl bíceps barra', reps:'3x12', rest:60},
        {name:'Plancha lateral', reps:'3x30 seg c/lado', rest:45},
      ]},
      { id:'w5d3_gym', name:'Piernas Potencia', emoji:'🦵', exercises:[
        {name:'Sentadilla en multipower', reps:'4x10', rest:90},
        {name:'Peso muerto rumano mancuernas', reps:'3x12', rest:75},
        {name:'Zancada búlgara mancuernas', reps:'3x10 c/lado', rest:75},
        {name:'Press femoral máquina', reps:'3x15', rest:60},
      ]},
    ]
  },
  {
    week: 6, name: 'Volumen I', phase: 'Intermedio',
    workouts: [
      { id:'w6d1_gym', name:'Pecho y Tríceps', emoji:'💥', exercises:[
        {name:'Press banca barra', reps:'4x10', rest:75},
        {name:'Aperturas en polea cruzada', reps:'3x12', rest:60},
        {name:'Press inclinado mancuernas', reps:'3x10', rest:75},
        {name:'Extensión tríceps polea cuerda', reps:'4x12', rest:45},
        {name:'Press francés barra', reps:'3x10', rest:60},
      ]},
      { id:'w6d2_gym', name:'Espalda y Bíceps', emoji:'🔝', exercises:[
        {name:'Dominadas', reps:'4x6', rest:90},
        {name:'Remo con barra', reps:'4x10', rest:75},
        {name:'Remo en polea baja agarre estrecho', reps:'3x12', rest:60},
        {name:'Curl martillo mancuernas', reps:'3x12', rest:45},
        {name:'Curl concentrado mancuernas', reps:'3x10 c/lado', rest:45},
      ]},
      { id:'w6d3_gym', name:'Piernas y Glúteos', emoji:'🍑', exercises:[
        {name:'Sentadilla en multipower', reps:'4x10', rest:90},
        {name:'Peso muerto rumano barra', reps:'4x10', rest:75},
        {name:'Prensa de piernas', reps:'3x15', rest:60},
        {name:'Hip thrust máquina', reps:'4x15', rest:60},
        {name:'Abducción cadera máquina', reps:'3x20', rest:45},
      ]},
    ]
  },
  {
    week: 7, name: 'Intensidad I', phase: 'Intermedio',
    workouts: [
      { id:'w7d1_gym', name:'HIIT Cardio', emoji:'⚡', exercises:[
        {name:'Cinta de correr intervalos', reps:'20 seg rápido / 10 seg caminar x8', rest:0},
        {name:'Remo máquina sprints', reps:'20 seg máx / 10 seg pausa x8', rest:120},
        {name:'Burpees', reps:'3x10', rest:60},
      ]},
      { id:'w7d2_gym', name:'Fuerza Máxima', emoji:'🏋️', exercises:[
        {name:'Press banca barra', reps:'5x5', rest:120},
        {name:'Remo con barra', reps:'5x5', rest:120},
        {name:'Sentadilla en multipower', reps:'5x5', rest:120},
      ]},
      { id:'w7d3_gym', name:'Recuperación Activa', emoji:'🌊', exercises:[
        {name:'Elíptica ritmo bajo', reps:'20 min', rest:0},
        {name:'Estiramientos completos', reps:'10 min', rest:0},
        {name:'Foam roller piernas', reps:'5 min', rest:0},
      ]},
    ]
  },
  {
    week: 8, name: 'Test Intermedio', phase: 'Intermedio',
    workouts: [
      { id:'w8d1_gym', name:'Test Fuerza', emoji:'🎯', exercises:[
        {name:'Press banca RM', reps:'máx peso 1 rep', rest:180},
        {name:'Sentadilla multipower RM', reps:'máx peso 1 rep', rest:180},
        {name:'Dominadas', reps:'máx reps', rest:120},
      ]},
      { id:'w8d2_gym', name:'Test Cardio', emoji:'🏃', exercises:[
        {name:'Remo máquina 2000m', reps:'tiempo máx', rest:0},
        {name:'Cinta de correr 2 km', reps:'tiempo máx', rest:0},
      ]},
      { id:'w8d3_gym', name:'Descanso Activo', emoji:'😴', exercises:[
        {name:'Caminar cinta suave', reps:'20 min', rest:0},
        {name:'Estiramientos globales', reps:'15 min', rest:0},
      ]},
    ]
  },
  {
    week: 9, name: 'Fuerza II', phase: 'Avanzado',
    workouts: [
      { id:'w9d1_gym', name:'Push Avanzado', emoji:'💪', exercises:[
        {name:'Press banca barra', reps:'5x6', rest:120},
        {name:'Press inclinado barra', reps:'4x8', rest:90},
        {name:'Press hombros barra', reps:'4x8', rest:90},
        {name:'Aperturas en polea alta', reps:'3x12', rest:60},
        {name:'Extensión tríceps polea', reps:'4x12', rest:60},
      ]},
      { id:'w9d2_gym', name:'Pull Avanzado', emoji:'🔝', exercises:[
        {name:'Dominadas lastradas', reps:'4x6', rest:120},
        {name:'Remo con barra agarre supino', reps:'4x8', rest:90},
        {name:'Jalón al pecho polea', reps:'3x10', rest:75},
        {name:'Curl bíceps barra', reps:'4x10', rest:60},
        {name:'Face pull polea cuerda', reps:'3x15', rest:45},
      ]},
      { id:'w9d3_gym', name:'Piernas Avanzado', emoji:'🦵', exercises:[
        {name:'Sentadilla barra libre', reps:'5x6', rest:120},
        {name:'Peso muerto convencional', reps:'4x6', rest:120},
        {name:'Zancada búlgara barra', reps:'3x8 c/lado', rest:90},
        {name:'Extensión cuádriceps máquina', reps:'3x15', rest:60},
        {name:'Elevación de talones máquina', reps:'4x20', rest:45},
      ]},
    ]
  },
  {
    week: 10, name: 'Potencia II', phase: 'Avanzado',
    workouts: [
      { id:'w10d1_gym', name:'Explosivo Upper', emoji:'⚡', exercises:[
        {name:'Press banca explosivo', reps:'5x5', rest:120},
        {name:'Remo con barra explosivo', reps:'5x5', rest:120},
        {name:'Press hombros mancuernas explosivo', reps:'4x8', rest:90},
        {name:'Fondos en paralelas lastrados', reps:'3x8', rest:90},
      ]},
      { id:'w10d2_gym', name:'Explosivo Lower', emoji:'💥', exercises:[
        {name:'Sentadilla salto con barra', reps:'5x5', rest:120},
        {name:'Peso muerto convencional', reps:'4x5', rest:120},
        {name:'Step up con mancuernas', reps:'4x10 c/lado', rest:75},
        {name:'Elevación de gemelos máquina', reps:'4x25', rest:45},
      ]},
      { id:'w10d3_gym', name:'Core Atlético', emoji:'🔥', exercises:[
        {name:'Rueda abdominal', reps:'4x10', rest:60},
        {name:'Dragon flag en banco', reps:'3x5', rest:90},
        {name:'Pallof press en polea', reps:'3x12 c/lado', rest:60},
        {name:'Plancha dinámica', reps:'3x45 seg', rest:60},
      ]},
    ]
  },
  {
    week: 11, name: 'Volumen II', phase: 'Avanzado',
    workouts: [
      { id:'w11d1_gym', name:'Pecho y Hombros', emoji:'🏋️', exercises:[
        {name:'Press banca barra', reps:'4x8', rest:90},
        {name:'Press inclinado mancuernas', reps:'4x10', rest:75},
        {name:'Aperturas cable cruzado', reps:'3x12', rest:60},
        {name:'Press militar barra', reps:'4x8', rest:90},
        {name:'Elevaciones laterales mancuernas', reps:'4x15', rest:45},
      ]},
      { id:'w11d2_gym', name:'Espalda y Bíceps', emoji:'💪', exercises:[
        {name:'Dominadas lastradas', reps:'4x6', rest:120},
        {name:'Remo con mancuerna un brazo', reps:'4x10 c/lado', rest:75},
        {name:'Remo en máquina sentado', reps:'3x12', rest:60},
        {name:'Curl bíceps barra', reps:'3x10', rest:60},
        {name:'Curl predicador mancuernas', reps:'3x12', rest:45},
      ]},
      { id:'w11d3_gym', name:'Piernas Volumen', emoji:'🦵', exercises:[
        {name:'Sentadilla barra libre', reps:'5x8', rest:90},
        {name:'Prensa de piernas inclinada', reps:'4x12', rest:75},
        {name:'Zancada búlgara mancuernas', reps:'3x10 c/lado', rest:75},
        {name:'Hip thrust barra', reps:'4x12', rest:75},
        {name:'Curl femoral tumbado', reps:'3x15', rest:60},
      ]},
    ]
  },
  {
    week: 12, name: 'Resistencia II', phase: 'Avanzado',
    workouts: [
      { id:'w12d1_gym', name:'AMRAP 20 min', emoji:'🔥', exercises:[
        {name:'Press banca x8', reps:'AMRAP 20 min', rest:0},
        {name:'Remo con barra x8', reps:'AMRAP 20 min', rest:0},
        {name:'Sentadilla multipower x10', reps:'AMRAP 20 min', rest:0},
      ]},
      { id:'w12d2_gym', name:'Cardio Intenso', emoji:'⚡', exercises:[
        {name:'Remo máquina tabata', reps:'8x20 seg / 10 seg pausa', rest:120},
        {name:'Cinta de correr intervalos', reps:'8x30 seg rápido / 30 seg trote', rest:0},
      ]},
      { id:'w12d3_gym', name:'Movilidad Pro', emoji:'🧘', exercises:[
        {name:'Movilidad cadera con banda', reps:'3 min', rest:0},
        {name:'Estiramiento pectoral en polea', reps:'2 min', rest:0},
        {name:'Foam roller espalda y piernas', reps:'10 min', rest:0},
      ]},
    ]
  },
  {
    week: 13, name: 'Especialización I', phase: 'Élite',
    workouts: [
      { id:'w13d1_gym', name:'Push Élite', emoji:'🌟', exercises:[
        {name:'Press banca barra', reps:'6x4', rest:150},
        {name:'Press inclinado barra', reps:'4x6', rest:120},
        {name:'Press hombros barra', reps:'4x6', rest:120},
        {name:'Fondos lastrados', reps:'4x8', rest:90},
        {name:'Extensión tríceps polea', reps:'3x15', rest:60},
      ]},
      { id:'w13d2_gym', name:'Pull Élite', emoji:'💥', exercises:[
        {name:'Peso muerto convencional', reps:'5x4', rest:180},
        {name:'Dominadas lastradas', reps:'5x5', rest:120},
        {name:'Remo pendlay barra', reps:'4x6', rest:120},
        {name:'Curl bíceps barra', reps:'3x8', rest:75},
      ]},
      { id:'w13d3_gym', name:'Piernas Élite', emoji:'🎯', exercises:[
        {name:'Sentadilla barra baja', reps:'6x4', rest:180},
        {name:'Peso muerto rumano barra', reps:'4x8', rest:120},
        {name:'Leg press alta carga', reps:'4x10', rest:90},
        {name:'Curl femoral nórdico', reps:'3x6', rest:120},
      ]},
    ]
  },
  {
    week: 14, name: 'Fuerza Máxima', phase: 'Élite',
    workouts: [
      { id:'w14d1_gym', name:'Max Push', emoji:'💪', exercises:[
        {name:'Press banca 5x3 pesado', reps:'5x3', rest:180},
        {name:'Press hombros barra', reps:'5x3', rest:180},
        {name:'Press inclinado mancuernas pesado', reps:'4x6', rest:120},
      ]},
      { id:'w14d2_gym', name:'Max Pull', emoji:'🏋️', exercises:[
        {name:'Peso muerto convencional', reps:'5x3', rest:180},
        {name:'Dominadas lastradas', reps:'5x4', rest:150},
        {name:'Remo con barra pesado', reps:'5x5', rest:150},
      ]},
      { id:'w14d3_gym', name:'Max Legs', emoji:'🦵', exercises:[
        {name:'Sentadilla barra', reps:'5x3', rest:180},
        {name:'Sentadilla frontal', reps:'4x5', rest:150},
        {name:'Peso muerto sumo', reps:'4x5', rest:150},
      ]},
    ]
  },
  {
    week: 15, name: 'Potencia III', phase: 'Élite',
    workouts: [
      { id:'w15d1_gym', name:'Pliométrico Upper', emoji:'⚡', exercises:[
        {name:'Press banca explosivo bajo peso', reps:'6x3', rest:120},
        {name:'Remo con barra explosivo', reps:'5x5', rest:120},
        {name:'Fondos en paralelas explosivos', reps:'4x6', rest:90},
      ]},
      { id:'w15d2_gym', name:'Pliométrico Lower', emoji:'💥', exercises:[
        {name:'Sentadilla salto con barra', reps:'5x5', rest:120},
        {name:'Peso muerto explosivo', reps:'5x3', rest:150},
        {name:'Step up salto mancuernas', reps:'4x8 c/lado', rest:90},
      ]},
      { id:'w15d3_gym', name:'Core Élite', emoji:'🔥', exercises:[
        {name:'Dragon flag', reps:'4x5', rest:120},
        {name:'Rueda abdominal completa', reps:'4x12', rest:75},
        {name:'Pallof press pesado', reps:'4x10 c/lado', rest:60},
      ]},
    ]
  },
  {
    week: 16, name: 'Técnicas Avanzadas', phase: 'Élite',
    workouts: [
      { id:'w16d1_gym', name:'Drop Sets Push', emoji:'🤸', exercises:[
        {name:'Press banca drop set x3', reps:'10+8+6 sin descanso', rest:180},
        {name:'Press inclinado drop set x3', reps:'10+8+6 sin descanso', rest:180},
        {name:'Aperturas polea drop set x3', reps:'12+10+8 sin descanso', rest:150},
      ]},
      { id:'w16d2_gym', name:'Superseries Pull', emoji:'🌟', exercises:[
        {name:'Dominadas + Curl bíceps', reps:'6+10 sin descanso x4', rest:120},
        {name:'Remo mancuerna + Jalón polea', reps:'8+12 sin descanso x4', rest:120},
        {name:'Face pull + Curl martillo', reps:'15+12 sin descanso x3', rest:90},
      ]},
      { id:'w16d3_gym', name:'Legs Intensivo', emoji:'💪', exercises:[
        {name:'Sentadilla drop set x3', reps:'8+6+4 sin descanso', rest:180},
        {name:'Leg press superserie extensión', reps:'15+15 sin descanso x4', rest:120},
        {name:'Hip thrust pesado', reps:'5x8', rest:90},
      ]},
    ]
  },
  {
    week: 17, name: 'Resistencia Élite', phase: 'Élite',
    workouts: [
      { id:'w17d1_gym', name:'EMOM 30 min', emoji:'🔥', exercises:[
        {name:'5 press banca cada minuto', reps:'30 min EMOM', rest:0},
        {name:'5 remo con barra cada minuto', reps:'30 min EMOM', rest:0},
        {name:'8 sentadillas cada minuto', reps:'30 min EMOM', rest:0},
      ]},
      { id:'w17d2_gym', name:'Cardio Élite', emoji:'⚡', exercises:[
        {name:'Remo máquina 5km', reps:'tiempo total', rest:0},
        {name:'Cinta de correr 5km', reps:'tiempo total', rest:0},
      ]},
      { id:'w17d3_gym', name:'Movilidad Élite', emoji:'🧘', exercises:[
        {name:'Movilidad completa con banda', reps:'15 min', rest:0},
        {name:'Foam roller completo', reps:'10 min', rest:0},
        {name:'Estiramientos PNF', reps:'10 min', rest:0},
      ]},
    ]
  },
  {
    week: 18, name: 'Peak I', phase: 'Élite',
    workouts: [
      { id:'w18d1_gym', name:'Max Effort Push', emoji:'💪', exercises:[
        {name:'Press banca máximo set', reps:'máx reps al 85%', rest:180},
        {name:'Press hombros máximo set', reps:'máx reps al 85%', rest:180},
        {name:'Fondos lastrados máx', reps:'máx reps', rest:150},
      ]},
      { id:'w18d2_gym', name:'Max Effort Pull', emoji:'🏋️', exercises:[
        {name:'Peso muerto máximo set', reps:'máx reps al 85%', rest:180},
        {name:'Dominadas máx lastradas', reps:'máx reps', rest:150},
        {name:'Remo barra máx', reps:'máx reps al 85%', rest:150},
      ]},
      { id:'w18d3_gym', name:'Max Effort Legs', emoji:'🦵', exercises:[
        {name:'Sentadilla máximo set', reps:'máx reps al 85%', rest:180},
        {name:'Leg press máximo', reps:'máx reps', rest:120},
        {name:'Peso muerto rumano máx', reps:'máx reps', rest:120},
      ]},
    ]
  },
  {
    week: 19, name: 'Peak II', phase: 'Élite',
    workouts: [
      { id:'w19d1_gym', name:'Top Sets', emoji:'🎯', exercises:[
        {name:'Press banca top set', reps:'1x máximo peso posible x3', rest:240},
        {name:'Sentadilla barra top set', reps:'1x máximo peso posible x3', rest:240},
        {name:'Peso muerto top set', reps:'1x máximo peso posible x1', rest:300},
      ]},
      { id:'w19d2_gym', name:'Fuerza-Resistencia', emoji:'🔥', exercises:[
        {name:'50 dominadas total', reps:'en sets', rest:60},
        {name:'100 press banca ligero', reps:'en sets', rest:60},
        {name:'100 remo con barra', reps:'en sets', rest:60},
      ]},
      { id:'w19d3_gym', name:'Preparación Final', emoji:'🌟', exercises:[
        {name:'Activación suave en elíptica', reps:'15 min', rest:0},
        {name:'Estiramientos completos', reps:'10 min', rest:0},
        {name:'Visualización del entreno', reps:'5 min', rest:0},
      ]},
    ]
  },
  {
    week: 20, name: 'Final Test', phase: 'Élite',
    workouts: [
      { id:'w20d1_gym', name:'Test Final Fuerza', emoji:'🏆', exercises:[
        {name:'Press banca 1RM', reps:'1 rep máxima', rest:300},
        {name:'Sentadilla barra 1RM', reps:'1 rep máxima', rest:300},
        {name:'Peso muerto 1RM', reps:'1 rep máxima', rest:300},
      ]},
      { id:'w20d2_gym', name:'Test Final Cardio', emoji:'🎯', exercises:[
        {name:'Remo máquina 2000m', reps:'tiempo récord personal', rest:0},
        {name:'Dominadas máximas', reps:'máx reps', rest:120},
      ]},
      { id:'w20d3_gym', name:'Celebración', emoji:'🎉', exercises:[
        {name:'Entreno favorito libre', reps:'el que quieras', rest:0},
        {name:'Fotos de progreso', reps:'hazlas', rest:0},
        {name:'Descanso merecido', reps:'relájate', rest:0},
      ]},
    ]
  },
];

export const GYM_PHASE_COLORS = {
  'Principiante': '#C8FF00',
  'Intermedio':   '#00E5FF',
  'Avanzado':     '#FF6B35',
  'Élite':        '#A855F7',
};
