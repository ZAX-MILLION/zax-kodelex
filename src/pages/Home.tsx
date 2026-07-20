import { SeamlessHomepage } from '@/components/homepage/seamless/SeamlessHomepage';
import { HomepageOverride } from '@/components/themes/HomepageOverride';

const Home = () => {
  return (
    <HomepageOverride defaultHomepage={SeamlessHomepage} />
  );
};
export default Home;