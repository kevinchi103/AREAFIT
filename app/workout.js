import { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, Vibration, Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WEEKS, PHASE_COLORS } from '../constants/program';
import { GYM_WEEKS, GYM_PHASE_COLORS } from '../constants/gymProgram';
import { loadState, saveState, loadProfile, saveSession } from '../constants/storage';
import { buildStructuredSession, getWeightHint, PHASE_META } from '../constants/sessionStructure';
import { calcWorkoutXP, syncXPToSupabase, saveWorkoutSession } from '../constants/leagues';
import { useSettings } from '../constants/SettingsContext';
import { getTheme } from '../constants/theme';
import { submitWorkoutFeedback } from '../constants/customWorkouts';
import { checkAndUnlockAchievements } from '../constants/achievements';
import AchievementToast from '../constants/AchievementToast';
import XPToast from '../constants/XPToast';
import StreakToast from '../constants/StreakToast';
import { cancelStreakWarning } from '../constants/pushNotifications';

// ─── Ilustraciones de ejercicios (stick figure con Views) ────────
const EXERCISE_ILLUSTRATIONS = {
  // Movilidad / Estiramientos
  'Rotación hombros':   { icon: '🔄', parts: ['hombros'], pose: 'arms-circle' },
  'Estiramiento':       { icon: '🧘', parts: ['cuerpo'], pose: 'stretch' },
  'Hip flexor':         { icon: '🦵', parts: ['cadera'], pose: 'lunge' },
  'Cat-cow':            { icon: '🐱', parts: ['espalda'], pose: 'cat' },
  'Pigeon pose':        { icon: '🧘', parts: ['cadera'], pose: 'stretch' },
  'Yoga flow':          { icon: '🧘', parts: ['cuerpo'], pose: 'stretch' },
  'Foam roll piernas':  { icon: '🦵', parts: ['piernas'], pose: 'roll' },
  'Respiración':        { icon: '🫁', parts: ['pecho'], pose: 'breathe' },
  'Meditación':         { icon: '🧘', parts: ['mente'], pose: 'sit' },
  'Splits progresión':  { icon: '🤸', parts: ['piernas'], pose: 'split' },
  'Shoulder dislocate': { icon: '🔄', parts: ['hombros'], pose: 'arms-circle' },
  'Pancake stretch':    { icon: '🧘', parts: ['piernas'], pose: 'stretch' },
  'Shoulder bridge':    { icon: '🌉', parts: ['espalda'], pose: 'bridge' },
  'Full body flow':     { icon: '🌊', parts: ['cuerpo'], pose: 'stretch' },
  'Crab walk':          { icon: '🦀', parts: ['cuerpo'], pose: 'crab' },
  'Visualización':      { icon: '🧠', parts: ['mente'], pose: 'sit' },
  'Activación suave':   { icon: '🔥', parts: ['cuerpo'], pose: 'warmup' },

  // Flexiones y push
  'Flexión rodillas':   { icon: '💪', parts: ['pecho', 'tríceps'], pose: 'pushup' },
  'Flexión':            { icon: '💪', parts: ['pecho', 'tríceps'], pose: 'pushup' },
  'Flexión completa':   { icon: '💪', parts: ['pecho', 'tríceps'], pose: 'pushup' },
  'Flexión ancha':      { icon: '💪', parts: ['pecho'], pose: 'pushup-wide' },
  'Flexión diamante':   { icon: '💎', parts: ['tríceps'], pose: 'pushup' },
  'Flexión declinada':  { icon: '💪', parts: ['pecho superior'], pose: 'pushup-decline' },
  'Flexión arquero':    { icon: '🏹', parts: ['pecho'], pose: 'pushup-archer' },
  'Flexión archer':     { icon: '🏹', parts: ['pecho'], pose: 'pushup-archer' },
  'Push-up salto':      { icon: '💥', parts: ['pecho'], pose: 'pushup-explosive' },
  'Push-up palma':      { icon: '👏', parts: ['pecho'], pose: 'pushup-explosive' },
  'Push-up salto manos':{ icon: '👏', parts: ['pecho'], pose: 'pushup-explosive' },
  'Flexión palma':      { icon: '👏', parts: ['pecho'], pose: 'pushup-explosive' },
  'Clapping push-up':   { icon: '👏', parts: ['pecho'], pose: 'pushup-explosive' },
  'Pike push-up':       { icon: '🔺', parts: ['hombros'], pose: 'pike' },
  'Pike push-up elevado': { icon: '🔺', parts: ['hombros'], pose: 'pike' },
  'Pseudo plancha push':{ icon: '💪', parts: ['pecho', 'hombros'], pose: 'planche' },
  'Pseudo planche push':{ icon: '💪', parts: ['pecho', 'hombros'], pose: 'planche' },
  'Flexión 1 brazo asist.': { icon: '💪', parts: ['pecho'], pose: 'pushup' },

  // Fondos / Dips
  'Fondos silla':       { icon: '🪑', parts: ['tríceps'], pose: 'dip' },
  'Fondos estrecho':    { icon: '💪', parts: ['tríceps'], pose: 'dip' },
  'Fondos paralelas':   { icon: '💪', parts: ['pecho', 'tríceps'], pose: 'dip' },
  'Fondos salto':       { icon: '💥', parts: ['tríceps'], pose: 'dip' },
  'Fondos explosivos':  { icon: '💥', parts: ['tríceps'], pose: 'dip' },
  'Dips profundo':      { icon: '💪', parts: ['pecho', 'tríceps'], pose: 'dip' },
  'Extensión tríceps':  { icon: '💪', parts: ['tríceps'], pose: 'extension' },

  // Sentadillas y piernas
  'Sentadilla aire':    { icon: '🦵', parts: ['cuádriceps', 'glúteos'], pose: 'squat' },
  'Sentadilla':         { icon: '🦵', parts: ['cuádriceps', 'glúteos'], pose: 'squat' },
  'Sentadilla rápida':  { icon: '⚡', parts: ['cuádriceps'], pose: 'squat' },
  'Sentadilla salto':   { icon: '🦘', parts: ['cuádriceps', 'explosivo'], pose: 'squat-jump' },
  'Sentadilla búlgara': { icon: '🦵', parts: ['cuádriceps', 'glúteos'], pose: 'bulgarian' },
  'Pistol squat':       { icon: '🎯', parts: ['cuádriceps'], pose: 'pistol' },
  'Pistol squat asist.':{ icon: '🎯', parts: ['cuádriceps'], pose: 'pistol' },
  'Shrimp squat asist.':{ icon: '🦐', parts: ['cuádriceps'], pose: 'shrimp' },
  'Shrimp squat':       { icon: '🦐', parts: ['cuádriceps'], pose: 'shrimp' },
  'Jump squat máx':     { icon: '🦘', parts: ['cuádriceps'], pose: 'squat-jump' },
  'Zancada':            { icon: '🚶', parts: ['cuádriceps', 'glúteos'], pose: 'lunge' },
  'Zancada reversa':    { icon: '🚶', parts: ['cuádriceps', 'glúteos'], pose: 'lunge' },
  'Elevación talones':  { icon: '🦶', parts: ['gemelos'], pose: 'calf' },
  'Box jump':           { icon: '📦', parts: ['piernas'], pose: 'box-jump' },
  'Box jump alt.':      { icon: '📦', parts: ['piernas'], pose: 'box-jump' },
  'Depth jump':         { icon: '📦', parts: ['piernas'], pose: 'box-jump' },
  'Split jump':         { icon: '🦘', parts: ['piernas'], pose: 'squat-jump' },
  'Sprint sitio 10 seg':{ icon: '🏃', parts: ['piernas'], pose: 'run' },
  'Nordic curl':        { icon: '🦵', parts: ['isquiotibiales'], pose: 'nordic' },
  'Nordic curl asist.': { icon: '🦵', parts: ['isquiotibiales'], pose: 'nordic' },
  'Peso muerto rumano': { icon: '🏋️', parts: ['isquiotibiales', 'espalda'], pose: 'deadlift' },

  // Glúteos
  'Puente glúteo':      { icon: '🍑', parts: ['glúteos'], pose: 'bridge' },
  'Glute bridge':       { icon: '🍑', parts: ['glúteos'], pose: 'bridge' },
  'Hip thrust':         { icon: '🍑', parts: ['glúteos'], pose: 'hip-thrust' },
  'Hip thrust cargado': { icon: '🍑', parts: ['glúteos'], pose: 'hip-thrust' },

  // Core
  'Plancha':            { icon: '🧱', parts: ['abdominales'], pose: 'plank' },
  'Plancha lateral':    { icon: '🧱', parts: ['oblicuos'], pose: 'side-plank' },
  'Plancha RKC':        { icon: '🧱', parts: ['abdominales'], pose: 'plank' },
  'Crunch':             { icon: '🔥', parts: ['abdominales'], pose: 'crunch' },
  'Crunch bici':        { icon: '🚲', parts: ['oblicuos'], pose: 'bicycle' },
  'Superman':           { icon: '🦸', parts: ['lumbar'], pose: 'superman' },
  'Dead bug':           { icon: '🪲', parts: ['abdominales'], pose: 'dead-bug' },
  'Dragon flag':        { icon: '🐉', parts: ['abdominales'], pose: 'dragon-flag' },
  'Dragon flag asist.': { icon: '🐉', parts: ['abdominales'], pose: 'dragon-flag' },
  'Hollow hold':        { icon: '🥄', parts: ['abdominales'], pose: 'hollow' },
  'Hollow body rock':   { icon: '🥄', parts: ['abdominales'], pose: 'hollow' },
  'L-sit':              { icon: '🔷', parts: ['abdominales'], pose: 'l-sit' },
  'L-sit asistido':     { icon: '🔷', parts: ['abdominales'], pose: 'l-sit' },

  // Pull / Espalda
  'Remo silla':         { icon: '🪑', parts: ['espalda'], pose: 'row' },
  'Remo invertido':     { icon: '🏋️', parts: ['espalda'], pose: 'row' },
  'Remo TRX':           { icon: '🏋️', parts: ['espalda'], pose: 'row' },
  'Remo frontlever':    { icon: '🏋️', parts: ['espalda'], pose: 'row' },
  'Australian row':     { icon: '🏋️', parts: ['espalda'], pose: 'row' },
  'Pull-up':            { icon: '🔝', parts: ['espalda', 'bíceps'], pose: 'pullup' },
  'Pull-up asistido':   { icon: '🔝', parts: ['espalda', 'bíceps'], pose: 'pullup' },
  'Pull-up lastrado':   { icon: '🔝', parts: ['espalda', 'bíceps'], pose: 'pullup' },
  'L-sit pull-up':      { icon: '🔝', parts: ['espalda', 'core'], pose: 'pullup' },
  'Curl bíceps toalla': { icon: '💪', parts: ['bíceps'], pose: 'curl' },
  'Curl isométrico':    { icon: '💪', parts: ['bíceps'], pose: 'curl' },
  'Face pull toalla':   { icon: '🏋️', parts: ['hombros traseros'], pose: 'face-pull' },
  'Muscle-up asistido': { icon: '🌟', parts: ['espalda', 'pecho'], pose: 'muscle-up' },
  'Muscle-up':          { icon: '🌟', parts: ['espalda', 'pecho'], pose: 'muscle-up' },

  // Skills
  'Front lever tucked': { icon: '🏋️', parts: ['espalda', 'core'], pose: 'front-lever' },
  'Tuck front lever':   { icon: '🏋️', parts: ['espalda', 'core'], pose: 'front-lever' },
  'One leg front lever':{ icon: '🏋️', parts: ['espalda', 'core'], pose: 'front-lever' },
  'Front lever':        { icon: '🏋️', parts: ['espalda', 'core'], pose: 'front-lever' },
  'Planche lean':       { icon: '🤸', parts: ['hombros', 'core'], pose: 'planche' },
  'Planche lean hold':  { icon: '🤸', parts: ['hombros', 'core'], pose: 'planche' },
  'Tuck planche':       { icon: '🤸', parts: ['hombros', 'core'], pose: 'planche' },
  'Handstand wall':     { icon: '🤸', parts: ['hombros'], pose: 'handstand' },
  'Handstand kick-up':  { icon: '🤸', parts: ['hombros'], pose: 'handstand' },
  'Handstand wall hold':{ icon: '🤸', parts: ['hombros'], pose: 'handstand' },
  'Handstand libre':    { icon: '🤸', parts: ['hombros'], pose: 'handstand' },
  'Handstand hold':     { icon: '🤸', parts: ['hombros'], pose: 'handstand' },
  'Bridge push-up':     { icon: '🌉', parts: ['espalda', 'hombros'], pose: 'bridge' },

  // Cardio / HIIT
  'Marcha sitio':       { icon: '🚶', parts: ['piernas'], pose: 'march' },
  'Trote sitio':        { icon: '🏃', parts: ['piernas', 'cardio'], pose: 'run' },
  'Jumping jack lento': { icon: '⭐', parts: ['cuerpo'], pose: 'jumping-jack' },
  'Jumping jack':       { icon: '⭐', parts: ['cuerpo'], pose: 'jumping-jack' },
  'Salto tijera':       { icon: '✂️', parts: ['piernas'], pose: 'jumping-jack' },
  'Burpee':             { icon: '🔥', parts: ['cuerpo completo'], pose: 'burpee' },
  'Burpee modificado':  { icon: '🔥', parts: ['cuerpo completo'], pose: 'burpee' },
  'Montañero lento':    { icon: '⛰️', parts: ['core', 'cardio'], pose: 'mountain' },
  'Montañero':          { icon: '⛰️', parts: ['core', 'cardio'], pose: 'mountain' },
  'Salto cuerda aire':  { icon: '🪢', parts: ['cardio'], pose: 'jump-rope' },
  'Caminar':            { icon: '🚶', parts: ['cardio'], pose: 'walk' },

  // Tests / Máximos
  'Flexión máx 1 min':  { icon: '💪', parts: ['pecho'], pose: 'pushup' },
  'Sentadilla máx 1 min':{ icon: '🦵', parts: ['piernas'], pose: 'squat' },
  'Plancha máx':        { icon: '🧱', parts: ['core'], pose: 'plank' },
  'Burpee 3 min':       { icon: '🔥', parts: ['cuerpo'], pose: 'burpee' },
  'Montañero 1 min':    { icon: '⛰️', parts: ['core'], pose: 'mountain' },
};

