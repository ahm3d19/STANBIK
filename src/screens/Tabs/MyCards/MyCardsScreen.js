import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Platform,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BackBtn from '../../../components/BackBtn';

// Constants
const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_HEIGHT = 220;
const SPACING = 20;

// Scaling functions
const scale = size => (SCREEN_WIDTH / 375) * size;
const verticalScale = size => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// Modern color palette
const COLORS = {
  primary: '#6366F1',
  background: '#F9FAFB',
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
};

// Static data
const cardsData = [
  {
    id: '1',
    number: '4562 1122 4595 7852',
    name: 'AR Jonson',
    expiry: '24/2000',
    cvv: '6986',
    type: 'mastercard',
    color: '#2A2C3C',
  },
  {
    id: '2',
    number: '5123 4567 8912 3456',
    name: 'AR Jonson',
    expiry: '12/2025',
    cvv: '123',
    type: 'visa',
    color: '#3D5A80',
  },
  {
    id: '3',
    number: '3782 8224 6310 005',
    name: 'AR Jonson',
    expiry: '09/2024',
    cvv: '456',
    type: 'amex',
    color: '#4A4E69',
  },
];

const transactionsData = [
  {
    id: '1',
    merchant: 'Apple Store',
    category: 'Entertainment',
    amount: '£5.99',
    icon: 'shopping-cart',
  },
  {
    id: '2',
    merchant: 'Spotify',
    category: 'Music',
    amount: '£12.99',
    icon: 'music-note',
  },
  {
    id: '3',
    merchant: 'Grocery',
    category: 'Shopping',
    amount: '£88.00',
    icon: 'local-grocery-store',
  },
];

const monthlySpendingData = {
  limit: 10000,
  spent: 8545.0,
};

const CardItem = ({card, isActive}) => {
  const getCardLogo = () => {
    switch (card.type) {
      case 'visa':
        return require('../../../assets/MyCards/visa-logo-preview.png');
      default:
        return require('../../../assets/MyCards/mastercard-logo.png');
    }
  };

  return (
    <View
      style={[styles.cardContainer, isActive && styles.activeCardContainer]}>
      <View style={[styles.card, {backgroundColor: card.color}]}>
        <Image
          source={require('../../../assets/MyCards/worldmap.png')}
          style={styles.cardBackground}
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardNumber}>{card.number}</Text>
          <Text style={styles.cardName}>{card.name}</Text>
          <View style={styles.cardDetails}>
            <View>
              <Text style={styles.detailLabel}>Expiry Date</Text>
              <Text style={styles.detailValue}>{card.expiry}</Text>
            </View>
            <View style={styles.cvvContainer}>
              <Text style={styles.detailLabel}>CVV</Text>
              <Text style={styles.detailValue}>{card.cvv}</Text>
            </View>
            <Image source={getCardLogo()} style={styles.cardLogo} />
          </View>
        </View>
      </View>
    </View>
  );
};

const TransactionItem = ({item}) => {
  const getCategoryColor = category => {
    const colors = {
      Entertainment: {bg: '#E0E7FF', icon: '#4F46E5'},
      Music: {bg: '#FCE7F3', icon: '#EC4899'},
      Shopping: {bg: '#D1FAE5', icon: '#10B981'},
    };
    return colors[category] || {bg: '#E5E7EB', icon: '#6B7280'};
  };

  const color = getCategoryColor(item.category);

  return (
    <View style={styles.transactionItem}>
      <View style={[styles.transactionIcon, {backgroundColor: color.bg}]}>
        <MaterialIcons
          name={item.icon}
          size={moderateScale(20)}
          color={color.icon}
        />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.merchantText}>{item.merchant}</Text>
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>
      <Text style={styles.amountText}>{item.amount}</Text>
    </View>
  );
};

