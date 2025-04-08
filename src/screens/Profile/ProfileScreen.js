import React, {useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import BackBtn from '../../components/BackBtn';

// Responsive scaling functions
const {width, height} = Dimensions.get('window');
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = size => (width / guidelineBaseWidth) * size;
const verticalScale = size => (height / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// Memoized components for better performance
const MenuItem = React.memo(({text, onPress}) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}>
    <Text style={styles.menuItemText}>{text}</Text>
  </TouchableOpacity>
));

const ProfileScreen = () => {
  // Navigation would be added here if needed
  // const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <BackBtn />
          <Text style={styles.header}>Profile</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Image
              style={styles.editButton}
              source={require('../../assets/Profile/EditIcon.png')}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image
            style={styles.avatar}
            source={{
              uri: 'https://t4.ftcdn.net/jpg/04/31/64/75/360_F_431647519_usrbQ8Z983hTYe8zgA7t1XVc5fEtqcpa.jpg',
            }}
          />
          <Text style={styles.name}>Tanya Myroniuk</Text>
          <Text style={styles.title}>Senior Developer</Text>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuHeader}>Personal Information</Text>

          <MenuItem text="Payment Preferences" />
          <MenuItem text="Banks and Cards" />
          <MenuItem text="Notifications" />
          <MenuItem text="Message Center" />
          <MenuItem text="Address" />
          <MenuItem text="Settings" />
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
  editButton: {
    width: moderateScale(50),
    height: moderateScale(50),
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: verticalScale(30),
  },
  avatar: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    borderWidth: moderateScale(2),
    borderColor: '#0066FF',
    marginBottom: verticalScale(15),
  },
  name: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    marginBottom: verticalScale(5),
    color: '#000',
  },
  title: {
    fontSize: moderateScale(16),
    color: '#666',
  },
  menuSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e1e1e1',
    paddingTop: verticalScale(20),
  },
  menuHeader: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    marginBottom: verticalScale(15),
    color: '#333',
  },
  menuItem: {
    paddingVertical: verticalScale(15),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: moderateScale(16),
    color: '#333',
  },
});

export default ProfileScreen;
