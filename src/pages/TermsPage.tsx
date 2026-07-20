import { LegalDocumentPage } from '@/components/LegalDocumentPage';
import { legalDocuments } from '@/content/legalDocuments';

const TermsPage = () => (
  <LegalDocumentPage
    title="Terms of Service"
    description="Terms of service for Zax Million — usage rules, copyright responsibility, and liability limits."
    keywords="terms, service, agreement, copyright, liability, legal"
    markdown={legalDocuments.terms}
  />
);

export default TermsPage;
