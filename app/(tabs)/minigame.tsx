import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gameStorage } from '../../utils/gameStorage';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const GAME_DURATION = 60; // 60 saniye
const MAX_DIFFICULTY = 10;
const BALLOONS_PER_LEVEL = 5; // Her 5 balon için zorluk artışı

interface BalloonProps {
  onPop: () => void;
  color: string;
  position: {
    x: number;
    y: number;
  };
  speed: number;
}

interface Balloon {
  id: number;
  color: string;
  position: {
    x: number;
    y: number;
  };
  speed: number;
  direction: {
    x: number;
    y: number;
  };
  points: number;
  size: number;
}

const DifficultyBattery = ({ level }: { level: number }) => {
  const segments = Array.from({ length: MAX_DIFFICULTY }, (_, i) => i + 1);
  const getColor = (segment: number) => {
    if (segment <= level) {
      if (level <= 3) return '#00E676'; // Daha canlı yeşil
      if (level <= 6) return '#FFD600'; // Daha canlı sarı
      if (level <= 8) return '#FF9100'; // Daha canlı turuncu
      return '#FF1744'; // Daha canlı kırmızı
    }
    return 'rgba(255, 255, 255, 0.2)';
  };

  return (
    <View style={styles.batteryContainer}>
      <View style={styles.batteryBody}>
        {segments.map((segment) => (
          <View
            key={segment}
            style={[
              styles.batterySegment,
              { backgroundColor: getColor(segment) },
            ]}
          />
        ))}
      </View>
      <View style={styles.batteryTop} />
    </View>
  );
};

