import { LegalDocumentPage } from '@/components/LegalDocumentPage';
import { legalDocuments } from '@/content/legalDocuments';

const AcceptableUsePage = () => (
  <LegalDocumentPage
    title="Acceptable Use Policy"
    description="Rules for lawful use of Zax Million — no piracy, malware, or illegal activity."
    keywords="acceptable use, aup, piracy, abuse, rules"
    markdown={legalDocuments.acceptableUse}
  />
);

export default AcceptableUsePage;
