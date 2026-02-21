# 📱 Conecta Elas - Front

Bem-vindo ao repositório do **Conecta Elas**, uma aplicação interativa desenvolvida com **Ionic** e **React**, **especialmente voltada para o público feminino**. Este projeto visa oferecer uma plataforma segura de acolhimento, entretenimento e informação. Além de jogos cognitivos, o aplicativo fornece ferramentas essenciais de apoio, comunicação e aprendizado para o dia a dia das mulheres.

## 🎮 Funcionalidades Principais

O aplicativo é dividido em módulos que atendem tanto ao lazer quanto à segurança e informação da usuária:

### 💜 Apoio e Comunicação
-   **💬 Chat de Assistência**: Um canal direto para tirar dúvidas, onde perfis de assistência podem oferecer suporte e orientação às usuárias.
-   **🆘 Contatos de Emergência**: Lista rápida de telefones úteis e serviços de proteção para situações de risco.
-   **📒 Agenda Pessoal**: Funcionalidade que permite à usuária salvar e gerenciar seus próprios contatos de preferência e confiança.

### 📰 Informação e Interatividade
-   **🗞️ Feed de Notícias**: Um espaço com notícias e conteúdos informativos relevantes.
-   **❤️ Interação e Favoritos**: As usuárias podem interagir com o conteúdo e **salvar** as notícias e artigos que consideram mais importantes para leitura posterior.

### 🧩 Jogos Cognitivos
O aplicativo também oferece quatro tipos de jogos para exercitar a mente, acessíveis para usuários e gerenciáveis por administradores:

1.  **🧠 Quiz**: Perguntas e respostas interativas com feedback imediato.
2.  **🔤 Caça-Palavras**: Jogo clássico de encontrar palavras escondidas em uma grade.
3.  **✏️ Palavras Cruzadas**: Desafios de palavras cruzadas com dicas.
4.  **🃏 Jogo da Memória**: Jogo de cartas para exercitar a memória, organizados por temas.

### 🛠️ Módulo de Gerenciamento (Admin/Assistente)
Para perfis autorizados, o aplicativo oferece um painel de controle robusto onde é possível:
-   **Criar, Editar e Excluir** jogos de todos os tipos.
-   **Visualizar** a lista de jogos criados.
-   **Testar** os jogos diretamente do painel de administração (Botão "Jogar").

## 🚀 Tecnologias Utilizadas

Este projeto foi construído utilizando tecnologias modernas de desenvolvimento web e mobile:

-   **[Ionic Framework 8](https://ionicframework.com/)**: Para interface móvel e componentes UI.
-   **[React 18](https://react.dev/)**: Biblioteca JavaScript para construção da interface.
-   **[TypeScript](https://www.typescriptlang.org/)**: Para tipagem estática e segurança no código.
-   **[Vite](https://vitejs.dev/)**: Ferramenta de build rápida e servidor de desenvolvimento.
-   **[Capacitor](https://capacitorjs.com/)**: Para integração nativa (Android/iOS).
-   **[Axios](https://axios-http.com/)**: Cliente HTTP para comunicação com a API (Backend Strapi).
-   **[Zod](https://zod.dev/)** & **[React Hook Form](https://react-hook-form.com/)**: Para validação e manipulação de formulários.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

-   **[Node.js](https://nodejs.org/)** (versão 16 ou superior recomendada)
-   **NPM** (gerenciador de pacotes padrão do Node)

## 🔧 Como Rodar o Projeto

Siga os passos abaixo para executar o projeto localmente:

1.  **Clone o repositório** (se aplicável) ou navegue até a pasta do projeto:
    ```bash
    cd ConectaElas-Front
    ```

2.  **Instale as dependências**:
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente**:
    Verifique se existe um arquivo `.env` na raiz do projeto com a URL da API configurada (ex: `VITE_API_URL`).

4.  **Inicie o Servidor de Desenvolvimento**:
    ```bash
    npm run dev
    ```
    O aplicativo estará acessível geralmente em `http://localhost:8100` ou `http://localhost:5173`.

## 📱 Build para Android

Para gerar a versão nativa Android (necessário ter o Android Studio configurado):

```bash
npm run build
npx cap sync
npx cap open android
```

## 📂 Estrutura do Projeto

-   `src/pages`: Contém as páginas da aplicação (Jogos, Listagens, Gerenciamento).
-   `src/components`: Componentes reutilizáveis (ex: `QuizItem`).
-   `src/Services`: Serviços para comunicação com a API (`api.ts`, `QuizService.ts`, etc.).
-   `src/theme`: Arquivos de estilização global e variáveis CSS.

---

Desenvolvido com 💜 para o projeto **Conecta Elas**.
