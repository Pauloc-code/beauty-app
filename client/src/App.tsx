import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Component, ErrorInfo, ReactNode } from "react";

import NotFound from "@/pages/not-found";
import MobileApp from "@/pages/mobile-app";
import AdminPanel from "@/pages/admin-panel";

// --- Error Boundary Melhorado ---
// Este componente é uma "rede de segurança" para a sua aplicação.
// Se qualquer componente filho falhar durante a renderização,
// este ErrorBoundary irá "capturar" o erro e renderizar uma interface de fallback.

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("❌ ERRO CAPTURADO PELO ERROR BOUNDARY:", {
      error: error,
      componentStack: errorInfo.componentStack,
    });
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-2xl border border-red-200">
            <div className="bg-red-600 text-white p-4 rounded-t-lg">
              <h2 className="text-xl font-bold">Oops! A aplicação encontrou um erro.</h2>
              <p>Ocorreu um problema que impediu a página de carregar corretamente.</p>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-red-800 mb-2">Mensagem do Erro:</h3>
              <pre className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-4">
                {this.state.error?.toString()}
              </pre>

              <details className="cursor-pointer">
                <summary className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Ver detalhes técnicos (Component Stack)
                </summary>
                <pre className="mt-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-md overflow-auto whitespace-pre-wrap">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>

              <button
                onClick={() => window.location.reload()}
                className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Recarregar a Página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={AdminPanel} />
      <Route path="/app" component={MobileApp} />
      <Route path="/cliente" component={MobileApp} />
      <Route path="/mobile" component={MobileApp} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
