import { QueryClient } from "@tanstack/react-query";

// Configuração simplificada do QueryClient para o Firebase.
// Não precisamos mais da função apiRequest, pois vamos usar as funções do SDK do Firebase diretamente nos componentes.

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
});
