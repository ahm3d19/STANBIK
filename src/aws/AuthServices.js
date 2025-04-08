import {
  signUp as amplifySignUp,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  confirmSignUp as amplifyConfirmSignUp,
  resendSignUpCode as amplifyResendSignUp,
  getCurrentUser as amplifyCurrentAuthenticatedUser,
  confirmResetPassword as amplifyConfirmResetPassword,
  resetPassword as amplifyResetPassword,
} from 'aws-amplify/auth';

// Sign In
export const signIn = async (email, password) => {
  try {
    const response = await amplifySignIn({username: email, password});

    // Check if the response contains a nextStep property
    if (response.nextStep) {
      return {
        success: true,
        nextStep: response.nextStep, // Include the nextStep in the response
        user: response, // Include the user object if available
      };
    }

    // If no nextStep is required, assume sign-in is complete
    return {
      success: true,
      nextStep: {signInStep: 'DONE'}, // Default to DONE if no nextStep is provided
      user: response,
    };
  } catch (error) {
    console.error('Error signing in:', error);

    // Handle specific error cases
    let errorMessage = error.message || 'An error occurred while signing in.';
    if (error.code === 'NotAuthorizedException') {
      errorMessage = 'Incorrect email or password.';
    } else if (error.code === 'UserNotFoundException') {
      errorMessage = 'User not found.';
    } else if (error.code === 'UserNotConfirmedException') {
      errorMessage = 'Please confirm your account before signing in.';
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Sign Up
export const signUp = async (username, email, password) => {
  try {
    const user = await amplifySignUp({
      username: email,
      password,
      options: {userAttributes: {email, username}},
    });
    return {success: true, user};
  } catch (error) {
    console.error('Error signing up:', error);
    return {success: false, message: error.message || 'Sign-up failed.'};
  }
};

// Confirm Sign Up
export const confirmSignUp = async (username, confirmationCode) => {
  try {
    await amplifyConfirmSignUp({username, confirmationCode});
    console.log('Sign up confirmed!');
    return {success: true, message: 'Sign up confirmed!'};
  } catch (error) {
    console.error('Error confirming sign up:', error);
    return {success: false, message: error.message || 'Confirmation failed.'};
  }
};

// Resend OTP
export const resendSignUp = async username => {
  try {
    await amplifyResendSignUp({username: username});
    console.log('Resend OTP successful');
    return {success: true, message: 'OTP resend successful!'};
  } catch (error) {
    console.error('Error resending OTP:', error);
    return {success: false, message: error.message || 'Resend OTP failed.'};
  }
};

// Sign Out
export const signOut = async () => {
  try {
    await amplifySignOut();
    console.log('User signed out');
    return {success: true, message: 'Successfully signed out!'};
  } catch (error) {
    console.error('Error signing out:', error);
    return {success: false, message: error.message || 'Sign out failed.'};
  }
};

// get current user
export const getCurrentUser = async () => {
  try {
    const user = await amplifyCurrentAuthenticatedUser();
    return {success: true, user};
  } catch (error) {
    if (error.name === 'UserUnAuthenticatedException') {
      // Handle unauthenticated user gracefully
      return {success: false, message: 'No user signed in.'};
    }

    console.error(
      'Unexpected error fetching current user:',
      JSON.stringify(error),
    );
    return {success: false, message: 'An unexpected error occurred.'};
  }
};
// Reset Password
export const resetPassword = async username => {
  try {
    const output = await amplifyResetPassword({username: username});
    return handleResetPasswordNextSteps(output);
  } catch (error) {
    console.error('Error during reset password:', error);
    return {
      success: false,
      message: error.message || 'Error resetting password.',
    };
  }
};

// Handle reset password steps
const handleResetPasswordNextSteps = output => {
  const {nextStep} = output;
  switch (nextStep.resetPasswordStep) {
    case 'CONFIRM_RESET_PASSWORD_WITH_CODE':
      const codeDeliveryDetails = nextStep.codeDeliveryDetails;
      console.log(
        `Confirmation code sent to ${codeDeliveryDetails.deliveryMedium}`,
      );
      return {
        success: true,
        nextStep: 'CONFIRM_RESET_PASSWORD_WITH_CODE',
        message: `Confirmation code sent to ${codeDeliveryDetails.deliveryMedium}`,
      };
    case 'DONE':
      console.log('Password reset done!');
      return {success: true, message: 'Password reset successful.'};
    default:
      return {success: false, message: 'Unknown error during password reset.'};
  }
};

// Confirm Reset Password
export const confirmResetPassword = async ({
  username,
  confirmationCode,
  newPassword,
}) => {
  try {
    await amplifyConfirmResetPassword({
      username,
      confirmationCode,
      newPassword,
    });
    console.log('Password reset successful!');
    return {success: true, message: 'Password reset successful!'};
  } catch (error) {
    console.error('Error confirming reset password:', error);
    return {
      success: false,
      message: error.message || 'Error confirming password reset.',
    };
  }
};
