# Carômetro 🎓

<p align="center">
  <img src="public/icon.png" alt="Carômetro Logo" width="150"/>
</p>

Plataforma para gerenciamento e visualização de perfis de egressos de uma instituição de ensino.

## Sobre o Projeto

O Carômetro é uma aplicação web desenvolvida para facilitar a conexão e o acompanhamento da trajetória profissional dos egressos de uma instituição. A plataforma permite que ex-alunos criem perfis, compartilhem suas experiências e que a instituição ou outros usuários autorizados possam buscar e visualizar esses perfis.

Este projeto consiste em:

*   **Frontend:** Uma aplicação moderna e responsiva desenvolvida em React com TypeScript, utilizando Vite para o build.
*   **Backend:** Qual api seguindo as especificações do arquivo `specs.md`. 
    * Um backend em Java com Spring Boot, utilizando MySQL como banco de dados este disponivel em `java-backend/`.

## Funcionalidades Principais

*   **Cadastro de Egressos:** Novos egressos podem se cadastrar utilizando um código de convite.
*   **Login de Egressos e Administradores:** Sistemas de autenticação separados.
*   **Gerenciamento de Perfil:** Egressos podem criar, visualizar e editar seus próprios perfis, incluindo informações pessoais, de contato, trajetória profissional e imagem de perfil.
*   **Busca Avançada de Egressos:** Administradores e usuários públicos (para perfis verificados) podem buscar egressos por nome, curso, ano de formatura.
*   **Painel Administrativo:**
    *   Gerenciamento de usuários (egressos): verificar, desverificar, deletar.
    *   Gerenciamento de códigos de convite: criar, listar e cancelar.
    *   Gerenciamento de cursos: adicionar, editar e remover cursos da plataforma.
    *   Envio de e-mails em massa para egressos (ex: convites para cadastro).
*   **Visualização de Perfis Públicos:** Perfis de egressos verificados podem ser visualizados publicamente.

## Tecnologias Utilizadas

**Frontend:**

*   React 19
*   TypeScript
*   Vite
*   React Router DOM (v7)
*   Bootstrap 5 & React-Bootstrap
*   ESLint
*   Firebase (para simulação de backend e deploy do frontend)
*   Chart.js (para gráficos no dashboard admin)

**Backend (`java-backend/`):**

*   Java
*   Spring Boot
*   Spring Data JPA
*   Spring Security
*   MySQL
*   Maven
