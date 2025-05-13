
# Especificação da API REST para Plataforma de Egressos

## Rotas da API

### 1. Criar Egresso

*   **Rota:** `/api/v1/egressos`
*   **Método:** `POST`
*   **Descrição:** Cria um novo usuário egresso na plataforma. Requer um código de convite válido e não utilizado.

**Exemplo de Requisição:**

```json
{
  "name": "João da Silva",
  "profileImage": "base64_imagem_perfil",
  "faceImage": "base64_imagem_face",
  "facePoints": "pontos_da_face",
  "course": "Ciência da Computação",
  "graduationYear": "2023",
  "personalDescription": "Um breve resumo sobre mim.",
  "contactLinks": ["https://linkedin.com/joaosilva", "https://github.com/joaosilva"],
  "verified": false,
  "username": "joaosilva",
  "passwordHash": "senha123",
  "careerDescription": "Minha trajetória profissional até agora.",
  "termsAccepted": true,
  "inviteCode": "CODIGO_DE_CONVITE_VALIDO"
}
```

**Exemplo de Resposta de Sucesso (Status 201 Created):**

```json
{
  "name": "João da Silva",
  "profileImage": "base64_imagem_perfil",
  "faceImage": "base64_imagem_face",
  "facePoints": "pontos_da_face",
  "course": "Ciência da Computação",
  "graduationYear": "2023",
  "personalDescription": "Um breve resumo sobre mim.",
  "contactLinks": ["https://linkedin.com/joaosilva", "https://github.com/joaosilva"],
  "verified": false,
  "username": "joaosilva",
  "passwordHash": "eG9hby1oYXNo", // Representação do hash da senha
  "careerDescription": "Minha trajetória profissional até agora.",
  "termsAccepted": true,
  "id": "ID_GERADO_PELO_SERVIDOR"
}
```

**Exemplo de Resposta de Erro (Status 400 Bad Request - Código de Convite Inválido):**

```json
{
  "message": "Invalid or used invite code."
}
```

**Exemplo de Resposta de Erro (Status 409 Conflict - Nome de Usuário Já Existe):**

```json
{
  "message": "Username already exists for another egresso."
}
```

---

### 2. Login de Egresso

*   **Rota:** `/api/v1/login/egresso`
*   **Método:** `POST`
*   **Descrição:** Autentica um egresso na plataforma.

**Exemplo de Requisição:**

```json
{
  "username": "joaosilva",
  "password": "senha123"
}
```

**Exemplo de Resposta de Sucesso (Status 200 OK):**

```json
{
  "name": "João da Silva",
  "profileImage": "base64_imagem_perfil",
  "faceImage": "base64_imagem_face",
  "facePoints": "pontos_da_face",
  "course": "Ciência da Computação",
  "graduationYear": "2023",
  "personalDescription": "Um breve resumo sobre mim.",
  "contactLinks": ["https://linkedin.com/joaosilva", "https://github.com/joaosilva"],
  "verified": false,
  "username": "joaosilva",
  "passwordHash": "eG9hby1oYXNo", // Hash da senha do usuário retornado para fins de consistência ou não, dependendo da política de segurança
  "careerDescription": "Minha trajetória profissional até agora.",
  "termsAccepted": true,
  "id": "ID_DO_EGRESSO"
}
```

**Exemplo de Resposta de Erro (Status 401 Unauthorized - Credenciais Inválidas):**

```json
{
  "message": "Invalid credentials"
}
```

---

### 3. Listar Egressos

*   **Rota:** `/api/v1/egressos`
*   **Método:** `GET`
*   **Descrição:** Retorna uma lista de todos os egressos cadastrados.

**Exemplo de Requisição:**
(Nenhuma body)

**Exemplo de Resposta de Sucesso (Status 200 OK):**

