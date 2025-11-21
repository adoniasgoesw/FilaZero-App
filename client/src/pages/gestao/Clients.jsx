import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layouts/Sidebar';
import BackButton from '../../components/buttons/Back';
import AddButton from '../../components/buttons/Add';
import SearchBar from '../../components/layouts/SearchBar';
import BaseModal from '../../components/modals/Base';
import FormClient from '../../components/forms/FormClient';
import ListClients from '../../components/lists/ListClients';
import Notification from '../../components/elements/Notification';
import ConfirmDialog from '../../components/elements/ConfirmDialog';
import { useAuth } from '../../hooks/useAuth';
import { updateClient, deleteClient } from '../../services/api';

const Clients = () => {
  const navigate = useNavigate();
  const { userData: user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [refreshClients, setRefreshClients] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const formRef = useRef();

  const handleBack = () => {
    navigate('/config');
  };

  const handleAddClick = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClient = (client) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteClient = async () => {
    if (!clientToDelete) return;

    try {
      const result = await deleteClient(clientToDelete.id);
      if (result.success) {
        setNotification({
          message: 'Cliente excluído com sucesso!',
          type: 'success'
        });
        if (refreshClients) {
          refreshClients();
        }
      } else {
        setNotification({
          message: 'Erro ao excluir cliente: ' + result.message,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      setNotification({
        message: 'Erro ao excluir cliente',
        type: 'error'
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const handleCancelDeleteClient = () => {
    setIsDeleteDialogOpen(false);
    setClientToDelete(null);
  };

  const handleStatusToggle = async (client) => {
    try {
      const result = await updateClient(client.id, {
        status: !client.status
      });
      if (result.success) {
        setNotification({
          message: `Cliente ${!client.status ? 'ativado' : 'desativado'} com sucesso!`,
          type: 'success'
        });
        if (refreshClients) {
          refreshClients();
        }
      } else {
        setNotification({
          message: 'Erro ao alterar status do cliente: ' + result.message,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Erro ao alterar status do cliente:', error);
      setNotification({
        message: 'Erro ao alterar status do cliente',
        type: 'error'
      });
    }
  };

  const handleSaveClient = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const handleClientSuccess = (client) => {
    console.log('Cliente salvo com sucesso:', client);
    setNotification({
      message: editingClient ? 'Cliente editado com sucesso!' : 'Cliente criado com sucesso!',
      type: 'success'
    });
    handleCloseModal();
    if (refreshClients) {
      refreshClients();
    }
  };

  const handleRefreshClients = useCallback((refreshFn) => {
    setRefreshClients(() => refreshFn);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Caixa 1 */}
      <Sidebar currentPage="clients" onNavigate={(page) => {
        if (['clients', 'users', 'payments', 'categories', 'products'].includes(page)) {
          navigate(`/${page}`);
        } else if (['historic', 'kitchen', 'delivery', 'config'].includes(page)) {
          navigate(`/${page}`);
        } else {
          navigate('/home');
        }
      }} isManagementPage={true} />
      
      {/* Conteúdo da página - Caixa 2 */}
      <div 
        className="flex-1 md:ml-20 flex flex-col"
        style={{
          height: window.innerWidth <= 768 
            ? 'calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))'
            : '100vh'
        }}
      >
        {/* Caixa 1 - Header: Botão voltar, barra de pesquisa e botão adicionar */}
        <div className="flex items-center gap-4 p-4 sm:p-6 bg-white flex-shrink-0">
          <BackButton onClick={handleBack} isRound={true} />
          <div className="flex-1">
            <SearchBar placeholder="Buscar clientes..." />
          </div>
          <AddButton text="Novo Cliente" onClick={handleAddClick} />
        </div>

        {/* Caixa 2 - Listagem de clientes (com scroll) - 100% altura restante */}
        <div className="flex-1 p-4 sm:p-6 overflow-hidden">
          <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            {user?.establishmentId ? (
              <ListClients
                estabelecimentoId={user.establishmentId}
                onEdit={handleEditClient}
                onDelete={handleDeleteClient}
                onStatusToggle={handleStatusToggle}
                onRefresh={handleRefreshClients}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-red-500 text-lg font-medium mb-2">Erro de autenticação</div>
                  <div className="text-gray-500 text-sm">Estabelecimento não encontrado. Faça login novamente.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <BaseModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        onSave={handleSaveClient}
        title={editingClient ? "Editar Cliente" : "Novo Cliente"}
        description={editingClient ? "Atualize as informações do cliente" : "Cadastre um novo cliente no sistema"}
        saveText="Salvar"
        cancelText="Cancelar"
      >
        <FormClient 
          ref={formRef}
          editData={editingClient}
          onSuccess={handleClientSuccess}
          onClose={handleCloseModal}
        />
      </BaseModal>

      {/* Notificação */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* ConfirmDialog para deletar cliente */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCancelDeleteClient}
        onConfirm={handleConfirmDeleteClient}
        title="Excluir Cliente"
        message={`Tem certeza que deseja excluir o cliente "${clientToDelete?.nome}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="delete"
      />
    </div>
  );
};

export default Clients;
