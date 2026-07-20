import { LegalDocumentPage } from '@/components/LegalDocumentPage';
import { legalDocuments } from '@/content/legalDocuments';

const DisclaimerPage = () => (
  <LegalDocumentPage
    title="Disclaimer"
    description="Legal disclaimer — Zax Million is not responsible for misuse or unauthorized copyrighted content."
    keywords="disclaimer, liability, misuse, copyright, as-is"
    markdown={legalDocuments.disclaimer}
  />
);

export default DisclaimerPage;
