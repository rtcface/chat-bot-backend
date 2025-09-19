# 🧪 Plan de Pruebas para API Chatbot Backend - NestJS

**Versión:** 1.0
**Fecha:** 2025-09-19
**API Base URL:** `http://localhost:3000`
**Framework:** NestJS con TypeORM, PostgreSQL, Redis
**Autenticación:** JWT Bearer Token

## 📋 Información General

### Objetivos del Plan de Pruebas

- ✅ Verificar funcionalidad completa del backend de chatbot
- ✅ Validar autenticación y autorización JWT
- ✅ Probar gestión de conversaciones y mensajes
- ✅ Evaluar integración con proveedores de IA (DeepSeek)
- ✅ Validar operaciones CRUD de usuarios y API keys
- ✅ Probar manejo de errores y edge cases

### Endpoints Identificados

Basado en el análisis de controladores NestJS:

#### 🔐 **Authentication Endpoints** (`/auth`)

- `POST /auth/register` - Registro de usuarios
- `POST /auth/login` - Login de usuarios
- `POST /auth/api-keys` - Generar API key (JWT required)
- `GET /auth/api-keys` - Listar API keys (JWT required)
- `GET /auth/profile` - Perfil de usuario (JWT required)

#### 💬 **Chat Endpoints** (`/chat`)

- `POST /chat/send` - Enviar mensaje (JWT required)
- `GET /chat/conversations` - Listar conversaciones (JWT required)
- `POST /chat/conversations` - Crear conversación (JWT required)
- `GET /chat/conversations/:id` - Historial de conversación (JWT required)
- `GET /chat/conversations/:id/messages` - Mensajes paginados (JWT required)
- `DELETE /chat/conversations/:id` - Eliminar conversación (JWT required)
- `PUT /chat/conversations/:id/archive` - Archivar conversación (JWT required)
- `PUT /chat/conversations/:id/title` - Actualizar título (JWT required)
- `GET /chat/stats` - Estadísticas de usuario (JWT required)

#### 🏥 **Health Endpoints** (`/health`)

- `GET /health` - Health check básico
- `GET /health/detailed` - Health check detallado

#### 🏠 **App Endpoints**

- `GET /` - Endpoint raíz

### Configuración en Insomnia

1. **Crear nuevo Workspace:** `Chatbot Backend API Testing`
2. **Crear Environment:** `Local NestJS`
3. **Variables de Environment:**
   ```json
   {
     "base_url": "http://localhost:3000",
     "test_user_email": "test@example.com",
     "test_user_password": "TestPass123!",
     "jwt_token": "",
     "conversation_id": "",
     "api_key": ""
   }
   ```

---

## 🔐 1. ENDPOINT: POST /auth/register

### 1.1 Casos de Éxito

#### **Test 1.1.1: Registro Exitoso**

- **Request:**

  ```
  POST {{base_url}}/auth/register
  Content-Type: application/json

  {
    "email": "{{test_user_email}}",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User"
  }
  ```

- **Expected Response:**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-string",
      "email": "{{test_user_email}}",
      "firstName": "Test",
      "lastName": "User"
    }
  }
  ```
- **Criterios de Éxito:**
  - ✅ Status: `201 Created`
  - ✅ `access_token` presente y válido
  - ✅ `user` object con campos requeridos
- **Post-Test Actions:**
  - Guardar `access_token` en variable `jwt_token`

#### **Test 1.1.2: Registro con Datos Mínimos**

- **Request:**
  ```json
  {
    "email": "minimal@example.com",
    "password": "Pass123!"
  }
  ```
- **Criterios de Éxito:**
  - ✅ Status: `201 Created`
  - ✅ Campos opcionales pueden ser null/undefined

### 1.2 Casos de Error

#### **Test 1.2.1: Email Duplicado**

- **Request:**
  ```json
  {
    "email": "{{test_user_email}}",
    "password": "DifferentPass123!"
  }
  ```
- **Expected Response:**
  - Status: `400 Bad Request`
  - Body: `{"message": "User already exists"}`
- **Criterios de Éxito:**
  - ✅ Status 400
  - ✅ Mensaje claro de error

#### **Test 1.2.2: Email Inválido**

- **Request:**
  ```json
  {
    "email": "invalid-email",
    "password": "Pass123!"
  }
  ```
- **Expected Response:**
  - Status: `400 Bad Request`
- **Criterios de Éxito:**
  - ✅ Validación de formato de email

#### **Test 1.2.3: Password Muy Corta**

- **Request:**
  ```json
  {
    "email": "shortpass@example.com",
    "password": "123"
  }
  ```
- **Expected Response:**
  - Status: `400 Bad Request`
- **Criterios de Éxito:**
  - ✅ Validación de longitud mínima de password

#### **Test 1.2.4: Campos Requeridos Faltantes**

- **Request:**
  ```json
  {
    "email": "incomplete@example.com"
  }
  ```
- **Expected Response:**
  - Status: `400 Bad Request`
- **Criterios de Éxito:**
  - ✅ Validación de campos requeridos

---

## 🔑 2. ENDPOINT: POST /auth/login

### 2.1 Casos de Éxito

#### **Test 2.1.1: Login Exitoso**

- **Request:**

  ```
  POST {{base_url}}/auth/login
  Content-Type: application/json

  {
    "email": "{{test_user_email}}",
    "password": "TestPass123!"
  }
  ```

- **Expected Response:**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-string",
      "email": "{{test_user_email}}"
    }
  }
  ```
