import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layouts/Sidebar';
import BackButton from '../../components/buttons/Back';
import SearchBar from '../../components/layouts/SearchBar';
import AddButton from '../../components/buttons/Add';
import BaseModal from '../../components/modals/Base';
import FormProduct from '../../components/forms/FormProduct.jsx';
import FormComplements from '../../components/forms/FormComplements.jsx';
import ListProduct from '../../components/lists/ListProduct';
import ListComplementos from '../../components/lists/ListComplementos';
import Notification from '../../components/elements/Notification';
import ConfirmDialog from '../../components/elements/ConfirmDialog';
import { API_URL } from '../../services/api';

const Products = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingComplement, setEditingComplement] = useState(null);
  const [activeTab, setActiveTab] = useState('produtos'); // 'produtos' ou 'complementos'
  const [activeFormTab, setActiveFormTab] = useState('detalhes'); // 'detalhes', 'complementos', 'receita'
  const [searchTerm, setSearchTerm] = useState('');
  const formRef = useRef();
  const refreshListRef = useRef();
  
  // Estados para notificação
  const [notification, setNotification] = useState(null);
  
  // Estados para confirmação de exclusão
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    itemId: null,
    itemName: '',
    itemType: '' // 'produto' ou 'complemento'
  });
  
  // ID do estabelecimento - em produção, isso viria do contexto de autenticação
  const estabelecimentoId = 7; // Temporário para teste (usando o ID que tem categorias no banco)

  const handleBack = () => {
    navigate('/config');
  };

  const handleAddClick = () => {
    setIsEditModal(false);
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditModal(false);
    setEditingProduct(null);
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

  const handleProductSuccess = (produto) => {
    console.log('Produto processado com sucesso:', produto);
    // Mostrar notificação de sucesso
    const action = isEditModal ? 'editado' : 'cadastrado';
    showNotification(`Produto "${produto.nome}" ${action} com sucesso!`, 'success');
    // Atualizar lista automaticamente
    setTimeout(() => {
      refreshList();
    }, 500); // Pequeno delay para garantir que a operação foi concluída
  };

  const handleComplementSuccess = (complemento) => {
    console.log('Complemento processado com sucesso:', complemento);
    // Mostrar notificação de sucesso
    const action = isEditModal ? 'editado' : 'cadastrado';
    showNotification(`Complemento "${complemento.nome}" ${action} com sucesso!`, 'success');
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
  const showDeleteConfirmation = (itemId, itemName, itemType = 'produto') => {
    setConfirmDialog({
      isOpen: true,
      itemId,
      itemName,
      itemType
    });
  };

  // Função para fechar confirmação
  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      itemId: null,
      itemName: '',
      itemType: ''
    });
  };

  // Função para abrir modal de edição
  const handleEditProduct = (produto) => {
    setEditingProduct(produto);
    setIsEditModal(true);
    setIsModalOpen(true);
  };

  // Função para fechar modal de edição
  const handleCloseEditModal = () => {
    setIsEditModal(false);
    setEditingProduct(null);
    setEditingComplement(null);
    setIsModalOpen(false);
  };

  // Função para abrir modal de edição de complemento
  const handleEditComplement = (complemento) => {
    setEditingComplement(complemento);
    setIsEditModal(true);
    setIsModalOpen(true);
  };

  // Função para alterar status do produto
  const handleToggleStatus = async (produto) => {
    try {
      const response = await fetch(`${API_URL}/product/${produto.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (result.success) {
        const action = produto.status ? 'desativado' : 'ativado';
        showNotification(`Produto "${produto.nome}" ${action} com sucesso!`, 'success');
        // Atualizar lista automaticamente
        setTimeout(() => {
          refreshList();
        }, 500);
      } else {
        showNotification(result.message || 'Erro ao alterar status do produto', 'error');
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      showNotification('Erro de conexão ao alterar status', 'error');
    }
  };

  // Função para alterar status do complemento
  const handleToggleComplementStatus = async (complemento) => {
    try {
      const response = await fetch(`${API_URL}/complement/${complemento.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (result.success) {
        const action = complemento.status ? 'desativado' : 'ativado';
        showNotification(`Complemento "${complemento.nome}" ${action} com sucesso!`, 'success');
        // Atualizar lista automaticamente
        setTimeout(() => {
          refreshList();
        }, 500);
      } else {
        showNotification(result.message || 'Erro ao alterar status do complemento', 'error');
      }
    } catch (error) {
      console.error('Erro ao alterar status do complemento:', error);
      showNotification('Erro ao conectar com o servidor', 'error');
    }
  };

  // Função para confirmar exclusão
  const handleConfirmDelete = async () => {
    try {
      const { itemId, itemName, itemType } = confirmDialog;
      console.log(`Excluindo ${itemType}:`, itemId);
      
      const endpoint = itemType === 'produto' ? 'product' : 'complement';
      const response = await fetch(`${API_URL}/${endpoint}/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (result.success) {
        // Mostrar notificação de sucesso
        const itemTypeText = itemType === 'produto' ? 'Produto' : 'Complemento';
        showNotification(`${itemTypeText} "${itemName}" excluído com sucesso!`, 'success');
        
        // Fechar confirmação
        closeConfirmDialog();
        
        // Atualizar lista automaticamente
        setTimeout(() => {
          refreshList();
        }, 500);
      } else {
        const itemTypeText = itemType === 'produto' ? 'produto' : 'complemento';
        showNotification(result.message || `Erro ao excluir ${itemTypeText}`, 'error');
      }
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      showNotification('Erro de conexão ao excluir item', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Caixa 1 */}
      <Sidebar currentPage="products" onNavigate={(page) => {
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
        className="flex-1 md:ml-20 flex flex-col overflow-hidden"
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
            <SearchBar 
              placeholder={activeTab === 'produtos' ? "Buscar produtos..." : "Buscar complementos..."} 
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <AddButton 
            text={activeTab === 'produtos' ? "Novo Produto" : "Novo Complemento"} 
            onClick={handleAddClick} 
          />
        </div>

        {/* Caixa 2 - Abas: Produtos e Complementos */}
        <div className="flex justify-start flex-shrink-0 px-4 sm:px-6 py-4">
          <div className="flex space-x-1">
            <button
              onClick={() => handleTabChange('produtos')}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'produtos'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Produtos
            </button>
            <button
              onClick={() => handleTabChange('complementos')}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'complementos'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Complementos
            </button>
          </div>
        </div>

        {/* Caixa 3 - Listagem de produtos (com scroll) - 100% altura restante */}
        <div className="flex-1 p-4 sm:p-6 overflow-hidden">
          <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          {activeTab === 'produtos' ? (
            <ListProduct 
              estabelecimentoId={estabelecimentoId}
              onEdit={handleEditProduct}
              onDelete={(produto) => {
                showDeleteConfirmation(produto.id, produto.nome, 'produto');
              }}
              onStatusToggle={handleToggleStatus}
              onRefresh={handleRefreshRef}
              searchTerm={searchTerm}
            />
          ) : (
            <ListComplementos 
              estabelecimentoId={estabelecimentoId}
              onEdit={handleEditComplement}
              onDelete={(complemento) => {
                showDeleteConfirmation(complemento.id, complemento.nome, 'complemento');
              }}
              onStatusToggle={handleToggleComplementStatus}
              onRefresh={handleRefreshRef}
              searchTerm={searchTerm}
            />
          )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <BaseModal 
        isOpen={isModalOpen} 
        onClose={isEditModal ? handleCloseEditModal : handleCloseModal}
        onSave={handleSave}
        title={
          activeTab === 'produtos' 
            ? (isEditModal ? "Editar Produto" : "Novo Produto")
            : (isEditModal ? "Editar Complemento" : "Novo Complemento")
        }
        description={
          activeTab === 'produtos' 
            ? (isEditModal ? "Atualize as informações do produto" : "Cadastre um novo produto no seu cardápio")
            : (isEditModal ? "Atualize as informações do complemento" : "Cadastre um novo complemento no seu menu")
        }
        saveText="Salvar"
        cancelText="Cancelar"
        tabs={activeTab === 'produtos' ? [
          { key: 'detalhes', label: 'Detalhes' },
          { key: 'complementos', label: 'Complementos' },
          { key: 'receita', label: 'Receita' }
        ] : null}
        activeTab={activeFormTab}
        onTabChange={setActiveFormTab}
      >
        {activeTab === 'produtos' ? (
          <FormProduct 
            ref={formRef}
            onSuccess={handleProductSuccess}
            onClose={isEditModal ? handleCloseEditModal : handleCloseModal}
            editData={editingProduct}
            activeTab={activeFormTab}
          />
        ) : (
          <FormComplements 
            ref={formRef}
            onSuccess={handleComplementSuccess}
            onClose={isEditModal ? handleCloseEditModal : handleCloseModal}
            editData={editingComplement}
          />
        )}
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
        title={`Excluir ${confirmDialog.itemType === 'produto' ? 'Produto' : 'Complemento'}`}
        message={`Tem certeza que deseja excluir o ${confirmDialog.itemType} "${confirmDialog.itemName}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="delete"
      />
    </div>
  );
};

export default Products;
