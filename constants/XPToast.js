// constants/XPToast.js
// Toast flotante que muestra XP ganado después de un entreno

import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

export default function XPToast({ xp, visible, theme, onDone }) {
  const translateY = useRef(new Animated.Value(60)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible || !xp) return;

    translateY.setValue(60);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -40, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => onDone?.());
    }, 2500);

    return () => clearTimeout(timer);
  }, [visible, xp]);

  if (!visible || !xp) return null;

  return (
    <Animated.View style={{
      position: 'absolute', bottom: 100, alignSelf: 'center', zIndex: 9999,
      transform: [{ translateY }], opacity,
    }}>
      <View style={{
        backgroundColor: theme?.accent || '#C8FF00',
        borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10,
        flexDirection: 'row', alignItems: 'center', gap: 6,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
      }}>
        <Text style={{ fontSize: 18 }}>⚡</Text>
        <Text style={{ fontSize: 18, fontWeight: '900', color: '#000' }}>+{xp} XP</Text>
      </View>
    </Animated.View>
  );
}
