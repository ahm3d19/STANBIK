import React, {useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Image,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import BackBtn from '../../../components/BackBtn';
import {signOut} from '../../../aws/AuthServices';
import {useNavigation} from '@react-navigation/native';

// Memoize components for better performance
const SettingsSection = React.memo(({title, children}) => (
  <View style={styles.section}>
    <Text style={styles.sectionHeader}>{title}</Text>
    {children}
  </View>
));

const SettingItem = React.memo(
  ({text, value, onPress, isSwitch = false, switchValue, onSwitchChange}) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={!isSwitch ? onPress : undefined}
      activeOpacity={0.7}>
      <Text style={styles.settingText}>{text}</Text>
      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={Platform.OS === 'android' ? '#f5dd4b' : '#f4f3f4'}
        />
      ) : (
        <View style={styles.settingValue}>
          {value && <Text style={styles.settingValueText}>{value}</Text>}
          <Text style={styles.chevron}>›</Text>
        </View>
      )}
    </TouchableOpacity>
  ),
);

// Responsive scaling functions
const {width, height} = Dimensions.get('window');
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = size => (width / guidelineBaseWidth) * size;
const verticalScale = size => (height / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = React.useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = React.useState(false);

  // Memoize handlers to prevent unnecessary re-renders
  const handleMyProfile = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    try {
      await signOut();
      navigation.replace('SignIn'); // Navigate to SignIn screen after sign out
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  const toggleBiometric = useCallback(() => {
    setIsBiometricEnabled(prev => !prev);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <BackBtn />
          <Text style={styles.header}>Settings</Text>
          {/*SignOut*/}
          <TouchableOpacity
            style={styles.logOutButton}
            activeOpacity={0.7}
            onPress={handleSignOut}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Image
                style={styles.logOutButton}
                source={require('../../../assets/Settings/LogOut.png')}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Sections */}
        <View style={styles.sectionsContainer}>
          <SettingsSection title="General">
            <SettingItem text="Language" value="English" />
            <SettingItem text="My Profile" onPress={handleMyProfile} />
          </SettingsSection>

          <SettingsSection title="Contact Us">
            <SettingItem text="Security" />
          </SettingsSection>

          <SettingsSection title="Change Password">
            <SettingItem text="Privacy Policy" />
            <SettingItem text="Choose what data you share with us" />
          </SettingsSection>

          <SettingsSection title="Biometric">
            <SettingItem
              text="Enable Biometric Authentication"
              isSwitch
              switchValue={isBiometricEnabled}
              onSwitchChange={toggleBiometric}
            />
          </SettingsSection>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: moderateScale(20),
    paddingTop: Platform.select({
      ios: verticalScale(20),
      android: verticalScale(30),
    }),
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(30),
  },
  header: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  logOutButton: {
    width: moderateScale(50),
    height: moderateScale(50),
  },
  sectionsContainer: {
    flex: 1,
  },
  section: {
    marginBottom: verticalScale(30),
  },
  sectionHeader: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    marginBottom: verticalScale(15),
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(15),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    fontSize: moderateScale(16),
    color: '#333',
    flexShrink: 1,
    marginRight: moderateScale(10),
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: moderateScale(16),
    color: '#666',
    marginRight: moderateScale(5),
  },
  chevron: {
    fontSize: moderateScale(20),
    color: '#999',
  },
});

export default SettingsScreen;
