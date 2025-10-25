// Serviço para gerenciar status de pontos de atendimento
import { API_URL } from './api';

// Status padrão com cores e ícones
export const STATUS_PONTOS_ATENDIMENTO = {
  disponivel: {
    nome: 'disponivel',
    texto: 'Disponível',
    cor: 'gray',
    corClasses: 'bg-gray-100 text-gray-600',
    icone: 'CheckCircle',
    descricao: 'Ponto disponível para atendimento'
  },
  aberto: {
    nome: 'aberto',
    texto: 'Aberto',
    cor: 'blue',
    corClasses: 'bg-blue-100 text-blue-800',
    icone: 'Unlock',
    descricao: 'Ponto aberto e pronto para uso'
  },
  ocupado: {
    nome: 'ocupado',
    texto: 'Ocupado',
    cor: 'green',
    corClasses: 'bg-green-100 text-green-800',
    icone: 'Users',
    descricao: 'Ponto ocupado por cliente'
  },
  em_atendimento: {
    nome: 'em_atendimento',
    texto: 'Em Atendimento',
    cor: 'purple',
    corClasses: 'bg-purple-100 text-purple-800',
    icone: 'Lock',
    descricao: 'Ponto em atendimento ativo'
  }
};

// Função para buscar status do banco de dados
export const buscarStatusPontosAtendimento = async (estabelecimentoId) => {
  try {
    const response = await fetch(`${API_URL}/status-pontos-atendimento/${estabelecimentoId}`);
    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        data: data.data
      };
    } else {
      return {
        success: false,
        message: data.message || 'Erro ao buscar status'
      };
    }
  } catch (error) {
    console.error('Erro ao buscar status:', error);
    return {
      success: false,
      message: 'Erro de conexão com o servidor'
    };
  }
};

// Função para obter informações de um status específico
export const getStatusInfo = (statusNome) => {
  return STATUS_PONTOS_ATENDIMENTO[statusNome] || STATUS_PONTOS_ATENDIMENTO.disponivel;
};

// Função para obter todos os status ativos
export const getStatusAtivos = () => {
  return Object.values(STATUS_PONTOS_ATENDIMENTO);
};






