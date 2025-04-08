import React, {useMemo, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Platform,
  RefreshControl,
} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import {useNavigation} from '@react-navigation/native';
import BackBtn from '../../../components/BackBtn';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Constants
const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// Scaling functions
const scale = size => (screenWidth / guidelineBaseWidth) * size;
const verticalScale = size => (screenHeight / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// Modern color palette
const COLORS = {
  primary: '#6366F1', // Indigo
  background: '#F9FAFB',
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  success: '#10B981', // Emerald
  danger: '#EF4444', // Red
  warning: '#F59E0B', // Amber
};

// Generate random data
const generateRandomData = (count, min, max) => {
  return Array.from(
    {length: count},
    () => Math.floor(Math.random() * (max - min + 1)) + min,
  );
};

// Memoized Transaction Item
const TransactionItem = React.memo(({item}) => (
  <TouchableOpacity style={styles.transactionCard} activeOpacity={0.9}>
    <View
      style={[
        styles.transactionIcon,
        {backgroundColor: getCategoryColor(item.category).bg},
      ]}>
      <MaterialIcons
        name={getCategoryIcon(item.category)}
        size={moderateScale(20)}
        color={getCategoryColor(item.category).icon}
      />
    </View>
    <View style={styles.transactionDetails}>
      <Text
        style={styles.transactionName}
        numberOfLines={1}
        ellipsizeMode="tail">
        {item.name}
      </Text>
      <Text style={styles.transactionCategory}>
        {formatDate(item.date)} • {item.category}
      </Text>
    </View>
    <Text
      style={[
        styles.transactionAmount,
        item.amount < 0 ? styles.expenseAmount : styles.incomeAmount,
      ]}>
      {item.amount < 0 ? '-' : '+'}£{Math.abs(item.amount).toFixed(2)}
    </Text>
  </TouchableOpacity>
));

const StatisticsScreen = () => {
  const navigation = useNavigation();
  const [chartData, setChartData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [currentBalance, setCurrentBalance] = useState(0);

  // Initialize random data
  useEffect(() => {
    generateNewData();
  }, []);

  const generateNewData = () => {
    // Generate random chart data (6 months)
    const newChartData = {
      labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
      datasets: [
        {
          data: generateRandomData(6, 5000, 9000),
          color: () => COLORS.primary,
          strokeWidth: moderateScale(3),
        },
      ],
    };

    // Generate random transactions
    const categories = [
      'Shopping',
      'Food',
      'Transport',
      'Entertainment',
      'Bills',
      'Income',
    ];
    const newTransactions = Array.from({length: 8}, (_, i) => ({
      id: i + 1,
      name: getRandomName(categories[i % categories.length]),
      category: categories[i % categories.length],
      amount: getRandomAmount(categories[i % categories.length]),
      date: getRandomDate(),
    }));

    // Calculate current balance (last chart data point)
    const balance = newChartData.datasets[0].data.slice(-1)[0];

    setChartData(newChartData);
    setTransactions(newTransactions);
    setCurrentBalance(balance);
  };

  // Chart configuration
  const chartConfig = useMemo(
    () => ({
      backgroundColor: COLORS.card,
      backgroundGradientFrom: COLORS.card,
      backgroundGradientTo: COLORS.card,
      decimalPlaces: 0,
      color: () => COLORS.primary,
      labelColor: () => COLORS.textSecondary,
      propsForDots: {
        r: moderateScale(5),
        strokeWidth: moderateScale(2),
        stroke: COLORS.primary,
        fill: COLORS.card,
      },
      propsForBackgroundLines: {
        strokeWidth: moderateScale(1),
        strokeDasharray: '3 3',
        stroke: '#E5E7EB',
      },
      style: {
        borderRadius: moderateScale(16),
      },
    }),
    [],
  );

  // Format balance with commas
  const formattedBalance = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GBP',
    }).format(currentBalance);
  }, [currentBalance]);

  // Calculate percentage change
  const percentageChange = useMemo(() => {
    if (!chartData || chartData.datasets[0].data.length < 2) return 0;
    const current = chartData.datasets[0].data.slice(-1)[0];
    const previous = chartData.datasets[0].data.slice(-2)[0];
    return (((current - previous) / previous) * 100).toFixed(1);
  }, [chartData]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={generateNewData}
            tintColor={COLORS.primary}
          />
        }>
        {/* Header */}
        <View style={styles.header}>
          <BackBtn />
          <Text style={styles.title}>Statistics</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={generateNewData}>
            <MaterialIcons
              name="refresh"
              size={moderateScale(24)}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>{formattedBalance}</Text>
          <View style={styles.balanceChangeContainer}>
            <MaterialIcons
              name={percentageChange >= 0 ? 'trending-up' : 'trending-down'}
              size={moderateScale(16)}
              color={percentageChange >= 0 ? COLORS.success : COLORS.danger}
            />
            <Text
              style={[
                styles.balanceChangeText,
                {color: percentageChange >= 0 ? COLORS.success : COLORS.danger},
              ]}>
              {Math.abs(percentageChange)}% from last month
            </Text>
          </View>
        </View>

        {/* Chart */}
        {chartData && (
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={screenWidth - moderateScale(40)}
              height={verticalScale(220)}
              chartConfig={chartConfig}
              bezier
              withHorizontalLabels={true}
              withVerticalLabels={true}
              withDots={true}
              withShadow={false}
              withInnerLines={true}
              withOuterLines={true}
              fromZero={false}
              segments={5}
              style={styles.chartStyle}
            />
          </View>
        )}

        {/* Transactions Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsList}>
          {transactions.map(item => (
            <TransactionItem key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper functions
const getCategoryIcon = category => {
  const icons = {
    Shopping: 'shopping-cart',
    Food: 'restaurant',
    Transport: 'directions-car',
    Entertainment: 'music-note',
    Bills: 'receipt',
    Income: 'attach-money',
  };
  return icons[category] || 'payment';
};

const getCategoryColor = category => {
  const colors = {
    Shopping: {bg: '#E0E7FF', icon: '#4F46E5'},
    Food: {bg: '#FEF3C7', icon: '#F59E0B'},
    Transport: {bg: '#E0F2FE', icon: '#0EA5E9'},
    Entertainment: {bg: '#FCE7F3', icon: '#EC4899'},
    Bills: {bg: '#EDE9FE', icon: '#8B5CF6'},
    Income: {bg: '#D1FAE5', icon: '#10B981'},
  };
  return colors[category] || {bg: '#E5E7EB', icon: '#6B7280'};
};

const formatDate = date => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const getRandomName = category => {
  const names = {
    Shopping: ['Amazon Purchase', 'Grocery Store', 'Electronics', 'Clothing'],
    Food: ['Restaurant', 'Coffee Shop', 'Groceries', 'Takeout'],
    Transport: [
      'Uber Ride',
      'Gas Station',
      'Public Transport',
      'Car Maintenance',
    ],
    Entertainment: [
      'Movie Tickets',
      'Concert',
      'Streaming Service',
      'Game Purchase',
    ],
    Bills: ['Electric Bill', 'Internet Bill', 'Phone Bill', 'Rent'],
    Income: ['Freelance Work', 'Salary', 'Bonus', 'Investment'],
  };
  const options = names[category] || ['Transaction'];
  return options[Math.floor(Math.random() * options.length)];
};

const getRandomAmount = category => {
  const ranges = {
    Shopping: {min: 5, max: 200},
    Food: {min: 3, max: 50},
    Transport: {min: 2, max: 100},
    Entertainment: {min: 5, max: 150},
    Bills: {min: 20, max: 500},
    Income: {min: 500, max: 5000},
  };
  const range = ranges[category] || {min: 1, max: 100};
  const amount = Math.random() * (range.max - range.min) + range.min;
  return category === 'Income' ? amount : -amount;
};

const getRandomDate = () => {
  const now = new Date();
  const pastDate = new Date();
  pastDate.setDate(now.getDate() - Math.floor(Math.random() * 30));
  return pastDate;
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: verticalScale(20),
    paddingTop: Platform.select({
      ios: verticalScale(10),
      android: verticalScale(20),
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  balanceCard: {
    backgroundColor: COLORS.card,
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    marginBottom: verticalScale(24),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: moderateScale(4)},
        shadowOpacity: 0.05,
        shadowRadius: moderateScale(12),
      },
      android: {
        elevation: 3,
      },
    }),
  },
  balanceLabel: {
    fontSize: moderateScale(14),
    color: COLORS.textSecondary,
    marginBottom: verticalScale(4),
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  balanceAmount: {
    fontSize: moderateScale(32),
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: verticalScale(8),
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  balanceChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceChangeText: {
    fontSize: moderateScale(12),
    marginLeft: moderateScale(4),
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  chartContainer: {
    backgroundColor: COLORS.card,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: verticalScale(24),
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
  chartStyle: {
    borderRadius: moderateScale(12),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  seeAll: {
    fontSize: moderateScale(14),
    color: COLORS.primary,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  transactionsList: {
    marginBottom: verticalScale(20),
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: moderateScale(1)},
        shadowOpacity: 0.03,
        shadowRadius: moderateScale(4),
      },
      android: {
        elevation: 1,
      },
    }),
  },
  transactionIcon: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(12),
  },
  transactionDetails: {
    flex: 1,
    marginRight: moderateScale(8),
  },
  transactionName: {
    fontSize: moderateScale(16),
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: verticalScale(2),
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  transactionCategory: {
    fontSize: moderateScale(12),
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  transactionAmount: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  incomeAmount: {
    color: COLORS.success,
  },
  expenseAmount: {
    color: COLORS.danger,
  },
});

export default StatisticsScreen;
