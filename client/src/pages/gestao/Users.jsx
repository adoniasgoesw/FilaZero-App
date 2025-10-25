import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layouts/Sidebar';
import BackButton from '../../components/buttons/Back';
import AddButton from '../../components/buttons/Add';
import SearchBar from '../../components/layouts/SearchBar';
import BaseModal from '../../components/modals/Base';
import FormUser from '../../components/forms/FormUser';
import ListUsers from '../../components/lists/ListUsers';
import Notification from '../../components/elements/Notification';
import ConfirmDialog from '../../components/elements/ConfirmDialog';
import { useAuth } from '../../hooks/useAuth';
import { updateUser, deleteUser } from '../../services/api';

const Users = () => {
  const navigate = useNavigate();
  const { userData: user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [refreshUsers, setRefreshUsers] = useState(null);
  const [notification, setNotification] = useState(null);
  const [activeFormTab, setActiveFormTab] = useState('detalhes'); // 'detalhes', 'permissoes'
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    userId: null,
    userName: '',
    userCargo: ''
  });
  const formRef = useRef();

  const handleBack = () => {
    navigate('/config');
  };

  const handleAddClick = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    setConfirmDialog({
      isOpen: true,
      userId: user.id,
      userName: user.nome_completo,
      userCargo: user.cargo
    });
  };

  const handleConfirmDelete = async () => {
    try {
      const result = await deleteUser(confirmDialog.userId);
      if (result.success) {
        setNotification({
          message: 'Usuário excluído com sucesso!',
          type: 'success'
        });
        if (refreshUsers) {
          refreshUsers();
        }
      } else {
        setNotification({
          message: 'Erro ao excluir usuário: ' + result.message,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      setNotification({
        message: 'Erro ao excluir usuário',
        type: 'error'
      });
    } finally {
      setConfirmDialog({
        isOpen: false,
        userId: null,
        userName: '',
        userCargo: ''
      });
    }
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      userId: null,
      userName: '',
      userCargo: ''
    });
  };

  const handleStatusToggle = async (user) => {
    try {
      const result = await updateUser(user.id, {
        status: !user.status
      });
      if (result.success) {
        setNotification({
          message: `Usuário ${!user.status ? 'ativado' : 'desativado'} com sucesso!`,
          type: 'success'
        });
        if (refreshUsers) {
          refreshUsers();
        }
      } else {
        setNotification({
          message: 'Erro ao alterar status do usuário: ' + result.message,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      setNotification({
        message: 'Erro ao alterar status do usuário',
        type: 'error'
      });
    }
  };

  const handleSaveUser = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const handleUserSuccess = (user) => {
    console.log('Usuário salvo com sucesso:', user);
    setNotification({
      message: editingUser ? 'Usuário editado com sucesso!' : 'Usuário criado com sucesso!',
      type: 'success'
    });
    handleCloseModal();
    if (refreshUsers) {
      refreshUsers();
    }
  };

  const handleRefreshUsers = useCallback((refreshFn) => {
    setRefreshUsers(() => refreshFn);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Caixa 1 */}
      <Sidebar currentPage="users" onNavigate={(page) => {
        if (['clients', 'users', 'payments', 'categories', 'products'].includes(page)) {
          navigate(`/${page}`);
        } else if (['historic', 'kitchen', 'delivery', 'config'].includes(page)) {
          navigate(`/${page}`);
        } else {
          navigate('/home');
        }
      }} isManagementPage={true} />
      
      {/* Conteúdo da página - Caixa 2 */}
      <div className="flex-1 md:ml-20 h-screen flex flex-col">
        {/* Caixa 1 - Header: Botão voltar, barra de pesquisa e botão adicionar */}
        <div className="flex items-center gap-4 p-4 sm:p-6 bg-white flex-shrink-0">
          <BackButton onClick={handleBack} isRound={true} />
          <div className="flex-1">
            <SearchBar placeholder="Buscar usuários..." />
          </div>
          <AddButton text="Novo Usuário" onClick={handleAddClick} />
        </div>

        {/* Caixa 2 - Listagem de usuários (com scroll) - 100% altura restante */}
        <div className="flex-1 p-4 sm:p-6 overflow-hidden">
          <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            {user?.establishmentId ? (
              <ListUsers
                estabelecimentoId={user.establishmentId}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onStatusToggle={handleStatusToggle}
                onRefresh={handleRefreshUsers}
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
        onSave={handleSaveUser}
        title={editingUser ? "Editar Usuário" : "Novo Usuário"}
        description={editingUser ? "Atualize as informações do usuário" : "Cadastre um novo usuário no sistema"}
        saveText="Salvar"
        cancelText="Cancelar"
        tabs={[
          { key: 'detalhes', label: 'Detalhes' },
          { key: 'permissoes', label: 'Permissões' }
        ]}
        activeTab={activeFormTab}
        onTabChange={setActiveFormTab}
      >
        <FormUser 
          ref={formRef}
          editData={editingUser}
          onSuccess={handleUserSuccess}
          onClose={handleCloseModal}
          activeTab={activeFormTab}
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmDelete}
        title="Excluir Usuário"
        message={`Tem certeza que deseja excluir o usuário "${confirmDialog.userName}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="delete"
      />
    </div>
  );
};

export default Users;

