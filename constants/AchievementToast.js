// constants/AchievementToast.js
// Toast animado que aparece cuando se desbloquea un logro

import { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function AchievementToast({ achievement, lang = 'es', theme, onDone }) {
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!achievement) return;

    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -120, duration: 300, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => onDone?.());
    }, 3500);

    return () => clearTimeout(timer);
  }, [achievement]);

  if (!achievement) return null;

  return (
    <Animated.View style={{
      position: 'absolute', top: 60, left: 16, right: 16, zIndex: 9999,
      transform: [{ translateY: slideAnim }], opacity: opacityAnim,
    }}>
      <View style={{
        backgroundColor: theme?.bgCard || '#1A1A1A',
        borderRadius: 16, padding: 16,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        borderWidth: 2, borderColor: theme?.accent || '#C8FF00',
        shadowColor: theme?.accent || '#C8FF00', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
      }}>
        <Text style={{ fontSize: 36 }}>{achievement.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: theme?.accent || '#C8FF00', letterSpacing: 1.5, marginBottom: 2 }}>
            LOGRO DESBLOQUEADO
          </Text>
          <Text style={{ fontSize: 16, fontWeight: '900', color: theme?.white || '#fff' }}>
            {achievement.name?.[lang] || achievement.name?.es || ''}
          </Text>
          <Text style={{ fontSize: 12, color: theme?.gray || '#888', marginTop: 1 }}>
            {achievement.desc?.[lang] || achievement.desc?.es || ''}
          </Text>
        </View>
        {achievement.xp > 0 && (
          <View style={{ backgroundColor: (theme?.accent || '#C8FF00') + '20', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Text style={{ fontSize: 14, fontWeight: '900', color: theme?.accent || '#C8FF00' }}>+{achievement.xp}</Text>
            <Text style={{ fontSize: 9, fontWeight: '700', color: theme?.gray || '#888', textAlign: 'center' }}>XP</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}
