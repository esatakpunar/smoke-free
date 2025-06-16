import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '../../hooks/useColorScheme';
import { storage, UserData } from '../../utils/storage';

export default function AchievementsScreen() {
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
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

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
  console.log('Debug Time Calculations:', {
    quitDate: quitDateObj.toISOString(),
    now: now.toISOString(),
    yearsPassed,
    monthsPassed,
    totalMonthsExact,
    totalDays,
    totalHours,
    totalMinutes
  });

  const cigarettesPerDayNum = userData?.cigarettesPerDay || 0;
  const cigarettesPerPackNum = userData?.cigarettesPerPack || 20;
  const packPriceNum = userData?.packPrice || 0;
  const cigarettePrice = packPriceNum / cigarettesPerPackNum;
  const cigaretteSmokeTime = userData?.smokeTime || 6;

  const cigarettesAvoided = totalDays * cigarettesPerDayNum + Math.floor((totalHours % 24) * cigarettesPerDayNum / 24);
  const moneySaved = cigarettesAvoided * cigarettePrice;
  const minutesSaved = cigarettesAvoided * cigaretteSmokeTime;

  // Achievements (mock)
  const achievements = [
    // İlk Kazanım
    { icon: 'heart', color: '#FF6B6B', title: 'İlk Adım', desc: 'Tebrikler! Sigarayı bırakma kararı aldınız. En zor kısmı geride bıraktınız.', achieved: true },
  
    // Zaman Bazlı Kazanımlar
    { icon: 'clock', color: '#FF6B6B', title: '20 Dakika', desc: 'Kan basıncınız normale dönmeye başladı.', achieved: totalMinutes >= 20 },
    { icon: 'lungs', color: '#FF6B6B', title: '8 Saat', desc: 'Kandaki oksijen seviyesi normale ulaştı.', achieved: totalHours >= 8 },
    { icon: 'bed', color: '#FF6B6B', title: '24 Saat', desc: 'Kalp krizi riskiniz azalmaya başladı.', achieved: totalHours >= 24 },
    { icon: 'smile', color: '#FF6B6B', title: '3 Gün', desc: 'Nikotini tamamen vücudunuzdan attınız.', achieved: totalDays >= 3 },
    { icon: 'tint', color: '#FF6B6B', title: '1 Hafta', desc: 'Tat ve koku duyularınız yeniden güç kazandı.', achieved: totalDays >= 7 },
    { icon: 'running', color: '#FF6B6B', title: '2 Hafta', desc: 'Akciğer fonksiyonlarınız %30’a kadar iyileşti.', achieved: totalDays >= 14 },
    { icon: 'calendar-alt', color: '#FF6B6B', title: '1 Ay', desc: 'Enerjiniz artmaya başladı, cildiniz daha parlak.', achieved: totalMonthsExact >= 1 },
    { icon: 'heartbeat', color: '#FF6B6B', title: '3 Ay', desc: 'Akciğerleriniz neredeyse normale döndü.', achieved: totalMonthsExact >= 3 },
    { icon: 'dumbbell', color: '#FF6B6B', title: '6 Ay', desc: 'Nefes darlığı ve öksürük önemli ölçüde azaldı.', achieved: totalMonthsExact >= 6 },
    { icon: 'star', color: '#FF6B6B', title: '1 Yıl', desc: 'Kalp krizi riskiniz %50 azaldı.', achieved: yearsPassed >= 1 },
    { icon: 'leaf', color: '#FF6B6B', title: '2 Yıl', desc: 'Felç geçirme riskiniz ciddi oranda azaldı.', achieved: yearsPassed >= 2 },
    { icon: 'fire', color: '#FF6B6B', title: '5 Yıl', desc: 'Ağız, boğaz ve yemek borusu kanseri riski azaldı.', achieved: yearsPassed >= 5 },
    { icon: 'infinity', color: '#FF6B6B', title: '10 Yıl', desc: 'Akciğer kanseri riski, sigara içmeyen birinin seviyesine yaklaştı.', achieved: yearsPassed >= 10 },
  
    // Para Bazlı Kazanımlar
    { icon: 'wallet', color: '#2ECC71', title: '₺100', desc: 'Bir akşam yemeği parasını kurtardın.', achieved: moneySaved >= 100 },
    { icon: 'wallet', color: '#2ECC71', title: '₺250', desc: 'Kendine küçük bir ödül alabilirsin.', achieved: moneySaved >= 250 },
    { icon: 'wallet', color: '#2ECC71', title: '₺500', desc: 'Bir haftalık market alışverişi kadar tasarruf ettin.', achieved: moneySaved >= 500 },
    { icon: 'wallet', color: '#2ECC71', title: '₺1000', desc: 'Yeni bir kulaklık ya da saat alabilirsin.', achieved: moneySaved >= 1000 },
    { icon: 'wallet', color: '#2ECC71', title: '₺2500', desc: 'Mini bir hafta sonu kaçamağı için yeterli bütçe.', achieved: moneySaved >= 2500 },
    { icon: 'wallet', color: '#2ECC71', title: '₺5000', desc: 'Yeni bir telefon alacak kadar birikim yaptın.', achieved: moneySaved >= 5000 },
    { icon: 'wallet', color: '#2ECC71', title: '₺10000', desc: 'Hayalini kurduğun bir tatil için hazırsın.', achieved: moneySaved >= 10000 },
  
    // Paket Bazlı Kazanımlar
    { icon: 'smoking-ban', color: '#198754', title: '10 Paket', desc: 'Yaklaşık 200 sigarayı içmedin.', achieved: cigarettesAvoided >= 10 * cigarettesPerPackNum },
    { icon: 'smoking-ban', color: '#198754', title: '25 Paket', desc: 'Bir dolabın içini sigarayla doldurmaktan vazgeçtin.', achieved: cigarettesAvoided >= 25 * cigarettesPerPackNum },
    { icon: 'smoking-ban', color: '#198754', title: '50 Paket', desc: 'Ciğerlerin sana minnettar.', achieved: cigarettesAvoided >= 50 * cigarettesPerPackNum },
    { icon: 'smoking-ban', color: '#198754', title: '100 Paket', desc: 'Oturduğun evi dumandan kurtardın.', achieved: cigarettesAvoided >= 100 * cigarettesPerPackNum },
    { icon: 'smoking-ban', color: '#198754', title: '250 Paket', desc: 'Ailenin yanında daha sağlıklı nefes alıyorsun.', achieved: cigarettesAvoided >= 250 * cigarettesPerPackNum },
    { icon: 'smoking-ban', color: '#198754', title: '500 Paket', desc: 'Tüm vücudun bu değişimin farkında.', achieved: cigarettesAvoided >= 500 * cigarettesPerPackNum },
    { icon: 'smoking-ban', color: '#198754', title: '1000 Paket', desc: 'Hayatını tamamen değiştirdin. Gerçek bir zafer!', achieved: cigarettesAvoided >= 1000 * cigarettesPerPackNum },
  ];
  

  const totalAchievements = achievements.length;
  const achievedCount = achievements.filter(ach => ach.achieved).length;

  // Get current styles based on theme
  const currentStyles = colorScheme === 'dark' ? darkStyles : styles;

  return (
    <SafeAreaView edges={['left', 'right']} style={currentStyles.container}>
      <View style={currentStyles.header}>
        <View style={currentStyles.headerTop}>
          <Text style={currentStyles.title}>Kazanımlar</Text>
          <View style={currentStyles.achievementCount}>
            <Text style={currentStyles.achievementCountText}>{achievedCount}/{totalAchievements}</Text>
          </View>
        </View>
        <Text style={currentStyles.subtitle}>Başarılarını görüntüle ve yeni hedefler belirle</Text>
      </View>
      <ScrollView 
        ref={scrollViewRef}
        style={currentStyles.scrollView} 
        contentContainerStyle={currentStyles.scrollViewContent}>
        <View style={currentStyles.achievementsList}>
          {achievements.map((ach, idx) => (
            <View key={idx} style={[currentStyles.achievementCard, !ach.achieved && { opacity: 0.5 }] }>
              <View style={currentStyles.achievementIconWrapper}>
                <FontAwesome5 name="trophy" size={35} color="#FFD700" style={{ position: 'absolute', left: 0, top: 0 }} />
                <FontAwesome5 name={ach.icon} size={10} color={ach.color} style={{ position: 'absolute', left: 15, top: 5 }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={currentStyles.achievementTitle}>{ach.title}</Text>
                <Text style={currentStyles.achievementDesc}>{ach.desc}</Text>
              </View>
              {ach.achieved && <FontAwesome name="check-circle" size={24} color={colorScheme === 'dark' ? "#2EA043" : "#198754"} />}
            </View>
          ))}
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
  achievementCount: {
    backgroundColor: '#E9ECEF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  achievementCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    marginTop: 8,
  },
  achievementsList: {
    padding: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementIconWrapper: {
    width: 44,
    height: 44,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
  },
  achievementDesc: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 2,
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
  achievementCount: {
    backgroundColor: '#25292C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  achievementCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ECEDEE',
  },
  subtitle: {
    fontSize: 16,
    color: '#9BA1A6',
    marginTop: 8,
  },
  achievementsList: {
    padding: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1D1E',
    borderRadius: 16,
    marginBottom: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementIconWrapper: {
    width: 44,
    height: 44,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ECEDEE',
  },
  achievementDesc: {
    fontSize: 14,
    color: '#9BA1A6',
    marginTop: 2,
  },
});