const MyCardsScreen = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef(null);
  const progressPercentage =
    (monthlySpendingData.spent / monthlySpendingData.limit) * 100;

  const handleScroll = event => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / (CARD_WIDTH + SPACING));
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const scrollToIndex = index => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * (CARD_WIDTH + SPACING),
        animated: true,
      });
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }>
        {/* Header */}
        <View style={styles.header}>
          <BackBtn />
          <Text style={styles.title}>My Cards</Text>
          <TouchableOpacity>
            <MaterialIcons
              name="settings"
              size={moderateScale(24)}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Cards ScrollView */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.cardsScrollContainer}
          snapToInterval={CARD_WIDTH + SPACING}
          decelerationRate="fast">
          {cardsData.map((card, index) => (
            <CardItem
              key={card.id}
              card={card}
              isActive={index === activeIndex}
            />
          ))}
        </ScrollView>

        {/* Indicators */}
        <View style={styles.indicators}>
          {cardsData.map((_, index) => (
            <TouchableOpacity key={index} onPress={() => scrollToIndex(index)}>
              <View
                style={[
                  styles.indicator,
                  index === activeIndex && styles.activeIndicator,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.transactionsContainer}>
          {transactionsData.map(item => (
            <TransactionItem key={item.id} item={item} />
          ))}
        </View>

        {/* Monthly Spending */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Spending</Text>
        </View>
        <View style={styles.limitContainer}>
          <View style={styles.limitHeader}>
            <Text style={styles.limitLabel}>Monthly limit</Text>
            <Text style={styles.limitAmount}>
              £{monthlySpendingData.spent.toFixed(2)} of £
              {monthlySpendingData.limit.toFixed(2)}
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, {width: `${progressPercentage}%`}]}
              />
            </View>
            <View style={styles.progressMarkers}>
              <Text style={styles.markerText}>£0</Text>
              <Text style={styles.markerText}>£4,600</Text>
              <Text style={styles.markerText}>£10,000</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    paddingBottom: verticalScale(20),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    paddingTop: Platform.select({
      ios: verticalScale(10),
      android: verticalScale(20),
    }),
    paddingBottom: verticalScale(20),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  cardsScrollContainer: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
    height: CARD_HEIGHT + verticalScale(40),
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginHorizontal: SPACING / 2,
    opacity: 0.7,
    transform: [{scale: 0.9}],
  },
  activeCardContainer: {
    opacity: 1,
    transform: [{scale: 1}],
  },
  card: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: moderateScale(10)},
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(20),
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  cardContent: {
    flex: 1,
    padding: moderateScale(20),
    justifyContent: 'space-between',
  },
  cardNumber: {
    color: 'white',
    fontSize: moderateScale(18),
    letterSpacing: 2,
    fontWeight: '500',
    marginTop: verticalScale(10),
  },
  cardName: {
    color: 'white',
    fontSize: moderateScale(16),
    fontWeight: '500',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  detailLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: moderateScale(12),
    marginBottom: 4,
  },
  detailValue: {
    color: 'white',
    fontSize: moderateScale(16),
    fontWeight: '500',
  },
  cvvContainer: {
    marginLeft: moderateScale(20),
  },
  cardLogo: {
    width: moderateScale(50),
    height: moderateScale(30),
    resizeMode: 'contain',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: verticalScale(10),
  },
  indicator: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: '#DEE2E6',
    marginHorizontal: moderateScale(4),
  },
  activeIndicator: {
    backgroundColor: COLORS.primary,
    width: moderateScale(16),
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    marginTop: verticalScale(20),
    marginBottom: verticalScale(10),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  seeAll: {
    fontSize: moderateScale(14),
    color: COLORS.primary,
    fontWeight: '500',
  },
  transactionsContainer: {
    paddingHorizontal: moderateScale(20),
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
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
  },
  merchantText: {
    fontSize: moderateScale(16),
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  categoryText: {
    fontSize: moderateScale(14),
    color: COLORS.textSecondary,
    marginTop: verticalScale(2),
  },
  amountText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  limitContainer: {
    backgroundColor: COLORS.card,
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    marginHorizontal: moderateScale(20),
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
  limitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(12),
  },
  limitLabel: {
    fontSize: moderateScale(16),
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  limitAmount: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  progressBarContainer: {
    marginBottom: verticalScale(4),
  },
  progressBar: {
    height: moderateScale(8),
    backgroundColor: '#E9ECEF',
    borderRadius: moderateScale(4),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: moderateScale(4),
  },
  progressMarkers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(8),
  },
  markerText: {
    fontSize: moderateScale(12),
    color: COLORS.textSecondary,
  },
});

export default MyCardsScreen;
