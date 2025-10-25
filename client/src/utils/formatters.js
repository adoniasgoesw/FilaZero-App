// Formatação de WhatsApp
export const formatWhatsApp = (value) => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Formatação dinâmica conforme o usuário digita
  if (numbers.length === 0) {
    return '';
  } else if (numbers.length <= 2) {
    return `(${numbers}`;
  } else if (numbers.length <= 7) {
    return `(${numbers.substring(0, 2)}) ${numbers.substring(2)}`;
  } else if (numbers.length <= 11) {
    return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7)}`;
  } else {
    // Limita a 11 dígitos
    const limitedNumbers = numbers.substring(0, 11);
    return `(${limitedNumbers.substring(0, 2)}) ${limitedNumbers.substring(2, 7)}-${limitedNumbers.substring(7)}`;
  }
};

// Formatação de CNPJ
export const formatCNPJ = (value) => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 14) {
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 5) {
      return `${numbers.substring(0, 2)}.${numbers.substring(2)}`;
    } else if (numbers.length <= 8) {
      return `${numbers.substring(0, 2)}.${numbers.substring(2, 5)}.${numbers.substring(5)}`;
    } else if (numbers.length <= 12) {
      return `${numbers.substring(0, 2)}.${numbers.substring(2, 5)}.${numbers.substring(5, 8)}/${numbers.substring(8)}`;
    } else {
      return `${numbers.substring(0, 2)}.${numbers.substring(2, 5)}.${numbers.substring(5, 8)}/${numbers.substring(8, 12)}-${numbers.substring(12)}`;
    }
  }
  
  return value;
};

// Formatação de CPF
export const formatCPF = (value) => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 11) {
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.substring(0, 3)}.${numbers.substring(3)}`;
    } else if (numbers.length <= 9) {
      return `${numbers.substring(0, 3)}.${numbers.substring(3, 6)}.${numbers.substring(6)}`;
    } else {
      return `${numbers.substring(0, 3)}.${numbers.substring(3, 6)}.${numbers.substring(6, 9)}-${numbers.substring(9)}`;
    }
  }
  
  return value;
};

// Validação de e-mail
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validação de CNPJ
export const isValidCNPJ = (cnpj) => {
  const numbers = cnpj.replace(/\D/g, '');
  return numbers.length === 14;
};

// Validação de CPF
export const isValidCPF = (cpf) => {
  const numbers = cpf.replace(/\D/g, '');
  return numbers.length === 11;
};

// Validação de WhatsApp
export const isValidWhatsApp = (whatsapp) => {
  const numbers = whatsapp.replace(/\D/g, '');
  return numbers.length === 11; // DDD (2) + número (9)
};