- **Criterios de Éxito:**
  - ✅ Status: `200 OK`
  - ✅ JWT token válido
  - ✅ Usuario correcto
- **Post-Test Actions:**
  - Actualizar variable `jwt_token`

#### **Test 2.1.2: Login con Email en Mayúsculas**

- **Request:**
  ```json
  {
    "email": "{{test_user_email|uppercase}}",
    "password": "TestPass123!"
  }
  ```
- **Criterios de Éxito:**
  - ✅ Case insensitive para email

### 2.2 Casos de Error

#### **Test 2.2.1: Credenciales Incorrectas**

- **Request:**
  ```json
  {
    "email": "{{test_user_email}}",
    "password": "WrongPassword123!"
  }
  ```
- **Expected Response:**
  - Status: `401 Unauthorized`
  - Body: `{"message": "Invalid credentials"}`
- **Criterios de Éxito:**
  - ✅ Status 401
  - ✅ Mensaje de error apropiado

#### **Test 2.2.2: Usuario No Existe**

- **Request:**
  ```json
  {
    "email": "nonexistent@example.com",
    "password": "Pass123!"
  }
  ```
- **Expected Response:**
  - Status: `401 Unauthorized`
- **Criterios de Éxito:**
  - ✅ Status 401 para usuario inexistente

---

## 👤 3. ENDPOINT: GET /auth/profile

### 3.1 Pruebas con Autenticación

#### **Test 3.1.1: Obtener Perfil - Caso Éxito**

- **Request:**
  ```
  GET {{base_url}}/auth/profile
  Authorization: Bearer {{jwt_token}}
  ```
- **Expected Response:**
  ```json
  {
    "id": "uuid-string",
    "email": "{{test_user_email}}",
    "firstName": "Test",
    "lastName": "User",
    "createdAt": "2025-09-19T17:00:00.000Z"
  }
  ```
- **Criterios de Éxito:**
  - ✅ Status: `200 OK`
  - ✅ Datos del usuario correcto
  - ✅ Campos sensibles no expuestos

#### **Test 3.1.2: Token Expirado**

- **Request:**
  ```
  GET {{base_url}}/auth/profile
  Authorization: Bearer expired_jwt_token
  ```
- **Expected Response:**
  - Status: `401 Unauthorized`
- **Criterios de Éxito:**
  - ✅ JWT expiration handling

#### **Test 3.1.3: Token Malformado**

- **Request:**
  ```
  GET {{base_url}}/auth/profile
  Authorization: Bearer invalid.token.here
  ```
- **Expected Response:**
  - Status: `401 Unauthorized`
- **Criterios de Éxito:**
  - ✅ Validación de formato JWT

---

## 🔑 4. ENDPOINT: POST /auth/api-keys

### 4.1 Pruebas de API Keys

#### **Test 4.1.1: Generar API Key - Caso Éxito**

- **Request:**

  ```
  POST {{base_url}}/auth/api-keys
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json

  {
    "name": "Test API Key",
    "permissions": ["read", "write"]
  }
  ```