const DEFAULT_ILLUSTRATION = { icon: '🏋️', parts: ['cuerpo'], pose: 'generic' };

// ─── Stick figure component ─────────────────────────────────────
function StickFigure({ pose, color, size = 120 }) {
  const s = size;
  const headSize = s * 0.18;
  const bodyLen = s * 0.3;
  const limbLen = s * 0.22;
  const thick = 3;
  const c = color;

  const figures = {
    'pushup': (
      <View style={[figStyles.wrap, { width: s, height: s * 0.6 }]}>
        {/* Cuerpo horizontal - pushup position */}
        <View style={{ position: 'absolute', top: s * 0.12, left: s * 0.15 }}>
          <View style={{ width: headSize, height: headSize, borderRadius: headSize / 2, borderWidth: thick, borderColor: c, position: 'absolute', left: 0, top: 0 }} />
          <View style={{ width: s * 0.5, height: thick, backgroundColor: c, position: 'absolute', left: headSize, top: headSize / 2 }} />
          {/* Brazos abajo */}
          <View style={{ width: thick, height: limbLen * 0.8, backgroundColor: c, position: 'absolute', left: headSize + 4, top: headSize / 2, transform: [{ rotate: '10deg' }] }} />
          <View style={{ width: thick, height: limbLen * 0.8, backgroundColor: c, position: 'absolute', left: headSize + s * 0.2, top: headSize / 2, transform: [{ rotate: '10deg' }] }} />
          {/* Piernas */}
          <View style={{ width: thick, height: limbLen, backgroundColor: c, position: 'absolute', left: headSize + s * 0.45, top: headSize / 2, transform: [{ rotate: '10deg' }] }} />
        </View>
      </View>
    ),
    'squat': (
      <View style={[figStyles.wrap, { width: s, height: s * 0.8 }]}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: headSize, height: headSize, borderRadius: headSize / 2, borderWidth: thick, borderColor: c }} />
          <View style={{ width: thick, height: bodyLen * 0.7, backgroundColor: c }} />
          {/* Brazos al frente */}
          <View style={{ width: limbLen * 1.5, height: thick, backgroundColor: c, position: 'absolute', top: headSize + bodyLen * 0.2, left: s * 0.5 - limbLen * 0.75 }} />
          {/* Piernas dobladas */}
          <View style={{ flexDirection: 'row', gap: s * 0.12 }}>
            <View style={{ width: thick, height: limbLen * 0.7, backgroundColor: c, transform: [{ rotate: '-30deg' }] }} />
            <View style={{ width: thick, height: limbLen * 0.7, backgroundColor: c, transform: [{ rotate: '30deg' }] }} />
          </View>
          <View style={{ flexDirection: 'row', gap: s * 0.06 }}>
            <View style={{ width: thick, height: limbLen * 0.7, backgroundColor: c, transform: [{ rotate: '30deg' }] }} />
            <View style={{ width: thick, height: limbLen * 0.7, backgroundColor: c, transform: [{ rotate: '-30deg' }] }} />
          </View>
        </View>
      </View>
    ),
    'plank': (
      <View style={[figStyles.wrap, { width: s, height: s * 0.5 }]}>
        <View style={{ position: 'absolute', top: s * 0.15, left: s * 0.1 }}>
          <View style={{ width: headSize, height: headSize, borderRadius: headSize / 2, borderWidth: thick, borderColor: c, position: 'absolute', left: 0, top: 0 }} />
          <View style={{ width: s * 0.6, height: thick, backgroundColor: c, position: 'absolute', left: headSize, top: headSize / 2 }} />
          <View style={{ width: thick, height: limbLen * 0.6, backgroundColor: c, position: 'absolute', left: headSize + 4, top: headSize / 2 }} />
          <View style={{ width: thick, height: limbLen * 0.6, backgroundColor: c, position: 'absolute', left: headSize + s * 0.55, top: headSize / 2 }} />
        </View>
      </View>
    ),
    'lunge': (
      <View style={[figStyles.wrap, { width: s, height: s * 0.85 }]}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: headSize, height: headSize, borderRadius: headSize / 2, borderWidth: thick, borderColor: c }} />
          <View style={{ width: thick, height: bodyLen, backgroundColor: c }} />
          {/* Pierna delantera */}
          <View style={{ flexDirection: 'row', gap: s * 0.08 }}>
            <View style={{ width: thick, height: limbLen, backgroundColor: c, transform: [{ rotate: '-25deg' }] }} />
            <View style={{ width: thick, height: limbLen, backgroundColor: c, transform: [{ rotate: '25deg' }] }} />
          </View>
        </View>
      </View>
    ),
    'pullup': (
      <View style={[figStyles.wrap, { width: s, height: s * 0.9 }]}>
        <View style={{ alignItems: 'center' }}>
          {/* Barra */}
          <View style={{ width: s * 0.6, height: thick + 1, backgroundColor: c, marginBottom: 4, borderRadius: 2 }} />
          {/* Brazos arriba */}
          <View style={{ flexDirection: 'row', gap: s * 0.2 }}>
            <View style={{ width: thick, height: limbLen * 0.5, backgroundColor: c }} />
            <View style={{ width: thick, height: limbLen * 0.5, backgroundColor: c }} />
          </View>
          <View style={{ width: headSize, height: headSize, borderRadius: headSize / 2, borderWidth: thick, borderColor: c }} />
          <View style={{ width: thick, height: bodyLen, backgroundColor: c }} />
          <View style={{ flexDirection: 'row', gap: s * 0.08 }}>
            <View style={{ width: thick, height: limbLen, backgroundColor: c, transform: [{ rotate: '-10deg' }] }} />
            <View style={{ width: thick, height: limbLen, backgroundColor: c, transform: [{ rotate: '10deg' }] }} />
          </View>
        </View>
      </View>
    ),
    'bridge': (
      <View style={[figStyles.wrap, { width: s, height: s * 0.45 }]}>
        <View style={{ position: 'absolute', top: s * 0.05, left: s * 0.15 }}>
          {/* Arco del puente */}
          <View style={{ width: s * 0.55, height: s * 0.2, borderTopLeftRadius: s * 0.3, borderTopRightRadius: s * 0.3, borderWidth: thick, borderColor: c, borderBottomWidth: 0 }} />
          {/* Pies y manos */}
          <View style={{ width: thick, height: limbLen * 0.4, backgroundColor: c, position: 'absolute', left: 0, top: s * 0.18 }} />
          <View style={{ width: thick, height: limbLen * 0.4, backgroundColor: c, position: 'absolute', right: s * 0.15, top: s * 0.18 }} />
        </View>
      </View>
    ),
    'burpee': (
      <View style={[figStyles.wrap, { width: s, height: s * 0.85 }]}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: headSize, height: headSize, borderRadius: headSize / 2, borderWidth: thick, borderColor: c }} />
          <View style={{ width: thick, height: bodyLen * 0.8, backgroundColor: c }} />
          {/* Brazos arriba */}
          <View style={{ flexDirection: 'row', gap: s * 0.25, position: 'absolute', top: headSize }}>
            <View style={{ width: thick, height: limbLen, backgroundColor: c, transform: [{ rotate: '-35deg' }] }} />
            <View style={{ width: thick, height: limbLen, backgroundColor: c, transform: [{ rotate: '35deg' }] }} />
          </View>
          <View style={{ flexDirection: 'row', gap: s * 0.1 }}>
            <View style={{ width: thick, height: limbLen, backgroundColor: c, transform: [{ rotate: '-8deg' }] }} />
            <View style={{ width: thick, height: limbLen, backgroundColor: c, transform: [{ rotate: '8deg' }] }} />
          </View>
        </View>
      </View>
    ),
    'handstand': (
      <View style={[figStyles.wrap, { width: s, height: s * 0.9 }]}>
        <View style={{ alignItems: 'center' }}>
          {/* Piernas arriba */}
          <View style={{ flexDirection: 'row', gap: s * 0.08 }}>
            <View style={{ width: thick, height: limbLen, backgroundColor: c, transform: [{ rotate: '-5deg' }] }} />
            <View style={{ width: thick, height: limbLen, backgroundColor: c, transform: [{ rotate: '5deg' }] }} />
          </View>
          <View style={{ width: thick, height: bodyLen, backgroundColor: c }} />
          <View style={{ width: headSize, height: headSize, borderRadius: headSize / 2, borderWidth: thick, borderColor: c }} />
          {/* Brazos abajo */}
          <View style={{ flexDirection: 'row', gap: s * 0.15 }}>
            <View style={{ width: thick, height: limbLen * 0.5, backgroundColor: c }} />
            <View style={{ width: thick, height: limbLen * 0.5, backgroundColor: c }} />
          </View>
          {/* Suelo */}
          <View style={{ width: s * 0.4, height: thick, backgroundColor: c + '40', marginTop: 2 }} />
        </View>
      </View>
    ),
  };

  // Figura genérica de pie
  const generic = (
    <View style={[figStyles.wrap, { width: s, height: s * 0.85 }]}>
      <View style={{ alignItems: 'center' }}>
        <View style={{ width: headSize, height: headSize, borderRadius: headSize / 2, borderWidth: thick, borderColor: c }} />
        <View style={{ width: thick, height: bodyLen, backgroundColor: c }} />
        <View style={{ flexDirection: 'row', gap: s * 0.18, position: 'absolute', top: headSize + bodyLen * 0.15 }}>
          <View style={{ width: thick, height: limbLen * 0.8, backgroundColor: c, transform: [{ rotate: '-30deg' }] }} />
          <View style={{ width: thick, height: limbLen * 0.8, backgroundColor: c, transform: [{ rotate: '30deg' }] }} />
        </View>
        <View style={{ flexDirection: 'row', gap: s * 0.1 }}>
          <View style={{ width: thick, height: limbLen, backgroundColor: c, transform: [{ rotate: '-8deg' }] }} />
          <View style={{ width: thick, height: limbLen, backgroundColor: c, transform: [{ rotate: '8deg' }] }} />
        </View>
      </View>
    </View>
  );

  // Mapear poses similares a las figuras disponibles
  const poseMap = {
    'pushup': 'pushup', 'pushup-wide': 'pushup', 'pushup-decline': 'pushup',
    'pushup-archer': 'pushup', 'pushup-explosive': 'pushup',
    'squat': 'squat', 'squat-jump': 'squat', 'bulgarian': 'squat',
    'pistol': 'squat', 'shrimp': 'squat',
    'plank': 'plank', 'side-plank': 'plank', 'hollow': 'plank',
    'dragon-flag': 'plank', 'l-sit': 'plank',
    'lunge': 'lunge', 'calf': 'lunge',
    'pullup': 'pullup', 'muscle-up': 'pullup', 'row': 'pullup',
    'front-lever': 'pullup',
    'bridge': 'bridge', 'hip-thrust': 'bridge',
    'burpee': 'burpee', 'jumping-jack': 'burpee', 'mountain': 'burpee',
    'run': 'burpee', 'march': 'lunge', 'walk': 'lunge',
    'handstand': 'handstand', 'planche': 'handstand',
    'dip': 'pullup', 'curl': 'pullup', 'face-pull': 'pullup',
    'pike': 'handstand',
    'stretch': 'lunge', 'sit': 'squat', 'breathe': 'squat',
    'arms-circle': 'burpee', 'cat': 'bridge', 'roll': 'plank',
    'warmup': 'burpee', 'dead-bug': 'plank', 'crunch': 'plank',
    'bicycle': 'plank', 'superman': 'plank', 'extension': 'pullup',
    'deadlift': 'lunge', 'nordic': 'lunge', 'crab': 'bridge',
    'box-jump': 'squat', 'split': 'lunge', 'jump-rope': 'burpee',
    'generic': null,
  };

  const mappedPose = poseMap[pose];
  return figures[mappedPose] || generic;
}

