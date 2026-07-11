import { BookOpen } from 'lucide-react';

interface DemoModeBannerProps {
  visible?: boolean;
}

export const DemoModeBanner = ({ visible = false }: DemoModeBannerProps) => {
  if (!visible) return null;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 mb-6">
      <div className="flex items-start gap-3 text-sm">
        <BookOpen className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p className="text-muted-foreground">
          Showing the built-in demo library (20 series, 20 chapters each). Connect Supabase and run
          Admin → Demo Data Seeder to load live content.
        </p>
      </div>
    </div>
  );
};

export default DemoModeBanner;
