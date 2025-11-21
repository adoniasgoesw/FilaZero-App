import React, { useState, forwardRef, useImperativeHandle, useEffect, useRef } from 'react';
import { Package, DollarSign, Clock, Box, Image as ImageIcon, X, ChevronDown } from 'lucide-react';
import { API_URL } from '../../services/api.js';

const FormProduct = forwardRef(({ onSuccess, onClose, editData = null, activeTab = 'detalhes' }, ref) => {
  const [formData, setFormData] = useState({
    nome: editData?.nome || '',
    categoria_id: editData?.categoria_id || '',
    valor_venda: editData?.valor_venda || '',
    valor_custo: editData?.valor_custo || '',
    estoque_qtd: editData?.estoque_qtd || '',
    tempo_preparo_min: editData?.tempo_preparo_min || '',
    image: null,
    imageUrl: editData?.imagem_url || null
  });
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const isEditing = !!editData;

  // Componente Action personalizado para seleção de categorias
  const CategoryAction = ({ currentCategoryId, onCategoryChange, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Fechar dropdown quando clicar fora
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleCategorySelect = (categoryId) => {
      onCategoryChange(categoryId);
      setIsOpen(false);
    };

    const selectedCategory = categorias.find(cat => cat.id === currentCategoryId);

    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        {/* Botão Principal */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={loadingCategorias}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
            {loadingCategorias ? 'Carregando categorias...' : (selectedCategory ? selectedCategory.nome : 'Selecione uma categoria')}
          </span>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {isOpen && !loadingCategorias && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto">
            <div className="py-1">
              {categorias.map((categoria) => (
                <button
                  key={categoria.id}
                  type="button"
                  onClick={() => handleCategorySelect(categoria.id)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                >
                  {categoria.nome}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Expor função de submit para o modal base
  useImperativeHandle(ref, () => ({
    submit: handleSubmit
  }));

  // Buscar categorias para o dropdown
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoadingCategorias(true);
        setError(''); // Limpar erros anteriores
        const estabelecimentoId = 7; // TODO: Pegar do contexto de auth
        
        console.log('Buscando categorias para estabelecimento:', estabelecimentoId);
        console.log('URL da API:', `${API_URL}/product/categories/${estabelecimentoId}`);
        
        const response = await fetch(`${API_URL}/product/categories/${estabelecimentoId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Resposta da API de categorias:', data);
        
        if (data.success) {
          setCategorias(data.data.categorias);
        } else {
          setError('Erro ao carregar categorias: ' + (data.message || 'Erro desconhecido'));
        }
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
        setError('Erro de conexão ao carregar categorias: ' + err.message);
      } finally {
        setLoadingCategorias(false);
      }
    };

    fetchCategorias();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categoria_id: categoryId
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
        imageUrl: null
      }));
      
      // Upload da imagem ANTES de continuar
      await uploadImage(file);
    }
  };

  const uploadImage = async (file) => {
    try {
      setUploading(true);
      setError('');

      console.log('Iniciando upload da imagem:', file.name);

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_URL}/upload/product-image`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      console.log('Resposta do upload:', result);

      if (result.success) {
        console.log('Upload bem-sucedido, URL:', result.data.secure_url);
        const imageUrl = result.data.secure_url;
        
        setFormData(prev => ({
          ...prev,
          imageUrl: imageUrl
        }));
        
        return imageUrl; // Retornar a URL para uso imediato
      } else {
        console.error('Erro no upload:', result.message);
        setError(result.message || 'Erro ao fazer upload da imagem');
        return null;
      }
    } catch (err) {
      console.error('Erro no upload:', err);
      setError('Erro de conexão no upload');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null,
      imageUrl: null
    }));
    
    // Limpar input de arquivo
    const fileInput = document.getElementById('product-image');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    // Validações
    if (!formData.nome.trim()) {
      setError('Nome do produto é obrigatório');
      return;
    }

    if (!formData.categoria_id) {
      setError('Selecione uma categoria');
      return;
    }

    if (!formData.valor_venda || parseFloat(formData.valor_venda) <= 0) {
      setError('Valor de venda deve ser maior que zero');
      return;
    }

    // Se há uma imagem mas ainda não foi feito upload, fazer upload primeiro
    let finalImageUrl = formData.imageUrl;
    if (formData.image && !formData.imageUrl) {
      console.log('Fazendo upload da imagem antes de salvar...');
      finalImageUrl = await uploadImage(formData.image);
      
      if (!finalImageUrl) {
        setError('Erro ao fazer upload da imagem');
        return;
      }
    }

    try {
      if (isEditing) {
        // Modo edição - PUT
        const productData = {
          categoria_id: parseInt(formData.categoria_id),
          nome: formData.nome.trim(),
          valor_venda: parseFloat(formData.valor_venda),
          valor_custo: formData.valor_custo ? parseFloat(formData.valor_custo) : null,
          estoque_qtd: formData.estoque_qtd ? parseInt(formData.estoque_qtd) : 0,
          tempo_preparo_min: formData.tempo_preparo_min ? parseInt(formData.tempo_preparo_min) : null,
          imagem_url: finalImageUrl
        };

        const response = await fetch(`${API_URL}/product/${editData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData)
        });

        const result = await response.json();

        if (result.success) {
          console.log('Produto editado com sucesso:', result.data);
          
          if (onClose) {
            onClose();
          }
          
          if (onSuccess) {
            onSuccess(result.data.produto);
          }
        } else {
          setError(result.message || 'Erro ao editar produto');
        }
      } else {
        // Modo criação - POST
        const estabelecimento_id = 7; // TODO: Pegar do contexto de auth

        const productData = {
          estabelecimento_id,
          categoria_id: parseInt(formData.categoria_id),
          nome: formData.nome.trim(),
          valor_venda: parseFloat(formData.valor_venda),
          valor_custo: formData.valor_custo ? parseFloat(formData.valor_custo) : null,
          estoque_qtd: formData.estoque_qtd ? parseInt(formData.estoque_qtd) : 0,
          tempo_preparo_min: formData.tempo_preparo_min ? parseInt(formData.tempo_preparo_min) : null,
          imagem_url: finalImageUrl
        };

        console.log('Dados do produto a serem enviados:', productData);
        console.log('URL da imagem:', finalImageUrl);

        const response = await fetch(`${API_URL}/product`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData)
        });

        // Verificar se a resposta é válida antes de fazer parse
        if (!response.ok) {
          let errorMessage = 'Erro ao criar produto';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
            // Se houver detalhes do erro em desenvolvimento, incluir
            if (errorData.error && process.env.NODE_ENV === 'development') {
              errorMessage += `: ${errorData.error}`;
            }
          } catch (parseError) {
            // Se não conseguir parsear JSON, usar mensagem baseada no status code
            if (response.status === 400) {
              errorMessage = 'Dados inválidos. Verifique os campos preenchidos.';
            } else if (response.status === 500) {
              errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
            } else if (response.status === 404) {
              errorMessage = 'Categoria não encontrada.';
            }
          }
          setError(errorMessage);
          return;
        }

        const result = await response.json();

        if (result.success) {
          console.log('Produto criado com sucesso:', result.data);
          
          if (onClose) {
            onClose();
          }
          
          if (onSuccess) {
            onSuccess(result.data.produto);
          }
          
          // Resetar formulário
          setFormData({
            nome: '',
            categoria_id: '',
            valor_venda: '',
            valor_custo: '',
            estoque_qtd: '',
            tempo_preparo_min: '',
            image: null,
            imageUrl: null
          });
        } else {
          setError(result.message || 'Erro ao criar produto');
        }
      }
    } catch (err) {
      console.error('Erro ao processar produto:', err);
      setError('Erro de conexão. Tente novamente.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Conteúdo das abas */}
      {activeTab === 'detalhes' && (
        <div className="space-y-6">
          {/* Nome do Produto */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Nome do Produto <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
            placeholder="Digite o nome do produto"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>
      </div>

      {/* Categoria */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Categoria <span className="text-red-500">*</span>
        </label>
        <CategoryAction
          currentCategoryId={formData.categoria_id}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {/* Imagem do Produto */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Imagem do Produto
        </label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="product-image"
            disabled={uploading}
          />
          
          {formData.image || formData.imageUrl ? (
            <div className="flex justify-start">
              <div className="relative">
                <img
                  src={formData.imageUrl || URL.createObjectURL(formData.image)}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300 shadow-sm"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={removeImage}
                  disabled={uploading}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-md disabled:opacity-50"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            <label
              htmlFor="product-image"
              className={`w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 shadow-sm p-8 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center space-y-2">
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="text-sm text-gray-600 font-medium">Fazendo upload...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="text-gray-400" size={24} />
                    <span className="text-sm text-gray-600 font-medium">Clique para selecionar uma imagem</span>
                    <span className="text-xs text-gray-500">(PNG, JPG, JPEG)</span>
                  </>
                )}
              </div>
            </label>
          )}
        </div>
      </div>

      {/* Valores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Valor de Venda */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Valor de Venda (R$) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="number"
              name="valor_venda"
              value={formData.valor_venda}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              placeholder="0,00"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>
        </div>

        {/* Valor de Custo */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Valor de Custo (R$)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="number"
              name="valor_custo"
              value={formData.valor_custo}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              placeholder="0,00"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Tempo de Preparo e Estoque */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tempo de Preparo */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tempo de Preparo (min)
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="number"
              name="tempo_preparo_min"
              value={formData.tempo_preparo_min}
              onChange={handleInputChange}
              min="0"
              placeholder="0"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Estoque */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Quantidade em Estoque
          </label>
          <div className="relative">
            <Box className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="number"
              name="estoque_qtd"
              value={formData.estoque_qtd}
              onChange={handleInputChange}
              min="0"
              placeholder="0"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
      </div>
        </div>
      )}

      {/* Aba Complementos */}
      {activeTab === 'complementos' && (
        <div className="space-y-6">
          <div className="text-center py-8">
            <Box className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Complementos</h3>
            <p className="text-gray-500">Funcionalidade em desenvolvimento</p>
          </div>
        </div>
      )}

      {/* Aba Receita */}
      {activeTab === 'receita' && (
        <div className="space-y-6">
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Receita</h3>
            <p className="text-gray-500">Funcionalidade em desenvolvimento</p>
          </div>
        </div>
      )}
    </form>
  );
});

export default FormProduct;