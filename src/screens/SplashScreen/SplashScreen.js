import React, {useEffect, useRef, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {getCurrentUser} from '../../aws/AuthServices';

const {width, height} = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();
  const scaleValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  // Calculate responsive sizes
  const logoSize = width * 0.4; // 40% of screen width
  const textLogoWidth = width * 0.6; // 60% of screen width
  const textLogoHeight = textLogoWidth * 0.3; // Maintain aspect ratio
  const textBottomMargin = height * 0.1; // 10% from bottom

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await getCurrentUser();
      navigation.replace(
        response.success && response.user ? 'Onboarding' : 'SignIn',
      );
    } catch (error) {
      console.error('Auth check failed:', error);
      navigation.replace('SignIn');
    }
  }, [navigation]);

  useEffect(() => {
    const animations = Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1.1,
        tension: 20,
        useNativeDriver: true,
      }),
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    animations.start();

    const timer = setTimeout(() => {
      if (Platform.OS === 'android') {
        requestAnimationFrame(() => {
          checkAuthStatus();
        });
      } else {
        checkAuthStatus();
      }
    }, 2000);

    return () => {
      animations.stop();
      clearTimeout(timer);
    };
  }, [checkAuthStatus, scaleValue, fadeValue]);

  const logoSource = useRef(require('../../assets/Logo/logo.png')).current;
  const logoText = useRef(require('../../assets/Logo/text.png')).current;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{scale: scaleValue}],
            opacity: fadeValue,
          },
        ]}>
        <Image
          source={logoSource}
          style={[styles.logo, {width: logoSize, height: logoSize}]}
          resizeMode="contain"
          fadeDuration={0}
        />
      </Animated.View>

      <View style={[styles.textContainer, {bottom: textBottomMargin}]}>
        <Image
          source={logoText}
          style={{width: textLogoWidth, height: textLogoHeight}}
          resizeMode="contain"
          fadeDuration={0}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    // Dimensions set dynamically
  },
});

export default React.memo(SplashScreen);
