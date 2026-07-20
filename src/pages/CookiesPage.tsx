import { LegalDocumentPage } from '@/components/LegalDocumentPage';
import { legalDocuments } from '@/content/legalDocuments';

const CookiesPage = () => (
  <LegalDocumentPage
    title="Cookie Policy"
    description="How Zax Million uses cookies and similar technologies."
    keywords="cookies, tracking, preferences, privacy"
    markdown={legalDocuments.cookies}
  />
);

export default CookiesPage;