- **Expected Response:**
  ```json
  {
    "apiKey": "ak_1234567890abcdef",
    "name": "Test API Key",
    "permissions": ["read", "write"],
    "expiresAt": null
  }
  ```
- **Criterios de Éxito:**
  - ✅ Status: `201 Created`
  - ✅ API key generada
  - ✅ Permisos asignados
- **Post-Test Actions:**
  - Guardar `apiKey` en variable `api_key`

#### **Test 4.1.2: API Key con Expiración**

- **Request:**
  ```json
  {
    "name": "Temporary Key",
    "permissions": ["read"],
    "expiresAt": "2025-12-31T23:59:59.000Z"
  }
  ```
- **Criterios de Éxito:**
  - ✅ Fecha de expiración guardada

---

## 💬 5. ENDPOINT: POST /chat/send

### 5.1 Casos de Éxito

#### **Test 5.1.1: Enviar Mensaje Simple**

- **Request:**

  ```
  POST {{base_url}}/chat/send
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json

  {
    "content": "Hola, ¿cómo estás?",
    "model": "deepseek-r1:1.5b"
  }
  ```

- **Expected Response:**
  ```json
  {
    "message": {
      "id": "msg_uuid",
      "role": "assistant",
      "content": "¡Hola! Estoy bien, gracias por preguntar...",
      "tokenCount": 15,
      "modelUsed": "deepseek-r1:1.5b",
      "createdAt": "2025-09-19T17:00:00.000Z"
    },
    "conversationId": "conv_uuid",
    "sessionId": "session_uuid"
  }
  ```
- **Criterios de Éxito:**
  - ✅ Status: `200 OK`
  - ✅ Respuesta de IA generada
  - ✅ Conversación creada automáticamente
  - ✅ Tokens contados correctamente
- **Post-Test Actions:**
  - Guardar `conversationId` en variable

#### **Test 5.1.2: Mensaje con Conversación Existente**

- **Request:**
  ```json
  {
    "content": "¿Cuál es la capital de Francia?",
    "conversationId": "{{conversation_id}}",
    "model": "deepseek-r1:1.5b"
  }
  ```
- **Criterios de Éxito:**
  - ✅ Mensaje agregado a conversación existente
  - ✅ Contexto de conversación mantenido

#### **Test 5.1.3: Mensaje con Parámetros Avanzados**

- **Request:**
  ```json
  {
    "content": "Escribe un poema corto",
    "model": "deepseek-r1:1.5b",
    "temperature": 0.8,
    "maxTokens": 100,
    "roleId": "role_uuid"
  }
  ```
- **Criterios de Éxito:**
  - ✅ Parámetros avanzados aplicados
  - ✅ Role configuration usado si existe

### 5.2 Casos de Error

#### **Test 5.2.1: Sin Autenticación**

- **Request:**

  ```
  POST {{base_url}}/chat/send
  Content-Type: application/json

  {
    "content": "Hola"
  }
  ```

- **Expected Response:**
  - Status: `401 Unauthorized`
- **Criterios de Éxito:**
  - ✅ JWT requerido

#### **Test 5.2.2: Mensaje Vacío**

- **Request:**
  ```json
  {
    "content": "",
    "model": "deepseek-r1:1.5b"
  }
  ```
- **Expected Response:**
  - Status: `400 Bad Request`
- **Criterios de Éxito:**
  - ✅ Validación de contenido no vacío

#### **Test 5.2.3: Modelo No Disponible**

- **Request:**
  ```json
  {
    "content": "Hola",
    "model": "nonexistent-model"
  }
  ```
- **Expected Response:**
  - Status: `400 Bad Request`
- **Criterios de Éxito:**
  - ✅ Validación de modelo disponible

---

## 📝 6. ENDPOINTS DE CONVERSACIONES

### 6.1 Gestión de Conversaciones

#### **Test 6.1.1: Listar Conversaciones**

- **Request:**
  ```
  GET {{base_url}}/chat/conversations?page=1&limit=10
  Authorization: Bearer {{jwt_token}}
  ```
- **Expected Response:**
  ```json
  {
    "conversations": [
      {
        "id": "conv_uuid",
        "title": "Nueva conversación",
        "createdAt": "2025-09-19T17:00:00.000Z",
        "lastActivityAt": "2025-09-19T17:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
  ```
- **Criterios de Éxito:**
  - ✅ Status: `200 OK`
  - ✅ Lista paginada
  - ✅ Metadatos de paginación correctos

