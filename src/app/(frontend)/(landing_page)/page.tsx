import Head from 'next/head'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { SolutionCard } from './components/solution-card'
import { FeatureItem } from './components/feature-item'
import { TestimonialCard } from './components/testimonial-card'

export default function LandingPage() {
  const solutions = [
    {
      iconSrc: '/assets/icons/shoe.svg',
      title: 'Monitoramento Inteligente',
      description:
        'Acompanhe a evolução de seus atletas com métricas avançadas e insights personalizados.',
      iconAlt: 'Sapato',
    },
    {
      iconSrc: '/assets/icons/dumbbell.svg',
      title: 'Programação de Treinos e Metas',
      description:
        'Planejamento completo e personalizado para atingir os melhores resultados de forma sustentável.',
      iconAlt: 'Halter',
    },
    {
      iconSrc: '/assets/icons/apple.svg',
      title: 'Feedback em Tempo Real',
      description:
        'Avaliações imediatas permitem ajustes rápidos e melhoria contínua da performance.',
      iconAlt: 'Maça',
    },
  ]

  const features = [
    {
      iconSrc: '/assets/icons/shoe.svg',
      title: 'Dashboard Personalizado',
      description: 'Acesso a dados de performance em tempo real para tomada de decisões',
      iconAlt: 'Sapato',
    },
    {
      iconSrc: '/assets/icons/dumbbell.svg',
      title: 'Análise Biomecânica',
      description: 'Avaliações detalhadas para otimizar a técnica e prevenir lesões',
      iconAlt: 'Halter',
    },
    {
      iconSrc: '/assets/icons/apple.svg',
      title: 'Integração com Wearables',
      description: 'Compatível com os principais dispositivos do mercado',
      iconAlt: 'Maça',
      iconWidth: 44,
      iconHeight: 50,
    },
    {
      iconSrc: '/assets/icons/bottle.svg',
      title: 'Gestão Completa de Atletas',
      description: 'Cadastro, histórico e acompanhamento de planos de treino',
      iconAlt: 'Garrafa',
      iconWidth: 32,
      iconHeight: 32,
    },
  ]

  const testimonials = [
    {
      text: 'A Apex revolucionou a forma como gerenciamos nossos atletas. Agora, cada treino é otimizado com dados reais.',
      authorName: 'Carlos Mendes',
      authorRole: 'Preparador Físico - TeamRun',
    },
    {
      text: 'A integração entre todos os dados na Apex deixou o treinamento muito mais eficiente. O feedback instantâneo é um diferencial!',
      authorName: 'Ana Oliveira',
      authorRole: 'Treinadora Esportiva',
    },
    {
      text: 'Com a Apex, controlamos tudo em um só lugar. Além, claro, dos ótimos resultados conseguidos pelos nossos atletas com melhor planejamento.',
      authorName: 'Felipe Souza',
      authorRole: 'Fundador Elite Runners',
    },
  ]

  return (
    <div className="flex flex-col min-h-screen mx-auto">
      <Head>
        <title>Apex - Aprimore o desempenho da sua equipe</title>
        <meta name="description" content="Soluções exclusivas para sua assessoria esportiva" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="bg-white py-5 shadow-sm container px-4 md:px-10">
        <div className=" flex items-center">
          <div className="flex items-center">
            <Image
              src="/assets/logo-name.svg"
              width={138}
              height={52}
              alt="logo"
              className="w-[86px] h-[32px] md:w-[138px] md:h-[52px]"
              priority
            />
          </div>
          <div className="w-[1px] min-h-10 bg-gray-300 mx-6" />
          <nav className="hidden md:flex space-x-6 text-sm font-medium">
            <a href="#" className="text-gray-700 hover:text-primary hover:underline">
              Home
            </a>
            <a href="#" className="text-gray-700 hover:text-primary hover:underline">
              Descubra
            </a>
            <a href="#" className="text-gray-700 hover:text-primary hover:underline">
              Planos
            </a>
            <a href="#" className="text-gray-700 hover:text-primary hover:underline">
              Sobre nós
            </a>
            <a href="#" className="text-gray-700 hover:text-primary hover:underline">
              Contato
            </a>
          </nav>
        </div>
        {/* <div>login</div> */}
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[320px] md:h-[500px]">
          <div className="absolute inset-0 opacity-95">
            <Image
              src="/assets/homepage/athlete-running.png"
              alt="Atleta correndo"
              layout="fill"
              objectFit="cover"
              className="mix-blend-overlay"
            />
          </div>
          <div className="relative container px-4 md:px-10 h-full flex flex-col justify-center">
            <h1 className="text-3xl md:text-6xl font-bold text-primary max-w-md">
              Aprimore o desempenho da sua equipe com a Apex.
            </h1>
            <p className="text-white mt-4 max-w-lg text-sm md:text-base">
              Centralize a gestão de atletas, treinadores e nutricionistas em uma única plataforma.
              Utilize dados em tempo real para personalizar treinos e dietas, garantindo melhores
              resultados.
            </p>
            <div className="mt-6">
              <Link href="auth/sign-in">
                <Button className="bg-primary hover:bg-primary-800 text-white">Comece Agora</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Logo and Introduction */}
        <section className="py-8 md:py-16 bg-gray-50">
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20 mx-4 md:mx-10 max-w-screen-lg">
            <Image
              src="/assets/logo.svg"
              alt="Logo Apex"
              width={381}
              height={500}
              className="h-[220px] md:h-[500px]"
            />
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-6xl font-bold text-primary mb-4 md:mb-6">
                O futuro da performance esportiva
              </h2>
              <p className="text-accent text-base">
                A Apex é uma plataforma completa para monitoramento e análise de desempenho
                esportivo. Combinamos tecnologia avançada, metodologias comprovadas e personalização
                para oferecer a performance que seu atleta merece.
              </p>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 md:px-10 max-w-screen-lg">
            <h2 className="text-center text-2xl text-primary font-medium md:text-3xl mb-8">
              Soluções exclusivas para sua assessoria
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {solutions.map((solution, index) => (
                <SolutionCard key={index} {...solution} />
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 md:px-10 max-w-screen-lg">
            <h2 className="text-center text-primary text-2xl md:text-3xl font-medium mb-8">
              Transforme sua assessoria com a Apex
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mx-auto h-full">
              {features.map((feature, index) => (
                <FeatureItem key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Video Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 md:px-10 max-w-screen-lg">
            <h2 className="text-center text-accent mb-2 text-xl md:text-2xl">Motivos</h2>
            <h3 className="text-center text-primary text-2xl md:text-3xl font-medium mb-8">
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
          <div className="container mx-auto px-4 md:px-10 max-w-screen-lg">
            <h2 className="text-center text-accent mb-2 text-xl md:text-2xl">
              Resultados que fazem a diferença!
            </h2>
            <h3 className="text-center text-primary text-2xl md:text-3xl font-medium mb-8">
              O que Nossos Clientes Dizem?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={index} {...testimonial} />
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 md:px-10 max-w-lg text-center">
            <h2 className="text-center text-accent text-xl">Mantenha-se Atualizado</h2>
            <h3 className="text-center text-primary font-medium mb-4 text-2xl">Nossa Newsletter</h3>
            <p className="text-secondary mb-6 text-sm">
              Assine nossa Newsletter e receba dicas exclusivas sobre performance esportiva!
            </p>

            <div className="flex gap-8">
              <Input type="email" placeholder="Seu Email" className="flex-grow" />
              <Button className="bg-primary hover:bg-primary-800 text-white w-32">Assinar</Button>
            </div>
          </div>
        </section>

        {/* Partners/Gallery Section */}
        <section className="py-12 bg-gray-200">
          <div className="container mx-auto px-4 md:px-10">
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

      <footer className="bg-gray-100 py-12">
        <div className="container mx-auto px-4 md:px-10">
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
                <li className="cursor-pointer hover:text-primary-600 hover:font-medium">
                  Planos e Preços
                </li>
                <li className="cursor-pointer hover:text-primary-600 hover:font-medium">
                  Descubra
                </li>
                <li className="cursor-pointer hover:text-primary-600 hover:font-medium">
                  Sobre nós
                </li>
                <li className="cursor-pointer hover:text-primary-600 hover:font-medium">
                  Depoimentos
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="cursor-pointer hover:text-primary-600 hover:font-medium">
                  Termos de Serviço
                </li>
                <li className="cursor-pointer hover:text-primary-600 hover:font-medium">
                  Política de Privacidade
                </li>
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