```json
[
  {
    "name": "João da Silva",
    "profileImage": "base64_imagem_perfil",
    "faceImage": "base64_imagem_face",
    "facePoints": "pontos_da_face",
    "course": "Ciência da Computação",
    "graduationYear": "2023",
    "personalDescription": "Um breve resumo sobre mim.",
    "contactLinks": ["https://linkedin.com/joaosilva", "https://github.com/joaosilva"],
    "verified": false,
    "username": "joaosilva",
    "passwordHash": "eG9hby1oYXNo",
    "careerDescription": "Minha trajetória profissional até agora.",
    "termsAccepted": true,
    "id": "ID_DO_EGRESSO_1"
  },
  {
    "name": "Maria Souza",
    "profileImage": "base64_imagem_perfil_maria",
    "faceImage": "base64_imagem_face_maria",
    "facePoints": "pontos_da_face_maria",
    "course": "Engenharia de Software",
    "graduationYear": "2022",
    "personalDescription": "Descrição de Maria Souza.",
    "contactLinks": ["https://linkedin.com/mariasouza"],
    "verified": true,
    "username": "mariasouza",
    "passwordHash": "bWFyaWEtaGFzaA==",
    "careerDescription": "Experiência profissional de Maria.",
    "termsAccepted": true,
    "id": "ID_DO_EGRESSO_2"
  }
  // ... mais egressos
]
```

**Exemplo de Resposta de Erro (Status 404 Not Found - Nenhum Egresso Encontrado):**
(Retorna um array vazio se nenhum egresso for encontrado, status ainda seria 200 OK)

```json
[]
```

---

### 4. Obter Egresso por ID

*   **Rota:** `/api/v1/egressos/{id}` (onde `{id}` é o ID do egresso)
*   **Método:** `GET`
*   **Descrição:** Retorna os dados de um egresso específico com base no ID.

**Exemplo de Requisição:**
(Nenhuma body)

**Exemplo de Resposta de Sucesso (Status 200 OK):**

```json
{
  "name": "João da Silva",
  "profileImage": "base64_imagem_perfil",
  "faceImage": "base64_imagem_face",
  "facePoints": "pontos_da_face",
  "course": "Ciência da Computação",
  "graduationYear": "2023",
  "personalDescription": "Um breve resumo sobre mim.",
  "contactLinks": ["https://linkedin.com/joaosilva", "https://github.com/joaosilva"],
  "verified": false,
  "username": "joaosilva",
  "passwordHash": "eG9hby1oYXNo",
  "careerDescription": "Minha trajetória profissional até agora.",
  "termsAccepted": true,
  "id": "ID_DO_EGRESSO"
}
```

**Exemplo de Resposta de Erro (Status 404 Not Found - Egresso Não Encontrado):**

```json
{
  "message": "Egresso not found"
}
```

---

### 5. Obter Egresso por Nome de Usuário

*   **Rota:** `/api/v1/egressos?username={username}` (onde `{username}` é o nome de usuário)
*   **Método:** `GET`
*   **Descrição:** Retorna os dados de um egresso específico com base no nome de usuário.

**Exemplo de Requisição:**
(Nenhuma body)

**Exemplo de Resposta de Sucesso (Status 200 OK):**

```json
{
  "name": "João da Silva",
  "profileImage": "base64_imagem_perfil",
  "faceImage": "base64_imagem_face",
  "facePoints": "pontos_da_face",
  "course": "Ciência da Computação",
  "graduationYear": "2023",
  "personalDescription": "Um breve resumo sobre mim.",
  "contactLinks": ["https://linkedin.com/joaosilva", "https://github.com/joaosilva"],
  "verified": false,
  "username": "joaosilva",
  "passwordHash": "eG9hby1oYXNo",
  "careerDescription": "Minha trajetória profissional até agora.",
  "termsAccepted": true,
  "id": "ID_DO_EGRESSO"
}
```

**Exemplo de Resposta de Erro (Status 404 Not Found - Egresso Não Encontrado):**

```json
{
  "message": "Egresso not found"
}
```

---

### 6. Atualizar Egresso

