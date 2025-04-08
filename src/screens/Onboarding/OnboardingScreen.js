import React, {useCallback, useMemo} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import {useNavigation} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Initialize Material Icons
MaterialIcons.loadFont();

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const sliderRef = React.useRef(null);

  const slides = useMemo(
    () => [
      {
        id: '1',
        title: 'Fastest Payment in the world',
        description:
          'Integrate multiple payment methods to help you up the process quickly',
        image: require('../../assets/Onboarding/1.png'),
      },
      {
        id: '2',
        title: 'The most Secure Platform for Customer',
        description:
          'Built-in Fingerprint, face recognition and more, keeping you completely safe',
        image: require('../../assets/Onboarding/2.png'),
      },
      {
        id: '3',
        title: 'Paying for Everything is Easy and Convenient',
        description:
          'Built-in Fingerprint, face recognition and more, keeping you completely safe',
        image: require('../../assets/Onboarding/3.png'),
      },
    ],
    [],
  );

  const handleNext = useCallback(() => {
    if (sliderRef.current) {
      const nextIndex = sliderRef.current.state.activeIndex + 1;
      sliderRef.current.goToSlide(nextIndex);
    }
  }, []);

  const handleDone = useCallback(() => {
    navigation.replace('MainTabs');
  }, [navigation]);

  const renderItem = useCallback(
    ({item}) => (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.divider} />
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    ),
    [],
  );

  const renderNextButton = useCallback(
    () => (
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <MaterialIcons name="arrow-forward" size={24} color="white" />
      </TouchableOpacity>
    ),
    [handleNext],
  );

  const renderDoneButton = useCallback(
    () => (
      <TouchableOpacity style={styles.button} onPress={handleDone}>
        <MaterialIcons name="check" size={24} color="white" />
      </TouchableOpacity>
    ),
    [handleDone],
  );

  return (
    <AppIntroSlider
      ref={sliderRef}
      data={slides}
      renderItem={renderItem}
      renderNextButton={renderNextButton}
      renderDoneButton={renderDoneButton}
      onDone={handleDone}
      showSkip={false}
      dotStyle={styles.dot}
      activeDotStyle={styles.activeDot}
    />
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFF',
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  image: {
    width: '80%',
    height: 300,
    marginBottom: 40,
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
  },
  divider: {
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  dot: {
    backgroundColor: '#ccc',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#0066FF',
    width: 20,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default OnboardingScreen;
