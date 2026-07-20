import { LegalDocumentPage } from '@/components/LegalDocumentPage';
import { legalDocuments } from '@/content/legalDocuments';

const PrivacyPage = () => (
  <LegalDocumentPage
    title="Privacy Policy"
    description="How Zax Million collects, uses, and protects personal information."
    keywords="privacy, policy, data protection, personal information, gdpr"
    markdown={legalDocuments.privacy}
  />
);

export default PrivacyPage;