*   **Rota:** `/api/v1/egressos/{id}` (onde `{id}` é o ID do egresso)
*   **Método:** `PUT`
*   **Descrição:** Atualiza os dados de um egresso existente.

**Exemplo de Requisição:**

```json
{
  "name": "João Silva Atualizado",
  "personalDescription": "Descrição pessoal atualizada.",
  "contactLinks": ["https://linkedin.com/joaosilva_atualizado"],
  "passwordHash": "nova_senha_123" // Opcional: Apenas se a senha estiver sendo alterada
}
```

**Exemplo de Resposta de Sucesso (Status 200 OK):**

```json
{
  "name": "João Silva Atualizado",
  "personalDescription": "Descrição pessoal atualizada.",
  "contactLinks": ["https://linkedin.com/joaosilva_atualizado"],
  "passwordHash": "bm92YS1zZW5oYS0xMjM=", // Hash da nova senha
  "id": "ID_DO_EGRESSO"
  // ... outros campos atualizados e não atualizados do egresso
}
```

**Exemplo de Resposta de Erro (Status 404 Not Found - Egresso Não Encontrado):**

```json
{
  "message": "Egresso not found"
}
```

---

### 7. Deletar Egresso

*   **Rota:** `/api/v1/egressos/{id}` (onde `{id}` é o ID do egresso)
*   **Método:** `DELETE`
*   **Descrição:** Deleta um egresso da plataforma.

**Exemplo de Requisição:**
(Nenhuma body)

**Exemplo de Resposta de Sucesso (Status 204 No Content):**
(Nenhuma body)

**Exemplo de Resposta de Erro (Status 404 Not Found - Egresso Não Encontrado):**

```json
{
  "message": "Egresso not found"
}```

---

### 8. Criar Administrador

*   **Rota:** `/api/v1/admins`
*   **Método:** `POST`
*   **Descrição:** Cria um novo administrador na plataforma.

**Exemplo de Requisição:**

```json
{
  "name": "Admin Principal",
  "username": "admin",
  "role": "SuperAdmin",
  "passwordHash": "admin123"
}
```

**Exemplo de Resposta de Sucesso (Status 201 Created):**

```json
{
  "name": "Admin Principal",
  "username": "admin",
  "role": "SuperAdmin",
  "passwordHash": "YWRtaW4taGFzaA==", // Representação do hash da senha
  "id": "ID_GERADO_PELO_SERVIDOR"
}
```

**Exemplo de Resposta de Erro (Status 409 Conflict - Nome de Usuário Já Existe):**

```json
{
  "message": "Username already exists for another admin."
}
```

---

### 9. Login de Administrador

*   **Rota:** `/api/v1/login/admin`
*   **Método:** `POST`
*   **Descrição:** Autentica um administrador na plataforma.

**Exemplo de Requisição:**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Exemplo de Resposta de Sucesso (Status 200 OK):**

```json
{
  "name": "Admin Principal",
  "username": "admin",
  "role": "SuperAdmin",
  "passwordHash": "YWRtaW4taGFzaA==", // Hash da senha do admin
  "id": "ID_DO_ADMINISTRADOR"
}
```

**Exemplo de Resposta de Erro (Status 401 Unauthorized - Credenciais Inválidas):**

```json
{
  "message": "Invalid credentials"
}
```

---

### 10. Obter Administrador por ID

*   **Rota:** `/api/v1/admins/{id}` (onde `{id}` é o ID do administrador)
*   **Método:** `GET`
*   **Descrição:** Retorna os dados de um administrador específico com base no ID.

**Exemplo de Requisição:**
(Nenhuma body)

**Exemplo de Resposta de Sucesso (Status 200 OK):**

```json
{
  "name": "Admin Principal",
  "username": "admin",
  "role": "SuperAdmin",
  "passwordHash": "YWRtaW4taGFzaA==", // Hash da senha do admin
  "id": "ID_DO_ADMINISTRADOR"
}
```

**Exemplo de Resposta de Erro (Status 404 Not Found - Administrador Não Encontrado):**

