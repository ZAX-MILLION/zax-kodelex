import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { componentRegistry } from './ComponentRegistry';

interface Props {
  children: ReactNode;
  themeId?: string;
  componentName?: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class ThemeErrorBoundary extends Component<Props, State> {
  private maxRetries = 2;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to component registry for admin panel
    if (this.props.themeId && this.props.componentName) {
      console.error(`Theme component error in ${this.props.themeId}/${this.props.componentName}:`, error);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    this.setState({ errorInfo });
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  handleFallbackToDefault = () => {
    // Clear the problematic theme component and reload
    if (this.props.themeId) {
      componentRegistry.clearTheme(this.props.themeId);
    }
    
    // Reset error state
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0
    });
    
    // Reload the page to ensure clean state
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="max-w-2xl mx-auto mt-8 p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Theme Component Error
              </h2>
              <p className="text-muted-foreground">
                {this.props.themeId 
                  ? `There was an issue loading the "${this.props.componentName}" component from the "${this.props.themeId}" theme.`
                  : "There was an issue loading a theme component."
                }
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-muted p-4 rounded-lg">
                <summary className="cursor-pointer font-medium mb-2">
                  Error Details (Development Mode)
                </summary>
                <pre className="text-sm text-destructive overflow-auto">
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {this.state.retryCount < this.maxRetries && (
                <Button 
                  onClick={this.handleRetry}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry ({this.maxRetries - this.state.retryCount} attempts left)
                </Button>
              )}
              
              <Button 
                onClick={this.handleFallbackToDefault}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Use Default Layout
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              If this problem persists, please contact the theme developer or site administrator.
            </p>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}