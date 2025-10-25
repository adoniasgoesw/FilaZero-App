import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layouts/Sidebar';
import BackButton from '../../components/buttons/Back';
import AddButton from '../../components/buttons/Add';
import SearchBar from '../../components/layouts/SearchBar';
import BaseModal from '../../components/modals/Base';
import FormCategory from '../../components/forms/FormCategory';
import ListCategory from '../../components/lists/ListCategory';
import Notification from '../../components/elements/Notification';
import ConfirmDialog from '../../components/elements/ConfirmDialog';
import { API_URL } from '../../services/api';

const Categories = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const formRef = useRef();
  const refreshListRef = useRef();
  
  // Estados para notificação
  const [notification, setNotification] = useState(null);
  
  // Estados para confirmação de exclusão
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    categoryId: null,
    categoryName: ''
  });
  
  // ID do estabelecimento - em produção, isso viria do contexto de autenticação
  const estabelecimentoId = 7; // Temporário para teste (usando o ID que tem categorias no banco)

  const handleBack = () => {
    navigate('/config');
  };

  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  // Função para capturar a referência de refresh
  const handleRefreshRef = (refreshFn) => {
    refreshListRef.current = refreshFn;
  };

  // Função para atualizar a lista
  const refreshList = () => {
    if (refreshListRef.current) {
      refreshListRef.current();
    }
  };

  const handleCategorySuccess = (categoria) => {
    console.log('Categoria processada com sucesso:', categoria);
    // Mostrar notificação de sucesso
    const action = isEditModal ? 'editada' : 'cadastrada';
    showNotification(`Categoria "${categoria.nome}" ${action} com sucesso!`, 'success');
    // Atualizar lista automaticamente
    setTimeout(() => {
      refreshList();
    }, 500); // Pequeno delay para garantir que a operação foi concluída
  };

  // Função para mostrar notificações
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // Função para fechar notificação
  const closeNotification = () => {
    setNotification(null);
  };

  // Função para mostrar confirmação de exclusão
  const showDeleteConfirmation = (categoryId, categoryName) => {
    setConfirmDialog({
      isOpen: true,
      categoryId,
      categoryName
    });
  };

  // Função para fechar confirmação
  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      categoryId: null,
      categoryName: ''
    });
  };

  // Função para abrir modal de edição
  const handleEditCategory = (categoria) => {
    setEditingCategory(categoria);
    setIsEditModal(true);
    setIsModalOpen(true);
  };

  // Função para fechar modal de edição
  const handleCloseEditModal = () => {
    setIsEditModal(false);
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  // Função para alterar status da categoria
  const handleToggleStatus = async (categoria) => {
    try {
      const response = await fetch(`${API_URL}/category/${categoria.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (result.success) {
        const action = categoria.status ? 'desativada' : 'ativada';
        showNotification(`Categoria "${categoria.nome}" ${action} com sucesso!`, 'success');
        // Atualizar lista automaticamente
        setTimeout(() => {
          refreshList();
        }, 500);
      } else {
        showNotification(result.message || 'Erro ao alterar status da categoria', 'error');
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      showNotification('Erro de conexão ao alterar status', 'error');
    }
  };

  // Função para confirmar exclusão
  const handleConfirmDelete = async () => {
    try {
      console.log('Excluindo categoria:', confirmDialog.categoryId);
      
      const response = await fetch(`${API_URL}/category/${confirmDialog.categoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (result.success) {
        // Mostrar notificação de sucesso
        showNotification(`Categoria "${confirmDialog.categoryName}" excluída com sucesso!`, 'success');
        
        // Fechar confirmação
        closeConfirmDialog();
        
        // Atualizar lista automaticamente
        setTimeout(() => {
          refreshList();
        }, 500);
      } else {
        showNotification(result.message || 'Erro ao excluir categoria', 'error');
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      showNotification('Erro de conexão ao excluir categoria', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Caixa 1 */}
      <Sidebar currentPage="categories" onNavigate={(page) => {
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
            <SearchBar placeholder="Buscar categorias..." />
          </div>
          <AddButton text="Nova Categoria" onClick={handleAddClick} />
        </div>

        {/* Caixa 2 - Listagem de categorias (com scroll interno) - 100% altura restante */}
        <div className="flex-1 p-4 sm:p-6 overflow-hidden">
          <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <ListCategory 
              estabelecimentoId={estabelecimentoId}
              onEdit={handleEditCategory}
              onDelete={(categoria) => {
                showDeleteConfirmation(categoria.id, categoria.nome);
              }}
              onStatusToggle={handleToggleStatus}
              onRefresh={handleRefreshRef}
            />
          </div>
        </div>
      </div>

      {/* Modal */}
      <BaseModal 
        isOpen={isModalOpen} 
        onClose={isEditModal ? handleCloseEditModal : handleCloseModal}
        onSave={handleSave}
        title={isEditModal ? "Editar Categoria" : "Nova Categoria"}
        description={isEditModal ? "Atualize as informações da categoria" : "Crie uma nova categoria para organizar seus produtos"}
        saveText="Salvar"
        cancelText="Cancelar"
      >
        <FormCategory 
          ref={formRef}
          onSuccess={handleCategorySuccess}
          onClose={isEditModal ? handleCloseEditModal : handleCloseModal}
          editData={editingCategory}
        />
      </BaseModal>

      {/* Notification */}
      <Notification
        message={notification?.message}
        type={notification?.type}
        onClose={closeNotification}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirmDelete}
        title="Excluir Categoria"
        message={`Tem certeza que deseja excluir a categoria "${confirmDialog.categoryName}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="delete"
      />
    </div>
  );
};

export default Categories;
