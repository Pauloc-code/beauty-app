import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrendingUp, Plus, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertTransaction } from "@shared/schema";

export default function FinancialSection() {
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    service: "",
    clientName: "",
    amount: "",
    method: "cash" as const
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats/today"],
  });

  const { data: services } = useQuery({
    queryKey: ["/api/services"],
  });

  const createTransactionMutation = useMutation({
    mutationFn: (transaction: InsertTransaction) =>
      apiRequest("POST", "/api/transactions", transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/today"] });
      setIsNewTransactionOpen(false);
      resetForm();
      toast({
        title: "Lançamento criado",
        description: "Transação foi registrada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível registrar a transação.",
        variant: "destructive",
      });
    },
  });

  const recentTransactions = transactions?.slice(0, 10) || [];

  // Mock data for demonstration
  const mockTransactions = [
    {
      id: "1",
      service: "Esmaltação em Gel",
      client: "Carla Santos", 
      amount: 35.00,
      method: "Dinheiro",
      time: "há 2 horas"
    },
    {
      id: "2",
      service: "Spa dos Pés",
      client: "Marina Oliveira",
      amount: 50.00, 
      method: "PIX",
      time: "há 4 horas"
    },
    {
      id: "3", 
      service: "Unhas de Fibra",
      client: "Paula Costa",
      amount: 80.00,
      method: "Cartão", 
      time: "ontem"
    }
  ];

  const resetForm = () => {
    setTransactionForm({
      service: "",
      clientName: "",
      amount: "",
      method: "cash"
    });
  };

  const handleSaveTransaction = () => {
    if (!transactionForm.service || !transactionForm.clientName || !transactionForm.amount) {
      toast({
        title: "Campos obrigatórios",
        description: "Serviço, nome do cliente e valor são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const selectedService = services?.find(s => s.id === transactionForm.service);
    
    const transactionData: InsertTransaction = {
      amount: parseFloat(transactionForm.amount),
      type: "income",
      method: transactionForm.method,
      description: `${selectedService?.name || transactionForm.service} - ${transactionForm.clientName}`,
      serviceId: transactionForm.service === "other" ? undefined : transactionForm.service,
      clientId: null, // Walk-in client without registration
      date: new Date()
    };

    createTransactionMutation.mutate(transactionData);
  };

  const transactionsToShow = recentTransactions.length ? recentTransactions : mockTransactions;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Financial Overview */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Controle Financeiro</h2>
                <Dialog open={isNewTransactionOpen} onOpenChange={setIsNewTransactionOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary text-white hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Lançamento Manual
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Novo Lançamento Manual</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="service">Serviço *</Label>
                        <Select value={transactionForm.service} onValueChange={(value) => setTransactionForm(prev => ({ ...prev, service: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um serviço" />
                          </SelectTrigger>
                          <SelectContent>
                            {services?.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name} - R$ {service.price}
                              </SelectItem>
                            ))}
                            <SelectItem value="other">Outro serviço</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="clientName">Nome do Cliente *</Label>
                        <Input
                          id="clientName"
                          value={transactionForm.clientName}
                          onChange={(e) => setTransactionForm(prev => ({ ...prev, clientName: e.target.value }))}
                          placeholder="Nome da cliente"
                        />
                      </div>
                      <div>
                        <Label htmlFor="amount">Valor (R$) *</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          value={transactionForm.amount}
                          onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                          placeholder="35.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="method">Forma de Pagamento *</Label>
                        <Select value={transactionForm.method} onValueChange={(value: "cash" | "card" | "pix") => setTransactionForm(prev => ({ ...prev, method: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Dinheiro</SelectItem>
                            <SelectItem value="card">Cartão</SelectItem>
                            <SelectItem value="pix">PIX</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setIsNewTransactionOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveTransaction} disabled={createTransactionMutation.isPending}>
                          {createTransactionMutation.isPending ? "Salvando..." : "Salvar"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <CardContent className="p-6">
              {/* Financial metrics */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    R$ {stats?.todayRevenue ? (stats.todayRevenue * 30).toFixed(2).replace('.', ',') : '12.450,00'}
                  </p>
                  <p className="text-sm text-gray-600">Faturamento do Mês</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">R$ 42,00</p>
                  <p className="text-sm text-gray-600">Ticket Médio</p>
                </div>
              </div>
              
              {/* Revenue chart placeholder */}
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Gráfico de Faturamento</p>
                <p className="text-sm text-gray-500">
                  Implementar biblioteca de gráficos (Chart.js, Recharts, etc.)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div>
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Transações Recentes</h3>
            </div>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between animate-pulse">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {transactionsToShow.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{transaction.service}</p>
                        <p className="text-sm text-gray-600">{transaction.client}</p>
                        <p className="text-xs text-gray-500">{transaction.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          + R$ {transaction.amount.toFixed(2).replace('.', ',')}
                        </p>
                        <p className="text-xs text-gray-500">{transaction.method}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(!transactions || transactions.length === 0) && !isLoading && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhuma transação registrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
