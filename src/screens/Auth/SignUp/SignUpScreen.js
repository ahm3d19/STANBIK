import React, {useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BackBtn from '../../../components/BackBtn';
import {signUp} from '../../../aws/AuthServices';
import {
  isValidEmail,
  checkPasswordStrength,
} from '../../../utils/passwordValidation';

// Initialize icons
Icon.loadFont();

const {width, height} = Dimensions.get('window');

// Adjusted scaling for slightly smaller components
const scale = size => (width / 400) * size;
const verticalScale = size => (height / 850) * size;

const SignUpScreen = ({navigation}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    isValid: false,
  });

  const handleChange = (name, value) => {
    setFormData(prev => ({...prev, [name]: value}));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({...prev, [name]: ''}));
    }

    // Special handling for password fields
    if (name === 'password') {
      const strength = checkPasswordStrength(value);
      setPasswordStrength(strength);

      if (value && !strength.minLength) {
        setErrors(prev => ({
          ...prev,
          password: 'Password must be at least 8 characters',
        }));
      } else {
        setErrors(prev => ({...prev, password: ''}));
      }

      // Validate confirm password if it exists
      if (formData.confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword:
            value === formData.confirmPassword ? '' : 'Passwords do not match',
        }));
      }
    } else if (name === 'confirmPassword') {
      setErrors(prev => ({
        ...prev,
        confirmPassword:
          value === formData.password ? '' : 'Passwords do not match',
      }));
    } else if (name === 'email' && value && !isValidEmail(value)) {
      setErrors(prev => ({...prev, email: 'Please enter a valid email'}));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordStrength.minLength) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const isSignUpDisabled = useMemo(
  //   () =>
  //     !formData.firstName.trim() ||
  //     !formData.email.trim() ||
  //     !formData.password ||
  //     !formData.confirmPassword ||
  //     isSubmitting ||
  //     Object.keys(errors).length > 0,
  //   [formData, isSubmitting, errors],
  // );
  const isSignUpDisabled = useMemo(
    () =>
      !formData.firstName.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword ||
      isSubmitting ||
      errors.firstName ||
      errors.email ||
      errors.password ||
      errors.confirmPassword,
    [formData, isSubmitting, errors],
  );
  const toggleShowPassword = useCallback(() => {
    if (!isSubmitting) setShowPassword(prev => !prev);
  }, [isSubmitting]);

  const toggleShowConfirmPassword = useCallback(() => {
    if (!isSubmitting) setShowConfirmPassword(prev => !prev);
  }, [isSubmitting]);

  const handleSignUp = useCallback(async () => {
    if (!validateForm()) return;
    if (isSignUpDisabled) return;

    setIsSubmitting(true);

    try {
      const result = await signUp(
        `${formData.firstName} ${formData.lastName}`.trim(), // username
        formData.email,
        formData.password,
      );

      if (result.success) {
        navigation.navigate('ConfirmOtp', {
          email: formData.email,
          username: `${formData.firstName} ${formData.lastName}`.trim(),
        });
      } else {
        Alert.alert(
          'Sign Up Failed',
          result.message || 'Something went wrong during sign up.',
        );
      }
    } catch (error) {
      console.error('Error during sign up:', error);
      Alert.alert('Sign Up Failed', 'An error occurred while signing up.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isSignUpDisabled, navigation]);

  const handleExistingUserPress = useCallback(() => {
    if (!isSubmitting) navigation.goBack();
  }, [isSubmitting, navigation]);

  const FirstNameInput = useMemo(
    () => (
      <View>
        <TextInput
          style={[
            styles.input,
            isSubmitting && styles.disabledInput,
            errors.firstName && styles.errorInput,
          ]}
          value={formData.firstName}
          onChangeText={text => handleChange('firstName', text)}
          placeholder="Enter First Name"
          placeholderTextColor="#999"
          autoCapitalize="words"
          editable={!isSubmitting}
        />
        {errors.firstName && (
          <Text style={styles.errorText}>{errors.firstName}</Text>
        )}
        <View style={styles.inputDivider} />
      </View>
    ),
    [formData.firstName, isSubmitting, errors.firstName],
  );

  const LastNameInput = useMemo(
    () => (
      <View>
        <TextInput
          style={[styles.input, isSubmitting && styles.disabledInput]}
          value={formData.lastName}
          onChangeText={text => handleChange('lastName', text)}
          placeholder="Enter Last Name (Optional)"
          placeholderTextColor="#999"
          autoCapitalize="words"
          editable={!isSubmitting}
        />
        <View style={styles.inputDivider} />
      </View>
    ),
    [formData.lastName, isSubmitting],
  );

  const EmailInput = useMemo(
    () => (
      <View>
        <TextInput
          style={[
            styles.input,
            isSubmitting && styles.disabledInput,
            errors.email && styles.errorInput,
          ]}
          value={formData.email}
          onChangeText={text => handleChange('email', text)}
          placeholder="Enter Email Address"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isSubmitting}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        <View style={styles.inputDivider} />
      </View>
    ),
    [formData.email, isSubmitting, errors.email],
  );

  const PasswordInput = useMemo(
    () => (
      <View style={styles.passwordContainer}>
        <TextInput
          style={[
            styles.input,
            styles.passwordInput,
            isSubmitting && styles.disabledInput,
            errors.password && styles.errorInput,
          ]}
          value={formData.password}
          onChangeText={text => handleChange('password', text)}
          placeholder="Enter Password"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          editable={!isSubmitting}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={toggleShowPassword}
          activeOpacity={0.7}
          disabled={isSubmitting}>
          <Icon
            name={showPassword ? 'visibility-off' : 'visibility'}
            size={scale(20)}
            color={isSubmitting ? '#999' : '#666'}
          />
        </TouchableOpacity>
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
        {formData.password && !errors.password && (
          <Text style={styles.passwordStrengthText}>
            Password strength:{' '}
            {passwordStrength.isValid
              ? 'Strong'
              : passwordStrength.minLength
              ? 'Medium'
              : 'Weak'}
          </Text>
        )}
        <View style={styles.inputDivider} />
      </View>
    ),
    [
      formData.password,
      showPassword,
      isSubmitting,
      errors.password,
      passwordStrength,
      toggleShowPassword,
    ],
  );

  const ConfirmPasswordInput = useMemo(
    () => (
      <View style={styles.passwordContainer}>
        <TextInput
          style={[
            styles.input,
            styles.passwordInxput,
            isSubmitting && styles.disabledInput,
            errors.confirmPassword && styles.errorInput,
          ]}
          value={formData.confirmPassword}
          onChangeText={text => handleChange('confirmPassword', text)}
          placeholder="Confirm Password"
          placeholderTextColor="#999"
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
          editable={!isSubmitting}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={toggleShowConfirmPassword}
          activeOpacity={0.7}
          disabled={isSubmitting}>
          <Icon
            name={showConfirmPassword ? 'visibility-off' : 'visibility'}
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
      formData.confirmPassword,
      showConfirmPassword,
      isSubmitting,
      errors.confirmPassword,
      toggleShowConfirmPassword,
    ],
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <BackBtn
          disabled={isSubmitting}
          style={styles.backButtonPosition}
          onPress={() => navigation.goBack()}
        />

        <View style={styles.content}>
          <Text style={styles.header}>Create Account</Text>

          <Text style={styles.label}>First Name</Text>
          {FirstNameInput}

          <Text style={styles.label}>Last Name</Text>
          {LastNameInput}

          <Text style={styles.label}>Email Address</Text>
          {EmailInput}

          <Text style={styles.label}>Password</Text>
          {PasswordInput}

          <Text style={styles.label}>Confirm Password</Text>
          {ConfirmPasswordInput}

          <TouchableOpacity
            style={[
              styles.signUpButton,
              isSignUpDisabled && styles.disabledButton,
            ]}
            onPress={handleSignUp}
            activeOpacity={0.7}
            disabled={isSignUpDisabled}>
            {isSubmitting ? (
              <ActivityIndicator color="#0066FF" size="small" />
            ) : (
              <Text style={styles.signUpButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={handleExistingUserPress}
              activeOpacity={0.7}
              disabled={isSubmitting}>
              <Text
                style={[
                  styles.footerLink,
                  isSubmitting && styles.disabledLink,
                ]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: scale(15),
    paddingBottom: verticalScale(30),
  },
  content: {
    marginTop: verticalScale(30),
    marginBottom: verticalScale(30),
  },
  backButtonPosition: {
    position: 'absolute',
    top: verticalScale(8),
    left: scale(15),
    zIndex: 10,
  },
  header: {
    fontSize: scale(28),
    fontWeight: '700',
    marginBottom: verticalScale(25),
    marginTop: verticalScale(30),
  },
  label: {
    fontSize: scale(14),
    marginBottom: verticalScale(6),
    color: '#666',
  },
  input: {
    height: verticalScale(36),
    width: '100%',
    paddingHorizontal: scale(8),
    marginBottom: verticalScale(6),
    includeFontPadding: false,
    fontSize: scale(14),
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: scale(36),
  },
  eyeIcon: {
    position: 'absolute',
    right: scale(8),
    top: verticalScale(6),
  },
  inputDivider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    backgroundColor: '#E0E0E0',
    marginBottom: verticalScale(16),
  },
  signUpButton: {
    backgroundColor: '#0066FF',
    padding: verticalScale(10),
    height: verticalScale(48),
    width: '100%',
    borderRadius: scale(14),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(24),
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: scale(14),
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: verticalScale(16),
  },
  footerText: {
    fontSize: scale(13),
    color: '#666',
  },
  footerLink: {
    fontSize: scale(13),
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
    fontSize: scale(11),
    marginBottom: verticalScale(6),
    marginTop: verticalScale(-4),
  },
  passwordStrengthText: {
    color: '#666',
    fontSize: scale(11),
    marginBottom: verticalScale(6),
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  disabledLink: {
    color: '#999',
  },
});

export default React.memo(SignUpScreen);
