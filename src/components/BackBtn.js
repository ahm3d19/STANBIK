import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const {width} = Dimensions.get('window');

// Responsive scaling
const scale = size => (width / 375) * size;

const BackBtn = ({disabled = false, onPress, style}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.backButton, style]}
      disabled={disabled}
      onPress={handlePress}
      activeOpacity={0.7}>
      <View style={styles.backButtonBackground}>
        <Text style={styles.backButtonText}>←</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  backButtonBackground: {
    width: '100%',
    height: '100%',
    borderRadius: scale(25),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
  },
  backButtonText: {
    color: '#1E1E2D',
    fontSize: scale(20),
    fontWeight: 'bold',
  },
});

export default BackBtn;
