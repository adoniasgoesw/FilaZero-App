import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../services/api';
import { Search, Plus, User } from 'lucide-react';
import ConfirmDialog from '../elements/ConfirmDialog';

const ListClientes = ({ selectedCliente, onClienteSelect }) => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [localSelectedCliente, setLocalSelectedCliente] = useState(selectedCliente);
  const [showSearch, setShowSearch] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [novoClienteNome, setNovoClienteNome] = useState('');

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Buscando clientes...');
      
      const response = await fetch(`${API_URL}/client/7`); // TODO: Pegar estabelecimentoId dinamicamente
      const data = await response.json();

      console.log('Resposta da API:', data);

      if (data.success) {
        setClientes(data.data.clientes || []);
        console.log('Clientes carregados:', data.data.clientes);
      } else {
        setError(data.message || 'Erro ao carregar clientes');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Erro ao buscar clientes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  // Sincronizar cliente selecionado
  useEffect(() => {
    setLocalSelectedCliente(selectedCliente);
  }, [selectedCliente]);

  const handleClienteClick = (cliente) => {
    setLocalSelectedCliente(cliente);
    // Notificar o pai para atualizar a seleção local (mas não fechar modal)
    if (onClienteSelect) {
      onClienteSelect(cliente);
    }
  };

  const handleAdicionarCliente = () => {
    setIsAddDialogOpen(true);
  };

  const handleCadastrarCliente = async () => {
    try {
      if (!novoClienteNome.trim()) return;

      const response = await fetch(`${API_URL}/client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: novoClienteNome.trim(),
          estabelecimento_id: 7 // TODO: Pegar dinamicamente
        })
      });

      const data = await response.json();

      if (data.success) {
        // Recarregar lista de clientes
        await fetchClientes();
        // Selecionar o novo cliente
        setLocalSelectedCliente(data.data.cliente);
        // Notificar o componente pai
        if (onClienteSelect) {
          onClienteSelect(data.data.cliente);
        }
        // Fechar dialog
        setIsAddDialogOpen(false);
        setNovoClienteNome('');
      } else {
        console.error('Erro ao cadastrar cliente:', data.message);
      }
    } catch (err) {
      console.error('Erro ao cadastrar cliente:', err);
    }
  };

  const handleCancelarCadastro = () => {
    setIsAddDialogOpen(false);
    setNovoClienteNome('');
  };


  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-500">
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header com busca - estilo gaveta */}
        <div className="bg-gray-50 px-4 py-3 rounded-t-lg flex-shrink-0 relative overflow-hidden">
        {/* Linha base com título e botões, escondida quando buscando */}
        <div className={`flex items-center justify-between transition-opacity duration-300 ${
          showSearch ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
          <h3 className="text-sm font-semibold text-gray-700">Selecionar Cliente</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAdicionarCliente}
              className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors duration-200"
              title="Adicionar cliente"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => {
                setShowSearch(true);
                // Focar no input quando aparecer
                setTimeout(() => {
                  const input = document.getElementById('search-input');
                  if (input) input.focus();
                }, 300);
              }}
              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors duration-200"
              title="Buscar cliente"
            >
              <Search className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Gaveta de Busca - desliza da direita para a esquerda */}
        <div className={`absolute inset-0 bg-gray-50 transition-transform duration-300 ease-in-out ${
          showSearch ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}>
          <div className="p-4">
            <div className="relative">
              <input
                id="search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar cliente..."
                className="w-full h-10 text-sm border-2 border-gray-200 rounded-xl pl-10 pr-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white hover:border-gray-300"
              />
              {/* Ícone de busca dentro do input */}
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              {/* Ações dentro do input */}
              <div className="absolute inset-y-0 right-2 flex items-center gap-1">
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setSearchTerm('');
                  }}
                  className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
                  title="Fechar busca"
                >
                  <span className="text-gray-500 text-xs">×</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="flex-1 overflow-y-auto scrollbar-hide bg-white">
        {filteredClientes.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center text-gray-500">
              <p className="text-sm">Nenhum cliente encontrado</p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {filteredClientes.map((cliente) => (
              <div
                key={cliente.id}
                onClick={() => handleClienteClick(cliente)}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  localSelectedCliente?.id === cliente.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={localSelectedCliente?.id === cliente.id}
                  onChange={() => handleClienteClick(cliente)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {cliente.nome}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ConfirmDialog para adicionar cliente */}
      <ConfirmDialog
        isOpen={isAddDialogOpen}
        onClose={handleCancelarCadastro}
        onConfirm={handleCadastrarCliente}
        title="Novo Cliente"
        message="Cadastre um novo cliente rapidamente"
        confirmText="Salvar"
        cancelText="Cancelar"
        type="confirm"
        showInput={true}
        inputValue={novoClienteNome}
        onInputChange={setNovoClienteNome}
        inputPlaceholder="Digite o nome completo do cliente"
      />
      </div>

    </>
  );
};

export default ListClientes;