const figStyles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});

// ─── Parsear duración del ejercicio en segundos ──────────────────
function parseExerciseDuration(reps) {
  if (!reps) return null;
  const r = reps.toLowerCase().trim();

  // "máx", "AMRAP", "el que quieras", etc → sin timer
  if (r.includes('máx') || r.includes('amrap') || r.includes('quieras') ||
      r.includes('hazlas') || r.includes('relájate') || r.includes('intentos') ||
      r.includes('en sets')) return null;

  // "X min" → X * 60
  const minMatch = r.match(/(\d+)\s*min/);
  if (minMatch) return parseInt(minMatch[1]) * 60;

  // "X seg" → X
  const segMatch = r.match(/(\d+)\s*seg/);
  if (segMatch) {
    // "20 seg x4" → 20 * 4
    const xMatch = r.match(/x(\d+)/);
    if (xMatch) return parseInt(segMatch[1]) * parseInt(xMatch[1]);
    return parseInt(segMatch[1]);
  }

  // "8 rondas" → 8 * 25 (Tabata style)
  const rondasMatch = r.match(/(\d+)\s*rondas/);
  if (rondasMatch) return parseInt(rondasMatch[1]) * 30;

  // Plain number "10", "15" → estimate 3s per rep
  const numMatch = r.match(/^(\d+)$/);
  if (numMatch) return parseInt(numMatch[1]) * 3;

  // "10 c/lado" → 10 * 2 sides * 3s
  const ladoMatch = r.match(/(\d+)\s*c\/lado/);
  if (ladoMatch) return parseInt(ladoMatch[1]) * 2 * 3;

  return null;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}:${s.toString().padStart(2, '0')}`;
  return `${s}`;
}

// Auto-detecta qué modo usar según la descripción de reps
function detectMode(repsStr) {
  if (!repsStr) return 'manual';
  const r = repsStr.toLowerCase().trim();
  if (r.includes('máx') || r.includes('amrap') || r.includes('quieras') ||
      r.includes('hazlas') || r.includes('relájate') || r.includes('intentos') ||
      r.includes('en sets') || r.includes('tiempo') || r.includes('total') ||
      r.includes('libre')) return 'manual';
  if (/\d+\s*(seg|min|s\b)/.test(r) || r.includes('rondas')) return 'timer';
  return 'reps';
}

// Extrae el número objetivo de reps de una cadena como "3x12", "15 reps", "10 c/lado"
function parseRepTarget(repsStr) {
  if (!repsStr) return null;
  const r = repsStr.toLowerCase().trim();
  const setReps = r.match(/\d+x(\d+)/);
  if (setReps) return parseInt(setReps[1]);
  const plain = r.match(/^(\d+)/);
  if (plain) return parseInt(plain[1]);
  return null;
}

// ─── Componente principal ────────────────────────────────────────
export default function WorkoutScreen() {
  const router = useRouter();
  const { t, isDark, settings } = useSettings();
  const theme = getTheme(isDark);
  const params = useLocalSearchParams();

  // Support both program workouts (id+week) and custom workouts (customId+customData)
  const isCustom = !!params.customId;
  let workout = null;
  let xpMultiplier = 1;
  let assignmentNotes = params.assignmentNotes || '';

  if (isCustom) {
    try {
      const cw = JSON.parse(params.customData);
      xpMultiplier = cw.xp_multiplier || 1;
      workout = {
        id: cw.id,
        name: cw.name,
        emoji: '📋',
        exercises: (cw.exercises || []).map(ex => ({
          name: ex.name,
          reps: ex.reps || `${ex.sets || 3} series`,
          rest: ex.rest_seconds || 60,
        })),
      };
    } catch {}
  } else {
    const weekIndex = parseInt(params.week) || 0;
    // Detect gym workouts by id suffix
    const isGymWorkout = params.id?.endsWith('_gym');
    const programWeeks = isGymWorkout ? GYM_WEEKS : WEEKS;
    const weekData = programWeeks[Math.min(weekIndex, programWeeks.length - 1)];
    workout = weekData?.workouts.find(w => w.id === params.id);
  }

  const [currentEx, setCurrentEx] = useState(0);
  const [completedExs, setCompletedExs] = useState([]);
  const [resting, setResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(3);
  const [feedbackEnergy, setFeedbackEnergy] = useState(3);
  const [unlockedAchievement, setUnlockedAchievement] = useState(null);
  const [showXPToast, setShowXPToast] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [showStreakToast, setShowStreakToast] = useState(false);
  const [newStreak, setNewStreak] = useState(0);
  const [trainingEnv, setTrainingEnv] = useState('home');
  const [strengthData, setStrengthData] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [structuredWorkout, setStructuredWorkout] = useState(null);

  // ── Modos de ejecución ──
  const [execMode, setExecMode] = useState('reps'); // 'reps' | 'manual' | 'timer'
  const [repCount, setRepCount] = useState(0);
  const [repTarget, setRepTarget] = useState(null);
  const [manualElapsed, setManualElapsed] = useState(0);
  const [manualRunning, setManualRunning] = useState(false);
  const manualInterval = useRef(null);

  // Exercise timer
  const [exerciseTime, setExerciseTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const restInterval = useRef(null);
  const exerciseInterval = useRef(null);
  const workoutStartTime = useRef(Date.now());
  const [sessionDuration, setSessionDuration] = useState(0); // segundos
  const [postFeedbackRating, setPostFeedbackRating] = useState(0); // 1-5 estrellas
  const [postFeedbackEnergy, setPostFeedbackEnergy] = useState(0);

  const weekData = !isCustom ? WEEKS[Math.min(parseInt(params.week) || 0, WEEKS.length - 1)] : null;
  const phaseColor = weekData ? (PHASE_COLORS[weekData.phase] || theme.accent) : theme.accent;

  // Cargar entorno y datos de fuerza, luego construir sesión estructurada
  useEffect(() => {
    if (!workout) return;
    Promise.all([loadState(), loadProfile()]).then(([st, prof]) => {
      const env = st?.trainingEnvironment || 'home';
      setTrainingEnv(env);
      setStrengthData({ benchPress: prof?.benchPress, squat: prof?.squat });
      setStructuredWorkout(buildStructuredSession(workout, env));
      setSessionReady(true);
    });
  }, []);

  // Animacion de progreso
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: completedExs.length / (workout?.exercises.length || 1),
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [completedExs.length]);

  // Reset al cambiar de ejercicio
  useEffect(() => {
    clearInterval(exerciseInterval.current);
    clearInterval(manualInterval.current);
    const ex = (structuredWorkout || workout)?.exercises[currentEx];
    const duration = parseExerciseDuration(ex?.reps);
    setExerciseTime(duration || 0);
    setTimerRunning(false);
    setTimerStarted(false);
    // Reset modos
    const mode = detectMode(ex?.reps);
    setExecMode(mode);
    setRepCount(0);
    setRepTarget(parseRepTarget(ex?.reps));
    setManualElapsed(0);
    setManualRunning(false);
  }, [currentEx, sessionReady]);

  // Exercise countdown
  useEffect(() => {
    if (timerRunning && exerciseTime > 0) {
      exerciseInterval.current = setInterval(() => {
        setExerciseTime(t => {
          if (t <= 1) {
            clearInterval(exerciseInterval.current);
            setTimerRunning(false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(exerciseInterval.current);
  }, [timerRunning]);

  // Temporizador de descanso
  useEffect(() => {
    if (resting && restTime > 0) {
      restInterval.current = setInterval(() => {
        setRestTime(t => {
          if (t <= 1) {
            clearInterval(restInterval.current);
            setResting(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(restInterval.current);
  }, [resting, restTime]);

  // Cronómetro modo manual (cuenta hacia arriba)
  useEffect(() => {
    if (manualRunning) {
      manualInterval.current = setInterval(() => {
        setManualElapsed(t => t + 1);
      }, 1000);
    } else {
      clearInterval(manualInterval.current);
    }
    return () => clearInterval(manualInterval.current);
  }, [manualRunning]);

  if (!workout) {
    return (
      <SafeAreaView style={[st.safe, { backgroundColor: theme.bg }]}>
        <View style={st.center}>
          <Text style={[st.errorText, { color: theme.gray }]}>{t('workout.notFound')}</Text>
          <TouchableOpacity style={[st.backBtn, { backgroundColor: theme.bgCard }]} onPress={() => router.back()}>
            <Text style={[st.backBtnText, { color: theme.white }]}>{t('workout.back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!sessionReady || !structuredWorkout) {
    return (
      <SafeAreaView style={[st.safe, { backgroundColor: theme.bg }]}>
        <View style={st.center}>
          <Text style={[st.errorText, { color: theme.gray }]}>Preparando sesión...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const activeWorkout = structuredWorkout;
  const exercises = activeWorkout.exercises;
  const exercise = exercises[currentEx];
  const illustration = EXERCISE_ILLUSTRATIONS[exercise.name] || DEFAULT_ILLUSTRATION;
  const duration = parseExerciseDuration(exercise.reps);
  const hasDuration = duration !== null && duration > 0;

  const handleStartTimer = () => {
    if (!timerStarted) {
      setExerciseTime(duration);
      setTimerStarted(true);
    }
    setTimerRunning(true);
  };

  const handlePauseTimer = () => {
    clearInterval(exerciseInterval.current);
    setTimerRunning(false);
  };

  const handleRepTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = repCount + 1;
    setRepCount(next);
    if (repTarget && next >= repTarget) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleCompleteExercise = () => {
    setManualRunning(false);
    clearInterval(manualInterval.current);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    clearInterval(exerciseInterval.current);
    setTimerRunning(false);

    const newCompleted = [...completedExs, currentEx];
    setCompletedExs(newCompleted);

    if (newCompleted.length >= exercises.length) {
      setSessionDuration(Math.round((Date.now() - workoutStartTime.current) / 1000));
      setFinished(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      const rest = exercise.rest || 0;
      if (rest > 0) {
        setResting(true);
        setRestTime(rest);
      }
      const next = currentEx + 1 < exercises.length ? currentEx + 1 : 0;
      setCurrentEx(next);
    }
  };

  const handleSkipRest = () => {
    clearInterval(restInterval.current);
    setResting(false);
    setRestTime(0);
  };

  const handleFinishWorkout = async () => {
    const state = await loadState();
    const today = new Date().toDateString();
    const workoutId = isCustom ? `custom_${params.customId}` : params.id;
    const dayKey = `${workoutId}_${today}`;

    if (!state.completedDays?.includes(dayKey)) {
      const baseXP = calcWorkoutXP(state.streak || 0);
      const xpEarned = Math.round(baseXP * xpMultiplier);
      const newState = {
        ...state,
        completedDays: [...(state.completedDays || []), dayKey],
        xp: (state.xp || 0) + xpEarned,
        weeklyXP: (state.weeklyXP || 0) + xpEarned,
        streak: (state.streak || 0) + 1,
        lastTrainDate: today,
      };
      await saveState(newState);
      setEarnedXP(xpEarned);
      setShowXPToast(true);
      setNewStreak(newState.streak);
      setShowStreakToast(true);

      // Guardar sesión en historial
      await saveSession({
        id: Date.now(),
        date: new Date().toLocaleDateString('es-ES'),
        dateStr: today,
        workoutId,
        workoutName: activeWorkout?.name || '',
        workoutEmoji: activeWorkout?.emoji || '💪',
        duration: sessionDuration,
        exercisesDone: exercises.length,
        xpEarned,
        streak: newState.streak,
        rating: postFeedbackRating || 3,
        energy: postFeedbackEnergy || 3,
        environment: trainingEnv,
      });

      saveWorkoutSession(workoutId, xpEarned, state.currentWeek);
      syncXPToSupabase(xpEarned);
      cancelStreakWarning(); // workout done — dismiss streak warning

      if (isCustom) {
        submitWorkoutFeedback({
          workoutId: params.customId,
          difficultyRating: postFeedbackRating || feedbackRating,
          energyLevel: postFeedbackEnergy || feedbackEnergy,
        });
      }

      const newAchievements = await checkAndUnlockAchievements(newState);
      if (newAchievements.length > 0) {
        setUnlockedAchievement(newAchievements[0]);
        setTimeout(() => router.back(), 4000);
        return;
      }
    }
    router.back();
  };

  // ── Pantalla de completado ──
  if (finished) {
    const mins = Math.floor(sessionDuration / 60);
    const secs = sessionDuration % 60;
    const durationStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    const feedbackDone = postFeedbackRating > 0 && postFeedbackEnergy > 0;

    return (
      <SafeAreaView style={[st.safe, { backgroundColor: theme.bg }]}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={{ alignItems: 'center', marginBottom: 28, marginTop: 12 }}>
            <Text style={{ fontSize: 64, marginBottom: 8 }}>🎉</Text>
            <Text style={[st.finishTitle, { color: theme.white }]}>¡Entreno completado!</Text>
            <Text style={[st.finishSub, { color: theme.gray }]}>{activeWorkout.emoji} {activeWorkout.name}</Text>
          </View>

          {/* Stats grid */}
          <View style={st.summaryGrid}>
            <View style={[st.summaryCell, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
              <Text style={st.summaryCellIcon}>⏱</Text>
              <Text style={[st.summaryCellVal, { color: theme.white }]}>{durationStr}</Text>
              <Text style={[st.summaryCellLbl, { color: theme.gray }]}>Duración</Text>
            </View>
            <View style={[st.summaryCell, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
              <Text style={st.summaryCellIcon}>💪</Text>
              <Text style={[st.summaryCellVal, { color: theme.white }]}>{exercises.length}</Text>
              <Text style={[st.summaryCellLbl, { color: theme.gray }]}>Ejercicios</Text>
            </View>
            <View style={[st.summaryCell, { backgroundColor: phaseColor + '18', borderColor: phaseColor + '50' }]}>
              <Text style={st.summaryCellIcon}>⚡</Text>
              <Text style={[st.summaryCellVal, { color: phaseColor }]}>+{earnedXP || '—'}</Text>
              <Text style={[st.summaryCellLbl, { color: theme.gray }]}>XP</Text>
            </View>
            <View style={[st.summaryCell, { backgroundColor: '#FF950018', borderColor: '#FF950050' }]}>
              <Text style={st.summaryCellIcon}>🔥</Text>
              <Text style={[st.summaryCellVal, { color: '#FF9500' }]}>{newStreak || '—'}</Text>
              <Text style={[st.summaryCellLbl, { color: theme.gray }]}>Racha</Text>
            </View>
          </View>

          {/* Feedback */}
          <View style={[st.feedbackCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <Text style={[st.feedbackTitle, { color: theme.white }]}>¿Cómo ha ido?</Text>

            <Text style={[st.feedbackLabel, { color: theme.gray }]}>DIFICULTAD</Text>
            <View style={st.starsRow}>
              {[1,2,3,4,5].map(n => (
                <TouchableOpacity key={n} onPress={() => setPostFeedbackRating(n)}
                  style={[st.starBtn, {
                    backgroundColor: postFeedbackRating >= n ? phaseColor + '30' : theme.bgLight,
                    borderColor: postFeedbackRating >= n ? phaseColor : 'transparent',
                  }]}>
                  <Text style={{ fontSize: 20 }}>{postFeedbackRating >= n ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[st.feedbackLabel, { color: theme.gray, marginTop: 14 }]}>ENERGÍA</Text>
            <View style={st.starsRow}>
              {[1,2,3,4,5].map(n => (
                <TouchableOpacity key={n} onPress={() => setPostFeedbackEnergy(n)}
                  style={[st.starBtn, {
                    backgroundColor: postFeedbackEnergy >= n ? '#FF950030' : theme.bgLight,
                    borderColor: postFeedbackEnergy >= n ? '#FF9500' : 'transparent',
                  }]}>
                  <Text style={{ fontSize: 20 }}>{postFeedbackEnergy >= n ? '⚡' : '·'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[st.finishBtn, { backgroundColor: feedbackDone ? phaseColor : theme.border, marginTop: 8 }]}
            onPress={handleFinishWorkout}
          >
            <Text style={[st.finishBtnText, { color: feedbackDone ? (isDark ? '#000' : '#fff') : theme.gray }]}>
              {feedbackDone ? 'Guardar y salir →' : 'Valorar para continuar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleFinishWorkout} style={{ alignItems: 'center', paddingVertical: 12 }}>
            <Text style={{ color: theme.gray, fontSize: 12 }}>Saltar valoración</Text>
          </TouchableOpacity>
        </ScrollView>

        <XPToast xp={earnedXP} visible={showXPToast} theme={theme} onDone={() => setShowXPToast(false)} />
        <StreakToast streak={newStreak} visible={showStreakToast} theme={theme} onDone={() => setShowStreakToast(false)} />
        <AchievementToast
          achievement={unlockedAchievement}
          lang={settings?.lang || 'es'}
          theme={theme}
          onDone={() => setUnlockedAchievement(null)}
        />
      </SafeAreaView>
    );
  }

  // ── Pantalla de descanso ──
  if (resting) {
    const nextEx = exercises[currentEx];
    const nextIllustration = nextEx ? (EXERCISE_ILLUSTRATIONS[nextEx.name] || DEFAULT_ILLUSTRATION) : DEFAULT_ILLUSTRATION;
    return (
      <SafeAreaView style={[st.safe, { backgroundColor: theme.bg }]}>
        <View style={st.center}>
          <Text style={[st.restLabel, { color: theme.gray }]}>{t('workout.restLabel')}</Text>
          <Text style={[st.restTimer, { color: theme.white }]}>{restTime}s</Text>

          <View style={[st.restNextCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <Text style={[st.restNextLabel, { color: theme.gray }]}>{t('workout.nextUp')}</Text>
            <View style={st.restNextIllustration}>
              <StickFigure pose={nextIllustration.pose} color={phaseColor + '80'} size={80} />
            </View>
            <Text style={st.restNextName}>{nextEx?.name}</Text>
            <Text style={st.restNextReps}>{nextEx?.reps}</Text>
          </View>

          <TouchableOpacity style={st.skipBtn} onPress={handleSkipRest}>
            <Text style={[st.skipBtnText, { color: phaseColor }]}>{t('workout.skipRest')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Pantalla principal del ejercicio ──
  return (
    <SafeAreaView style={[st.safe, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[st.headerBack, { color: theme.gray }]}>✕</Text>
        </TouchableOpacity>
        <View style={st.headerCenter}>
          <Text style={st.headerTitle}>{activeWorkout.emoji} {activeWorkout.name}</Text>
          <Text style={st.headerSub}>{completedExs.length} / {exercises.length} ejercicios</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      {/* Barra de progreso */}
      <View style={st.progressTrack}>
        <Animated.View style={[st.progressFill, {
          backgroundColor: phaseColor,
          width: progressAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          }),
        }]} />
      </View>

      <ScrollView contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>
        {/* Ejercicio actual */}
        <View style={st.exerciseCard}>
          {/* Badge de fase */}
          {(() => {
            const ph = exercise.phase || 'Principal';
            const meta = PHASE_META[ph] || PHASE_META['Principal'];
            const color = meta.color || phaseColor;
            return (
              <View style={[st.phaseBadge, { backgroundColor: color + '20', borderColor: color + '50' }]}>
                <Text style={[st.phaseBadgeText, { color }]}>{meta.icon} {ph.toUpperCase()}</Text>
              </View>
            );
          })()}

          <Text style={[st.exerciseNum, { color: theme.gray }]}>{t('workout.exerciseOf')} {currentEx + 1} {t('workout.of')} {exercises.length}</Text>

          {/* Ilustracion */}
          <View style={st.illustrationWrap}>
            <StickFigure pose={illustration.pose} color={phaseColor} size={120} />
          </View>

          {/* Musculos implicados */}
          <View style={st.musclesRow}>
            {illustration.parts.map((part, i) => (
              <View key={i} style={[st.musclePill, { borderColor: phaseColor + '50' }]}>
                <Text style={[st.muscleText, { color: phaseColor }]}>{part}</Text>
              </View>
            ))}
          </View>

          <Text style={st.exerciseName}>{exercise.name}</Text>

          {/* Recomendación de peso (si aplica) */}
          {(() => {
            const hint = getWeightHint(exercise.name, exercise.reps, strengthData);
            return hint ? (
              <View style={[st.weightHint, { backgroundColor: theme.bgLight, borderColor: theme.border }]}>
                <Text style={[st.weightHintText, { color: theme.accent }]}>🏋️ Peso sugerido: {hint}</Text>
              </View>
            ) : null;
          })()}

          {/* ── Selector de modo ── */}
          <View style={st.modeSelector}>
            {[
              { key: 'reps',   icon: '🔢', label: 'Reps' },
              { key: 'manual', icon: '⏱',  label: 'Manual' },
              { key: 'timer',  icon: '⏰',  label: 'Timer' },
            ].map(({ key, icon, label }) => {
              const active = execMode === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setExecMode(key)}
                  style={[st.modeTab, { borderColor: active ? phaseColor : theme.border, backgroundColor: active ? phaseColor + '20' : theme.bgLight }]}
                >
                  <Text style={st.modeTabIcon}>{icon}</Text>
                  <Text style={[st.modeTabLabel, { color: active ? phaseColor : theme.gray }]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── MODO A: Contador de Reps ── */}
          {execMode === 'reps' && (
            <View style={st.repsModeWrap}>
              <TouchableOpacity
                style={[st.repTapBtn, { borderColor: repTarget && repCount >= repTarget ? '#00CC66' : phaseColor }]}
                onPress={handleRepTap}
                activeOpacity={0.6}
              >
                <Text style={[st.repTapCount, { color: repTarget && repCount >= repTarget ? '#00CC66' : phaseColor }]}>
                  {repCount}
                </Text>
                {repTarget ? (
                  <Text style={[st.repTapTarget, { color: theme.gray }]}>/ {repTarget}</Text>
                ) : null}
                <Text style={[st.repTapHint, { color: theme.gray }]}>TAP</Text>
              </TouchableOpacity>
              <Text style={[st.repsLabel, { color: theme.gray }]}>{exercise.reps}</Text>
              {repCount > 0 && (
                <TouchableOpacity onPress={() => setRepCount(0)} style={{ paddingVertical: 6, paddingHorizontal: 16 }}>
                  <Text style={{ color: theme.gray, fontSize: 12, fontWeight: '700' }}>↺ Reset</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ── MODO B: Manual + Cronómetro ── */}
          {execMode === 'manual' && (
            <View style={st.manualModeWrap}>
              <Text style={[st.manualTime, { color: theme.white }]}>{formatTime(manualElapsed)}</Text>
              <Text style={[st.repsLabel, { color: theme.gray, marginBottom: 14 }]}>{exercise.reps}</Text>
              <TouchableOpacity
                style={[st.timerBtn, {
                  backgroundColor: manualRunning ? '#FF444430' : phaseColor + '25',
                  borderColor: manualRunning ? '#FF4444' : phaseColor,
                }]}
                onPress={() => setManualRunning(r => !r)}
              >
                <Text style={[st.timerBtnText, { color: manualRunning ? '#FF4444' : phaseColor }]}>
                  {manualRunning ? '⏸  Pausar' : manualElapsed > 0 ? '▶  Continuar' : '▶  Iniciar'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── MODO C: Temporizador Countdown ── */}
          {execMode === 'timer' && (
            <View style={st.timerSection}>
              <Text style={[st.timerDisplay, { color: exerciseTime === 0 ? '#00CC66' : '#fff' }]}>
                {formatTime(exerciseTime)}
              </Text>
              {exerciseTime > 0 ? (
                <TouchableOpacity
                  style={[st.timerBtn, {
                    backgroundColor: timerRunning ? '#FF444430' : phaseColor + '25',
                    borderColor: timerRunning ? '#FF4444' : phaseColor,
                  }]}
                  onPress={timerRunning ? handlePauseTimer : handleStartTimer}
                >
                  <Text style={[st.timerBtnText, { color: timerRunning ? '#FF4444' : phaseColor }]}>
                    {timerRunning ? '⏸  Pausar' : timerStarted ? '▶  Continuar' : '▶  Iniciar'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={[st.timerDone, { color: theme.success }]}>¡Tiempo completado! ✓</Text>
              )}
            </View>
          )}

          {exercise.rest > 0 && (
            <Text style={st.restInfo}>Descanso: {exercise.rest}s</Text>
          )}
        </View>

        {/* Lista de ejercicios */}
        <Text style={[st.listTitle, { color: theme.gray }]}>{t('workout.allExercises')}</Text>
        {exercises.map((ex, i) => {
          const done = completedExs.includes(i);
          const isCurrent = i === currentEx;
          return (
            <TouchableOpacity
              key={i}
              style={[st.listItem, isCurrent && { borderColor: phaseColor + '60' }, done && st.listItemDone]}
              onPress={() => !done && setCurrentEx(i)}
              activeOpacity={done ? 1 : 0.7}
            >
              <View style={[st.listNum, done && { backgroundColor: phaseColor }]}>
                <Text style={[st.listNumText, done && { color: '#000' }]}>{done ? '✓' : i + 1}</Text>
              </View>
              <View style={st.listInfo}>
                <Text style={[st.listName, done && st.listNameDone]}>{ex.name}</Text>
                <Text style={st.listMeta}>
                  {ex.phase && ex.phase !== 'Principal' ? `${PHASE_META[ex.phase]?.icon || ''} ${ex.phase} · ` : ''}
                  {ex.reps}{ex.rest > 0 ? ` · ${ex.rest}s descanso` : ''}
                </Text>
              </View>
              {isCurrent && !done && <View style={[st.currentDot, { backgroundColor: phaseColor }]} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Boton completar ejercicio */}
      <View style={st.bottomBar}>
        <TouchableOpacity style={[st.completeBtn, { backgroundColor: phaseColor }]} onPress={handleCompleteExercise}>
          <Text style={[st.completeBtnText, { color: isDark ? '#000' : '#fff' }]}>{t('workout.complete')} {exercise.name}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────
const st = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },

  errorText: { color: '#888', fontSize: 16, marginBottom: 16 },
  backBtn: { backgroundColor: '#1A1A1A', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  backBtnText: { color: '#fff', fontWeight: '700' },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  headerBack: { fontSize: 22, color: '#888', width: 32 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: '#888', marginTop: 2 },

  progressTrack: { height: 3, backgroundColor: '#242424', marginHorizontal: 20 },
  progressFill: { height: '100%', borderRadius: 2 },

  content: { padding: 20, paddingBottom: 100 },

  // Exercise card
  exerciseCard: { backgroundColor: '#1A1A1A', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 28, borderWidth: 1, borderColor: '#2A2A2A' },
  exerciseNum: { fontSize: 10, fontWeight: '800', color: '#888', letterSpacing: 1.5, marginBottom: 8 },

  // Illustration
  illustrationWrap: { marginVertical: 12, padding: 8 },
  musclesRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 14 },
  musclePill: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  muscleText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  exerciseName: { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 16 },

  // Phase badge
  phaseBadge: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 10, alignSelf: 'center' },
  phaseBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },

  // Weight hint
  weightHint: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 12 },
  weightHintText: { fontSize: 13, fontWeight: '700', textAlign: 'center' },

  // Mode selector
  modeSelector: { flexDirection: 'row', gap: 8, marginBottom: 20, marginTop: 4 },
  modeTab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, gap: 2 },
  modeTabIcon: { fontSize: 18 },
  modeTabLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  // Mode A: Reps counter
  repsModeWrap: { alignItems: 'center', gap: 8, marginBottom: 4 },
  repTapBtn: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, alignItems: 'center', justifyContent: 'center', gap: 2 },
  repTapCount: { fontSize: 52, fontWeight: '900', lineHeight: 58 },
  repTapTarget: { fontSize: 16, fontWeight: '700' },
  repTapHint: { fontSize: 11, fontWeight: '800', letterSpacing: 2, marginTop: 2 },

  // Mode B: Manual stopwatch
  manualModeWrap: { alignItems: 'center', gap: 8 },
  manualTime: { fontSize: 56, fontWeight: '900', letterSpacing: 2 },

  // Timer
  timerSection: { alignItems: 'center', gap: 12 },
  timerDisplay: { fontSize: 56, fontWeight: '900', letterSpacing: 2 },
  timerBtn: { borderWidth: 2, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 12 },
  timerBtnText: { fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  timerDone: { fontSize: 14, fontWeight: '700', color: '#00CC66' },

  // Reps
  repsSection: { alignItems: 'center', gap: 4 },
  repsValue: { fontSize: 36, fontWeight: '900' },
  repsLabel: { fontSize: 12, color: '#888' },

  restInfo: { fontSize: 12, color: '#888', marginTop: 12 },

  // Exercise list
  listTitle: { fontSize: 11, fontWeight: '700', color: '#888', letterSpacing: 1.5, marginBottom: 12 },
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 14, padding: 14, marginBottom: 8, gap: 12, borderWidth: 1, borderColor: 'transparent' },
  listItemDone: { opacity: 0.5 },
  listNum: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#242424', alignItems: 'center', justifyContent: 'center' },
  listNumText: { fontSize: 13, fontWeight: '800', color: '#888' },
  listInfo: { flex: 1 },
  listName: { fontSize: 14, fontWeight: '700', color: '#fff' },
  listNameDone: { color: '#888', textDecorationLine: 'line-through' },
  listMeta: { fontSize: 11, color: '#888', marginTop: 2 },
  currentDot: { width: 8, height: 8, borderRadius: 4 },

  // Bottom
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, backgroundColor: '#0F0F0F' },
  completeBtn: { borderRadius: 16, padding: 18, alignItems: 'center' },
  completeBtnText: { fontSize: 16, fontWeight: '800', color: '#000' },

  // Rest screen
  restLabel: { fontSize: 14, fontWeight: '800', color: '#888', letterSpacing: 2, marginBottom: 8 },
  restTimer: { fontSize: 72, fontWeight: '900', color: '#fff', marginBottom: 20 },
  restNextCard: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 20 },
  restNextLabel: { fontSize: 10, fontWeight: '800', color: '#888', letterSpacing: 1.5, marginBottom: 8 },
  restNextIllustration: { marginBottom: 8 },
  restNextName: { fontSize: 18, fontWeight: '800', color: '#fff' },
  restNextReps: { fontSize: 13, color: '#888', marginTop: 4 },
  skipBtn: { paddingVertical: 12, paddingHorizontal: 24 },
  skipBtnText: { fontSize: 15, fontWeight: '700' },

  // Finish screen
  finishTitle: { fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  finishSub: { fontSize: 15, textAlign: 'center' },
  finishBtn: { borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 4 },
  finishBtnText: { fontSize: 16, fontWeight: '800' },

  // Summary grid
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  summaryCell: { flex: 1, minWidth: '44%', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, gap: 4 },
  summaryCellIcon: { fontSize: 24 },
  summaryCellVal: { fontSize: 22, fontWeight: '900' },
  summaryCellLbl: { fontSize: 11, fontWeight: '700' },

  // Feedback card
  feedbackCard: { borderRadius: 16, padding: 20, borderWidth: 1, marginBottom: 16 },
  feedbackTitle: { fontSize: 17, fontWeight: '900', marginBottom: 16, textAlign: 'center' },
  feedbackLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  starsRow: { flexDirection: 'row', gap: 8 },
  starBtn: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