#### **Test 6.1.2: Crear Conversación**

- **Request:**

  ```
  POST {{base_url}}/chat/conversations
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json

  {
    "title": "Mi Conversación de Prueba"
  }
  ```

- **Expected Response:**
  ```json
  {
    "id": "conv_uuid",
    "title": "Mi Conversación de Prueba",
    "sessionId": "session_uuid",
    "createdAt": "2025-09-19T17:00:00.000Z"
  }
  ```
- **Criterios de Éxito:**
  - ✅ Status: `201 Created`
  - ✅ Conversación creada con título

#### **Test 6.1.3: Obtener Historial**

- **Request:**
  ```
  GET {{base_url}}/chat/conversations/{{conversation_id}}
  Authorization: Bearer {{jwt_token}}
  ```
- **Expected Response:**
  ```json
  {
    "conversation": {
      "id": "{{conversation_id}}",
      "title": "Mi Conversación de Prueba"
    },
    "messages": [
      {
        "id": "msg_uuid",
        "role": "user",
        "content": "Hola",
        "tokenCount": 1,
        "createdAt": "2025-09-19T17:00:00.000Z"
      },
      {
        "id": "msg_uuid_2",
        "role": "assistant",
        "content": "¡Hola! ¿En qué puedo ayudarte?",
        "tokenCount": 8,
        "createdAt": "2025-09-19T17:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 2,
      "totalPages": 1
    }
  }
  ```
- **Criterios de Éxito:**
  - ✅ Historial completo de mensajes
  - ✅ Orden cronológico correcto

#### **Test 6.1.4: Eliminar Conversación**

- **Request:**
  ```
  DELETE {{base_url}}/chat/conversations/{{conversation_id}}
  Authorization: Bearer {{jwt_token}}
  ```
- **Expected Response:**
  ```json
  {
    "success": true
  }
  ```
- **Criterios de Éxito:**
  - ✅ Status: `200 OK`
  - ✅ Conversación eliminada

---

## 🏥 7. ENDPOINTS DE HEALTH

### 7.1 Health Checks

#### **Test 7.1.1: Health Check Básico**

- **Request:**
  ```
  GET {{base_url}}/health
  ```
- **Expected Response:**
  ```json
  {
    "status": "ok",
    "timestamp": "2025-09-19T17:00:00.000Z",
    "uptime": 123.456,
    "version": "1.0.0"
  }
  ```
- **Criterios de Éxito:**
  - ✅ Status: `200 OK`
  - ✅ Servicio operativo
  - ✅ Timestamp actual
  - ✅ Uptime > 0

#### **Test 7.1.2: Health Check Detallado**

- **Request:**
  ```
  GET {{base_url}}/health/detailed
  ```
- **Expected Response:**
  ```json
  {
    "status": "ok",
    "timestamp": "2025-09-19T17:00:00.000Z",
    "uptime": 123.456,
    "version": "1.0.0",
    "memory": {
      "rss": "50 MB",
      "heapTotal": "30 MB",
      "heapUsed": "25 MB",
      "external": "5 MB"
    },
    "environment": {
      "nodeVersion": "v18.17.0",
      "platform": "linux",
      "arch": "x64"
    }
  }
  ```
- **Criterios de Éxito:**
  - ✅ Información detallada de memoria
  - ✅ Información del environment

---

## ⚡ 8. PRUEBAS DE PERFORMANCE

### 8.1 Tiempos de Respuesta

#### **Test 8.1.1: Response Time - Endpoints Rápidos**

- **Endpoints:** GET /health, GET /auth/profile
- **Métricas Esperadas:**
  - ✅ < 500ms para health checks
  - ✅ < 1s para endpoints autenticados simples

#### **Test 8.1.2: Response Time - Chat Completion**

- **Endpoint:** POST /chat/send
- **Métricas Esperadas:**
  - ✅ < 30s para respuestas de IA
  - ✅ < 10s para respuestas simples

### 8.2 Rate Limiting

#### **Test 8.2.1: Rate Limit Detection**

- **Ejecutar POST /chat/send** repetidamente
- **Expected Response:**
  - Status: `429 Too Many Requests`
- **Criterios de Éxito:**
  - ✅ Rate limiting configurado
  - ✅ Headers informativos

---