const Balloon: React.FC<BalloonProps> = ({ onPop, color, position, speed }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 3,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -10,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  return (
    <TouchableOpacity
      onPress={onPop}
      style={[
        styles.balloon,
        {
          backgroundColor: color,
          left: position.x,
          top: position.y,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.balloonInner,
          {
            transform: [
              { scale },
              { translateY },
            ],
          },
        ]}
      />
    </TouchableOpacity>
  );
};

export default function MinigameScreen() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [poppedBalloons, setPoppedBalloons] = useState(0); // Patlatılan balon sayısı
  const isFocused = useIsFocused();

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

  const createBalloon = () => {
    // Zorluk arttıkça balonlar küçülür
    const size = Math.max(30, 70 - (difficulty * 3)); 
    
    // Patlatılan balon sayısı arttıkça renk varyasyonu artar
    const balloonColor = poppedBalloons > 20 ? 
      `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)` :
      colors[Math.floor(Math.random() * colors.length)];
    
    // Zorluk bazlı puan hesaplama
    const pointValue = Math.floor(Math.random() * difficulty) + difficulty;
    
    const newBalloon: Balloon = {
      id: Date.now(),
      color: balloonColor,
      position: {
        x: Math.random() * (SCREEN_WIDTH - size),
        y: Math.random() * (SCREEN_HEIGHT - size - 100), // Header için alan bırak
      },
      speed: 1 + (difficulty * 0.8) + (poppedBalloons * 0.02), // Hem zorluk hem de patlatılan balon sayısıyla hızlanır
      direction: {
        x: (Math.random() - 0.5) * 2, // -1 ile 1 arası
        y: (Math.random() - 0.5) * 2,
      },
      points: pointValue,
      size,
    };
    setBalloons((prev) => [...prev, newBalloon]);
  };

  const updateBalloonPositions = () => {
    setBalloons((prev) =>
      prev.map((balloon) => {
        const newX = balloon.position.x + balloon.speed * balloon.direction.x;
        const newY = balloon.position.y + balloon.speed * balloon.direction.y;

        // Ekran sınırlarını kontrol et ve yönü değiştir
        if (newX <= 0 || newX >= SCREEN_WIDTH - balloon.size) {
          balloon.direction.x *= -1;
        }
        if (newY <= 0 || newY >= SCREEN_HEIGHT - balloon.size - 100) {
          balloon.direction.y *= -1;
        }

        return {
          ...balloon,
          position: {
            x: Math.max(0, Math.min(SCREEN_WIDTH - balloon.size, newX)),
            y: Math.max(0, Math.min(SCREEN_HEIGHT - balloon.size - 100, newY)),
          },
        };
      })
    );
  };

  const popBalloon = (id: number) => {
    const balloon = balloons.find((b) => b.id === id);
    if (balloon) {
      setScore((prev) => prev + balloon.points);
      setPoppedBalloons((prev) => {
        const newCount = prev + 1;
        // Patlatılan her BALLOONS_PER_LEVEL balon için zorluk artar
        if (newCount % BALLOONS_PER_LEVEL === 0 && difficulty < MAX_DIFFICULTY) {
          setDifficulty(d => Math.min(d + 1, MAX_DIFFICULTY));
        }
        return newCount;
      });
    }
    setBalloons((prev) => prev.filter((balloon) => balloon.id !== id));
  };

  const startGame = () => {
    // Önce tüm durumları sıfırla
    setBalloons([]);
    setPoppedBalloons(0);
    setScore(0);
    setDifficulty(1);
    setTimeLeft(GAME_DURATION);
    
    // Sonra oyunu aktif et - Bu sıralama önemli çünkü isPlaying state'i değiştiğinde
    // yukarıda düzelttiğimiz useEffect tetiklenecek ve zamanlayıcılar başlayacak
    setTimeout(() => {
      setIsPlaying(true);
    }, 100);
  };

  // Sekme odaklandığında oyunu sıfırla
  useEffect(() => {
    if (isFocused && !isPlaying) {
      setScore(0);
      setTimeLeft(GAME_DURATION);
      setBalloons([]);
      setDifficulty(1);
    }
  }, [isFocused]);

  // Yüksek skor verisini AsyncStorage'dan yükle
  useEffect(() => {
    const loadHighScore = async () => {
      const savedHighScore = await gameStorage.getHighScore();
      setHighScore(savedHighScore);
    };
    loadHighScore();
  }, []);
  
  // Yüksek skor değiştiğinde kaydet
  useEffect(() => {
    if (highScore > 0) {
      gameStorage.saveHighScore(highScore);
    }
  }, [highScore]);

  useEffect(() => {
    let gameInterval: NodeJS.Timeout;
    let balloonInterval: NodeJS.Timeout;
    let updateInterval: NodeJS.Timeout;

    if (isPlaying) {
      // Zamanlayıcı
      gameInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            // Eğer mevcut skor, yüksek skordan büyükse, yüksek skoru güncelle ve kaydet
            if (score > highScore) {
              setHighScore(score);
              // Not: Setstate yaptıktan sonra diğer useEffect içinde kayıt otomatik yapılacak
            }
            return 0;
          }
          // Her 15 saniyede bir zorluk seviyesini artır
          if (prev % 15 === 0 && difficulty < MAX_DIFFICULTY) {
            setDifficulty((d) => Math.min(d + 1, MAX_DIFFICULTY));
          }
          return prev - 1;
        });
      }, 1000);

      balloonInterval = setInterval(() => {
        // Zorluk arttıkça daha fazla balon ve daha hızlı oluşturma
        const maxBalloons = Math.min(3 + Math.floor(difficulty * 1.5), 15);
        if (balloons.length < maxBalloons) {
          createBalloon();
        }
      }, Math.max(1000 - (difficulty * 50), 300)); // Zorluk arttıkça balonlar daha hızlı oluşur (minimum 300ms)

      updateInterval = setInterval(() => {
        updateBalloonPositions();
      }, 16); // ~60 FPS
    }

    // Temizleme fonksiyonu - component unmount edildiğinde veya dependency değiştiğinde çağrılır
    return () => {
      if (gameInterval) clearInterval(gameInterval);
      if (balloonInterval) clearInterval(balloonInterval);
      if (updateInterval) clearInterval(updateInterval);
    };
  }, [isPlaying, difficulty]); // Sadece oyun durumu ve zorluk değiştiğinde interval'ları yeniden oluştur

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.container}>
      <LinearGradient
        colors={['#0F2027', '#203A43', '#2C5364']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <View style={styles.header}>
          <View style={styles.scoreContainer}>
            <Text style={styles.score}>Skor: {score}</Text>
            <Text style={styles.timer}>Süre: {timeLeft}s</Text>
            <Text style={styles.balloonCount}>Balonlar: {poppedBalloons}</Text>
          </View>
          <View style={styles.difficultyContainer}>
            <Text style={styles.difficultyText}>Zorluk</Text>
            <DifficultyBattery level={difficulty} />
          </View>
        </View>

        <View style={styles.gameArea}>
          {balloons.map((balloon) => (
            <Balloon
              key={balloon.id}
              color={balloon.color}
              position={balloon.position}
              speed={balloon.speed}
              onPop={() => popBalloon(balloon.id)}
            />
          ))}
        </View>

        {!isPlaying && (
          <View style={styles.gameOverContainer}>
            <LinearGradient
              colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)']}
              style={styles.gameOverGradient}
            >
              <Text style={styles.gameOverText}>
                {score > 0 ? 'Oyun Bitti!' : 'Balon Patlatma Oyunu'}
              </Text>
              {score > 0 && (
                <>
                  <Text style={styles.finalScore}>Toplam Skor: {score}</Text>
                  <Text style={styles.poppedBalloons}>Patlatılan Balonlar: {poppedBalloons}</Text>
                  <Text style={styles.highScore}>En Yüksek Skor: {highScore}</Text>
                </>
              )}
              <TouchableOpacity style={styles.startButton} onPress={startGame}>
                <Text style={styles.startButtonText}>
                  {score > 0 ? 'Tekrar Oyna' : 'Oyunu Başlat'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  scoreContainer: {
    flex: 1,
  },
  score: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  timer: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  balloonCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  difficultyContainer: {
    alignItems: 'center',
    marginLeft: 20,
  },
  difficultyText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryBody: {
    flexDirection: 'row',
    height: 24,
    width: 140,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  batterySegment: {
    flex: 1,
    margin: 1,
    borderRadius: 2,
  },
  batteryTop: {
    width: 4,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginLeft: 2,
    borderRadius: 2,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  balloon: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balloonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  gameOverContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  finalScore: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  poppedBalloons: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  highScore: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 30,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  startButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 35,
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});