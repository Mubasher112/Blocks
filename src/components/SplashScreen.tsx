import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.85));

  useEffect(() => {
    // Animate logo fade in & scale up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Fade out after delay
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 1800);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.studioContainer}>
          <Text style={styles.studioLabel}>NOVA STUDIOS</Text>
          <Text style={styles.studioSubLabel}>PRESENTS</Text>
        </View>

        <View style={styles.logoBadge}>
          <Text style={styles.logoBadgeText}>❖</Text>
        </View>

        <Text style={styles.title}>BLOCK NOVA</Text>
        <Text style={styles.subtitle}>PUZZLE EVOLVED</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0c14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  studioContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  studioLabel: {
    color: '#00F0FF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 4,
  },
  studioSubLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: 4,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderWidth: 2,
    borderColor: '#00F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
  },
  logoBadgeText: {
    color: '#00F0FF',
    fontSize: 40,
    fontWeight: 'bold',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 3,
  },
  subtitle: {
    color: '#FF007F',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 5,
    marginTop: 6,
  },
});
