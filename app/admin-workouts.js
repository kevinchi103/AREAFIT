// app/admin-workouts.js
// Pantalla de gestión de entrenamientos personalizados (admin)

import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../constants/SettingsContext';
import { getTheme } from '../constants/theme';
import {
  createCustomWorkout, fetchAllCustomWorkouts, deleteCustomWorkout,
  assignWorkout, fetchAllUsers, fetchAllAssignments, deactivateAssignment,
  fetchAllFeedback, DIFFICULTY_OPTIONS, DAY_NAMES,
} from '../constants/customWorkouts';

export default function AdminWorkoutsScreen() {
  const router = useRouter();
  const { settings, isDark } = useSettings();
  const theme = getTheme(isDark);
  const lang = settings.lang || 'es';

  const [tab, setTab] = useState('workouts'); // workouts | assign | feedback
  const [workouts, setWorkouts] = useState([]);
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create workout modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', difficulty: 'medium', xpMultiplier: '1', exercises: [] });
  const [exForm, setExForm] = useState({ name: '', reps: '', sets: '3', rest: '60' });

  // Assign modal
  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({ userId: '', workoutId: '', dayOfWeek: null, notes: '' });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [w, u, a, f] = await Promise.all([
      fetchAllCustomWorkouts(),
      fetchAllUsers(),
      fetchAllAssignments(),
      fetchAllFeedback(),
    ]);
    setWorkouts(w.data);
    setUsers(u.data);
    setAssignments(a.data);
    setFeedback(f.data);
    setLoading(false);
  }

  // ── Create workout ──
  function addExercise() {
    if (!exForm.name) return;
    setForm(f => ({
      ...f,
      exercises: [...f.exercises, {
        name: exForm.name,
        reps: exForm.reps || '10',
        sets: parseInt(exForm.sets) || 3,
        rest_seconds: parseInt(exForm.rest) || 60,
      }],
    }));
    setExForm({ name: '', reps: '', sets: '3', rest: '60' });
  }

  function removeExercise(index) {
    setForm(f => ({ ...f, exercises: f.exercises.filter((_, i) => i !== index) }));
  }

  async function handleCreate() {
    if (!form.name || form.exercises.length === 0) {
      Alert.alert('Error', 'Nombre y al menos 1 ejercicio');
      return;
    }
    const { error } = await createCustomWorkout({
      name: form.name,
      description: form.description,
      exercises: form.exercises,
      xpMultiplier: parseFloat(form.xpMultiplier) || 1,
      difficulty: form.difficulty,
    });
    if (error) { Alert.alert('Error', error); return; }
    setShowCreate(false);
    setForm({ name: '', description: '', difficulty: 'medium', xpMultiplier: '1', exercises: [] });
    loadData();
  }

  // ── Assign ──
  async function handleAssign() {
    if (!assignForm.userId || !assignForm.workoutId) {
      Alert.alert('Error', 'Selecciona usuario y entrenamiento');
      return;
    }
    const { error } = await assignWorkout({
      userId: assignForm.userId,
      workoutId: assignForm.workoutId,
      dayOfWeek: assignForm.dayOfWeek,
      notes: assignForm.notes,
    });
    if (error) { Alert.alert('Error', error); return; }
    setShowAssign(false);
    setAssignForm({ userId: '', workoutId: '', dayOfWeek: null, notes: '' });
    loadData();
  }

  // ── Delete ──
  async function handleDelete(id) {
    Alert.alert('Eliminar', 'Seguro?', [
      { text: 'No', style: 'cancel' },
      { text: 'Si', style: 'destructive', onPress: async () => {
        await deleteCustomWorkout(id);
        loadData();
      }},
    ]);
  }

  async function handleDeactivate(id) {
    await deactivateAssignment(id);
    loadData();
  }

  if (loading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={theme.accent} size="large" />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 22, color: theme.gray }}>←</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '900', color: theme.white, letterSpacing: 1 }}>
          ENTRENAMIENTOS
        </Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 8 }}>
        {['workouts', 'assign', 'feedback'].map(t => (
          <TouchableOpacity
            key={t}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1,
              backgroundColor: tab === t ? theme.accent + '15' : theme.bgCard,
              borderColor: tab === t ? theme.accent : theme.border }}
            onPress={() => setTab(t)}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: tab === t ? theme.accent : theme.gray }}>
              {t === 'workouts' ? `Entrenos (${workouts.length})` : t === 'assign' ? `Asignados (${assignments.length})` : `Feedback (${feedback.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* ── WORKOUTS TAB ── */}
        {tab === 'workouts' && (
          <>
            <TouchableOpacity
              style={{ backgroundColor: theme.accent, borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 16 }}
              onPress={() => setShowCreate(true)}
            >
              <Text style={{ fontSize: 15, fontWeight: '800', color: isDark ? '#000' : '#fff' }}>+ Crear entrenamiento</Text>
            </TouchableOpacity>

            {workouts.map(w => {
              const diff = DIFFICULTY_OPTIONS.find(d => d.value === w.difficulty);
              return (
                <View key={w.id} style={{ backgroundColor: theme.bgCard, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: theme.border }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: theme.white, flex: 1 }}>{w.name}</Text>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <View style={{ backgroundColor: diff?.color + '20', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: diff?.color }}>{diff?.label[lang]}</Text>
                      </View>
                      {w.xp_multiplier > 1 && (
                        <View style={{ backgroundColor: theme.accent + '20', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: theme.accent }}>x{w.xp_multiplier} XP</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {w.description ? <Text style={{ fontSize: 12, color: theme.gray, marginBottom: 6 }}>{w.description}</Text> : null}
                  <Text style={{ fontSize: 11, color: theme.gray }}>{(w.exercises || []).length} ejercicios</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <TouchableOpacity
                      style={{ flex: 1, backgroundColor: theme.accent + '15', borderRadius: 10, padding: 8, alignItems: 'center' }}
                      onPress={() => { setAssignForm(f => ({ ...f, workoutId: w.id })); setShowAssign(true); }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: theme.accent }}>Asignar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ backgroundColor: '#FF444415', borderRadius: 10, padding: 8, paddingHorizontal: 14 }}
                      onPress={() => handleDelete(w.id)}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#FF4444' }}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
            {workouts.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ fontSize: 40, marginBottom: 8 }}>📋</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: theme.white }}>No hay entrenamientos</Text>
                <Text style={{ fontSize: 13, color: theme.gray }}>Crea el primero con el boton de arriba</Text>
              </View>
            )}
          </>
        )}

        {/* ── ASSIGNMENTS TAB ── */}
        {tab === 'assign' && (
          <>
            <TouchableOpacity
              style={{ backgroundColor: theme.accent, borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 16 }}
              onPress={() => setShowAssign(true)}
            >
              <Text style={{ fontSize: 15, fontWeight: '800', color: isDark ? '#000' : '#fff' }}>+ Asignar entrenamiento</Text>
            </TouchableOpacity>

            {assignments.map(a => {
              const dayName = a.day_of_week !== null ? (DAY_NAMES[lang] || DAY_NAMES.es)[a.day_of_week] : 'Cualquier dia';
              return (
                <View key={a.id} style={{ backgroundColor: theme.bgCard, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: theme.border }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: theme.white }}>{a.custom_workouts?.name || '—'}</Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: theme.accent }}>{dayName}</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: theme.gray }}>
                    Para: {a.users?.name || a.users?.email || '—'}
                  </Text>
                  {a.notes ? <Text style={{ fontSize: 11, color: theme.grayLight, marginTop: 4 }}>📝 {a.notes}</Text> : null}
                  <TouchableOpacity
                    style={{ marginTop: 8, backgroundColor: '#FF444415', borderRadius: 10, padding: 8, alignItems: 'center' }}
                    onPress={() => handleDeactivate(a.id)}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#FF4444' }}>Desactivar</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
            {assignments.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ fontSize: 40, marginBottom: 8 }}>📅</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: theme.white }}>No hay asignaciones</Text>
              </View>
            )}
          </>
        )}

        {/* ── FEEDBACK TAB ── */}
        {tab === 'feedback' && (
          <>
            {feedback.map((f, i) => (
              <View key={f.id || i} style={{ backgroundColor: theme.bgCard, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: theme.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: theme.white }}>{f.users?.name || '—'}</Text>
                  <Text style={{ fontSize: 11, color: theme.gray }}>
                    {f.created_at ? new Date(f.created_at).toLocaleDateString(lang) : ''}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: theme.grayLight, marginBottom: 4 }}>{f.custom_workouts?.name || '—'}</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Text style={{ fontSize: 12, color: theme.gray }}>Dificultad: {'⭐'.repeat(f.difficulty_rating || 0)}</Text>
                  <Text style={{ fontSize: 12, color: theme.gray }}>Energia: {'⚡'.repeat(f.energy_level || 0)}</Text>
                </View>
                {f.notes ? <Text style={{ fontSize: 12, color: theme.gray, marginTop: 4 }}>💬 {f.notes}</Text> : null}
              </View>
            ))}
            {feedback.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ fontSize: 40, marginBottom: 8 }}>💬</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: theme.white }}>No hay feedback aun</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* ── MODAL: Crear entrenamiento ── */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: theme.white, marginBottom: 16 }}>Crear entrenamiento</Text>

              <Text style={{ fontSize: 10, fontWeight: '800', color: theme.gray, letterSpacing: 1, marginBottom: 6 }}>NOMBRE</Text>
              <TextInput
                style={{ backgroundColor: theme.bg, color: theme.white, borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1, borderColor: theme.border, marginBottom: 12 }}
                placeholder="Ej: Push Day Avanzado"
                placeholderTextColor={theme.gray}
                value={form.name}
                onChangeText={v => setForm(f => ({ ...f, name: v }))}
              />

              <Text style={{ fontSize: 10, fontWeight: '800', color: theme.gray, letterSpacing: 1, marginBottom: 6 }}>DESCRIPCION</Text>
              <TextInput
                style={{ backgroundColor: theme.bg, color: theme.white, borderRadius: 12, padding: 14, fontSize: 14, borderWidth: 1, borderColor: theme.border, marginBottom: 12 }}
                placeholder="Opcional"
                placeholderTextColor={theme.gray}
                value={form.description}
                onChangeText={v => setForm(f => ({ ...f, description: v }))}
              />

              <Text style={{ fontSize: 10, fontWeight: '800', color: theme.gray, letterSpacing: 1, marginBottom: 6 }}>DIFICULTAD</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                {DIFFICULTY_OPTIONS.map(d => (
                  <TouchableOpacity
                    key={d.value}
                    style={{ flex: 1, padding: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1,
                      borderColor: form.difficulty === d.value ? d.color : theme.border,
                      backgroundColor: form.difficulty === d.value ? d.color + '15' : theme.bg }}
                    onPress={() => setForm(f => ({ ...f, difficulty: d.value }))}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: form.difficulty === d.value ? d.color : theme.gray }}>{d.label[lang]}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontSize: 10, fontWeight: '800', color: theme.gray, letterSpacing: 1, marginBottom: 6 }}>MULTIPLICADOR XP</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {['1', '1.5', '2', '3'].map(m => (
                  <TouchableOpacity
                    key={m}
                    style={{ flex: 1, padding: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1,
                      borderColor: form.xpMultiplier === m ? theme.accent : theme.border,
                      backgroundColor: form.xpMultiplier === m ? theme.accent + '15' : theme.bg }}
                    onPress={() => setForm(f => ({ ...f, xpMultiplier: m }))}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '800', color: form.xpMultiplier === m ? theme.accent : theme.gray }}>x{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Ejercicios */}
              <Text style={{ fontSize: 10, fontWeight: '800', color: theme.gray, letterSpacing: 1, marginBottom: 6 }}>
                EJERCICIOS ({form.exercises.length})
              </Text>

              {form.exercises.map((ex, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.bg, borderRadius: 10, padding: 10, marginBottom: 6, gap: 8 }}>
                  <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: theme.white }}>{ex.name}</Text>
                  <Text style={{ fontSize: 11, color: theme.gray }}>{ex.reps} x{ex.sets}</Text>
                  <TouchableOpacity onPress={() => removeExercise(i)}>
                    <Text style={{ fontSize: 16, color: '#FF4444' }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <View style={{ backgroundColor: theme.bg, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: theme.border, marginBottom: 16 }}>
                <TextInput
                  style={{ color: theme.white, fontSize: 14, marginBottom: 8 }}
                  placeholder="Nombre del ejercicio"
                  placeholderTextColor={theme.gray}
                  value={exForm.name}
                  onChangeText={v => setExForm(f => ({ ...f, name: v }))}
                />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput
                    style={{ flex: 1, color: theme.white, fontSize: 13, backgroundColor: theme.bgCard, borderRadius: 8, padding: 8 }}
                    placeholder="Reps"
                    placeholderTextColor={theme.gray}
                    value={exForm.reps}
                    onChangeText={v => setExForm(f => ({ ...f, reps: v }))}
                  />
                  <TextInput
                    style={{ flex: 1, color: theme.white, fontSize: 13, backgroundColor: theme.bgCard, borderRadius: 8, padding: 8 }}
                    placeholder="Series"
                    placeholderTextColor={theme.gray}
                    value={exForm.sets}
                    onChangeText={v => setExForm(f => ({ ...f, sets: v }))}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={{ flex: 1, color: theme.white, fontSize: 13, backgroundColor: theme.bgCard, borderRadius: 8, padding: 8 }}
                    placeholder="Descanso(s)"
                    placeholderTextColor={theme.gray}
                    value={exForm.rest}
                    onChangeText={v => setExForm(f => ({ ...f, rest: v }))}
                    keyboardType="numeric"
                  />
                </View>
                <TouchableOpacity
                  style={{ marginTop: 8, backgroundColor: theme.accent + '20', borderRadius: 10, padding: 10, alignItems: 'center' }}
                  onPress={addExercise}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: theme.accent }}>+ Añadir ejercicio</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={{ backgroundColor: theme.accent, borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 8 }}
                onPress={handleCreate}
              >
                <Text style={{ fontSize: 16, fontWeight: '800', color: isDark ? '#000' : '#fff' }}>Crear entrenamiento</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ padding: 12, alignItems: 'center' }}
                onPress={() => setShowCreate(false)}
              >
                <Text style={{ fontSize: 14, color: theme.gray }}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── MODAL: Asignar entrenamiento ── */}
      <Modal visible={showAssign} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: theme.white, marginBottom: 16 }}>Asignar entrenamiento</Text>

              <Text style={{ fontSize: 10, fontWeight: '800', color: theme.gray, letterSpacing: 1, marginBottom: 6 }}>USUARIO</Text>
              <View style={{ marginBottom: 12 }}>
                {users.map(u => (
                  <TouchableOpacity
                    key={u.id}
                    style={{ padding: 12, borderRadius: 10, marginBottom: 4, borderWidth: 1,
                      borderColor: assignForm.userId === u.id ? theme.accent : theme.border,
                      backgroundColor: assignForm.userId === u.id ? theme.accent + '10' : theme.bg }}
                    onPress={() => setAssignForm(f => ({ ...f, userId: u.id }))}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '700', color: assignForm.userId === u.id ? theme.accent : theme.white }}>
                      {u.name || u.email}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontSize: 10, fontWeight: '800', color: theme.gray, letterSpacing: 1, marginBottom: 6 }}>ENTRENAMIENTO</Text>
              <View style={{ marginBottom: 12 }}>
                {workouts.map(w => (
                  <TouchableOpacity
                    key={w.id}
                    style={{ padding: 12, borderRadius: 10, marginBottom: 4, borderWidth: 1,
                      borderColor: assignForm.workoutId === w.id ? theme.accent : theme.border,
                      backgroundColor: assignForm.workoutId === w.id ? theme.accent + '10' : theme.bg }}
                    onPress={() => setAssignForm(f => ({ ...f, workoutId: w.id }))}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '700', color: assignForm.workoutId === w.id ? theme.accent : theme.white }}>
                      {w.name} {w.xp_multiplier > 1 ? `(x${w.xp_multiplier} XP)` : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontSize: 10, fontWeight: '800', color: theme.gray, letterSpacing: 1, marginBottom: 6 }}>DIA DE LA SEMANA (OPCIONAL)</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                <TouchableOpacity
                  style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1,
                    borderColor: assignForm.dayOfWeek === null ? theme.accent : theme.border,
                    backgroundColor: assignForm.dayOfWeek === null ? theme.accent + '15' : theme.bg }}
                  onPress={() => setAssignForm(f => ({ ...f, dayOfWeek: null }))}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: assignForm.dayOfWeek === null ? theme.accent : theme.gray }}>Cualquier</Text>
                </TouchableOpacity>
                {(DAY_NAMES[lang] || DAY_NAMES.es).map((day, i) => (
                  <TouchableOpacity
                    key={i}
                    style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1,
                      borderColor: assignForm.dayOfWeek === i ? theme.accent : theme.border,
                      backgroundColor: assignForm.dayOfWeek === i ? theme.accent + '15' : theme.bg }}
                    onPress={() => setAssignForm(f => ({ ...f, dayOfWeek: i }))}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: assignForm.dayOfWeek === i ? theme.accent : theme.gray }}>
                      {day.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontSize: 10, fontWeight: '800', color: theme.gray, letterSpacing: 1, marginBottom: 6 }}>NOTAS PARA EL USUARIO</Text>
              <TextInput
                style={{ backgroundColor: theme.bg, color: theme.white, borderRadius: 12, padding: 14, fontSize: 14, borderWidth: 1, borderColor: theme.border, marginBottom: 16, minHeight: 60 }}
                placeholder="Instrucciones o notas..."
                placeholderTextColor={theme.gray}
                value={assignForm.notes}
                onChangeText={v => setAssignForm(f => ({ ...f, notes: v }))}
                multiline
              />

              <TouchableOpacity
                style={{ backgroundColor: theme.accent, borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 8 }}
                onPress={handleAssign}
              >
                <Text style={{ fontSize: 16, fontWeight: '800', color: isDark ? '#000' : '#fff' }}>Asignar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ padding: 12, alignItems: 'center' }} onPress={() => setShowAssign(false)}>
                <Text style={{ fontSize: 14, color: theme.gray }}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
