import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../constants/supabase';
import { useSettings } from '../constants/SettingsContext';
import { getTheme } from '../constants/theme';

// Respuestas automáticas del chatbot cuando el entrenador no está disponible
const AUTO_REPLIES = [
  '¡Hola! Soy el asistente de AREAFIT. El entrenador revisará tu mensaje pronto 💪',
  'Recibido. El entrenador te responderá en las próximas horas 🏋️',
  '¡Buena pregunta! Te responderemos lo antes posible ⚡',
  'Mensaje recibido. Recuerda revisar tu plan de hoy en la pantalla principal 🔥',
];

function timeStr(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function dateLabel(isoStr) {
  if (!isoStr) return '';
  const d   = new Date(isoStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export default function ChatScreen() {
  const router = useRouter();
  const { isDark } = useSettings();
  const theme = getTheme(isDark);
  const scrollRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar usuario + mensajes
  useFocusEffect(useCallback(() => {
    let sub;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }
      setUserId(user.id);

      // Check premium
      const { data: profile } = await supabase
        .from('users')
        .select('is_premium')
        .eq('id', user.id)
        .single();
      setIsPremium(profile?.is_premium || false);

      // Load messages
      const { data: msgs } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      setMessages(msgs || []);
      setLoading(false);

      // Mark messages from trainer as read
      await supabase
        .from('chat_messages')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('is_from_trainer', true)
        .eq('read', false);

      // Suscripción realtime
      sub = supabase
        .channel(`chat_${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `user_id=eq.${user.id}`,
        }, payload => {
          setMessages(prev => [...prev, payload.new]);
          setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        })
        .subscribe();
    })();

    return () => { sub?.unsubscribe(); };
  }, []));

  async function sendMessage() {
    if (!input.trim() || !userId || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);

    // Insertar mensaje del usuario
    const { error } = await supabase.from('chat_messages').insert({
      user_id: userId,
      content: text,
      is_from_trainer: false,
      read: true,
    });

    if (!error) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

      // Auto-respuesta del bot después de 1.5s (solo si es el primer mensaje del día)
      setTimeout(async () => {
        const today = new Date().toDateString();
        const { data: todayMsgs } = await supabase
          .from('chat_messages')
          .select('id')
          .eq('user_id', userId)
          .eq('is_from_trainer', true)
          .gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString());

        if (!todayMsgs || todayMsgs.length === 0) {
          const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
          await supabase.from('chat_messages').insert({
            user_id: userId,
            content: reply,
            is_from_trainer: true,
            read: false,
          });
        }
      }, 1500);
    }

    setSending(false);
  }

  // Agrupar mensajes por fecha
  function groupedMessages() {
    const groups = [];
    let lastDate = null;
    messages.forEach(msg => {
      const d = msg.created_at ? new Date(msg.created_at).toDateString() : '';
      if (d !== lastDate) {
        groups.push({ type: 'date', label: dateLabel(msg.created_at), key: `d_${msg.created_at}` });
        lastDate = d;
      }
      groups.push({ type: 'msg', msg, key: msg.id });
    });
    return groups;
  }

  if (!isPremium && !loading) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[s.back, { color: theme.gray }]}>←</Text>
          </TouchableOpacity>
          <Text style={[s.title, { color: theme.white }]}>Entrenador Personal</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={[s.premiumLock, { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>💎</Text>
          <Text style={[s.title, { color: theme.white, fontSize: 22, marginBottom: 8, textAlign: 'center' }]}>
            Premium exclusivo
          </Text>
          <Text style={{ color: theme.gray, textAlign: 'center', lineHeight: 22, marginBottom: 28 }}>
            El chat con entrenador personal está disponible para usuarios Premium PRO.
            Obtén feedback real, rutinas personalizadas y seguimiento directo.
          </Text>
          <TouchableOpacity
            style={[s.upgBtn, { backgroundColor: theme.accent }]}
            onPress={() => router.back()}
          >
            <Text style={[s.upgBtnText, { color: '#000' }]}>Ver planes Premium →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: theme.border, borderBottomWidth: 0.5 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[s.back, { color: theme.gray }]}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[s.title, { color: theme.white, fontSize: 16 }]}>Entrenador Personal</Text>
          <Text style={{ color: '#00CC66', fontSize: 11, fontWeight: '700' }}>● En línea</Text>
        </View>
        <View style={{ width: 32 }}>
          <Text style={{ fontSize: 22 }}>🏋️</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={theme.accent} size="large" />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {messages.length === 0 && (
              <View style={[s.welcomeCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <Text style={{ fontSize: 36, marginBottom: 8 }}>👋</Text>
                <Text style={[s.welcomeTitle, { color: theme.white }]}>¡Hola! Soy tu entrenador.</Text>
                <Text style={{ color: theme.gray, textAlign: 'center', lineHeight: 20, marginTop: 6 }}>
                  Pregúntame cualquier cosa sobre tus entrenamientos, ejercicios, nutrición o progreso. Estoy aquí para ayudarte.
                </Text>
              </View>
            )}

            {groupedMessages().map(item => {
              if (item.type === 'date') {
                return (
                  <View key={item.key} style={s.dateSep}>
                    <Text style={[s.dateLabel, { color: theme.gray }]}>{item.label}</Text>
                  </View>
                );
              }
              const msg = item.msg;
              const isMe = !msg.is_from_trainer;
              return (
                <View key={item.key} style={[s.msgRow, isMe && s.msgRowMe]}>
                  {!isMe && (
                    <View style={[s.avatar, { backgroundColor: theme.accent }]}>
                      <Text style={{ fontSize: 14 }}>🏋️</Text>
                    </View>
                  )}
                  <View style={[
                    s.bubble,
                    isMe
                      ? [s.bubbleMe, { backgroundColor: theme.accent }]
                      : [s.bubbleThem, { backgroundColor: theme.bgCard, borderColor: theme.border }]
                  ]}>
                    <Text style={[s.bubbleText, { color: isMe ? '#000' : theme.white }]}>
                      {msg.content}
                    </Text>
                    <Text style={[s.bubbleTime, { color: isMe ? '#00000066' : theme.gray }]}>
                      {timeStr(msg.created_at)}
                      {isMe && (msg.read ? ' ✓✓' : ' ✓')}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Input */}
          <View style={[s.inputRow, { backgroundColor: theme.bgCard, borderTopColor: theme.border }]}>
            <TextInput
              style={[s.input, { color: theme.white, backgroundColor: theme.bgLight }]}
              placeholder="Escribe un mensaje..."
              placeholderTextColor={theme.gray}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity
              style={[s.sendBtn, { backgroundColor: input.trim() ? theme.accent : theme.bgLight }]}
              onPress={sendMessage}
              disabled={!input.trim() || sending}
            >
              <Text style={{ fontSize: 18 }}>{sending ? '⏳' : '➤'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  back: { fontSize: 26, width: 32 },
  title: { fontWeight: '900' },
  premiumLock: {},
  upgBtn: { borderRadius: 14, paddingHorizontal: 32, paddingVertical: 16 },
  upgBtnText: { fontSize: 16, fontWeight: '800' },

  welcomeCard: { borderRadius: 16, padding: 24, borderWidth: 1, alignItems: 'center', marginBottom: 16 },
  welcomeTitle: { fontSize: 18, fontWeight: '900' },

  dateSep: { alignItems: 'center', marginVertical: 12 },
  dateLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8, gap: 8 },
  msgRowMe: { flexDirection: 'row-reverse' },

  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '75%', borderRadius: 16, padding: 12, gap: 4 },
  bubbleMe: { borderBottomRightRadius: 4 },
  bubbleThem: { borderWidth: 1, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTime: { fontSize: 10, fontWeight: '600', textAlign: 'right' },

  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, gap: 10, borderTopWidth: 0.5 },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
