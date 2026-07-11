import { runComprehensiveProductionReset } from './comprehensiveProductionReset';

export const executeDataReset = async () => {
  try {
    console.log('🚀 Starting database seeding process...');
    const result = await runComprehensiveProductionReset();
    
    if (result.success) {
      console.log('✅ Database successfully populated with production data');
      console.log(`📊 Statistics:`, result.stats);
      return true;
    } else {
      console.error('❌ Database seeding failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Critical error during database seeding:', error);
    return false;
  }
};

// Only run in development or when explicitly triggered
if (import.meta.env.DEV || localStorage.getItem('force-db-reset') === 'true') {
  console.log('🔄 Database reset triggered...');
  executeDataReset().then((success) => {
    if (success) {
      localStorage.removeItem('force-db-reset');
      console.log('🎉 Database reset completed successfully');
    }
  });
}