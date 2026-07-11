import { runComprehensiveProductionReset } from './comprehensiveProductionReset';

// Execute the comprehensive database reset
export const executeProductionReset = async () => {
  console.log('🚀 Executing comprehensive production database reset...');
  
  try {
    const result = await runComprehensiveProductionReset();
    
    if (result.success) {
      console.log('✅ Database reset completed successfully!');
      console.log(`📊 Stats:`, result.stats);
      console.log('🖼️ All images use consistent picsum.photos URLs');
      console.log('💰 Chapter pricing: 70% free, 30% locked (5-25 coins)');
      console.log('📚 Content types: 20 manga + 10 novels');
      console.log('📈 View data: Generated for trending calculations');
      
      return result;
    } else {
      console.error('❌ Database reset failed:', result.error);
      return result;
    }
  } catch (error) {
    console.error('❌ Error executing reset:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Auto-execute when this file is imported
executeProductionReset().then(result => {
  if (result.success) {
    console.log('🎉 Your manga reader platform is now populated with production-quality data!');
    console.log('✨ Features ready:');
    console.log('  - Hero slider with working cover images');
    console.log('  - Latest comics section with 16 items');
    console.log('  - Trending sidebar with real data');
    console.log('  - Series pages with chapter lists');
    console.log('  - Reader view for both manga and novels');
    console.log('  - Monetization system with coin pricing');
    window.location.reload(); // Refresh to show new data
  }
});