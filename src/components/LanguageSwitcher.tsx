import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export const LanguageSwitcher = () => {
  const { currentLanguage, languages, setLanguage, t, isLoading } = useI18n();

  if (isLoading || languages.length <= 1) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-sm font-medium"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentLanguage.native_name}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLanguage(language.code)}
            className={`flex items-center gap-3 cursor-pointer ${
              currentLanguage.code === language.code 
                ? 'bg-accent text-accent-foreground' 
                : ''
            }`}
          >
            <div className="flex flex-col">
              <span className="font-medium text-sm">
                {language.native_name}
              </span>
              <span className="text-xs text-muted-foreground">
                {language.name}
              </span>
            </div>
            {currentLanguage.code === language.code && (
              <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};