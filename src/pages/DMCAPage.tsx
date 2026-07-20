import { LegalDocumentPage } from '@/components/LegalDocumentPage';
import { legalDocuments } from '@/content/legalDocuments';

const DMCAPage = () => (
  <LegalDocumentPage
    title="DMCA / Copyright Policy"
    description="Copyright takedown and DMCA policy for Zax Million."
    keywords="dmca, copyright, takedown, intellectual property"
    markdown={legalDocuments.dmca}
  />
);

export default DMCAPage;
