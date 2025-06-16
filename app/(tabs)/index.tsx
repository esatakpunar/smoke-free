import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '../../hooks/useColorScheme';
import { storage, UserData } from '../../utils/storage';

export default function HomeScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [quitDate, setQuitDate] = useState<number>(() => new Date().getTime());
  const [cigarettesPerDay, setCigarettesPerDay] = useState('20');
  const [cigarettesPerPack, setCigarettesPerPack] = useState('20');
  const [packPrice, setPackPrice] = useState('2');
  const [smokeTime, setSmokeTime] = useState('6');
  const [now, setNow] = useState(new Date());
  const scrollViewRef = useRef<ScrollView>(null);
  const isFocused = useIsFocused();
  const colorScheme = useColorScheme();

  // İlk açılışta ve ekran odaklandığında kullanıcı verisini kontrol et
  useEffect(() => {
    const loadUserData = async () => {
      const data = await storage.getUserData();
      console.log('HomeScreen - Loaded User Data:', data);
      if (!data || data.isFirstTime) {
        console.log('HomeScreen - Opening settings modal: No data or isFirstTime is true');
        setIsSettingsModalVisible(true);
        setQuitDate(new Date().getTime());
        setCigarettesPerDay('20');
        setCigarettesPerPack('20');
        setPackPrice('2');
        setSmokeTime('6');
      } else {
        console.log('HomeScreen - User data exists, not opening modal.');
        setUserData(data);
        setQuitDate(data.quitDate);
        setCigarettesPerDay(data.cigarettesPerDay.toString());
        setCigarettesPerPack(data.cigarettesPerPack.toString());
        setPackPrice(data.packPrice.toString());
        setSmokeTime(data.smokeTime.toString());
      }
    };
    loadUserData();
    
    // Sekme odaklandığında scroll'u en başa döndür
    if (isFocused && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
    }
  }, [isFocused]); // isFocused değiştiğinde yeniden yükle

  // Sayaç için zamanı güncelle
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 100);
    return () => clearInterval(interval);
  }, []);

  // Bilgileri kaydet
  const handleSave = async () => {
    if (!cigarettesPerDay || !cigarettesPerPack || !packPrice || !smokeTime) {
      Alert.alert('Lütfen tüm alanları doldurun.');
      return;
    }
    const data: UserData = {
      quitDate: quitDate,
      cigarettesPerDay: parseInt(cigarettesPerDay),
      cigarettesPerPack: parseInt(cigarettesPerPack),
      packPrice: parseFloat(packPrice),
      smokeTime: parseInt(smokeTime),
      isFirstTime: false,
    };
    await storage.saveUserData(data);
    setUserData(data);
    setIsSettingsModalVisible(false);
  };

  // Sayaç ve istatistikler
  const quitDateObj = useMemo(() => {
    if (userData?.quitDate) {
      return new Date(userData.quitDate);
    }
    return new Date(quitDate);
  }, [userData, quitDate]);

  const diff = now.getTime() - quitDateObj.getTime();
  const ms = Math.floor((diff % 1000) / 10);
  const totalSeconds = Math.floor(diff / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  const totalDays = Math.floor(totalHours / 24);
  const days = totalDays % 7;
  const weeks = Math.floor(totalDays / 7) % 4;

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

  const months = monthsPassed;
  const years = yearsPassed;

  // Stats
  const cigarettesPerDayNum = userData?.cigarettesPerDay || 0;
  const cigarettePrice = userData?.packPrice ? userData.packPrice / (userData.cigarettesPerPack || 20) : 0;
  const cigarettesAvoided = totalDays * cigarettesPerDayNum + Math.floor((hours / 24) * cigarettesPerDayNum);
  const moneySaved = cigarettesAvoided * cigarettePrice;
  const minutesSaved = cigarettesAvoided * (userData?.smokeTime || 6);
  const savedDays = Math.floor(minutesSaved / (60 * 24));
  const savedHours = Math.floor((minutesSaved % (60 * 24)) / 60);
  const savedMinutes = minutesSaved % 60;

  // Sağlık durumu hesaplaması - bilimsel kilometre taşlarına göre
  const calculateHealthPercent = () => {
    const milestones = [
      { time: 10 / (24 * 60), percent: 0 },      // 20 dakika
      { time: 8 / 24, percent: 3 },             // 8 saat
      { time: 1, percent: 5 },                  // 1 gün
      { time: 2, percent: 10 },                  // 2 gün
      { time: 3, percent: 15 },                  // 3 gün
      { time: 7, percent: 20 },                  // 1 hafta
      { time: 14, percent: 25 },                 // 2 hafta
      { time: 30, percent: 30 },                 // 1 ay
      { time: 90, percent: 40 },                 // 3 ay
      { time: 180, percent: 50 },                // 6 ay
      { time: 365, percent: 60 },                // 1 yıl
      { time: 365 * 2, percent: 70 },            // 2 yıl
      { time: 365 * 5, percent: 80 },            // 5 yıl
      { time: 365 * 10, percent: 90 },           // 10 yıl
      { time: 365 * 15, percent: 100 }           // 15 yıl
    ];

    // Gün cinsinden geçen süre
    const daysPassed = totalDays;

    // En son geçilen kilometre taşını bul
    let lastMilestone = milestones[0];
    for (const milestone of milestones) {
      if (daysPassed >= milestone.time) {
        lastMilestone = milestone;
      } else {
        break;
      }
    }

    // Bir sonraki kilometre taşını bul
    const nextMilestoneIndex = milestones.indexOf(lastMilestone) + 1;
    const nextMilestone = nextMilestoneIndex < milestones.length ? milestones[nextMilestoneIndex] : lastMilestone;

    // İki kilometre taşı arasındaki ilerlemeyi hesapla
    const progress = (daysPassed - lastMilestone.time) / (nextMilestone.time - lastMilestone.time);
    const healthPercent = Math.min(100, Math.round(lastMilestone.percent + (nextMilestone.percent - lastMilestone.percent) * progress));

    return healthPercent;
  };

  const lungPercent = calculateHealthPercent();

  // Get current styles based on theme
  const currentStyles = colorScheme === 'dark' ? darkStyles : styles;
  
  return (
    <SafeAreaView edges={['left', 'right']} style={currentStyles.container}>
      <ScrollView 
        ref={scrollViewRef}
        style={currentStyles.scrollView} 
        contentContainerStyle={currentStyles.scrollViewContent}>
        <View style={currentStyles.header}>
          <Text style={currentStyles.title}>Sigarayı Bırak</Text>
          <Text style={currentStyles.subtitle}>Sigarasız geçen zaman</Text>
        </View>
        {/* Sayaç */}
        <View style={currentStyles.timerGrid}>
          <View style={currentStyles.timerBox}><Text style={currentStyles.timerValue}>{years}</Text><Text style={currentStyles.timerLabel}>Yıl</Text></View>
          <View style={currentStyles.timerBox}><Text style={currentStyles.timerValue}>{months}</Text><Text style={currentStyles.timerLabel}>Ay</Text></View>
          <View style={currentStyles.timerBox}><Text style={currentStyles.timerValue}>{weeks}</Text><Text style={currentStyles.timerLabel}>Hafta</Text></View>
          <View style={currentStyles.timerBox}><Text style={currentStyles.timerValue}>{days}</Text><Text style={currentStyles.timerLabel}>Gün</Text></View>
          <View style={currentStyles.timerBox}><Text style={currentStyles.timerValue}>{hours}</Text><Text style={currentStyles.timerLabel}>Saat</Text></View>
          <View style={currentStyles.timerBox}><Text style={currentStyles.timerValue}>{minutes}</Text><Text style={currentStyles.timerLabel}>Dakika</Text></View>
          <View style={currentStyles.timerBox}><Text style={currentStyles.timerValue}>{seconds}</Text><Text style={currentStyles.timerLabel}>Saniye</Text></View>
          <View style={currentStyles.timerBox}><Text style={currentStyles.timerValue}>{ms.toString().padStart(2, '0')}</Text><Text style={currentStyles.timerLabel}>Milis.</Text></View>
        </View>
        {/* Stat Cards */}
        <View style={currentStyles.statsRow}>
          <View style={currentStyles.statCard}>
            <FontAwesome5 name="lungs" size={32} color={colorScheme === 'dark' ? "#2EA043" : "#198754"} style={{ marginBottom: 8 }} />
            <Text style={currentStyles.statTitle}>Sağlık durumum</Text>
            <Text style={currentStyles.statValueLarge}>{lungPercent}%</Text>
          </View>
          <View style={currentStyles.statCard}>
            <FontAwesome name="money" size={32} color={colorScheme === 'dark' ? "#58A6FF" : "#0D6EFD"} style={{ marginBottom: 8 }} />
            <Text style={currentStyles.statTitle}>Cepte kalan Para</Text>
            <Text style={currentStyles.statValueLarge}>{moneySaved.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} ₺</Text>
          </View>
        </View>
        <View style={currentStyles.statsRow}>
          <View style={currentStyles.statCard}>
            <Text style={currentStyles.statTitle}>İçilmemiş sigara</Text>
            <View style={currentStyles.savedTimeGrid}>
              <View style={currentStyles.savedTimeBox}>
                <Text style={currentStyles.savedTimeValue}>{cigarettesAvoided.toLocaleString('tr-TR')}</Text>
                <Text style={currentStyles.savedTimeLabel}>Adet</Text>
              </View>
            </View>
          </View>
          <View style={currentStyles.statCard}>
            <Text style={currentStyles.statTitle}>Kurtarılan zaman</Text>
            <View style={currentStyles.savedTimeGrid}>
              <View style={currentStyles.savedTimeBox}>
                <Text style={currentStyles.savedTimeValue}>{savedDays}</Text>
                <Text style={currentStyles.savedTimeLabel}>Gün</Text>
              </View>
              <View style={currentStyles.savedTimeBox}>
                <Text style={currentStyles.savedTimeValue}>{savedHours}</Text>
                <Text style={currentStyles.savedTimeLabel}>Saat</Text>
              </View>
              <View style={currentStyles.savedTimeBox}>
                <Text style={currentStyles.savedTimeValue}>{savedMinutes}</Text>
                <Text style={currentStyles.savedTimeLabel}>Dakika</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      {/* Ayar Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSettingsModalVisible}
        onRequestClose={() => setIsSettingsModalVisible(false)}>
        <View style={currentStyles.modalOverlay}>
          <View style={currentStyles.modalContent}>
            <View style={currentStyles.modalHeader}>
              <Text style={currentStyles.modalTitle}>Bilgilerimi Düzenle</Text>
            </View>
            <ScrollView style={currentStyles.modalScrollView}>
              <View style={currentStyles.inputGroup}>
                <Text style={currentStyles.inputLabel}>Bırakma Tarihi</Text>
                <TextInput 
                  style={currentStyles.input} 
                  value={new Date(quitDate).toISOString().slice(0, 16)} 
                  onChangeText={(text) => setQuitDate(new Date(text).getTime())} 
                  placeholder="YYYY-MM-DDTHH:mm"
                  placeholderTextColor={colorScheme === 'dark' ? '#9BA1A6' : '#6C757D'} 
                />
              </View>
              <View style={currentStyles.inputGroup}>
                <Text style={currentStyles.inputLabel}>Günde içilen sigara sayısı</Text>
                <TextInput 
                  style={currentStyles.input} 
                  value={cigarettesPerDay} 
                  onChangeText={setCigarettesPerDay} 
                  keyboardType="numeric"
                  placeholderTextColor={colorScheme === 'dark' ? '#9BA1A6' : '#6C757D'}
                />
              </View>
              <View style={currentStyles.inputGroup}>
                <Text style={currentStyles.inputLabel}>Paketteki sigara sayısı</Text>
                <TextInput 
                  style={currentStyles.input} 
                  value={cigarettesPerPack} 
                  onChangeText={setCigarettesPerPack} 
                  keyboardType="numeric"
                  placeholderTextColor={colorScheme === 'dark' ? '#9BA1A6' : '#6C757D'}
                />
              </View>
              <View style={currentStyles.inputGroup}>
                <Text style={currentStyles.inputLabel}>Paketin fiyatı</Text>
                <TextInput 
                  style={currentStyles.input} 
                  value={packPrice} 
                  onChangeText={setPackPrice} 
                  keyboardType="numeric"
                  placeholderTextColor={colorScheme === 'dark' ? '#9BA1A6' : '#6C757D'}
                />
              </View>
              <View style={currentStyles.inputGroup}>
                <Text style={currentStyles.inputLabel}>Bir sigarayı içme süreniz (dk.)</Text>
                <TextInput 
                  style={currentStyles.input} 
                  value={smokeTime} 
                  onChangeText={setSmokeTime} 
                  keyboardType="numeric"
                  placeholderTextColor={colorScheme === 'dark' ? '#9BA1A6' : '#6C757D'}
                />
              </View>
            </ScrollView>
            <TouchableOpacity style={currentStyles.saveButton} onPress={handleSave}>
              <Text style={currentStyles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  timerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  timerBox: {
    width: '22%',
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
  },
  timerValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212529',
  },
  timerLabel: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 6,
    marginVertical: 4,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValueLarge: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0D6EFD',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212529',
  },
  modalScrollView: {
    maxHeight: '80%',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 4,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    color: '#212529',
    height: 40,
  },
  saveButton: {
    backgroundColor: '#0D6EFD',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
    shadowColor: '#0D6EFD',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  savedTimeGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  savedTimeBox: {
    alignItems: 'center',
    minWidth: 45,
  },
  savedTimeValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0D6EFD',
  },
  savedTimeLabel: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  statValueContainer: {
    flex: 1,
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
  timerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    margin: 20,
    backgroundColor: '#1A1D1E',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  timerBox: {
    width: '22%',
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 8,
    backgroundColor: '#25292C',
    borderRadius: 10,
  },
  timerValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ECEDEE',
  },
  timerLabel: {
    fontSize: 12,
    color: '#9BA1A6',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1D1E',
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 6,
    marginVertical: 4,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#9BA1A6',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValueLarge: {
    fontSize: 22,
    fontWeight: '700',
    color: '#58A6FF',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1D1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ECEDEE',
  },
  modalScrollView: {
    maxHeight: '80%',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#9BA1A6',
    marginBottom: 4,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#25292C',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2A2F33',
    color: '#ECEDEE',
    height: 40,
  },
  saveButton: {
    backgroundColor: '#58A6FF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
    shadowColor: '#58A6FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonText: {
    color: '#ECEDEE',
    fontSize: 16,
    fontWeight: '700',
  },
  savedTimeGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  savedTimeBox: {
    alignItems: 'center',
    minWidth: 45,
  },
  savedTimeValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#58A6FF',
  },
  savedTimeLabel: {
    fontSize: 12,
    color: '#9BA1A6',
    marginTop: 2,
  },
  statValueContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

