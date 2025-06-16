import { FontAwesome } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { storage, UserData } from '../../utils/storage';

export default function ProfileScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [quitDate, setQuitDate] = useState('');
  const [cigarettesPerDay, setCigarettesPerDay] = useState('');
  const [cigarettesPerPack, setCigarettesPerPack] = useState('');
  const [packPrice, setPackPrice] = useState('');
  const [smokeTime, setSmokeTime] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyRemindersEnabled, setDailyRemindersEnabled] = useState(true);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [isThemeModalVisible, setIsThemeModalVisible] = useState(false);
  const { themePreference, setThemePreference, colorScheme } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const isFocused = useIsFocused();

  const styles = getThemedStyles(colorScheme);

  useEffect(() => {
    const loadUserData = async () => {
      const data = await storage.getUserData();
      if (data) {
        setUserData(data);
        setQuitDate(new Date(data.quitDate).toISOString().slice(0, 16));
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
  }, [isFocused]);

  const handleSave = async () => {
    if (!quitDate || !cigarettesPerDay || !cigarettesPerPack || !packPrice || !smokeTime) {
      Alert.alert('Lütfen tüm alanları doldurun.');
      return;
    }
    const data: UserData = {
      quitDate: new Date(quitDate).getTime(),
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

  const handleReset = () => {
    Alert.alert(
      'Sayaç Sıfırlama',
      'Tüm istatistikleriniz sıfırlanacak. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Tamam',
          style: 'destructive',
          onPress: async () => {
            const currentData = await storage.getUserData();
            if (currentData) {
              const now = new Date();
              const newData: UserData = {
                ...currentData,
                quitDate: now.getTime(),
                isFirstTime: false,
              };
              await storage.saveUserData(newData);
              setUserData(newData);
              setQuitDate(now.toISOString().slice(0, 16));
              Alert.alert('Başarılı', 'Sayaç başarıyla sıfırlandı ve bilgileriniz güncellendi.');
            } else {
              Alert.alert('Hata', 'Kullanıcı verileri bulunamadı. Lütfen önce bilgilerinizi düzenleyin.');
            }
            console.log('Reset confirmed');
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Theme changes are handled directly in the theme modal through setThemePreference

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.container}>
      <ScrollView
        ref={scrollViewRef} 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <FontAwesome name="user-circle" size={80} color={styles.avatarIcon.color} />
            </View>
            <Text style={styles.userName}>Kullanıcı</Text>
          </View>
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Diğer Ayarlar</Text>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setIsThemeModalVisible(true)}>
            <View style={styles.settingInfo}>
              <FontAwesome name="moon-o" size={24} color={styles.settingIcon.color} />
              <Text style={styles.settingLabel}>Görünüm</Text>
            </View>
            <View style={styles.settingAction}>
              <Text style={styles.themeValue}>
                {themePreference === 'system' 
                  ? 'Sistem Tercihi' 
                  : themePreference === 'light' 
                    ? 'Açık Tema'
                    : 'Koyu Tema'}
              </Text>
              <FontAwesome name="chevron-right" size={16} color={styles.settingArrowIcon.color} />
            </View>
          </TouchableOpacity>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <FontAwesome name="bell" size={24} color={styles.settingIcon.color} />
              <Text style={styles.settingLabel}>Bildirimler</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: styles.switchTrackFalse.color, true: styles.accentColor.color }}
              thumbColor={notificationsEnabled ? styles.accentColor.color : styles.switchThumbFalse.color}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <FontAwesome name="clock-o" size={24} color={styles.settingIcon.color} />
              <Text style={styles.settingLabel}>Günlük Hatırlatıcılar</Text>
            </View>
            <Switch
              value={dailyRemindersEnabled}
              onValueChange={setDailyRemindersEnabled}
              trackColor={{ false: styles.switchTrackFalse.color, true: styles.accentColor.color }}
              thumbColor={dailyRemindersEnabled ? styles.accentColor.color : styles.switchThumbFalse.color}
            />
          </View>
        </View>

        <View style={styles.actionsCard}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setIsSettingsModalVisible(true)}>
            <FontAwesome name="edit" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Bilgilerimi Düzenle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleReset}>
            <FontAwesome name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Sigara İçtim, Başa Sar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isSettingsModalVisible}
        onRequestClose={() => setIsSettingsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bilgilerimi Düzenle</Text>
              <TouchableOpacity onPress={() => setIsSettingsModalVisible(false)}>
                <FontAwesome name="times" size={24} color={styles.closeIcon.color} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bırakma Tarihi</Text>
                <TextInput style={styles.input} value={quitDate} onChangeText={setQuitDate} placeholder="YYYY-MM-DDTHH:mm" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Günde içilen sigara sayısı</Text>
                <TextInput style={styles.input} value={cigarettesPerDay} onChangeText={setCigarettesPerDay} keyboardType="numeric" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Paketteki sigara sayısı</Text>
                <TextInput style={styles.input} value={cigarettesPerPack} onChangeText={setCigarettesPerPack} keyboardType="numeric" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Paketin fiyatı</Text>
                <TextInput style={styles.input} value={packPrice} onChangeText={setPackPrice} keyboardType="numeric" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bir sigarayı içme süreniz (dk.)</Text>
                <TextInput style={styles.input} value={smokeTime} onChangeText={setSmokeTime} keyboardType="numeric" />
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Theme Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isThemeModalVisible}
        onRequestClose={() => setIsThemeModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Görünüm Ayarları</Text>
              <TouchableOpacity onPress={() => setIsThemeModalVisible(false)}>
                <FontAwesome name="times" size={24} color={styles.closeIcon.color} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.themeOptions}>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  themePreference === 'system' && styles.themeOptionSelected
                ]}
                onPress={() => {
                  setThemePreference('system');
                  setIsThemeModalVisible(false);
                }}>
                <View style={styles.themeOptionIcon}>
                  <FontAwesome name="mobile" size={24} color={themePreference === 'system' ? styles.accentColor.color : styles.textSecondaryColor.color} />
                </View>
                <View style={styles.themeOptionText}>
                  <Text style={styles.themeOptionTitle}>Sistem Tercihi</Text>
                  <Text style={styles.themeOptionDescription}>Cihazınızın tema ayarlarını kullanır</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  themePreference === 'light' && styles.themeOptionSelected
                ]}
                onPress={() => {
                  setThemePreference('light');
                  setIsThemeModalVisible(false);
                }}>
                <View style={styles.themeOptionIcon}>
                  <FontAwesome name="sun-o" size={24} color={themePreference === 'light' ? styles.accentColor.color : styles.textSecondaryColor.color} />
                </View>
                <View style={styles.themeOptionText}>
                  <Text style={styles.themeOptionTitle}>Açık Tema</Text>
                  <Text style={styles.themeOptionDescription}>Daima açık temayı kullanır</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  themePreference === 'dark' && styles.themeOptionSelected
                ]}
                onPress={() => {
                  setThemePreference('dark');
                  setIsThemeModalVisible(false);
                }}>
                <View style={styles.themeOptionIcon}>
                  <FontAwesome name="moon-o" size={24} color={themePreference === 'dark' ? styles.accentColor.color : styles.textSecondaryColor.color} />
                </View>
                <View style={styles.themeOptionText}>
                  <Text style={styles.themeOptionTitle}>Koyu Tema</Text>
                  <Text style={styles.themeOptionDescription}>Daima koyu temayı kullanır</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Define theme colors
