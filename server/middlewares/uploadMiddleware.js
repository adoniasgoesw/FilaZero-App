import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import config from '../config/environments.js';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

// Configurar multer para armazenamento em memória
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limite
  },
  fileFilter: (req, file, cb) => {
    // Verificar se é uma imagem
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
    }
  },
});

// Middleware para upload de imagem única
export const uploadSingle = upload.single('image');

// Middleware para upload de múltiplas imagens
export const uploadMultiple = upload.array('images', 5);

// Função para fazer upload para Cloudinary
export const uploadToCloudinary = async (file, folder = 'filazero') => {
  try {
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      {
        folder: folder,
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
      }
    );
    
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Erro ao fazer upload para Cloudinary:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Função para deletar imagem do Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: true,
      result: result,
    };
  } catch (error) {
    console.error('Erro ao deletar do Cloudinary:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default upload;