```json
{
  "message": "Admin not found"
}
```

---

### 11. Obter Administrador por Nome de Usuário

*   **Rota:** `/api/v1/admins?username={username}` (onde `{username}` é o nome de usuário)
*   **Método:** `GET`
*   **Descrição:** Retorna os dados de um administrador específico com base no nome de usuário.

**Exemplo de Requisição:**
(Nenhuma body)

**Exemplo de Resposta de Sucesso (Status 200 OK):**

```json
{
  "name": "Admin Principal",
  "username": "admin",
  "role": "SuperAdmin",
  "passwordHash": "YWRtaW4taGFzaA==", // Hash da senha do admin
  "id": "ID_DO_ADMINISTRADOR"
}
```

**Exemplo de Resposta de Erro (Status 404 Not Found - Administrador Não Encontrado):**

```json
{
  "message": "Admin not found"
}
```

---

### 12. Criar Código de Convite

*   **Rota:** `/api/v1/invites`
*   **Método:** `POST`
*   **Descrição:** Gera um novo código de convite para cadastro de egressos. Requer o ID do administrador que está criando o convite.

**Exemplo de Requisição:**

```json
{
  "adminId": "ID_DO_ADMINISTRADOR"
}
```

**Exemplo de Resposta de Sucesso (Status 201 Created):**

```json
{
  "code": "CODIGO_DE_CONVITE_GERADO"
}
```

**Exemplo de Resposta de Erro (Status 400 Bad Request - Requisição Inválida):**

```json
{
  "message": "Invalid request"
}
```

---

### 13. Listar Códigos de Convite

*   **Rota:** `/api/v1/invites`
*   **Método:** `GET`
*   **Descrição:** Retorna uma lista de todos os códigos de convite gerados.

**Exemplo de Requisição:**
(Nenhuma body)

**Exemplo de Resposta de Sucesso (Status 200 OK):**

```json
[
  {
    "code": "CODIGO_DE_CONVITE_1",
    "used": false,
    "createdBy": "ID_DO_ADMINISTRADOR_1",
    "createdAt": "TIMESTAMP_ISO_8601"
  },
  {
    "code": "CODIGO_DE_CONVITE_2",
    "used": true,
    "createdBy": "ID_DO_ADMINISTRADOR_2",
    "createdAt": "TIMESTAMP_ISO_8601"
  }
  // ... mais convites
]
```

**Exemplo de Resposta de Erro (Status 404 Not Found - Nenhum Convite Encontrado):**
(Retorna um array vazio se nenhum convite for encontrado, status ainda seria 200 OK)

```json
[]
```

---

### 14. Cancelar Código de Convite

*   **Rota:** `/api/v1/invites`
*   **Método:** `PUT`
*   **Descrição:** Marca um código de convite como usado, efetivamente cancelando-o.

**Exemplo de Requisição:**

```json
{
  "code": "CODIGO_DE_CONVITE_A_CANCELAR"
}
```

**Exemplo de Resposta de Sucesso (Status 200 OK):**
(Nenhuma body, ou uma mensagem de sucesso)

```json
{
  "message": "Invite successfully cancelled."
}
```

**Exemplo de Resposta de Erro (Status 404 Not Found - Convite Não Encontrado):**

```json
{
  "message": "Invite not found"
}
```

---

### 15. Listar Cursos

*   **Rota:** `/api/v1/courses`
*   **Método:** `GET`
*   **Descrição:** Retorna uma lista de todos os cursos disponíveis.

**Exemplo de Requisição:**
(Nenhuma body)

**Exemplo de Resposta de Sucesso (Status 200 OK):**

```json
[
  "Ciência da Computação",
  "Engenharia de Software",
  "Sistemas de Informação",
  "Análise e Desenvolvimento de Sistemas"
]
```

**Exemplo de Resposta de Erro (Status 404 Not Found - Cursos Não Encontrados):**
(Retorna um array vazio se nenhum curso for encontrado, status ainda seria 200 OK)

```json
[]
```

---

