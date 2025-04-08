import React, {useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {resetPassword} from '../../../aws/AuthServices';
import BackBtn from '../../../components/BackBtn';

// Initialize icons
Icon.loadFont();

const {width, height} = Dimensions.get('window');

// Responsive scaling
const scale = size => (width / 375) * size;
const verticalScale = size => (height / 812) * size;

const ForgotPassword = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Memoized disabled state
  const isResetDisabled = useMemo(
    () => !email.trim() || isSubmitting || emailError,
    [email, isSubmitting, emailError],
  );

  // Validate email format
  const validateEmail = useCallback(text => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (text && !emailRegex.test(text)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  }, []);

  // Handle password reset
  const handleForgotPassword = useCallback(async () => {
    if (isResetDisabled) return;

    setIsSubmitting(true);
    try {
      const result = await resetPassword(email);
      if (result.success) {
        if (result.nextStep === 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
          navigation.navigate('ResetPassword', {username: email});
        } else {
          Alert.alert('Success', result.message);
        }
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert(
        'Error',
        error.message || 'Error resetting password, please try again later.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [email, isResetDisabled, navigation]);

  // Memoized back navigation handler
  const handleBackPress = useCallback(() => {
    if (!isSubmitting) navigation.goBack();
  }, [isSubmitting, navigation]);

  // Memoized email input component
  const EmailInput = useMemo(
    () => (
      <View>
        <TextInput
          style={[
            styles.input,
            isSubmitting && styles.disabledInput,
            emailError && styles.errorInput,
          ]}
          value={email}
          onChangeText={validateEmail}
          placeholder="Enter your email address"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isSubmitting}
          selectTextOnFocus={!isSubmitting}
        />
        {emailError && <Text style={styles.errorText}>{emailError}</Text>}
        <View style={styles.inputDivider} />
      </View>
    ),
    [email, isSubmitting, emailError, validateEmail],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <BackBtn
          disabled={isSubmitting}
          style={styles.backButton}
          onPress={handleBackPress}
        />

        <Text style={styles.header}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address to receive a password reset code
        </Text>

        <Text style={styles.label}>Email Address</Text>
        {EmailInput}

        <TouchableOpacity
          style={[styles.resetButton, isResetDisabled && styles.disabledButton]}
          onPress={handleForgotPassword}
          activeOpacity={0.7}
          disabled={isResetDisabled}>
          {isSubmitting ? (
            <ActivityIndicator color="#0066FF" size="small" />
          ) : (
            <Text style={styles.resetButtonText}>Reset Password</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Remembered your password? </Text>
          <TouchableOpacity
            onPress={handleBackPress}
            activeOpacity={0.7}
            disabled={isSubmitting}>
            <Text
              style={[styles.footerLink, isSubmitting && styles.disabledLink]}>
              Sign In
            </Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    padding: scale(20),
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: verticalScale(10),
    left: scale(15),
    zIndex: 10,
  },
  header: {
    fontSize: scale(28),
    fontWeight: '700',
    marginBottom: verticalScale(8),
    color: '#333',
  },
  subtitle: {
    fontSize: scale(14),
    color: '#666',
    marginBottom: verticalScale(24),
  },
  label: {
    fontSize: scale(14),
    marginBottom: verticalScale(8),
    color: '#666',
  },
  input: {
    height: verticalScale(40),
    width: '100%',
    paddingHorizontal: scale(10),
    marginBottom: verticalScale(8),
    includeFontPadding: false,
    fontSize: scale(16),
  },
  disabledInput: {
    color: '#999',
  },
  errorInput: {
    borderColor: '#FF3B30',
    borderWidth: 1,
    borderRadius: 4,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: scale(12),
    marginBottom: verticalScale(8),
  },
  inputDivider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    backgroundColor: '#E0E0E0',
    marginBottom: verticalScale(20),
  },
  resetButton: {
    backgroundColor: '#0066FF',
    padding: verticalScale(12),
    height: verticalScale(56),
    width: '100%',
    borderRadius: scale(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(10),
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: scale(16),
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: verticalScale(20),
  },
  footerText: {
    fontSize: scale(14),
    color: '#666',
  },
  footerLink: {
    fontSize: scale(14),
    fontWeight: 'bold',
    color: '#0066FF',
  },
  disabledLink: {
    color: '#999',
  },
});

export default React.memo(ForgotPassword);
