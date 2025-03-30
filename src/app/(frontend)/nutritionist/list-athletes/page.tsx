'use client'

import { useState, useEffect } from 'react'
import { getPacientList } from '../actions/nutritionist.action'
import { useFormState } from 'react-dom'

export default function PacientListPage() {
  const [state, formAction] = useFormState(getPacientList, {
    success: false,
    data: null,
    error: null,
    message: '',
  })

  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const formData = new FormData()
        formData.append('page', page.toString())
        formData.append('limit', limit.toString())

        const result = await getPacientList(null, formData)

        console.log('Resultado:',result);

        if (result.data) {
          setPatients(result.data.athletes || [])
          setError(null)
        } else {
          setError(result.message || 'Erro ao carregar pacientes')
        }
      } catch (err) {
        setError('Erro inesperado ao buscar pacientes')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [page, limit])

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1)
  }

  const handleNextPage = () => {
    setPage(page + 1)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Carregando pacientes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        <p>Erro: {error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Lista de Pacientes</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Consulta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{patient.user?.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{patient.user?.email || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{patient.lastConsultation || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${patient.status === 'Concluído' ? 'bg-green-100 text-green-800' :
                      patient.status === 'Em progresso' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {patient.status || 'Não iniciado'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between items-center">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md 
                ${page === 1 ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
            >
              Anterior
            </button>
            <span className="text-sm text-gray-700">
              Página <span className="font-medium">{page}</span>
            </span>
            <button
              onClick={handleNextPage}
              disabled={patients.length < limit}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md 
                ${patients.length < limit ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}