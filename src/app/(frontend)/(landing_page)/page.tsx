import Head from 'next/head'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>Apex - Aprimore o desempenho da sua equipe</title>
        <meta name="description" content="Soluções exclusivas para sua assessoria esportiva" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="bg-white py-3 px-4 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gray-200 rounded-full h-6 w-6 flex items-center justify-center text-xs">
              LOGO
            </div>
          </div>
          <nav className="hidden md:flex space-x-6 text-sm">
            <a href="#" className="text-gray-700 hover:text-blue-600">
              Home
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600">
              Descubra
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600">
              Planos
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600">
              Sobre nós
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600">
              Contato
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-64 md:h-96">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-400 opacity-80"></div>
          <div className="absolute inset-0">
            <Image
              src="/api/placeholder/1200/600"
              alt="Atleta correndo"
              layout="fill"
              objectFit="cover"
              className="mix-blend-overlay"
            />
          </div>
          <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
            <h1 className="text-2xl md:text-4xl font-bold text-blue-800 max-w-md">
              Aprimore o desempenho da sua equipe com a Apex.
            </h1>
            <p className="text-blue-900 mt-4 max-w-lg text-sm md:text-base">
              Descubra o poder da nossa ferramenta de treinamento em uma solução integrada. Eleve o
              potencial do seu time com insights personalizados para o máximo desempenho.
            </p>
            <div className="mt-6">
              <Link href="auth/sign-in">
                <Button className="bg-blue-700 hover:bg-blue-800 text-white">Comece Agora</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Logo and Introduction */}
        <section className="py-16 container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="w-40 h-40">
              <Image src="/api/placeholder/160/160" alt="Logo Apex" width={160} height={160} />
            </div>
            <div className="md:max-w-md">
              <h2 className="text-2xl md:text-3xl font-bold text-blue-700 mb-4">
                O futuro da performance esportiva
              </h2>
              <p className="text-gray-700">
                A Apex é uma plataforma completa para monitoramento e análise de desempenho
                esportivo. Combinamos tecnologia avançada, metodologias comprovadas e personalização
                para oferecer a performance que seu atleta merece.
              </p>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-xl text-blue-700 font-medium mb-8">
              Soluções exclusivas para sua assessoria
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="h-48 bg-gray-300 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="p-4">
                  <h3 className="text-blue-600 font-medium mb-2">Monitoramento Inteligente</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Acompanhe a evolução de seus atletas com métricas avançadas e insights
                    personalizados.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="h-48 bg-gray-300 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="p-4">
                  <h3 className="text-blue-600 font-medium mb-2">Programação de Treinos e Metas</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Planejamento completo e personalizado para atingir os melhores resultados de
                    forma sustentável.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="h-48 bg-gray-300 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="p-4">
                  <h3 className="text-blue-600 font-medium mb-2">Feedback em Tempo Real</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Avaliações imediatas permitem ajustes rápidos e melhoria contínua da
                    performance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Service Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-gray-700 mb-2">Main Service</h3>
            <h2 className="text-xl font-semibold mb-8">Choose your favorite favor</h2>

            <div className="flex flex-wrap justify-center gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="text-center">
                  <div className="w-16 h-16 border border-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg
                      className="w-8 h-8 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <p className="text-xs">Cupcake</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-blue-700 text-xl font-medium mb-8">
              Transforme sua assessoria com a Apex
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {/* Feature 1 */}
              <div className="text-center">
                <div className="mb-4">
                  <Image
                    src="/api/placeholder/50/50"
                    alt="Dashboard"
                    width={50}
                    height={50}
                    className="mx-auto"
                  />
                </div>
                <h3 className="text-green-600 font-medium mb-2">Dashboard Personalizado</h3>
                <p className="text-xs text-gray-500 mb-1">
                  Acesso a dados de performance em tempo real para tomada de decisões
                </p>
                <a href="#" className="text-xs text-blue-500">
                  Saiba mais
                </a>
              </div>

              {/* Feature 2 */}
              <div className="text-center">
                <div className="mb-4">
                  <Image
                    src="/api/placeholder/50/50"
                    alt="Análise"
                    width={50}
                    height={50}
                    className="mx-auto"
                  />
                </div>
                <h3 className="text-green-600 font-medium mb-2">Análise Biomecânica</h3>
                <p className="text-xs text-gray-500 mb-1">
                  Avaliações detalhadas para otimizar a técnica e prevenir lesões
                </p>
                <a href="#" className="text-xs text-blue-500">
                  Saiba mais
                </a>
              </div>

              {/* Feature 3 */}
              <div className="text-center">
                <div className="mb-4">
                  <Image
                    src="/api/placeholder/50/50"
                    alt="Integração"
                    width={50}
                    height={50}
                    className="mx-auto"
                  />
                </div>
                <h3 className="text-green-600 font-medium mb-2">Integração com Wearables</h3>
                <p className="text-xs text-gray-500 mb-1">
                  Compatível com os principais dispositivos do mercado
                </p>
                <a href="#" className="text-xs text-blue-500">
                  Saiba mais
                </a>
              </div>

              {/* Feature 4 */}
              <div className="text-center">
                <div className="mb-4">
                  <Image
                    src="/api/placeholder/50/50"
                    alt="Gestão"
                    width={50}
                    height={50}
                    className="mx-auto"
                  />
                </div>
                <h3 className="text-green-600 font-medium mb-2">Gestão Completa de Atletas</h3>
                <p className="text-xs text-gray-500 mb-1">
                  Cadastro, histórico e acompanhamento de planos de treino
                </p>
                <a href="#" className="text-xs text-blue-500">
                  Saiba mais
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Video Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-gray-500 mb-2">Métodos</h2>
            <h3 className="text-center text-blue-700 text-xl font-medium mb-8">
              Por que Escolher a Apex?
            </h3>

            <div className="max-w-3xl mx-auto bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
              <button className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-green-500 mb-2">Resultados que fazem a diferença!</h2>
            <h3 className="text-center text-blue-700 text-xl font-medium mb-8">
              O que Nossos Clientes Dizem?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Testimonial 1 */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-gray-700 mb-4 text-sm">
                  &quot;A Apex revolucionou a forma como gerenciamos nossos atletas. Agora, cada
                  treino é otimizado com dados reais.&quot;
                </p>
                <div className="flex items-center">
                  <div className="mr-4">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Carlos Mendes</h4>
                    <p className="text-xs text-gray-500">Preparador Físico - TeamRun</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-gray-700 mb-4 text-sm">
                  &quot;A integração entre todos os dados na Apex deixou o treinamento muito mais
                  eficiente. O feedback instantâneo é um diferencial!&quot;
                </p>
                <div className="flex items-center">
                  <div className="mr-4">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Ana Oliveira</h4>
                    <p className="text-xs text-gray-500">Treinadora Esportiva</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-gray-700 mb-4 text-sm">
                  &quot;Com a Apex, controlamos tudo em um só lugar. Além, claro, dos ótimos
                  resultados conseguidos pelos nossos atletas com melhor planejamento.&quot;
                </p>
                <div className="flex items-center">
                  <div className="mr-4">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Felipe Souza</h4>
                    <p className="text-xs text-gray-500">Fundador Elite Runners</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 max-w-lg text-center">
            <h2 className="text-center text-green-500 mb-2">Mantenha-se Atualizado</h2>
            <h3 className="text-center text-blue-700 text-xl font-medium mb-4">Nossa Newsletter</h3>
            <p className="text-gray-600 mb-6">
              Receba novidades, dicas e conteúdos exclusivos direto no seu email.
            </p>

            <div className="flex gap-2">
              <Input type="email" placeholder="Seu Email" className="flex-grow" />
              <Button className="bg-blue-700 hover:bg-blue-800 text-white">Assinar</Button>
            </div>
          </div>
        </section>

        {/* Partners/Gallery Section */}
        <section className="py-12 bg-gray-200">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-white p-4 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-medium mb-4">Apex</h4>
              <p className="text-sm text-gray-600 mb-2">Tecnologia para performance</p>
              <p className="text-sm text-gray-600 mb-4">contato@apexsports.com</p>
              <p className="text-sm text-gray-600">+55 (11) 99999-9999</p>
            </div>

            <div>
              <h4 className="font-medium mb-4">Menu</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>Planos de Treinamento</li>
                <li>Gestão de Treinos</li>
                <li>Plataforma Tecnológica</li>
                <li>Depoimentos de Usuários</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>Termos de Serviço</li>
                <li>Política de Privacidade</li>
                <li>Procedimentos & Segurança</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Social</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-600 hover:text-blue-600">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-blue-400">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124-4.09-.193-7.715-2.157-10.141-5.126-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 14-7.503 14-14 0-.21-.005-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-pink-600">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-red-600">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="text-center pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">© 2025 Apex. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
