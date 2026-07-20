import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedSEOHelmet } from '@/components/EnhancedSEOHelmet';

type LegalDocumentPageProps = {
  title: string;
  description: string;
  keywords: string;
  markdown: string;
};

/** Renders a legal markdown document with simple line breaks (matches existing legal pages). */
export function LegalDocumentPage({ title, description, keywords, markdown }: LegalDocumentPageProps) {
  return (
    <>
      <EnhancedSEOHelmet title={`${title} - Zax Million`} description={description} keywords={keywords} />

      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <div
                className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90"
                dangerouslySetInnerHTML={{ __html: markdown.replace(/\n/g, '<br/>') }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
