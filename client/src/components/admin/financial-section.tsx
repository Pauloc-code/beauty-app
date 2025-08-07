import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrendingUp, Plus, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, Timestamp, query, orderBy, limit } from "firebase/firestore";
import type { Service } from "@shared/schema";

// --- Tipos ---
interface Transaction {
    id: string;
    description: string;
    amount: number;
    method: string;
    createdAt: Date;
}

// --- Funções do Firebase ---
const fetchTransactions = async (): Promise<Transaction[]> => {
    const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(10));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
        } as Transaction;
    });
};

const fetchServices = async (): Promise<Service[]> => {
    const snapshot = await getDocs(collection(db, "services"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
};

const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    await addDoc(collection(db, "transactions"), {
        ...transaction,
        createdAt: Timestamp.now(),
    });
};

export default function FinancialSection() {
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    description: "",
    amount: "",
    method: "cash"
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: fetchTransactions,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
  });

  const createTransactionMutation = useMutation({
    mutationFn: addTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setIsNewTransactionOpen(false);
      resetForm();
      toast({
        title: "Lançamento criado",
        description: "Transação foi registrada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Não foi possível registrar a transação: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTransactionForm({
      description: "",
      amount: "",
      method: "cash"
    });
  };

  const handleSaveTransaction = () => {
    if (!transactionForm.description || !transactionForm.amount) {
      toast({
        title: "Campos obrigatórios",
        description: "Descrição e valor são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const transactionData = {
      description: transactionForm.description,
      amount: parseFloat(transactionForm.amount),
      method: transactionForm.method,
    };

    createTransactionMutation.mutate(transactionData as any);
  };

  return (
    <div className="space-y-8">
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
                    <Label htmlFor="description">Descrição *</Label>
                    <Input id="description" value={transactionForm.description} onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))} />
                  </div>
                  <div>
                    <Label htmlFor="amount">Valor (R$) *</Label>
                    <Input id="amount" type="number" step="0.01" value={transactionForm.amount} onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))} />
                  </div>
                  <div>
                    <Label htmlFor="method">Forma de Pagamento *</Label>
                    <Select value={transactionForm.method} onValueChange={(value) => setTransactionForm(prev => ({ ...prev, method: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Dinheiro</SelectItem>
                        <SelectItem value="card">Cartão</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsNewTransactionOpen(false)}>Cancelar</Button>
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
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Gráfico de Faturamento</p>
            <p className="text-sm text-gray-500">Funcionalidade de gráfico a ser implementada.</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transações Recentes</h3>
        </div>
        <CardContent className="p-6">
          {isLoading ? <p>Carregando transações...</p> : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleDateString('pt-BR')}</p>
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
        </CardContent>
      </Card>
    </div>
  );
}
