import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Search 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { InsertClient, Client } from "@shared/schema";

export default function ClientsSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientForm, setClientForm] = useState({
    name: "",
    cpf: "",
    phone: "",
    email: "",
    birthdate: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients, isLoading } = useQuery({
    queryKey: ["/api/clients"],
  });

  const createClientMutation = useMutation({
    mutationFn: (client: InsertClient) => apiRequest("POST", "/api/clients", client),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsNewClientOpen(false);
      resetForm();
      toast({
        title: "Cliente criado",
        description: "Cliente foi criado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o cliente.",
        variant: "destructive",
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, client }: { id: string, client: Partial<InsertClient> }) => 
      apiRequest("PATCH", `/api/clients/${id}`, client),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setEditingClient(null);
      resetForm();
      toast({
        title: "Cliente atualizado",
        description: "Cliente foi atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o cliente.",
        variant: "destructive",
      });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: (clientId: string) => apiRequest("DELETE", `/api/clients/${clientId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Cliente removido",
        description: "Cliente foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o cliente.",
        variant: "destructive",
      });
    },
  });

  const filteredClients = clients?.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cpf.includes(searchTerm) ||
    client.phone.includes(searchTerm)
  );

  const resetForm = () => {
    setClientForm({
      name: "",
      cpf: "",
      phone: "",
      email: "",
      birthdate: ""
    });
  };

  const handleOpenNewClient = () => {
    resetForm();
    setIsNewClientOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setClientForm({
      name: client.name,
      cpf: client.cpf,
      phone: client.phone,
      email: client.email || "",
      birthdate: client.birthdate ? format(new Date(client.birthdate), "yyyy-MM-dd") : ""
    });
    setEditingClient(client);
  };

  const handleSaveClient = () => {
    if (!clientForm.name || !clientForm.cpf || !clientForm.phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome, CPF e telefone são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const clientData: InsertClient = {
      name: clientForm.name,
      cpf: clientForm.cpf,
      phone: clientForm.phone,
      email: clientForm.email || undefined,
      birthdate: clientForm.birthdate ? new Date(clientForm.birthdate) : undefined
    };

    if (editingClient) {
      updateClientMutation.mutate({ id: editingClient.id, client: clientData });
    } else {
      createClientMutation.mutate(clientData);
    }
  };

  const handleDeleteClient = (clientId: string) => {
    if (confirm("Tem certeza que deseja remover este cliente?")) {
      deleteClientMutation.mutate(clientId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Gestão de Clientes</h2>
            <Button onClick={handleOpenNewClient} className="bg-primary text-white hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Nova Cliente
            </Button>
          </div>
        </div>
        
        <CardContent className="p-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar por nome, CPF ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
          
          {/* Clients Table */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="flex space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Cliente</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">CPF</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Telefone</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Cadastro</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Pontos</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients?.map((client) => (
                    <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-3">
                          <img 
                            src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40" 
                            alt={`Cliente ${client.name}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{client.name}</p>
                            <p className="text-sm text-gray-600">{client.email || "Email não informado"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-gray-600">
                        {client.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
                      </td>
                      <td className="py-4 px-2 text-gray-600">{client.phone}</td>
                      <td className="py-4 px-2 text-gray-600">
                        {format(new Date(client.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="py-4 px-2">
                        <Badge variant="secondary" className="bg-accent text-white">
                          {client.points}
                        </Badge>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-primary"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-primary"
                            onClick={() => handleEditClient(client)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-600"
                            onClick={() => handleDeleteClient(client.id)}
                            disabled={deleteClientMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        Nenhum cliente encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Modal */}
      <Dialog open={isNewClientOpen || !!editingClient} onOpenChange={(open) => {
        if (!open) {
          setIsNewClientOpen(false);
          setEditingClient(null);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? "Editar Cliente" : "Nova Cliente"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={clientForm.name}
                onChange={(e) => setClientForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={clientForm.cpf}
                onChange={(e) => setClientForm(prev => ({ ...prev, cpf: e.target.value }))}
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={clientForm.phone}
                onChange={(e) => setClientForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={clientForm.email}
                onChange={(e) => setClientForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="cliente@email.com"
              />
            </div>
            <div>
              <Label htmlFor="birthdate">Data de Nascimento</Label>
              <Input
                id="birthdate"
                type="date"
                value={clientForm.birthdate}
                onChange={(e) => setClientForm(prev => ({ ...prev, birthdate: e.target.value }))}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => {
                setIsNewClientOpen(false);
                setEditingClient(null);
                resetForm();
              }}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveClient} 
                disabled={createClientMutation.isPending || updateClientMutation.isPending}
              >
                {createClientMutation.isPending || updateClientMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
