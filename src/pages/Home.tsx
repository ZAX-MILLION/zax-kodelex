import { ResetScansHomepage } from '@/components/homepage/ResetScansHomepage';
import { HomepageOverride } from '@/components/themes/HomepageOverride';

const Home = () => {
  return (
    <HomepageOverride defaultHomepage={ResetScansHomepage} />
  );
};
export default Home;