# Apex

Este projeto utiliza as seguintes tecnologias:

- **[Payload CMS](https://payloadcms.com/)** – Um CMS headless poderoso e flexível.
- **[PostgreSQL](https://www.postgresql.org/)** – Banco de dados relacional robusto.
- **[Next.js](https://nextjs.org/)** – Framework React para aplicações escaláveis.
- **[Tailwind CSS](https://tailwindcss.com/)** – Utilitário-first CSS framework para estilização.

## Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em seu ambiente:

- **Node.js** (versão LTS recomendada)
- **PNPM** – Caso não possua, siga as instruções na [documentação oficial do PNPM](https://pnpm.io/installation)
- **Docker** e **Docker Compose** – Necessários para executar o container do PostgreSQL

## Passo a Passo para Executar o Projeto

1. **Instalar as dependências**

   No diretório raiz do projeto, abra o terminal e execute:

   ```bash
   pnpm install
   ```

2. **Executar o Docker Compose**

   Para iniciar o container do PostgreSQL (e demais serviços configurados no `docker-compose.yml`), execute:

   ```bash
   docker-compose up -d
   ```

   > **Observação:** Certifique-se de que o Docker e o Docker Compose estão instalados e configurados corretamente em seu sistema.

3. **Se quiser rodar fora do container**

   Com as dependências instaladas e o banco de dados em execução, inicie a aplicação localmente:

   ```bash
   pnpm run dev
   ```

   A aplicação estará disponível em `http://localhost:3000` (ou na porta configurada).

4. **Criar e rodar migrações**

   Para rodar as migrações:

   ```bash
   pnpm payload migrate
   ```

   Para criar migração:

   ```bash
   pnpm payload migrate:create --name-here
   ```

## Estrutura Core do Projeto

A estrutura do projeto é organizada com uma separação clara entre as **collections** (definições de entidades no Payload CMS) e o **front-end** (Next.js PWA que consome os serviços).

### Collections

As collections no Payload CMS representam as entidades do sistema e definem os dados armazenados no banco. No exemplo abaixo, temos a collection `Users`, que define permissões de acesso e autenticação:

```typescript
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    read: async ({ req }) => !!req.user,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({}) => false,
  },
  fields: [],
}
```

### Uso no Front-end

O front-end, desenvolvido com Next.js, consome os endpoints por meio de ações do servidor (`server actions`). O exemplo abaixo mostra o fluxo de login.

```typescript
export async function signInAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const result = await fetchFromApi<{
        token: string
      }>('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      })

      if (!result.data) {
        throw new Error(result.error?.messages[0] || 'Erro ao efetuar login')
      }

      const co = await cookies()
      co.set('payload-token', result.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      })

      return result.data
    },
    {
      onSuccess: (data) => {
        return data
      },
      onFailure: (error) => {
        return error
      },
    },
  )
}
```

### Obtendo Dados

Aqui está um exemplo de como obter dados dos usuários e exibi-los no front-end:

```typescript
import { notFound } from 'next/navigation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'
import { User } from '@/payload-types'
import { PaginatedDocs } from 'payload'

export const dynamic = 'force-dynamic'

const getUsers = async () => {
  const result = await fetchFromApi<PaginatedDocs<User>>('/api/users')

  if (!result.data) notFound()

  return result.data
}

export default async function Home() {
  const { docs } = await getUsers()

  if (!docs) return <div>Carregando...</div>
  return (
    <div>
      <h1>Seja bem vindo!</h1>
      <ul>
        {docs.map((user) => (
          <li key={user.id}>{user.email}</li>
        ))}
      </ul>
    </div>
  )
}
```

### Custom Endpoints

Também é possível criar seus próprios endpoints, com lógica personalizada.

```typescript
const newsletterSchema = z.object({
  email: z
    .string({
      required_error: 'Por favor, insira um e-mail.',
    })
    .email('Por favor, insira um e-mail válido.'),
})

// Examples of API endpoints
export const UsersApi: Endpoint[] = [
  {
    method: 'post',
    path: '/newsletter',
    handler: withValidation(newsletterSchema)(async (req, validatedData) => {
      try {
        const { email } = validatedData

        // TODO: Register email in newsletter

        return Response.json({
          data: {
            message: `${email} cadastrado com sucesso na newsletter`,
          },
        })
      } catch (error) {
        console.error('[UsersApi][newsletter]:', error)
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao cadastrar lead' }],
          },
          { status: 500 },
        )
      }
    }),
  },
  {
    method: 'get',
    path: '/leads',

    handler: async (req: PayloadRequest) => {
      try {
        const leads = await req.payload.find({
          collection: 'users',
        })
        return Response.json(leads)
      } catch (error) {
        console.error('[UsersApi][newsletter]:', error)
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao pegar leads' }],
          },
          { status: 500 },
        )
      }
    },
  },
]
```

## Dicas Adicionais

- **Instalação do PNPM:**  
  Se você ainda não tem o PNPM instalado, visite a [documentação oficial do PNPM](https://pnpm.io/installation) para instruções detalhadas.

- **Configuração de Variáveis de Ambiente:**  
  Verifique se todas as variáveis de ambiente necessárias para o funcionamento do Payload CMS, PostgreSQL e demais serviços estão corretamente configuradas. Geralmente, essas variáveis ficam definidas em um arquivo `.env`.

- **Parar os Containers:**  
  Caso precise parar os containers Docker, utilize o comando:

  ```bash
  docker-compose down
  ```
