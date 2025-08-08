import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const Phase8Checklist = () => {
  const tasks = [
    {
      title: "Installation Screen Persistence",
      description: "Prevent install screen from appearing on every preview",
      status: "completed" as const,
      details: "Added installation_complete localStorage check"
    },
    {
      title: "Developer Mode System",
      description: "Toggle to disable premium gating for development",
      status: "completed" as const,
      details: "Created useDeveloperMode hook with premium bypass"
    },
    {
      title: "License Verification with Bypass",
      description: "License check with developer override capability",
      status: "completed" as const,
      details: "Updated licenseValidator with dev bypass"
    },
    {
      title: "Collapsible Admin Sidebar",
      description: "Searchable, collapsible admin menu with categories",
      status: "completed" as const,
      details: "Created CollapsibleAdminSidebar component"
    },
    {
      title: "Premium Component Overrides",
      description: "Updated RequirePremium and PremiumChapterGate",
      status: "completed" as const,
      details: "Added developer bypass support"
    },
    {
      title: "MySQL Compatibility Layer",
      description: "Database abstraction for MySQL fallback",
      status: "partial" as const,
      details: "Basic structure created, needs full implementation"
    },
    {
      title: "Developer Tools Panel",
      description: "Admin panel for development overrides",
      status: "completed" as const,
      details: "Full developer tools dashboard created"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-500/10 text-green-600 border-green-500/30',
      partial: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
      failed: 'bg-red-500/10 text-red-600 border-red-500/30'
    };
    return variants[status as keyof typeof variants] || variants.failed;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phase 8: Implementation Checklist</CardTitle>
        <CardDescription>
          Final premium system integration, dashboard cleanup, and development overrides
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.map((task, index) => (
          <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
            <div className="mt-0.5">
              {getStatusIcon(task.status)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">{task.title}</h3>
                <Badge variant="outline" className={getStatusBadge(task.status)}>
                  {task.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                {task.description}
              </p>
              <p className="text-xs text-blue-600">
                {task.details}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};