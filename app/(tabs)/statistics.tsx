import { useIsFocused } from '@react-navigation/native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useColorScheme } from '../../hooks/useColorScheme';
import { storage, UserData } from '../../utils/storage';

export default function StatisticsScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [now, setNow] = useState(new Date());
  const scrollViewRef = useRef<ScrollView>(null);
  const isFocused = useIsFocused();
  const colorScheme = useColorScheme();

  useEffect(() => {
    const loadUserData = async () => {
      const data = await storage.getUserData();
      if (data) {
        setUserData(data);
      }
    };
    loadUserData();
    
    // Sekme odaklandığında scroll'u en başa döndür
    if (isFocused && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
    }
  }, [isFocused]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const quitDateObj = useMemo(() => {
    if (userData?.quitDate) {
      return new Date(userData.quitDate);
    }
    return new Date();
  }, [userData]);

  const diff = now.getTime() - quitDateObj.getTime();
  const totalMinutes = Math.floor(diff / (1000 * 60));
  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Calculate the difference in years and months based on calendar dates
  let yearsPassed = now.getFullYear() - quitDateObj.getFullYear();
  let monthsPassed = now.getMonth() - quitDateObj.getMonth();

  // Adjust months and years if current day is before quit day
  if (now.getDate() < quitDateObj.getDate()) {
    monthsPassed--;
  }

  if (monthsPassed < 0) {
    monthsPassed += 12;
    yearsPassed--;
  }

  const totalMonthsExact = yearsPassed * 12 + monthsPassed;

  // Debug logging
  console.log('Debug Statistics Time Calculations:', {
    quitDate: quitDateObj.toISOString(),
    now: now.toISOString(),
    yearsPassed,
    monthsPassed,
    totalMonthsExact,
    totalDays,
    totalMinutes
  });

  // Health milestones
  const healthMilestones = [
    {
      label: 'Nabzın ve kan basıncın normale döndü. Vücudun bağımlılığa karşı ilk zaferini kazandı.',
      time: 20,
      total: 20,
      unit: '20 Dakika',
      isMinutes: true
    },
    {
      label: 'Karbonmonoksit seviyen düştü, oksijen hücrelerine tam kapasiteyle ulaşmaya başladı.',
      time: 8 * 60,
      total: 8 * 60,
      unit: '8 Saat',
      isMinutes: true
    },
    {
      label: 'Bir gün içinde kalp krizi riskin azaldı, vücudun derin bir nefes aldı.',
      time: 24 * 60,
      total: 24 * 60,
      unit: '24 Saat',
      isMinutes: true
    },
    {
      label: 'Nikotin tamamen vücudundan atıldı. Artık fiziksel bağımlılıktan kurtuldun.',
      time: 2 * 24 * 60,
      total: 2 * 24 * 60,
      unit: '2 Gün',
      isMinutes: true
    },
    {
      label: 'Tat ve koku duyuların geri döndü. Hayat artık daha lezzetli ve anlamlı.',
      time: 3 * 24 * 60,
      total: 3 * 24 * 60,
      unit: '3 Gün',
      isMinutes: true
    },
    {
      label: 'Nefes alman belirgin şekilde kolaylaştı. Vücudun temiz havayı hak ediyor.',
      time: 7 * 24 * 60,
      total: 7 * 24 * 60,
      unit: '1 Hafta',
      isMinutes: true
    },
    {
      label: 'Öksürük ve nefes darlığın azaldı. Kan dolaşımın güç kazandı.',
      time: 14 * 24 * 60,
      total: 14 * 24 * 60,
      unit: '2 Hafta',
      isMinutes: true
    },
    {
      label: 'Akciğer fonksiyonların %30’a kadar iyileşti. Merdivenler artık düşmanın değil.',
      time: 30,
      total: 30,
      unit: '1 Ay',
      isMonths: true
    },
    {
      label: 'Bağışıklık sistemin güçlendi. Vücudun hastalıklara karşı daha dirençli hale geldi.',
      time: 3,
      total: 3,
      unit: '3 Ay',
      isMonths: true
    },
    {
      label: 'Solunum yollarındaki silyalar (temizleyici tüyler) yenilendi. Akciğerin kendini temizliyor.',
      time: 9,
      total: 9,
      unit: '9 Ay',
      isMonths: true
    },
    {
      label: 'Kalp hastalıkları riskin %50 azaldı. Kalbin sana teşekkür ediyor.',
      time: 1,
      total: 1,
      unit: '1 Yıl',
      isYears: true
    },
    {
      label: 'Vücudun doğurganlık, enerji ve stres yönetiminde dengeye ulaştı.',
      time: 1.5,
      total: 1.5,
      unit: '1.5 Yıl',
      isYears: true
    },
    {
      label: 'Mesane kanserine yakalanma riskin belirgin ölçüde azaldı.',
      time: 3,
      total: 3,
      unit: '3 Yıl',
      isYears: true
    },
    {
      label: 'Kalp krizi ve inme riskin, sigara içmeyen bir bireyle aynı seviyeye indi.',
      time: 5,
      total: 5,
      unit: '5 Yıl',
      isYears: true
    },
    {
      label: 'Akciğer kanseri riskin %50 azaldı. En büyük organlarından biri seni kutluyor.',
      time: 10,
      total: 10,
      unit: '10 Yıl',
      isYears: true
    },
    {
      label: 'Kalp krizi ve felç riskin, hiç sigara içmemiş biriyle neredeyse birebir aynı hale geldi.',
      time: 15,
      total: 15,
      unit: '15 Yıl',
      isYears: true
    }
  ];

  const totalMilestones = healthMilestones.length;
  const completedMilestones = healthMilestones.filter(item => {
    const percent = getPercent(item.time, item.total, item.isMinutes, item.isMonths, item.isYears);
    return percent === 100;
  }).length;

  function getPercent(value: number, total: number, isMinutes: boolean = false, isMonths: boolean = false, isYears: boolean = false) {
    let current;
    if (isMinutes) {
      current = totalMinutes;
    } else if (isMonths) {
      current = totalMonthsExact;
    } else if (isYears) {
      current = yearsPassed;
    } else {
      current = totalDays;
    }
    return Math.min(100, Math.round((current / total) * 100));
  }

  const CircleProgress = ({ percent }: { percent: number }) => {
    const size = 64;
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = percent === 100 ? circumference : (percent / 100) * circumference;

    // Get appropriate colors based on theme
    const baseCircleColor = colorScheme === 'dark' ? '#2A2F33' : '#E9ECEF';
    const progressCircleColor = colorScheme === 'dark' ? '#2EA043' : '#198754'; // Green color for both themes
    const textColor = percent === 100 
      ? (colorScheme === 'dark' ? '#2EA043' : '#198754') 
      : (colorScheme === 'dark' ? '#9BA1A6' : '#A0A0A0');

    return (
      <View style={styles.progressCircleWrapper}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={baseCircleColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {percent > 0 && (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={progressCircleColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
              transform={`rotate(-90, ${size / 2}, ${size / 2})`}
            />
          )}
        </Svg>
        <Text style={[styles.progressPercent, { color: textColor }]}>
          {percent}%
        </Text>
      </View>
    );
  };

  // Get current styles based on theme
  const currentStyles = colorScheme === 'dark' ? darkStyles : styles;

  return (
    <SafeAreaView edges={['left', 'right']} style={currentStyles.container}>
      <ScrollView 
        ref={scrollViewRef}
        style={currentStyles.scrollView} 
        contentContainerStyle={currentStyles.scrollViewContent}>
        <View style={currentStyles.header}>
          <View style={currentStyles.headerTop}>
            <Text style={currentStyles.title}>Sağlık</Text>
            <View style={currentStyles.progressCount}>
              <Text style={currentStyles.progressCountText}>{completedMilestones}/{totalMilestones}</Text>
            </View>
          </View>
          <Text style={currentStyles.subtitle}>Sigarayı bıraktıktan sonraki değişimlere tanık ol</Text>
        </View>
        <View style={currentStyles.progressList}>
          {healthMilestones.map((item, idx) => {
            const percent = getPercent(item.time, item.total, item.isMinutes, item.isMonths, item.isYears);
            return (
              <View key={idx} style={currentStyles.progressCard}>
                <CircleProgress percent={percent} />
                <View style={currentStyles.progressContent}>
                  <Text style={currentStyles.progressLabel}>{item.label}</Text>
                  <Text style={currentStyles.progressTime}>{item.unit}</Text>
                </View>
              </View>
            );
          })}
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212529',
    letterSpacing: -0.5,
  },
  progressCount: {
    backgroundColor: '#E9ECEF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  progressCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    marginTop: 8,
  },
  progressList: {
    padding: 20,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  progressCircleWrapper: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    position: 'relative',
  },
  progressPercent: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: '700',
    zIndex: 1,
  },
  progressContent: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 15,
    color: '#212529',
    fontWeight: '600',
    marginBottom: 4,
  },
  progressTime: {
    fontSize: 13,
    color: '#6C757D',
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ECEDEE',
    letterSpacing: -0.5,
  },
  progressCount: {
    backgroundColor: '#25292C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  progressCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ECEDEE',
  },
  subtitle: {
    fontSize: 16,
    color: '#9BA1A6',
    marginTop: 8,
  },
  progressList: {
    padding: 20,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1D1E',
    borderRadius: 16,
    marginBottom: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  progressCircleWrapper: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    position: 'relative',
  },
  progressPercent: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: '700',
    zIndex: 1,
  },
  progressContent: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 15,
    color: '#ECEDEE',
    fontWeight: '600',
    marginBottom: 4,
  },
  progressTime: {
    fontSize: 13,
    color: '#9BA1A6',
  },
});