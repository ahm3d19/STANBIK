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
import {confirmResetPassword} from '../../../aws/AuthServices';
import BackBtn from '../../../components/BackBtn';

// Initialize icons
Icon.loadFont();

const {width, height} = Dimensions.get('window');

// Responsive scaling
const scale = size => (width / 375) * size;
const verticalScale = size => (height / 812) * size;

const ResetPassword = ({route, navigation}) => {
  const {username} = route.params;
  const [confirmationCode, setConfirmationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    code: '',
    password: '',
    confirmPassword: '',
  });

  // Memoized disabled state
  const isResetDisabled = useMemo(
    () =>
      !confirmationCode ||
      !newPassword ||
      !confirmPassword ||
      isSubmitting ||
      Object.values(errors).some(error => error),
    [confirmationCode, newPassword, confirmPassword, isSubmitting, errors],
  );

  // Validate form fields
  const validateField = useCallback(
    (name, value) => {
      switch (name) {
        case 'confirmationCode':
          return value ? '' : 'Verification code is required';
        case 'newPassword':
          if (!value) return 'Password is required';
          if (value.length < 8) return 'Password must be at least 8 characters';
          return '';
        case 'confirmPassword':
          if (!value) return 'Please confirm your password';
          if (value !== newPassword) return 'Passwords do not match';
          return '';
        default:
          return '';
      }
    },
    [newPassword],
  );

  // Handle field changes
  const handleChange = useCallback(
    (name, value) => {
      switch (name) {
        case 'confirmationCode':
          setConfirmationCode(value);
          break;
        case 'newPassword':
          setNewPassword(value);
          break;
        case 'confirmPassword':
          setConfirmPassword(value);
          break;
      }

      // Clear error when user types
      if (errors[name]) {
        setErrors(prev => ({...prev, [name]: ''}));
      }
    },
    [errors],
  );

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible(prev => !prev);
  }, []);

  // Handle password reset
  const handleResetPassword = useCallback(async () => {
    // Validate all fields
    const validationErrors = {
      code: validateField('confirmationCode', confirmationCode),
      password: validateField('newPassword', newPassword),
      confirmPassword: validateField('confirmPassword', confirmPassword),
    };

    setErrors(validationErrors);

    if (Object.values(validationErrors).some(error => error)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await confirmResetPassword({
        username,
        confirmationCode,
        newPassword,
      });

      if (result.success) {
        Alert.alert(
          'Success',
          'Your password has been reset successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('SignIn'),
            },
          ],
          {cancelable: false},
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert(
        'Error',
        error.message || 'An error occurred while resetting your password',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    confirmationCode,
    newPassword,
    confirmPassword,
    username,
    navigation,
    validateField,
  ]);

  // Memoized back navigation handler
  const handleBackPress = useCallback(() => {
    if (!isSubmitting) navigation.goBack();
  }, [isSubmitting, navigation]);

  // Memoized input components
  const CodeInput = useMemo(
    () => (
      <View>
        <TextInput
          style={[
            styles.input,
            isSubmitting && styles.disabledInput,
            errors.code && styles.errorInput,
          ]}
          value={confirmationCode}
          onChangeText={text => handleChange('confirmationCode', text)}
          placeholder="Enter verification code"
          placeholderTextColor="#999"
          keyboardType="numeric"
          maxLength={6}
          editable={!isSubmitting}
        />
        {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
        <View style={styles.inputDivider} />
      </View>
    ),
    [confirmationCode, isSubmitting, errors.code, handleChange],
  );

  const NewPasswordInput = useMemo(
    () => (
      <View style={styles.passwordContainer}>
        <TextInput
          style={[
            styles.input,
            styles.passwordInput,
            isSubmitting && styles.disabledInput,
            errors.password && styles.errorInput,
          ]}
          value={newPassword}
          onChangeText={text => handleChange('newPassword', text)}
          placeholder="Enter new password"
          placeholderTextColor="#999"
          secureTextEntry={!isPasswordVisible}
          autoCapitalize="none"
          editable={!isSubmitting}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={togglePasswordVisibility}
          activeOpacity={0.7}
          disabled={isSubmitting}>
          <Icon
            name={isPasswordVisible ? 'visibility-off' : 'visibility'}
            size={scale(20)}
            color={isSubmitting ? '#999' : '#666'}
          />
        </TouchableOpacity>
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
        <View style={styles.inputDivider} />
      </View>
    ),
    [
      newPassword,
      isPasswordVisible,
      isSubmitting,
      errors.password,
      togglePasswordVisibility,
      handleChange,
    ],
  );

  const ConfirmPasswordInput = useMemo(
    () => (
      <View style={styles.passwordContainer}>
        <TextInput
          style={[
            styles.input,
            styles.passwordInput,
            isSubmitting && styles.disabledInput,
            errors.confirmPassword && styles.errorInput,
          ]}
          value={confirmPassword}
          onChangeText={text => handleChange('confirmPassword', text)}
          placeholder="Confirm new password"
          placeholderTextColor="#999"
          secureTextEntry={!isPasswordVisible}
          autoCapitalize="none"
          editable={!isSubmitting}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={togglePasswordVisibility}
          activeOpacity={0.7}
          disabled={isSubmitting}>
          <Icon
            name={isPasswordVisible ? 'visibility-off' : 'visibility'}
            size={scale(20)}
            color={isSubmitting ? '#999' : '#666'}
          />
        </TouchableOpacity>
        {errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        )}
        <View style={styles.inputDivider} />
      </View>
    ),
    [
      confirmPassword,
      isPasswordVisible,
      isSubmitting,
      errors.confirmPassword,
      togglePasswordVisibility,
      handleChange,
    ],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <BackBtn
          disabled={isSubmitting}
          style={styles.backButton}
          onPress={handleBackPress}
        />

        <Text style={styles.header}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter the verification code sent to your email and your new password
        </Text>

        <Text style={styles.label}>Verification Code</Text>
        {CodeInput}

        <Text style={styles.label}>New Password</Text>
        {NewPasswordInput}

        <Text style={styles.label}>Confirm Password</Text>
        {ConfirmPasswordInput}

        <TouchableOpacity
          style={[styles.resetButton, isResetDisabled && styles.disabledButton]}
          onPress={handleResetPassword}
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
            onPress={() => navigation.replace('SignIn')}
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
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: scale(40),
  },
  eyeIcon: {
    position: 'absolute',
    right: scale(10),
    top: verticalScale(8),
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
  disabledLink: {
    color: '#999',
  },
});

export default React.memo(ResetPassword);
