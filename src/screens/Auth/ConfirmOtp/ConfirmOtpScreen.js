import React, {useState, useEffect, useCallback, useMemo} from 'react';
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
import {confirmSignUp, resendSignUp} from '../../../aws/AuthServices';
import BackBtn from '../../../components/BackBtn';

// Initialize icons
Icon.loadFont();

const {width, height} = Dimensions.get('window');

// Responsive scaling
const scale = size => (width / 375) * size;
const verticalScale = size => (height / 812) * size;

const ConfirmOtpScreen = ({navigation, route}) => {
  const {email} = route.params;
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [otpError, setOtpError] = useState('');

  // Memoized disabled state
  const isConfirmDisabled = useMemo(
    () => !confirmationCode || isSubmitting,
    [confirmationCode, isSubmitting],
  );

  // Memoized resend disabled state
  const isResendDisabled = useMemo(
    () => isSubmitting || countdown > 0,
    [isSubmitting, countdown],
  );

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-resend OTP on mount if countdown is 0
  useEffect(() => {
    if (countdown === 0) {
      handleResendOtp();
    }
  }, []);

  // Handle OTP confirmation
  const handleConfirmOtp = useCallback(async () => {
    if (!confirmationCode) {
      setOtpError('Please enter the OTP');
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmSignUp(email, confirmationCode);
      Alert.alert('Success', 'Your account has been confirmed!');
      navigation.replace('SignIn');
    } catch (error) {
      console.error('OTP confirmation error:', error);

      if (error.code === 'CodeMismatchException') {
        setOtpError('The OTP you entered is incorrect');
      } else if (error.code === 'ExpiredCodeException') {
        setOtpError('This OTP has expired. Please request a new one.');
      } else {
        setOtpError(error.message || 'Failed to confirm OTP');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [confirmationCode, email, navigation]);

  // Handle OTP resend
  const handleResendOtp = useCallback(async () => {
    if (isResendDisabled) return;

    setIsSubmitting(true);
    try {
      await resendSignUp(email);
      Alert.alert('OTP Sent', 'A new OTP has been sent to your email.');
      setCountdown(30);
      setOtpError('');
    } catch (error) {
      console.error('Resend OTP error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to resend OTP. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [email, isResendDisabled]);

  // Memoized back navigation handler
  const handleBackPress = useCallback(() => {
    if (!isSubmitting) navigation.goBack();
  }, [isSubmitting, navigation]);

  // Memoized OTP input component
  const OtpInput = useMemo(
    () => (
      <View>
        <TextInput
          style={[
            styles.input,
            isSubmitting && styles.disabledInput,
            otpError && styles.errorInput,
          ]}
          value={confirmationCode}
          onChangeText={text => {
            setConfirmationCode(text);
            if (otpError) setOtpError('');
          }}
          placeholder="Enter 6-digit OTP"
          placeholderTextColor="#999"
          keyboardType="number-pad"
          maxLength={6}
          editable={!isSubmitting}
          selectTextOnFocus={!isSubmitting}
        />
        {otpError && <Text style={styles.errorText}>{otpError}</Text>}
        <View style={styles.inputDivider} />
      </View>
    ),
    [confirmationCode, isSubmitting, otpError],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <BackBtn
          disabled={isSubmitting}
          style={styles.backButton}
          onPress={handleBackPress}
        />

        <Text style={styles.header}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to {email}
        </Text>

        <Text style={styles.label}>Verification Code</Text>
        {OtpInput}

        <TouchableOpacity
          style={[
            styles.confirmButton,
            isConfirmDisabled && styles.disabledButton,
          ]}
          onPress={handleConfirmOtp}
          activeOpacity={0.7}
          disabled={isConfirmDisabled}>
          {isSubmitting ? (
            <ActivityIndicator color="#0066FF" size="small" />
          ) : (
            <Text style={styles.confirmButtonText}>Verify Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResendOtp}
          activeOpacity={0.7}
          disabled={isResendDisabled}
          style={styles.resendButton}>
          <Text
            style={[
              styles.resendText,
              isResendDisabled && styles.disabledLink,
            ]}>
            {countdown > 0
              ? `Resend code in ${countdown}s`
              : "Didn't receive code? Resend"}
          </Text>
        </TouchableOpacity>
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
  confirmButton: {
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
  confirmButtonText: {
    color: '#fff',
    fontSize: scale(16),
    fontWeight: 'bold',
  },
  resendButton: {
    marginTop: verticalScale(16),
    alignSelf: 'center',
  },
  resendText: {
    fontSize: scale(14),
    fontWeight: 'bold',
    color: '#0066FF',
  },
  disabledLink: {
    color: '#999',
  },
});

export default React.memo(ConfirmOtpScreen);
