import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Tag, Image as ImageIcon, X } from 'lucide-react';
import { API_URL } from '../../services/api.js';

const FormCategory = forwardRef(({ onSuccess, onClose, editData = null }, ref) => {
  const [formData, setFormData] = useState({
    name: editData?.nome || '',
    image: null,
    imageUrl: editData?.imagem_url || null
  });
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const isEditing = !!editData;

  // Expor função de submit para o modal base
  useImperativeHandle(ref, () => ({
    submit: handleSubmit
  }));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Fazer upload da imagem para Cloudinary
      await uploadImage(file);
    }
  };

  const uploadImage = async (file) => {
    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_URL}/upload/image`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          imageUrl: result.data.imageUrl
        }));
      } else {
        setError(result.message || 'Erro ao fazer upload da imagem');
      }
    } catch (err) {
      console.error('Erro no upload:', err);
      setError('Erro ao fazer upload da imagem');
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
    // Limpar o input file
    const fileInput = document.getElementById('category-image');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    try {
      if (isEditing) {
        // Modo edição - PUT
        const categoryData = {
          nome: formData.name,
          imagem_url: formData.imageUrl
        };

        const response = await fetch(`${API_URL}/category/${editData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(categoryData)
        });

        const result = await response.json();

        if (result.success) {
          console.log('Categoria editada com sucesso:', result.data);
          
          // Fechar modal imediatamente
          if (onClose) {
            onClose();
          }
          
          // Callback de sucesso (para atualizar lista, etc.)
          if (onSuccess) {
            onSuccess(result.data.categoria);
          }
        } else {
          setError(result.message || 'Erro ao editar categoria');
        }
      } else {
        // Modo criação - POST
        const estabelecimento_id = 7; // DevClub - TODO: Pegar do contexto de auth

        const categoryData = {
          estabelecimento_id,
          nome: formData.name,
          imagem_url: formData.imageUrl
        };

        const response = await fetch(`${API_URL}/category`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(categoryData)
        });

        const result = await response.json();

        if (result.success) {
          console.log('Categoria criada com sucesso:', result.data);
          
          // Fechar modal imediatamente
          if (onClose) {
            onClose();
          }
          
          // Callback de sucesso (para atualizar lista, etc.)
          if (onSuccess) {
            onSuccess(result.data.categoria);
          }
          
          // Resetar formulário
          setFormData({
            name: '',
            image: null,
            imageUrl: null
          });
        } else {
          setError(result.message || 'Erro ao criar categoria');
        }
      }
    } catch (err) {
      console.error('Erro ao processar categoria:', err);
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

      {/* Nome da Categoria */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Nome da Categoria <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Digite o nome da categoria"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>
      </div>


      {/* Imagem da Categoria */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Imagem da Categoria
        </label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="category-image"
            disabled={uploading}
          />
          
          {formData.image || formData.imageUrl ? (
            <div className="flex justify-start">
              <div className="relative">
                <img
                  src={formData.imageUrl || URL.createObjectURL(formData.image)}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-xl border border-gray-300 shadow-sm"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
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
              htmlFor="category-image"
              className={`w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 shadow-sm p-8 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
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

    </form>
  );
});

FormCategory.displayName = 'FormCategory';

export default FormCategory;
