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
import {signIn} from '../../../aws/AuthServices'; // Adjust the path as needed

// Initialize icons (for Android)
Icon.loadFont();

const {width, height} = Dimensions.get('window');

// Responsive scaling
const scale = size => (width / 375) * size;
const verticalScale = size => (height / 812) * size;

const SignInScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoized disabled state
  const isSignInDisabled = useMemo(
    () => !email.trim() || !password.trim() || isSubmitting,
    [email, password, isSubmitting],
  );

  // Memoized toggle function
  const toggleShowPassword = useCallback(() => {
    if (!isSubmitting) setShowPassword(prev => !prev);
  }, [isSubmitting]);

  // Memoized sign in handler with AWS Cognito logic
  const handleSignIn = useCallback(async () => {
    if (isSignInDisabled) return;

    setIsSubmitting(true);

    try {
      const {success, nextStep, message, user} = await signIn(email, password);

      if (success) {
        // Handle the response based on the nextStep value
        switch (nextStep?.signInStep) {
          case 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED':
            navigation.navigate('NewPassword', {email});
            break;

          case 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE':
            navigation.navigate('CustomChallenge', {email});
            break;

          case 'CONFIRM_SIGN_IN_WITH_TOTP_CODE':
            navigation.navigate('TotpCode', {email});
            break;

          case 'CONTINUE_SIGN_IN_WITH_TOTP_SETUP':
            navigation.navigate('TotpSetup', {email});
            break;

          case 'CONFIRM_SIGN_IN_WITH_SMS_CODE':
            navigation.navigate('SmsCode', {email});
            break;

          case 'CONTINUE_SIGN_IN_WITH_MFA_SELECTION':
            navigation.navigate('MfaSelection', {email});
            break;

          case 'RESET_PASSWORD':
            navigation.navigate('ResetPassword', {email});
            break;

          case 'CONFIRM_SIGN_UP':
            navigation.navigate('ConfirmOtp', {email});
            break;

          case 'DONE':
            navigation.replace('Onboarding');
            break;

          default:
            Alert.alert(
              'Error',
              message || 'An unexpected error occurred during sign-in.',
            );
            break;
        }
      } else {
        Alert.alert('Error', message || 'An error occurred while signing in.');
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
      let errorMessage = 'An error occurred while signing in.';

      // Handle specific error cases
      switch (true) {
        case error.message.includes('incorrect'):
          errorMessage = 'Incorrect email or password.';
          break;

        case error.message.includes('not confirmed'):
          errorMessage = 'Please confirm your account before signing in.';
          break;

        default:
          errorMessage = error.message || 'An error occurred while signing in.';
          break;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, isSignInDisabled, navigation]);

  // Memoized new user handler
  const handleNewUserPress = useCallback(() => {
    if (!isSubmitting) navigation.navigate('SignUp');
  }, [isSubmitting, navigation]);

  // Memoized forgot password handler
  const handleForgotPassword = useCallback(() => {
    if (!isSubmitting) navigation.navigate('ForgotPassword');
  }, [isSubmitting, navigation]);

  // Memoized input components
  const EmailInput = useMemo(
    () => (
      <View>
        <TextInput
          style={[styles.input, isSubmitting && styles.disabledInput]}
          value={email}
          onChangeText={isSubmitting ? undefined : setEmail}
          placeholder="Enter Email Address"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          importantForAutofill="yes"
          textContentType="emailAddress"
          editable={!isSubmitting}
          selectTextOnFocus={!isSubmitting}
        />
        <View style={styles.inputDivider} />
      </View>
    ),
    [email, isSubmitting],
  );

  const PasswordInput = useMemo(
    () => (
      <View style={styles.passwordContainer}>
        <TextInput
          style={[
            styles.input,
            styles.passwordInput,
            isSubmitting && styles.disabledInput,
          ]}
          value={password}
          onChangeText={isSubmitting ? undefined : setPassword}
          placeholder="Enter Password"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          importantForAutofill="yes"
          textContentType="password"
          editable={!isSubmitting}
          selectTextOnFocus={!isSubmitting}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={toggleShowPassword}
          activeOpacity={0.7}
          disabled={isSubmitting}>
          <Icon
            name={showPassword ? 'visibility-off' : 'visibility'}
            size={scale(24)}
            color={isSubmitting ? '#999' : '#666'}
          />
        </TouchableOpacity>
        <View style={styles.inputDivider} />
      </View>
    ),
    [password, showPassword, isSubmitting, toggleShowPassword],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Sign In</Text>

        <Text style={styles.label}>Email Address</Text>
        {EmailInput}

        <Text style={styles.label}>Password</Text>
        {PasswordInput}

        <TouchableOpacity
          onPress={handleForgotPassword}
          activeOpacity={0.7}
          disabled={isSubmitting}
          style={styles.forgotPasswordButton}>
          <Text
            style={[
              styles.forgotPasswordText,
              isSubmitting && styles.disabledLink,
            ]}>
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.signInButton,
            isSignInDisabled && styles.disabledButton,
          ]}
          onPress={handleSignIn}
          activeOpacity={0.7}
          disabled={isSignInDisabled}>
          {isSubmitting ? (
            <ActivityIndicator color="#0066FF" size="small" />
          ) : (
            <Text style={styles.signInButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>I'm a new user. </Text>
          <TouchableOpacity
            onPress={handleNewUserPress}
            activeOpacity={0.7}
            disabled={isSubmitting}>
            <Text
              style={[styles.footerLink, isSubmitting && styles.disabledLink]}>
              Sign Up
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
    justifyContent: 'center',
    padding: scale(20),
    backgroundColor: '#fff',
  },
  content: {
    marginBottom: verticalScale(90),
  },
  header: {
    fontSize: scale(32),
    fontWeight: '700',
    marginBottom: verticalScale(30),
  },
  label: {
    fontSize: scale(16),
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: verticalScale(20),
  },
  forgotPasswordText: {
    fontSize: scale(14),
    color: '#0066FF',
  },
  signInButton: {
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
  signInButtonText: {
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

export default React.memo(SignInScreen);
