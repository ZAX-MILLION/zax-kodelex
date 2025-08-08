import CoinStore from '@/components/CoinStore';
import { EnhancedSEOHelmet } from '@/components/EnhancedSEOHelmet';

const Coins = () => {
  return (
    <>
      <EnhancedSEOHelmet 
        title="Coin Store - Purchase Coins to Unlock Premium Content"
        description="Buy coins to unlock premium manga chapters, exclusive themes, and special features. Choose from various coin packages with bonus offers."
        keywords="coins, purchase, premium, unlock, manga chapters, store"
        canonical="/coins"
      />
      <CoinStore />
    </>
  );
};

export default Coins;