### 16. Salvar Cursos

*   **Rota:** `/api/v1/courses`
*   **Método:** `PUT`
*   **Descrição:** Atualiza a lista de cursos disponíveis.

**Exemplo de Requisição:**

```json
[
  "Ciência da Computação",
  "Engenharia de Software",
  "Sistemas de Informação",
  "Análise e Desenvolvimento de Sistemas",
  "Novo Curso"
]
```

**Exemplo de Resposta de Sucesso (Status 200 OK ou 204 No Content):**
(Nenhuma body, ou uma mensagem de sucesso)

```json
{
  "message": "Courses updated successfully."
}
```

**Exemplo de Resposta de Erro (Status 400 Bad Request - Requisição Inválida):**

```json
{
  "message": "Invalid request"
}
```

---

### 17. Enviar E-mail de Convite em Massa

*   **Rota:** `/api/v1/email/send`
*   **Método:** `POST`
*   **Descrição:** Envia e-mails de convite para uma lista de destinatários. Para cada destinatário, um novo código de convite único é gerado e associado ao `adminId` fornecido. O placeholder `{link}` no corpo do e-mail (HTML e texto) é substituído pelo link de convite exclusivo para aquele destinatário.

**Exemplo de Requisição:**

```json
{
  "adminId": "ID_DO_ADMINISTRADOR_QUE_ENVIA",
  "recipients": [
    { "email": "destinatario1@example.com" },
    { "email": "destinatario2@example.com" }
  ],
  "subject": "Convite para o Carômetro!",
  "html": "<!DOCTYPE html><html><body><h1>Olá!</h1><p>Você foi convidado para o Carômetro. Clique aqui: <a href='{link}'>Criar Conta</a></p></body></html>",
  "text": "Olá! Você foi convidado para o Carômetro. Use este link: {link}"
}
```

**Nota sobre o Corpo do E-mail:** O servidor irá gerar um código de convite único para cada destinatário e substituirá todas as ocorrências do placeholder `{link}` no `html` e no `text` pelo link de convite completo (ex: `https://seusite.com/create-account?invite=CODIGO_UNICO`).

**Exemplo de Resposta de Sucesso (Status 200 OK ou 202 Accepted - Todos os e-mails processados):**
(Indica que os e-mails foram aceitos para envio pela plataforma de e-mail)

```json
{
  "message": "All invite emails accepted for sending.",
  "details": {
    "successfulSends": 2,
    "failedSends": 0,
    "errors": []
  }
}
```

**Exemplo de Resposta de Sucesso Parcial (Status 207 Multi-Status - Alguns e-mails falharam):**

```json
{
  "message": "Partially sent emails. Success: 1, Failed: 1",
  "details": {
    "successfulSends": 1,
    "failedSends": 1,
    "errors": [
      { "email": "destinatario2@example.com", "error": "Simulated SmtpJS sending failure." }
    ]
  }
}
```

**Exemplo de Resposta de Erro (Status 400 Bad Request - Requisição Inválida):**

```json
{
  "message": "Missing required fields for sending email" // ou "Admin ID is required..."
}
```

**Exemplo de Resposta de Erro (Status 500 Internal Server Error - Falha geral no envio ou configuração):**

```json
{
  "message": "Email service not configured on server." // ou "All emails failed to send (Simulation). First error: ..."
}
```

---

## Formato de Data e Hora

As timestamps `createdAt` nas respostas de convite devem ser formatadas em ISO 8601 (e.g., `2024-07-26T12:00:00Z`).

## Autenticação e Autorização

Esta especificação não detalha a autenticação e autorização da API. Em uma implementação real, as rotas que exigem autenticação (como atualizar ou deletar egressos, criar convites, gerenciar cursos, enviar e-mails, etc.) devem ser protegidas, provavelmente usando tokens JWT ou mecanismos similares. As rotas de login (`/api/v1/login/egresso`, `/api/v1/login/admin`) seriam usadas para obter esses tokens após autenticação bem-sucedida.
