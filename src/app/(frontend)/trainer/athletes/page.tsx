'use client'

import { useState, useEffect, useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { getPacientList } from '../actions/trainer.action'
// Remove card import if it's causing errors - we'll use a div structure instead

// Status component with color-coded circle
const StatusIndicator = ({ status }) => {
  let color = 'bg-gray-400'
  
  if (status === 'Em progresso') {
    color = 'bg-blue-500'
  } else if (status === 'Concluído') {
    color = 'bg-green-500'
  } else if (status === 'Não concluído') {
    color = 'bg-yellow-500'
  } else if (status === 'Não iniciado') {
    color = 'bg-gray-500'
  } else if (status === 'Cancelado') {
    color = 'bg-red-500'
  }
  
  return (
    <div className="flex items-center">
      <div className={`h-2 w-2 rounded-full ${color} mr-2`}></div>
      <span>{status}</span>
    </div>
  )
}

export default function PacientListPage() {
  // State variables
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Pagination
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  
  // Filtering and sorting
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState(0) // 0 for name, 1 for date, 2 for goal
  const [sortOrder, setSortOrder] = useState('asc')
  const [goal, setGoal] = useState('')
  
  // Load data when filter params change
  useEffect(() => {
    fetchData()
  }, [page, limit, sortField, sortOrder, goal])
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchData()
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchQuery])
  
  // Setup form state
  const [state, formAction] = useActionState(getPacientList, {
    success: false,
    data: null,
    error: null,
    message: '',
  })
  
  // Fetch data from API
  const fetchData = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('page', page.toString())
      formData.append('limit', limit.toString())
      
      if (searchQuery) {
        formData.append('name', searchQuery)
      }
      
      if (sortField !== undefined) {
        formData.append('sortField', sortField.toString())
      }
      
      if (sortOrder) {
        formData.append('sortOrder', sortOrder)
      }
      
      if (goal) {
        formData.append('goal', goal)
      }
      
      const result = await getPacientList(state, formData)
      console.log(result);
      
      if (result.data?.athletes) {
        setPatients(result.data.athletes)
        const total = result.data.total || result.data.athletes.length
        setTotalPages(Math.ceil(total / limit))
        setError(null)
      } else {
        setError(result.data.message || 'Erro ao carregar pacientes')
        setPatients([])
      }
    } catch (err) {
      setError('Erro inesperado ao buscar pacientes')
      console.error(err)
      setPatients([])
    } finally {
      setLoading(false)
    }
  }
  
  // Pagination handlers
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1)
  }
  
  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1)
  }
  
  // Format date as DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('')
    setSortField(0)
    setSortOrder('asc')
    setGoal('')
    setPage(1)
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pacientes</h1>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => {
            // Implement filter dialog or toggle filter visibility
            fetchData()
          }}
        >
          <Filter className="h-4 w-4" />
          <span>Filter</span>
        </Button>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Input
            type="text"
            placeholder="Buscar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      {/* Patient List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          <p>Erro: {error}</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={fetchData}
          >
            Tentar novamente
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow">
          <div className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      <button 
                        className="flex items-center gap-1"
                        onClick={() => {
                          setSortField(0)
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                        }}
                      >
                        Nome
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      <button 
                        className="flex items-center gap-1"
                        onClick={() => {
                          setSortField(1)
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                        }}
                      >
                        Última Consulta
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      <button 
                        className="flex items-center gap-1"
                        onClick={() => {
                          setSortField(2)
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                        }}
                      >
                        Meta
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-gray-500">
                        Nenhum paciente encontrado
                      </td>
                    </tr>
                  ) : (
                    patients.map((patient) => (
                      <tr key={patient.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="font-medium">{patient.user?.name || 'Nome não disponível'}</div>
                        </td>
                        <td className="py-4 px-4">
                          <StatusIndicator status={patient.status || 'Não iniciado'} />
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {formatDate(patient.updatedAt)}
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {patient.goal || '-'}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-5 w-5 text-gray-400" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <div className="text-sm text-gray-500">
                Pacientes por página
                <select 
                  className="ml-2 border rounded px-2 py-1"
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value))
                    setPage(1)
                  }}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Página {page} de {totalPages}
                </span>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={page === 1}
                  onClick={handlePrevPage}
                  className="p-0 w-8 h-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={handleNextPage}
                  className="p-0 w-8 h-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}