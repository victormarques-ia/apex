# Definir nome

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

3. **Iniciar o servidor de desenvolvimento**

   Com as dependências instaladas e o banco de dados em execução, inicie a aplicação com:

   ```bash
   pnpm run dev
   ```

   A aplicação estará disponível em `http://localhost:3000` (ou na porta configurada).

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
