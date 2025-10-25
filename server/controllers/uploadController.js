import multer from 'multer';
import { uploadSingle, uploadToCloudinary } from '../middlewares/uploadMiddleware.js';

export const uploadImage = async (req, res) => {
  try {
    // Verificar se há arquivo
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado'
      });
    }

    // Fazer upload para Cloudinary
    const uploadResult = await uploadToCloudinary(req.file, 'filazero/categorias');

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao fazer upload da imagem',
        error: uploadResult.error
      });
    }

    // Retornar URL da imagem
    res.status(200).json({
      success: true,
      message: 'Imagem enviada com sucesso!',
      data: {
        imageUrl: uploadResult.url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height
      }
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const uploadProductImage = async (req, res) => {
  try {
    // Verificar se há arquivo
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado'
      });
    }

    // Fazer upload para Cloudinary na pasta de produtos
    const uploadResult = await uploadToCloudinary(req.file, 'filazero/produtos');

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao fazer upload da imagem',
        error: uploadResult.error
      });
    }

    // Retornar URL da imagem
    res.status(200).json({
      success: true,
      message: 'Imagem enviada com sucesso!',
      data: {
        secure_url: uploadResult.url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height
      }
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Middleware para tratar erros do multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. Tamanho máximo: 5MB'
      });
    }
  }
  
  if (error.message === 'Apenas arquivos de imagem são permitidos!') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};