const lightColors = {
  background: '#F8F9FA',
  cardBackground: '#FFFFFF',
  textPrimary: '#212529',
  textSecondary: '#6C757D',
  borderColor: '#E9ECEF',
  accentPrimary: '#007AFF',
  buttonPrimary: '#0D6EFD',
  danger: '#DC3545',
  avatarBackground: '#E7F5FF',
  shadowColor: '#000',
  switchThumbFalse: '#f4f3f4',
  switchTrackFalse: '#767577',
};

const darkColors = {
  background: '#121212',
  cardBackground: '#1E1E1E',
  textPrimary: '#E0E0E0',
  textSecondary: '#A0A0A0',
  borderColor: '#3A3A3A',
  accentPrimary: '#007AFF',
  buttonPrimary: '#0D6EFD',
  danger: '#DC3545',
  avatarBackground: '#2A3A4A',
  shadowColor: 'rgba(255,255,255,0.1)',
  switchThumbFalse: '#6C757D',
  switchTrackFalse: '#495057',
};

// Function to get themed styles
const getThemedStyles = (colorScheme: 'light' | 'dark') => {
  const colors = colorScheme === 'light' ? lightColors : darkColors;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      flexGrow: 1,
      paddingBottom: 10,
    },
    header: {
      padding: 20,
      backgroundColor: colors.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
    },
    avatarContainer: {
      backgroundColor: colors.avatarBackground,
      padding: 16,
      borderRadius: 45,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
    avatarIcon: {
      color: colors.accentPrimary,
    },
    userName: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
    settingsCard: {
      margin: 16,
      padding: 20,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 18,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },
    settingInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingIcon: {
      color: colors.accentPrimary,
    },
    settingLabel: {
      fontSize: 16,
      color: colors.textPrimary,
      marginLeft: 14,
      fontWeight: '600',
    },
    settingAction: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingArrowIcon: {
      color: colors.textSecondary,
    },
    themeValue: {
      fontSize: 14,
      color: colors.textSecondary,
      marginRight: 8,
    },
    accentColor: {
      color: colors.accentPrimary,
    },
    textSecondaryColor: {
      color: colors.textSecondary,
    },
    switchTrackFalse: {
      color: colors.switchTrackFalse,
    },
    switchThumbFalse: {
      color: colors.switchThumbFalse,
    },
    actionsCard: {
      margin: 16,
      padding: 20,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.buttonPrimary,
      padding: 14,
      borderRadius: 12,
      marginBottom: 10,
      shadowColor: colors.buttonPrimary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
    dangerButton: {
      backgroundColor: colors.danger,
      shadowColor: colors.danger,
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
      marginLeft: 12,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.cardBackground,
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
      color: colors.textPrimary,
    },
    closeIcon: {
      color: colors.textSecondary,
    },
    modalScrollView: {
      maxHeight: '80%',
    },
    inputGroup: {
      marginBottom: 12,
    },
    inputLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
      fontWeight: '600',
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 10,
      fontSize: 15,
      borderWidth: 1,
      borderColor: colors.borderColor,
      color: colors.textPrimary,
      height: 40,
    },
    saveButton: {
      backgroundColor: colors.buttonPrimary,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 4,
      shadowColor: colors.buttonPrimary,
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
    themeOptions: {
      marginBottom: 16,
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    themeOptionSelected: {
      backgroundColor: colors.avatarBackground,
      borderColor: colors.accentPrimary,
    },
    themeOptionIcon: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      marginRight: 16,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    themeOptionText: {
      flex: 1,
    },
    themeOptionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    themeOptionDescription: {
      fontSize: 14,
      color: colors.textSecondary,
    },
  });
};