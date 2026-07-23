import { resolveHomepageDesign, type HomepageDesignId } from '@/features/homepage/homepageDesign';
import { HomepageEditorial } from './HomepageEditorial';
import { HomepageCinematic } from './HomepageCinematic';
import { HomepageCatalogue } from './HomepageCatalogue';
import { HomepageConversion } from './HomepageConversion';

const DESIGNS: Record<HomepageDesignId, React.ComponentType> = {
  A: HomepageEditorial,
  B: HomepageCinematic,
  C: HomepageCatalogue,
  D: HomepageConversion,
};

interface SelectableHomepageProps {
  /** Optional override for preview routes (demo/admin). */
  designId?: HomepageDesignId;
}

export function SelectableHomepage({ designId }: SelectableHomepageProps) {
  const id = designId ?? resolveHomepageDesign();
  const Component = DESIGNS[id] ?? HomepageCatalogue;
  return <Component />;
}

export default SelectableHomepage;
