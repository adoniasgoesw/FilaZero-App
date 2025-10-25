import React, { useState, useEffect } from 'react';
import { testApiConnection, testDbConnection, API_URL } from '../services/api';

const TestConnection = () => {
  const [apiStatus, setApiStatus] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const testConnections = async () => {
    setLoading(true);
    
    // Testar API
    const apiResult = await testApiConnection();
    setApiStatus(apiResult);
    
    // Testar Banco de Dados
    const dbResult = await testDbConnection();
    setDbStatus(dbResult);
    
    setLoading(false);
  };

  useEffect(() => {
    testConnections();
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Teste de Conexões
      </h2>
      
      <div className="space-y-4">
        {/* API Status */}
        <div className="p-4 rounded-xl bg-gray-50">
          <h3 className="font-semibold text-gray-800 mb-2">API Status</h3>
          <p className="text-sm text-gray-600 mb-2">URL: {API_URL}</p>
          {apiStatus ? (
            <div className={`p-3 rounded-lg ${apiStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {apiStatus.success ? (
                <div>
                  <p className="font-semibold">✅ API Conectada</p>
                  <p className="text-sm">Ambiente: {apiStatus.data?.environment}</p>
                  <p className="text-sm">Status: {apiStatus.data?.status}</p>
                </div>
              ) : (
                <div>
                  <p className="font-semibold">❌ Erro na API</p>
                  <p className="text-sm">{apiStatus.error}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Testando...</p>
          )}
        </div>

        {/* Database Status */}
        <div className="p-4 rounded-xl bg-gray-50">
          <h3 className="font-semibold text-gray-800 mb-2">Banco de Dados</h3>
          {dbStatus ? (
            <div className={`p-3 rounded-lg ${dbStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {dbStatus.success ? (
                <div>
                  <p className="font-semibold">✅ Banco Conectado</p>
                  <p className="text-sm">Hora do DB: {new Date(dbStatus.data?.db_time?.now).toLocaleString()}</p>
                  <p className="text-sm">Ambiente: {dbStatus.data?.environment}</p>
                </div>
              ) : (
                <div>
                  <p className="font-semibold">❌ Erro no Banco</p>
                  <p className="text-sm">{dbStatus.error}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Testando...</p>
          )}
        </div>

        {/* Botão de Teste */}
        <div className="text-center">
          <button
            onClick={testConnections}
            disabled={loading}
            className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-300"
          >
            {loading ? 'Testando...' : 'Testar Novamente'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestConnection;

