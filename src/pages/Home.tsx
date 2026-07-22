import { SelectableHomepage } from '@/components/homepage/designs/SelectableHomepage';
import { HomepageOverride } from '@/components/themes/HomepageOverride';

const Home = () => {
  return <HomepageOverride defaultHomepage={SelectableHomepage} />;
};
export default Home;
