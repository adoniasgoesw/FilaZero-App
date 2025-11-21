// Serviço para gerenciar pontos de atendimento
import { API_URL } from './api';

class AtendimentoService {
  /**
   * Criar ou buscar um ponto de atendimento
   * Se não existir, cria um novo registro
   * Se já existir, retorna o existente
   */
  async criarOuBuscarPonto(estabelecimentoId, identificador, nomePonto = null) {
    try {
      const response = await fetch(`${API_URL}/atendimentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estabelecimento_id: estabelecimentoId,
          identificador: identificador,
          nome_ponto: nomePonto || identificador
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao criar/buscar ponto de atendimento:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Atualizar status de um ponto de atendimento
   */
  async atualizarStatus(atendimentoId, status) {
    try {
      const response = await fetch(`${API_URL}/atendimentos/${atendimentoId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      // Verificar se a resposta é válida antes de fazer parse
      if (!response.ok) {
        // Tentar parsear a mensagem de erro do servidor
        let errorMessage = 'Erro ao atualizar status';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // Se não conseguir parsear, usar mensagem padrão baseada no status code
          if (response.status === 400) {
            errorMessage = 'Status inválido ou dados incorretos';
          } else if (response.status === 404) {
            errorMessage = 'Ponto de atendimento não encontrado';
          } else if (response.status === 500) {
            errorMessage = 'Erro interno do servidor';
          }
        }
        
        console.error(`Erro ao atualizar status (${response.status}):`, errorMessage);
        return {
          success: false,
          message: errorMessage,
          statusCode: response.status
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Buscar ponto de atendimento por ID
   */
  async buscarPorId(atendimentoId) {
    try {
      const response = await fetch(`${API_URL}/atendimentos/${atendimentoId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar ponto de atendimento:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Buscar ponto de atendimento por identificador e estabelecimento
   */
  async buscarPorIdentificador(identificador, estabelecimentoId) {
    try {
      const response = await fetch(`${API_URL}/atendimentos/${identificador}/${estabelecimentoId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar ponto de atendimento:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Listar todos os pontos de atendimento de um estabelecimento
   */
  async listarPorEstabelecimento(estabelecimentoId) {
    try {
      const response = await fetch(`${API_URL}/atendimentos/estabelecimento/${estabelecimentoId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao listar pontos de atendimento:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Atualizar nome do ponto de atendimento
   */
  async atualizarNomePonto(atendimentoId, nomePonto) {
    try {
      const response = await fetch(`${API_URL}/atendimentos/${atendimentoId}/nome-ponto`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome_ponto: nomePonto })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar nome do ponto:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Deletar ponto de atendimento
   */
  async deletar(atendimentoId) {
    try {
      const response = await fetch(`${API_URL}/atendimentos/${atendimentoId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao deletar ponto de atendimento:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Buscar dados atualizados de um ponto (para atualização em tempo real)
   */
  async buscarDadosAtualizados(atendimentoId) {
    try {
      const response = await fetch(`${API_URL}/atendimentos/atualizado/${atendimentoId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar dados atualizados:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Buscar pedido por atendimento
   */
  async buscarPedidoPorAtendimento(atendimentoId) {
    try {
      const response = await fetch(`${API_URL}/pedidos/atendimento/${atendimentoId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar pedido por atendimento:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Sincronizar pontos de atendimento com a configuração
   * Cria/remove pontos automaticamente conforme a configuração
   */
  async sincronizarPontos(estabelecimentoId) {
    try {
      const response = await fetch(`${API_URL}/atendimentos/sincronizar/${estabelecimentoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao sincronizar pontos:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Limpar todos os pontos e recriar baseado na configuração
   * Remove pontos incorretos e cria apenas os corretos
   */
  async limparERecriarPontos(estabelecimentoId) {
    try {
      const response = await fetch(`${API_URL}/atendimentos/limpar-recriar/${estabelecimentoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao limpar e recriar pontos:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }
}

export default new AtendimentoService();
