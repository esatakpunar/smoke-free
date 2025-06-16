import { FontAwesome } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useColorScheme } from '../../hooks/useColorScheme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type DistractionTechnique = {
  title: string;
  description: string;
  icon: 'tint' | 'road' | 'heartbeat' | 'cutlery';
};

export default function EmergencyScreen() {
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingTimer, setBreathingTimer] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const isFocused = useIsFocused();
  const totalCycles = 4;
  const colorScheme = useColorScheme();
  
  // SVG Progress
  const radius = 80;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const circleScale = useRef(new Animated.Value(1)).current;
  const circleOpacity = useRef(new Animated.Value(1)).current;

  const getPhaseColor = (phase: 'inhale' | 'hold' | 'exhale') => {
    return phase === 'inhale' 
      ? '#0D6EFD' 
      : phase === 'hold' 
      ? '#228BE6' 
      : '#74C0FC';
  };

  const getPhaseDuration = (phase: 'inhale' | 'hold' | 'exhale') => {
    return phase === 'inhale' ? 4 : phase === 'hold' ? 7 : 8;
  };

  const distractionTechniques: DistractionTechnique[] = [
    {
      title: 'Su İç',
      description: 'Bir bardak su için ve yavaşça yudumlayın.',
      icon: 'tint',
    },
    {
      title: 'Yürüyüş Yap',
      description: 'Kısa bir yürüyüşe çıkın ve temiz hava alın.',
      icon: 'road',
    },
    {
      title: 'Derin Nefes Al',
      description: '4-7-8 nefes tekniğini uygulayın.',
      icon: 'heartbeat',
    },
    {
      title: 'Meyve Yiyin',
      description: 'Bir parça meyve yiyin veya şekersiz sakız çiğneyin.',
      icon: 'cutlery',
    },
  ];

  // Animate SVG progress
  const animateProgress = (phase: 'inhale' | 'hold' | 'exhale') => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: getPhaseDuration(phase) * 1000,
      useNativeDriver: false,
    }).start();
  };

  // Animate circle scale and opacity
  const animateBreathing = (phase: 'inhale' | 'hold' | 'exhale') => {
    const duration = getPhaseDuration(phase) * 1000;
    const toValue = phase === 'inhale' ? 1.5 : phase === 'hold' ? 1.5 : 1;
    const opacityValue = phase === 'inhale' ? 0.8 : phase === 'hold' ? 0.6 : 0.4;
    Animated.parallel([
      Animated.timing(circleScale, {
        toValue,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(circleOpacity, {
        toValue: opacityValue,
        duration,
        useNativeDriver: true,
      })
    ]).start();
  };

  const startBreathingExercise = useCallback(() => {
    setIsBreathingActive(true);
    setBreathingPhase('inhale');
    setBreathingTimer(4);
    setCurrentCycle(0);
    animateProgress('inhale');
    animateBreathing('inhale');
  }, []);

  useEffect(() => {
    if (isBreathingActive) {
      animateProgress(breathingPhase);
      animateBreathing(breathingPhase);
    }
  }, [breathingPhase, isBreathingActive]);

  // Sekme odaklandığında scroll'u en başa döndür
  useEffect(() => {
    if (isFocused && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
    }
  }, [isFocused]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathingTimer((prevTimer) => {
          if (prevTimer <= 1) {
            if (breathingPhase === 'inhale') {
              setBreathingPhase('hold');
              setBreathingTimer(7);
              return 7;
            } else if (breathingPhase === 'hold') {
              setBreathingPhase('exhale');
              setBreathingTimer(8);
              return 8;
            } else {
              setCurrentCycle((prev) => {
                if (prev + 1 >= totalCycles) {
                  setIsBreathingActive(false);
                  setBreathingPhase('inhale');
                  setBreathingTimer(4);
                  return 0;
                }
                setBreathingPhase('inhale');
                setBreathingTimer(4);
                return prev + 1;
              });
              return 4;
            }
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreathingActive, breathingPhase]);

  // SVG progress calculation
  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  // Get current styles based on theme
  const currentStyles = colorScheme === 'dark' ? darkStyles : styles;

  return (
    <SafeAreaView edges={['left', 'right']} style={currentStyles.container}>
      <ScrollView 
        ref={scrollViewRef}
        style={currentStyles.scrollView} 
        contentContainerStyle={currentStyles.scrollViewContent}>
        <View style={currentStyles.header}>
          <Text style={currentStyles.title}>Acil Durum</Text>
          <Text style={currentStyles.subtitle}>Güçlü kal, bu geçecek!</Text>
        </View>

        <View style={currentStyles.breathingCard}>
          <Text style={currentStyles.breathingTitle}>Nefes Egzersizi</Text>
          <View style={currentStyles.breathingContainer}>
            <Animated.View 
              style={[
                currentStyles.breathingCircle,
                {
                  transform: [{ scale: circleScale }],
                  opacity: circleOpacity,
                  backgroundColor: colorScheme === 'dark' ? '#25292C' : '#FFFFFF',
                }
              ]}
            >
              <Svg width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth}>
                <Circle
                  cx={radius + strokeWidth / 2}
                  cy={radius + strokeWidth / 2}
                  r={radius}
                  stroke={colorScheme === 'dark' ? '#2A2F33' : '#E9ECEF'}
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                <AnimatedCircle
                  cx={radius + strokeWidth / 2}
                  cy={radius + strokeWidth / 2}
                  r={radius}
                  stroke={getPhaseColor(breathingPhase)}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </Svg>
              <View style={currentStyles.breathingContent}>
                <Text style={[
                  currentStyles.breathingText,
                  { color: getPhaseColor(breathingPhase) }
                ]}>
                  {breathingPhase === 'inhale' ? 'Nefes Al' : breathingPhase === 'hold' ? 'Tut' : 'Ver'}
                </Text>
                <Text style={currentStyles.breathingTimer}>{breathingTimer}</Text>
                <Text style={currentStyles.cycleCounter}>
                  {currentCycle + 1}/{totalCycles}
                </Text>
              </View>
            </Animated.View>
          </View>
          <TouchableOpacity 
            style={[currentStyles.startButton, isBreathingActive && currentStyles.stopButton]} 
            onPress={() => {
              if (isBreathingActive) {
                setIsBreathingActive(false);
                setBreathingPhase('inhale');
                setBreathingTimer(4);
                setCurrentCycle(0);
                circleScale.setValue(1);
                circleOpacity.setValue(1);
                progressAnim.setValue(0);
              } else {
                startBreathingExercise();
              }
            }}
          >
            <Text style={currentStyles.startButtonText}>
              {isBreathingActive ? 'Durdur' : 'Başlat'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={currentStyles.techniquesContainer}>
          <Text style={currentStyles.techniquesTitle}>Dikkat Dağıtma Teknikleri</Text>
          {distractionTechniques.map((technique, index) => (
            <TouchableOpacity key={index} style={currentStyles.techniqueCard}>
              <FontAwesome name={technique.icon} size={24} color={colorScheme === 'dark' ? '#58A6FF' : '#007AFF'} />
              <View style={currentStyles.techniqueContent}>
                <Text style={currentStyles.techniqueTitle}>{technique.title}</Text>
                <Text style={currentStyles.techniqueDescription}>{technique.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={currentStyles.supportCard}>
          <Text style={currentStyles.supportTitle}>Destek Al</Text>
          <TouchableOpacity style={currentStyles.supportButton}>
            <FontAwesome name="phone" size={20} color="#FFFFFF" />
            <Text style={currentStyles.supportButtonText}>Alo 171 Sigara Bırakma Danışma Hattı</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 10, // Tab bar'ın üzerinde küçük bir boşluk bırakır
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212529',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    marginTop: 8,
  },
  breathingCard: {
    margin: 20,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  breathingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 24,
  },
  breathingContainer: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0D6EFD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  breathingActive: {
    backgroundColor: '#D0EBFF',
    transform: [{ scale: 1.1 }],
  },
  breathingText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  breathingTimer: {
    fontSize: 36,
    fontWeight: '700',
    color: '#6C757D',
  },
  startButton: {
    marginTop: 24,
    backgroundColor: '#0D6EFD',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#0D6EFD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  techniquesContainer: {
    padding: 20,
  },
  techniquesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 20,
  },
  techniqueCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  techniqueContent: {
    marginLeft: 16,
    flex: 1,
  },
  techniqueTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
  },
  techniqueDescription: {
    fontSize: 15,
    color: '#6C757D',
    marginTop: 6,
    lineHeight: 22,
  },
  supportCard: {
    margin: 20,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  supportTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 20,
  },
  supportButton: {
    backgroundColor: '#198754',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#198754',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  supportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  cycleCounter: {
    fontSize: 16,
    color: '#6C757D',
    marginTop: 8,
  },
  breathingContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Dark theme styles
const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151718',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  header: {
    padding: 24,
    backgroundColor: '#1A1D1E',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2F33',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ECEDEE',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#9BA1A6',
    marginTop: 8,
  },
  breathingCard: {
    margin: 20,
    padding: 24,
    backgroundColor: '#1A1D1E',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  breathingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ECEDEE',
    marginBottom: 24,
  },
  breathingContainer: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#25292C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0D6EFD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  breathingActive: {
    backgroundColor: '#2C3F55',
    transform: [{ scale: 1.1 }],
  },
  breathingText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  breathingTimer: {
    fontSize: 36,
    fontWeight: '700',
    color: '#9BA1A6',
  },
  startButton: {
    marginTop: 24,
    backgroundColor: '#0D6EFD',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#0D6EFD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  stopButton: {
    backgroundColor: '#FF453A',
  },
  startButtonText: {
    color: '#ECEDEE',
    fontSize: 18,
    fontWeight: '700',
  },
  techniquesContainer: {
    padding: 20,
  },
  techniquesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ECEDEE',
    marginBottom: 20,
  },
  techniqueCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1D1E',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  techniqueContent: {
    marginLeft: 16,
    flex: 1,
  },
  techniqueTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ECEDEE',
  },
  techniqueDescription: {
    fontSize: 15,
    color: '#9BA1A6',
    marginTop: 6,
    lineHeight: 22,
  },
  supportCard: {
    margin: 20,
    padding: 24,
    backgroundColor: '#1A1D1E',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  supportTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ECEDEE',
    marginBottom: 20,
  },
  supportButton: {
    backgroundColor: '#2EA043',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#2EA043',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  supportButtonText: {
    color: '#ECEDEE',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  cycleCounter: {
    fontSize: 16,
    color: '#9BA1A6',
    marginTop: 8,
  },
  breathingContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});