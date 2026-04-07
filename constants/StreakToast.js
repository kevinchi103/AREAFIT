// constants/StreakToast.js
// Toast for streak milestone

import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

export default function StreakToast({ streak, visible, theme, onDone }) {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible || !streak) return;

    scale.setValue(0.5);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 100, friction: 6, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true })
        .start(() => onDone?.());
    }, 2000);

    return () => clearTimeout(timer);
  }, [visible, streak]);

  if (!visible || !streak) return null;

  return (
    <Animated.View style={{
      position: 'absolute', bottom: 160, alignSelf: 'center', zIndex: 9998,
      transform: [{ scale }], opacity,
    }}>
      <View style={{
        backgroundColor: '#FF950030', borderRadius: 20,
        paddingHorizontal: 18, paddingVertical: 8,
        flexDirection: 'row', alignItems: 'center', gap: 4,
        borderWidth: 1, borderColor: '#FF950060',
      }}>
        <Text style={{ fontSize: 16 }}>🔥</Text>
        <Text style={{ fontSize: 15, fontWeight: '800', color: '#FF9500' }}>Racha +{streak}</Text>
      </View>
    </Animated.View>
  );
}
