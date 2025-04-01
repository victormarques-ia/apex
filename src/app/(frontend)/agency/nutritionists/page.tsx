'use client'

import { useState, useEffect, useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getNutritionistList } from './actions/agency.action'
import { Search, Filter, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

export default function PacientListPage() {
  // State variables
  const [nutritionists, setNutritionists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  // Pagination
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  // Filtering and sorting
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState(0) // 0 for name, 1 for date, 2 for specialization
  const [sortOrder, setSortOrder] = useState('asc')

  // Load data when filter params change
  useEffect(() => {
    fetchData()
  }, [page, limit, sortField, sortOrder])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchData()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

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

      const result = await getNutritionistList(formData)
    
      console.log('Resultado: ', result.data.professionals)
      if (result.data?.nutritionists && result.data.nutritionists?.length > 0) {
        setNutritionists(result.data.nutritionists)
        const total = result.data.total || result.data.nutricionists.length
        setTotalPages(Math.ceil(total / limit))
        setError("")
      } else {
        setNutritionists([])
      }
    } catch (err) {
      setError('Erro inesperado ao buscar nutricionistas')
      console.error(err)
      setNutritionists([])
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
  const formatDate = (dateString : string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Nutricionistas</h1>

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
      ) : error != "" ? (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          <p>Erro: {error}</p>
          <Button variant="outline" className="mt-2" onClick={fetchData}>
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
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      <button
                        className="flex items-center gap-1"
                        onClick={() => {
                          setSortField(1)
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                        }}
                      >
                        Data de Cadastro
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
                        Especialização
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {nutritionists?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-gray-500">
                        Nenhum paciente encontrado
                      </td>
                    </tr>
                  ) : (
                    nutritionists.map((nutri) => (
                      <tr key={nutri.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="font-medium">
                            {nutri.user?.name || 'Nome não disponível'}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{formatDate(nutri.createdAt)}</td>
                        <td className="py-4 px-4 text-gray-600">{nutri.specialization || '-'}</td>
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
