import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Image, StyleSheet, View, Dimensions, Text} from 'react-native';

// Screens
import HomeScreen from '../screens/Tabs/Home/HomeScreen';
import StatisticsScreen from '../screens/Tabs/Statistics/StatisticsScreen';
import SettingsScreen from '../screens/Tabs/Settings/SettingsScreen';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import SignInScreen from '../screens/Auth/SignIn/SignInScreen';
import SignUpScreen from '../screens/Auth/SignUp/SignUpScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import MyCardsScreen from '../screens/Tabs/MyCards/MyCardsScreen';
import ConfirmOtpScreen from '../screens/Auth/ConfirmOtp/ConfirmOtpScreen';
import ForgotPassword from '../screens/Auth/ForgotPassword/ForgotPassword';
import ResetPassword from '../screens/Auth/ForgotPassword/ResetPassword';
import SplashScreen from '../screens/SplashScreen/SplashScreen';

const {width} = Dimensions.get('window');
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const CenteredTabBar = ({state, descriptors, navigation}) => {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const isFocused = state.index === index;
          const label = options.tabBarLabel || route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconSource;
          switch (route.name) {
            case 'Home':
              iconSource = require('../assets/Tabs/Home.png');
              break;
            case 'MyCards':
              iconSource = require('../assets/Tabs/Cards.png');
              break;
            case 'Statistics':
              iconSource = require('../assets/Tabs/Statistics.png');
              break;
            case 'Settings':
              iconSource = require('../assets/Tabs/Settings.png');
              break;
          }

          return (
            <View key={route.key} style={styles.tabItem} onTouchEnd={onPress}>
              <Image
                source={iconSource}
                style={[
                  styles.tabIcon,
                  {tintColor: isFocused ? '#0066FF' : '#8B8B94'},
                ]}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {color: isFocused ? '#0066FF' : '#8B8B94'},
                ]}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CenteredTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{tabBarLabel: 'Home'}}
      />
      <Tab.Screen
        name="MyCards"
        component={MyCardsScreen}
        options={{tabBarLabel: 'My Cards'}}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{tabBarLabel: 'Statistics'}}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{tabBarLabel: 'Settings'}}
      />
    </Tab.Navigator>
  );
}

const Routes = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SplashScreen">
        <Stack.Screen
          name="SplashScreen"
          component={SplashScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ConfirmOtp"
          component={ConfirmOtpScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPassword}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPassword}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Routes;

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 30,
    height: 90,
    width: width * 1,

    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    paddingVertical: 10,
    marginBottom: 10,
  },
  tabIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
