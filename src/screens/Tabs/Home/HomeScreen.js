import React, {useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

// Constants
const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Scaling functions - memoized for performance
const scale = size => (SCREEN_WIDTH / 375) * size;
const verticalScale = size => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// Modern color palette
const COLORS = {
  primary: '#6366F1',
  background: '#FFFFFF',
  card: '#FFFFFF',
  textPrimary: '#1E1E2D',
  textSecondary: '#6B7280',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
};

const HomeScreen = () => {
  const navigation = useNavigation();

  const handleProfileBtn = () => {
    navigation.navigate('Profile');
  };

  // Memoized user data to prevent unnecessary re-renders
  const user = useMemo(
    () => ({
      name: 'Tanya Myroniuk',
      balance: 1250.5,
      transactions: [
        {
          id: 1,
          merchant: 'Apple Store',
          category: 'Entertainment',
          amount: -5.99,
          type: 'expense',
          icon: 'shopping-cart',
        },
        {
          id: 2,
          merchant: 'Spotify',
          category: 'Music',
          amount: -12.99,
          type: 'expense',
          icon: 'music-note',
        },
        {
          id: 3,
          merchant: 'Money Transfer',
          category: 'Transaction',
          amount: 300,
          type: 'income',
          icon: 'swap-horiz',
        },
        {
          id: 4,
          merchant: 'Grocery',
          category: 'Shopping',
          amount: -88,
          type: 'expense',
          icon: 'local-grocery-store',
        },
      ],
    }),
    [],
  );

  // Memoized quick actions
  const quickActions = useMemo(
    () => [
      {id: 1, title: 'Sent', icon: 'send'},
      {id: 2, title: 'Receive', icon: 'call-received'},
      {id: 3, title: 'Loan', icon: 'attach-money'},
      {id: 4, title: 'Topup', icon: 'account-balance'},
    ],
    [],
  );

  const formatCurrency = amount => {
    return amount < 0
      ? `-£${Math.abs(amount).toFixed(2)}`
      : `£${amount.toFixed(2)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Header with welcome message */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleProfileBtn}>
            <Image
              style={styles.avatar}
              source={{
                uri: 'https://t4.ftcdn.net/jpg/04/31/64/75/360_F_431647519_usrbQ8Z983hTYe8zgA7t1XVc5fEtqcpa.jpg',
              }}
            />
          </TouchableOpacity>

          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          <TouchableOpacity>
            <Image
              style={styles.searchButton}
              source={require('../../../assets/Home/Search.png')}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Balance Section */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(user.balance)}
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          {quickActions.map(action => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickAction}
              activeOpacity={0.8}>
              <View style={styles.quickActionIcon}>
                <MaterialIcons
                  name={action.icon}
                  size={moderateScale(24)}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.quickActionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaction</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsContainer}>
          {user.transactions.map(transaction => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              formatCurrency={formatCurrency}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Separate component for transaction items to optimize rendering
const TransactionItem = React.memo(({transaction, formatCurrency}) => {
  const categoryColor = getCategoryColor(transaction.category);

  return (
    <View style={styles.transactionItem}>
      <View
        style={[styles.transactionIcon, {backgroundColor: categoryColor.bg}]}>
        <MaterialIcons
          name={transaction.icon}
          size={moderateScale(20)}
          color={categoryColor.icon}
        />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.merchantText}>{transaction.merchant}</Text>
        <Text style={styles.categoryText}>{transaction.category}</Text>
      </View>
      <Text
        style={[
          styles.amountText,
          transaction.type === 'income'
            ? styles.incomeAmount
            : styles.expenseAmount,
        ]}>
        {formatCurrency(transaction.amount)}
      </Text>
    </View>
  );
});

// Helper function for category colors
const getCategoryColor = category => {
  const colors = {
    Entertainment: {bg: '#E0E7FF', icon: '#4F46E5'},
    Music: {bg: '#FCE7F3', icon: '#EC4899'},
    Shopping: {bg: '#D1FAE5', icon: '#10B981'},
    Transaction: {bg: '#E0F2FE', icon: '#0EA5E9'},
  };
  return colors[category] || {bg: '#E5E7EB', icon: '#6B7280'};
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: verticalScale(20),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(20),
  },
  avatar: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(50),
    borderWidth: moderateScale(2),
    borderColor: '#0066FF',
    marginBottom: verticalScale(15),
  },
  searchButton: {
    width: moderateScale(50),
    height: moderateScale(50),
  },
  welcomeText: {
    fontSize: moderateScale(18),
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  userName: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginTop: verticalScale(5),
  },
  balanceContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    marginBottom: verticalScale(25),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: moderateScale(4)},
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(12),
      },
      android: {
        elevation: 6,
      },
    }),
  },
  balanceLabel: {
    fontSize: moderateScale(16),
    color: COLORS.textSecondary,
    marginBottom: verticalScale(8),
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  balanceAmount: {
    fontSize: moderateScale(32),
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(25),
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    backgroundColor: '#EDE9FE',
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  quickActionText: {
    fontSize: moderateScale(14),
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  seeAllText: {
    fontSize: moderateScale(14),
    color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  transactionsContainer: {
    backgroundColor: COLORS.card,
    borderRadius: moderateScale(16),
    paddingHorizontal: moderateScale(16),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: moderateScale(2)},
        shadowOpacity: 0.05,
        shadowRadius: moderateScale(8),
      },
      android: {
        elevation: 2,
      },
    }),
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionIcon: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(16),
  },
  transactionDetails: {
    flex: 1,
  },
  merchantText: {
    fontSize: moderateScale(16),
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  categoryText: {
    fontSize: moderateScale(14),
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginTop: verticalScale(4),
  },
  amountText: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  incomeAmount: {
    color: COLORS.success,
  },
  expenseAmount: {
    color: COLORS.danger,
  },
});

export default HomeScreen;
