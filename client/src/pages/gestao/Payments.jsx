import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layouts/Sidebar';
import BackButton from '../../components/buttons/Back';
import AddButton from '../../components/buttons/Add';
import SearchBar from '../../components/layouts/SearchBar';
import BaseModal from '../../components/modals/Base';
import FormPayment from '../../components/forms/FormPayment';
import ListPayments from '../../components/lists/ListPayments';
import Notification from '../../components/elements/Notification';
import ConfirmDialog from '../../components/elements/ConfirmDialog';
import { useAuth } from '../../hooks/useAuth';
import { deletePayment, togglePaymentStatus } from '../../services/api';

const Payments = () => {
  const navigate = useNavigate();
  const { userData: user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [refreshPayments, setRefreshPayments] = useState(null);
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    paymentId: null,
    paymentNome: ''
  });
  const formRef = useRef();

  const handleBack = () => {
    navigate('/config');
  };

  const handleAddClick = () => {
    setEditingPayment(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPayment(null);
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setIsModalOpen(true);
  };

  const handleDeletePayment = (payment) => {
    setConfirmDialog({
      isOpen: true,
      paymentId: payment.id,
      paymentNome: payment.nome
    });
  };

  const handleConfirmDelete = async () => {
    try {
      const result = await deletePayment(confirmDialog.paymentId);
      if (result.success) {
        setNotification({
          message: 'Pagamento excluído com sucesso!',
          type: 'success'
        });
        if (refreshPayments) {
          refreshPayments();
        }
      } else {
        setNotification({
          message: 'Erro ao excluir pagamento: ' + result.message,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error);
      setNotification({
        message: 'Erro ao excluir pagamento',
        type: 'error'
      });
    } finally {
      setConfirmDialog({
        isOpen: false,
        paymentId: null,
        paymentNome: ''
      });
    }
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      paymentId: null,
      paymentNome: ''
    });
  };

  const handleStatusToggle = async (payment) => {
    try {
      const result = await togglePaymentStatus(payment.id);
      if (result.success) {
        setNotification({
          message: `Pagamento ${!payment.status ? 'ativado' : 'desativado'} com sucesso!`,
          type: 'success'
        });
        if (refreshPayments) {
          refreshPayments();
        }
      } else {
        setNotification({
          message: 'Erro ao alterar status do pagamento: ' + result.message,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Erro ao alterar status do pagamento:', error);
      setNotification({
        message: 'Erro ao alterar status do pagamento',
        type: 'error'
      });
    }
  };

  const handleSavePayment = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const handlePaymentSuccess = (payment) => {
    console.log('Pagamento salvo com sucesso:', payment);
    setNotification({
      message: editingPayment ? 'Pagamento editado com sucesso!' : 'Pagamento criado com sucesso!',
      type: 'success'
    });
    handleCloseModal();
    if (refreshPayments) {
      refreshPayments();
    }
  };

  const handleRefreshPayments = useCallback((refreshFn) => {
    setRefreshPayments(() => refreshFn);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Caixa 1 */}
      <Sidebar currentPage="payments" onNavigate={(page) => {
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
            <SearchBar placeholder="Buscar pagamentos..." />
          </div>
          <AddButton text="Novo Pagamento" onClick={handleAddClick} />
        </div>

        {/* Caixa 2 - Listagem de pagamentos (com scroll) - 100% altura restante */}
        <div className="flex-1 p-4 sm:p-6 overflow-hidden">
          <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            {user?.establishmentId ? (
              <ListPayments
                estabelecimentoId={user.establishmentId}
                onEdit={handleEditPayment}
                onDelete={handleDeletePayment}
                onStatusToggle={handleStatusToggle}
                onRefresh={handleRefreshPayments}
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
        onSave={handleSavePayment}
        title={editingPayment ? "Editar Pagamento" : "Novo Pagamento"}
        description={editingPayment ? "Atualize as informações da forma de pagamento" : "Cadastre uma nova forma de pagamento"}
        saveText="Salvar"
        cancelText="Cancelar"
      >
        <FormPayment
          ref={formRef}
          editData={editingPayment}
          onSuccess={handlePaymentSuccess}
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmDelete}
        title="Excluir Pagamento"
        message={`Tem certeza que deseja excluir o pagamento "${confirmDialog.paymentNome}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="delete"
      />
    </div>
  );
};

export default Payments;