## 🔧 9. CONFIGURACIÓN DE INSOMNIA

### 9.1 Variables de Environment

```json
{
  "base_url": "http://localhost:3000",
  "test_user_email": "test@example.com",
  "test_user_password": "TestPass123!",
  "jwt_token": "",
  "conversation_id": "",
  "api_key": "",
  "test_role_id": ""
}
```

### 9.2 Tests Scripts Automáticos

```javascript
// Test para validar JWT responses
pm.test('Has valid JWT token', function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property('access_token');

  // Guardar token para requests futuros
  pm.environment.set('jwt_token', jsonData.access_token);
});

// Test para validar chat responses
pm.test('Valid chat response structure', function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property('message');
  pm.expect(jsonData.message).to.have.property('content');
  pm.expect(jsonData).to.have.property('conversationId');
});
```

---

## 📊 10. REPORTING Y MÉTRICAS

### 10.1 Métricas a Capturar

- ✅ Tasa de éxito por módulo (Auth, Chat, Health)
- ✅ Tiempos de respuesta promedio
- ✅ Cobertura de casos de prueba
- ✅ Errores más comunes por tipo

### 10.2 Formato de Reporte

```markdown
## Reporte de Pruebas - API Chatbot Backend

### Resumen Ejecutivo

- **Fecha:** YYYY-MM-DD
- **Total Tests:** 25
- **Tests Exitosos:** 22 (88%)
- **Tiempo Total:** 45 segundos

### Resultados por Módulo

- **Authentication:** 8/8 ✅ (100%)
- **Chat:** 12/14 ⚠️ (86%)
- **Health:** 2/2 ✅ (100%)
- **Conversations:** 3/3 ✅ (100%)

### Problemas Identificados

- Rate limiting no configurado en algunos endpoints
- Validación de entrada podría ser más estricta
```

---

## 🚀 11. EJECUCIÓN Y AUTOMATIZACIÓN

### 11.1 Orden Recomendado de Ejecución

1. **Fase 1 - Health:** Tests 7.x (verificar servicio operativo)
2. **Fase 2 - Auth:** Tests 1.x, 2.x, 3.x (autenticación completa)
3. **Fase 3 - API Keys:** Tests 4.x (gestión de API keys)
4. **Fase 4 - Chat Básico:** Tests 5.1.1, 6.1.2 (funcionalidad core)
5. **Fase 5 - Conversaciones:** Tests 6.x (gestión completa)
6. **Fase 6 - Edge Cases:** Tests 5.2.x, 5.3.x (casos límite)
7. **Fase 7 - Performance:** Tests 8.x (rendimiento)

### 11.2 Automatización con Newman

```bash
# Ejecutar tests completos
npx newman run insomnia-chatbot-api-tests.json \
  --environment insomnia-chatbot-env.json \
  --reporters cli,json,html \
  --reporter-json-export results.json \
  --reporter-html-export report.html
```

### 11.3 Tests de Regresión

- **Diario:** Health checks + login flow
- **Semanal:** Suite completa de pruebas
- **Post-deploy:** Todos los tests críticos

---

## 📝 12. CONSIDERACIONES ADICIONALES

### 12.1 Pre-requisitos

- ✅ PostgreSQL ejecutándose en puerto 5432
- ✅ Redis ejecutándose en puerto 6379
- ✅ Variables de entorno configuradas (.env)
- ✅ NestJS application ejecutándose en puerto 3000

### 12.2 Base de Datos

- **Inicialización:** Ejecutar `init-db.sql`
- **Migraciones:** TypeORM handles automáticamente
- **Datos de Prueba:** Crear usuario de prueba antes de tests

### 12.3 Variables de Entorno Requeridas

```bash
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_DATABASE=chatbot_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h

# DeepSeek
DEEPSEEK_API_KEY=sk-4a478b7a14c44e10b8342c526be652b7
```

### 12.4 Troubleshooting Común

- **Error 500:** Revisar logs de NestJS
- **Error 401:** Verificar JWT token
- **Error 400:** Validar payload de request
- **Timeout:** Verificar conectividad con DB/Redis

---

**🎯 Objetivo**: Proporcionar una suite de pruebas completa, estructurada y automatizable para validar todas las funcionalidades del backend de chatbot, asegurando calidad y confiabilidad en el desarrollo y deployment.
