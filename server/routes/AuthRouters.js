import express from 'express';
import { registerUser } from '../controllers/registerController.js';
import { loginUser } from '../controllers/loginController.js';
import { createCategory, getCategories, updateCategory, toggleCategoryStatus, deleteCategory } from '../controllers/categoriesController.js';
import { createProduct, getProducts, getCategoriesForDropdown, updateProduct, toggleProductStatus, deleteProduct } from '../controllers/productsController.js';
import { createComplement, getComplements, updateComplement, toggleComplementStatus, deleteComplement } from '../controllers/complementsController.js';
import { createClient, getClients, updateClient, deleteClient } from '../controllers/clientsController.js';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/usersController.js';
import { getPayments, createPayment, updatePayment, deletePayment, togglePaymentStatus } from '../controllers/paymentsController.js';
import { getCaixasFechadas, getCaixaDetalhes, criarCaixa, fecharCaixa, getStatusUltimoCaixa, updateTotalVendas } from '../controllers/caixasController.js';
import { getPedidosHistorico } from '../controllers/pedidosHistoricoController.js';
import { getPagamentosHistorico } from '../controllers/pagamentosHistoricoController.js';
import { getMovimentacoesCaixa, adicionarMovimentacao } from '../controllers/movimentacoesCaixaController.js';
import { criarConfiguracaoPadrao, buscarConfiguracao, atualizarConfiguracao } from '../controllers/pontosAtendimentoController.js';
import { uploadImage, uploadProductImage, handleUploadError } from '../controllers/uploadController.js';
import { uploadSingle } from '../middlewares/uploadMiddleware.js';


const router = express.Router();

// Rota para registrar usuário
router.post('/registrar', registerUser);

// Rota para fazer login
router.post('/login', loginUser);

// Rota para criar categoria
router.post('/category', createCategory);

// Rota para buscar categorias de um estabelecimento
router.get('/category/:estabelecimento_id', getCategories);

// Rota para atualizar categoria
router.put('/category/:id', updateCategory);

// Rota para alterar status da categoria
router.patch('/category/:id/status', toggleCategoryStatus);

// Rota para excluir categoria
router.delete('/category/:id', deleteCategory);

// Rota para upload de imagens
router.post('/upload/image', uploadSingle, uploadImage, handleUploadError);

// Rota para upload de imagens de produtos
router.post('/upload/product-image', uploadSingle, uploadProductImage, handleUploadError);

// Rotas de Produtos
// Rota para criar produto
router.post('/product', createProduct);

// Rota para buscar produtos de um estabelecimento
router.get('/product/:estabelecimento_id', getProducts);

// Rota para buscar categorias para dropdown
router.get('/product/categories/:estabelecimento_id', getCategoriesForDropdown);

// Rota para atualizar produto
router.put('/product/:id', updateProduct);

// Rota para alterar status do produto
router.patch('/product/:id/status', toggleProductStatus);

// Rota para excluir produto
router.delete('/product/:id', deleteProduct);

// Rotas de Complementos
// Rota para criar complemento
router.post('/complement', createComplement);

// Rota para buscar complementos de um estabelecimento
router.get('/complement/:estabelecimento_id', getComplements);

// Rota para atualizar complemento
router.put('/complement/:id', updateComplement);

// Rota para alterar status do complemento
router.patch('/complement/:id/status', toggleComplementStatus);

// Rota para excluir complemento
router.delete('/complement/:id', deleteComplement);

// Rotas de Clientes
// Rota para criar cliente
router.post('/client', createClient);

// Rota para buscar clientes de um estabelecimento
router.get('/client/:estabelecimentoId', getClients);

// Rota para atualizar cliente
router.put('/client/:id', updateClient);

// Rota para excluir cliente
router.delete('/client/:id', deleteClient);

// Rotas de Usuários
// Rota para criar usuário
router.post('/user', createUser);

// Rota para buscar usuários de um estabelecimento
router.get('/users/:estabelecimentoId', getUsers);

// Rota para atualizar usuário
router.put('/user/:id', updateUser);

// Rota para deletar usuário
router.delete('/user/:id', deleteUser);

// Rotas de Pagamentos
// Rota para buscar pagamentos de um estabelecimento
router.get('/payments/:estabelecimentoId', getPayments);

// Rota para criar pagamento
router.post('/payment', createPayment);

// Rota para atualizar pagamento
router.put('/payment/:id', updatePayment);

// Rota para deletar pagamento
router.delete('/payment/:id', deletePayment);

// Rota para alternar status do pagamento
router.put('/payment/:id/toggle', togglePaymentStatus);

// Rotas de Caixas
// Rota para verificar status do último caixa
router.get('/caixa/status/:estabelecimento_id', getStatusUltimoCaixa);

// Rota para buscar caixas fechadas de um estabelecimento
router.get('/caixas/fechadas/:estabelecimento_id', getCaixasFechadas);

// Rota para atualizar total_vendas do caixa
router.put('/caixa/:caixaId/total-vendas', updateTotalVendas);

// Rota para buscar detalhes de um caixa específico
router.get('/caixa/:id', getCaixaDetalhes);

// Rota para criar novo caixa (abrir caixa)
router.post('/caixa', criarCaixa);

// Rota para fechar caixa
router.put('/caixa/:id/fechar', fecharCaixa);

// Rotas para histórico
router.get('/pedidos-historico/:estabelecimento_id', getPedidosHistorico);
router.get('/pagamentos-historico/:estabelecimento_id', getPagamentosHistorico);
router.get('/movimentacoes-caixa/:estabelecimento_id', getMovimentacoesCaixa);

// Rotas para movimentações de caixa
router.post('/movimentacoes-caixa', adicionarMovimentacao);

// Rotas de Pontos de Atendimento
// Rota para criar configuração padrão de pontos de atendimento
router.post('/pontos-atendimento/padrao', criarConfiguracaoPadrao);

// Rota para buscar configuração de pontos de atendimento
router.get('/pontos-atendimento/:estabelecimento_id', buscarConfiguracao);

// Rota para atualizar configuração de pontos de atendimento
router.put('/pontos-atendimento/:estabelecimento_id', atualizarConfiguracao);

export default router;
