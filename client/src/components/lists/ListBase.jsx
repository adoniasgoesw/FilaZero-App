import React, { useState, useEffect } from 'react';

const ListBase = ({ 
  columns = [], 
  data = [], 
  loading = false, 
  error = null,
  className = "",
  responsiveColumns = null, // Para colunas responsivas
  mobileColumn = null, // Coluna especial para mobile (apenas uma coluna)
  hasMarginTop = false // Para controlar mt-3
}) => {
  const [screenSize, setScreenSize] = useState('large');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) { // sm breakpoint
        setScreenSize('small');
      } else if (width < 1024) { // lg breakpoint
        setScreenSize('medium');
      } else {
        setScreenSize('large');
      }
    };

    handleResize(); // Set initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Usar coluna mobile se fornecida e for tela pequena, senão usar colunas responsivas
  const displayColumns = mobileColumn && screenSize === 'small'
    ? [mobileColumn]
    : responsiveColumns 
      ? responsiveColumns[screenSize] || responsiveColumns.large || columns
      : columns;

  // Para telas pequenas, sempre usar apenas uma coluna (mobileColumn)
  const isMobile = screenSize === 'small';
  const finalColumns = isMobile && mobileColumn ? [mobileColumn] : displayColumns;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium mb-2">Erro ao carregar dados</div>
          <div className="text-gray-500 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-500 text-lg font-medium mb-2">Nenhum item encontrado</div>
          <div className="text-gray-400 text-sm">Os dados aparecerão aqui quando estiverem disponíveis</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white overflow-hidden min-w-0 h-full flex flex-col ${className}`}>
      {/* Cabeçalho Fixo */}
      <div className={`bg-gray-100 rounded-lg mx-2 min-w-0 flex-shrink-0 ${hasMarginTop ? 'mt-3' : ''}`}>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full table-fixed min-w-0">
            <thead>
              <tr>
                {finalColumns.map((column, index) => (
                  <th
                    key={index}
                    className={`
                      px-3 sm:px-6 py-4 text-left text-sm font-semibold text-gray-600
                      ${column.align === 'center' ? 'text-center' : ''}
                      ${column.align === 'right' ? 'text-right' : ''}
                      ${isMobile ? 'w-full' : ''}
                      ${!isMobile && column.width === '40' ? 'w-2/5' : ''}
                      ${!isMobile && column.width === '20' ? 'w-1/5' : ''}
                      ${!isMobile && column.width === '15' ? 'w-1/6' : ''}
                      ${!isMobile && column.width === '10' ? 'w-1/12' : ''}
                      ${!isMobile && column.responsiveClass ? column.responsiveClass : ''}
                    `}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>
      </div>
      
      {/* Corpo da tabela com scroll */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide min-w-0">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full table-fixed min-w-0">
            <tbody className="bg-white">
              {data.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className="hover:bg-gray-50 transition-all duration-200 group border-b border-gray-100"
                >
                  {finalColumns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`
                        px-3 sm:px-6 py-4 text-sm text-gray-900
                        ${column.align === 'center' ? 'text-center' : ''}
                        ${column.align === 'right' ? 'text-right' : ''}
                        ${isMobile ? 'w-full' : ''}
                        ${!isMobile && column.width === '40' ? 'w-2/5' : ''}
                        ${!isMobile && column.width === '20' ? 'w-1/5' : ''}
                        ${!isMobile && column.width === '15' ? 'w-1/6' : ''}
                        ${!isMobile && column.width === '10' ? 'w-1/12' : ''}
                        ${!isMobile && column.responsiveClass ? column.responsiveClass : ''}
                      `}
                    >
                      {column.render ? column.render(row, rowIndex) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListBase;
