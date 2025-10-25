import React from 'react';
import { Image as ImageIcon, X } from 'lucide-react';

const ImageInput = ({ 
  id, 
  value, 
  onChange, 
  onRemove, 
  label = "Imagem", 
  placeholder = "Clique para selecionar",
  accept = "image/*",
  maxSize = "2MB"
}) => {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onChange(file);
    }
  };

  const removeImage = () => {
    onRemove();
    // Limpar o input file
    const fileInput = document.getElementById(id);
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="file"
          accept={accept}
          onChange={handleImageChange}
          className="hidden"
          id={id}
        />
        
        {value ? (
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={URL.createObjectURL(value)}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border border-gray-300 shadow-sm"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-md"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <label
            htmlFor={id}
            className="w-full h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
          >
            <div className="flex items-center space-x-3">
              <ImageIcon className="text-gray-400" size={20} />
              <span className="text-sm text-gray-600 font-medium">{placeholder}</span>
              <span className="text-xs text-gray-500">PNG, JPG, JPEG até {maxSize}</span>
            </div>
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageInput;
