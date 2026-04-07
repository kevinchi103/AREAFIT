import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { loadProfile, saveProfile, loadWeights, saveWeights, loadState } from '../../constants/storage';

export default function PerfilScreen() {
  const [profile, setProfile] = useState(null);
  const [weights, setWeights] = useState([]);
  const [state, setState] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [form, setForm] = useState({});

  useFocusEffect(useCallback(() => {
    loadProfile().then(p => { setProfile(p); setForm(p); });
    loadWeights().then(setWeights);
    loadState().then(setState);
  }, []));

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permisos', 'Necesitamos acceso a tu galería'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled) {
      const updated = { ...form, photoUri: result.assets[0].uri };
      setForm(updated);
      await saveProfile(updated);
      setProfile(updated);
    }
  }

  async function saveForm() {
    await saveProfile(form);
    setProfile(form);
    setEditing(false);
  }

  async function addWeight() {
    const val = parseFloat(newWeight.replace(',', '.'));
    if (!val || val < 20 || val > 300) { Alert.alert('Error', 'Introduce un peso válido'); return; }
    const entry = { date: new Date().toLocaleDateString('es-ES'), value: val };
    const updated = [entry, ...weights].slice(0, 30);
    setWeights(updated);
    await saveWeights(updated);
    setNewWeight('');
  }

  if (!profile) return <View style={s.loading}><Text style={{ color: '#888888' }}>Cargando...</Text></View>;

  const initials = (profile.name || 'AF').substring(0, 2).toUpperCase();
  const currentWeight = weights[0]?.value;
  const startWeight = parseFloat(profile.startWeight);
  const diff = currentWeight && startWeight ? (currentWeight - startWeight).toFixed(1) : null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={s.safe}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={s.header}>
            <TouchableOpacity onPress={pickPhoto}>
              {profile.photoUri
                ? <Image source={{ uri: profile.photoUri }} style={s.avatar} />
                : <View style={s.avatarPlaceholder}><Text style={s.avatarText}>{initials}</Text></View>
              }
              <View style={s.cameraIcon}><Text style={{ fontSize: 14 }}>📷</Text></View>
            </TouchableOpacity>
            <View style={s.headerInfo}>
              <Text style={s.name}>{profile.name || 'Tu nombre'}</Text>
              <Text style={s.levelBadge}>Nivel {state?.level || 1} · Semana {state?.currentWeek || 1}</Text>
            </View>
            <TouchableOpacity onPress={() => editing ? saveForm() : setEditing(true)} style={s.editBtn}>
              <Text style={s.editBtnText}>{editing ? 'Guardar' : 'Editar'}</Text>
            </TouchableOpacity>
          </View>

          <View style={s.statsRow}>
            <View style={s.statCard}>
              <Text style={s.statVal}>{state?.streak || 0}🔥</Text>
              <Text style={s.statLbl}>Racha</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statVal}>{state?.xp || 0}</Text>
              <Text style={s.statLbl}>XP total</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statVal}>{state?.completedDays?.length || 0}</Text>
              <Text style={s.statLbl}>Días</Text>
            </View>
          </View>

          <Text style={s.sectionTitle}>DATOS PERSONALES</Text>
          <View style={s.card}>
            {[
              { label: 'Nombre', field: 'name' },
              { label: 'Altura (cm)', field: 'height', keyboardType: 'numeric' },
              { label: 'Peso inicial (kg)', field: 'startWeight', keyboardType: 'numeric' },
              { label: 'Objetivo', field: 'goal', last: true },
            ].map(({ label, field, keyboardType, last }) => (
              <View key={field} style={[s.row, last && { borderBottomWidth: 0 }]}>
                <Text style={s.rowLabel}>{label}</Text>
                {editing
                  ? <TextInput style={s.rowInput} value={form[field] || ''} onChangeText={v => setForm({ ...form, [field]: v })} keyboardType={keyboardType || 'default'} placeholderTextColor="#888888" placeholder="—" />
                  : <Text style={s.rowValue}>{profile[field] || '—'}</Text>
                }
              </View>
            ))}
          </View>

          <Text style={s.sectionTitle}>CONTROL DE PESO</Text>
          {diff !== null && (
            <View style={[s.diffBanner, { backgroundColor: parseFloat(diff) <= 0 ? '#00CC6622' : '#FF444422' }]}>
              <Text style={[s.diffText, { color: parseFloat(diff) <= 0 ? '#00CC66' : '#FF4444' }]}>
                {parseFloat(diff) <= 0 ? '↓' : '↑'} {Math.abs(diff)} kg desde el inicio
              </Text>
            </View>
          )}
          <View style={s.card}>
            <View style={s.weightInput}>
              <TextInput style={s.weightField} placeholder="Peso actual (kg)" placeholderTextColor="#888888" keyboardType="decimal-pad" value={newWeight} onChangeText={setNewWeight} />
              <TouchableOpacity style={s.weightBtn} onPress={addWeight}>
                <Text style={s.weightBtnText}>+ Añadir</Text>
              </TouchableOpacity>
            </View>
            {weights.slice(0, 8).map((w, i) => (
              <View key={i} style={[s.weightRow, i === weights.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={s.weightDate}>{w.date}</Text>
                <Text style={s.weightVal}>{w.value} kg</Text>
                {i === 0 && <View style={s.latestPill}><Text style={s.latestText}>actual</Text></View>}
              </View>
            ))}
            {weights.length === 0 && <Text style={s.emptyText}>Registra tu primer peso 👆</Text>}
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F0F' },
  loading: { flex: 1, backgroundColor: '#0F0F0F', alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20 },
  avatar: { width: 70, height: 70, borderRadius: 35 },
  avatarPlaceholder: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#C8FF00', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '900', color: '#000' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#1A1A1A', borderRadius: 10, padding: 2, borderWidth: 1, borderColor: '#2A2A2A' },
  headerInfo: { flex: 1 },
  name: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  levelBadge: { fontSize: 12, color: '#888888', marginTop: 2 },
  editBtn: { backgroundColor: '#242424', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#2A2A2A' },
  editBtnText: { color: '#C8FF00', fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2A' },
  statVal: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', marginBottom: 2 },
  statLbl: { fontSize: 11, color: '#888888', fontWeight: '600' },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#888888', letterSpacing: 1.5, paddingHorizontal: 20, marginBottom: 10 },
  card: { marginHorizontal: 20, backgroundColor: '#1A1A1A', borderRadius: 16, paddingHorizontal: 16, marginBottom: 24, borderWidth: 1, borderColor: '#2A2A2A' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#2A2A2A' },
  rowLabel: { fontSize: 14, color: '#888888' },
  rowValue: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  rowInput: { fontSize: 14, color: '#C8FF00', fontWeight: '700', textAlign: 'right', minWidth: 100 },
  diffBanner: { marginHorizontal: 20, borderRadius: 12, padding: 12, marginBottom: 10, alignItems: 'center' },
  diffText: { fontSize: 15, fontWeight: '800' },
  weightInput: { flexDirection: 'row', gap: 10, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#2A2A2A' },
  weightField: { flex: 1, color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  weightBtn: { backgroundColor: '#C8FF00', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  weightBtnText: { color: '#000', fontWeight: '800', fontSize: 13 },
  weightRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#2A2A2A' },
  weightDate: { flex: 1, fontSize: 13, color: '#888888' },
  weightVal: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', marginRight: 8 },
  latestPill: { backgroundColor: '#C8FF0033', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
  latestText: { fontSize: 10, fontWeight: '700', color: '#C8FF00' },
  emptyText: { color: '#888888', textAlign: 'center', paddingVertical: 20, fontSize: 14 },
});