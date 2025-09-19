# 🧪 Plan de Pruebas para API Local DeepSeek - Insomnia

**Versión:** 1.0
**Fecha:** 2025-09-19
**API Base URL:** `http://localhost:8080/api/v1`
**API Key:** `sk-4a478b7a14c44e10b8342c526be652b7`

## 📋 Información General

### Objetivos del Plan de Pruebas

- ✅ Verificar funcionalidad completa de la API local DeepSeek
- ✅ Validar autenticación y autorización
- ✅ Probar casos de éxito y error
- ✅ Evaluar performance y tiempos de respuesta
- ✅ Identificar edge cases y comportamientos inesperados

### Configuración en Insomnia

1. **Crear nuevo Workspace:** `DeepSeek Local API Testing`
2. **Crear Environment:** `Local DeepSeek`
3. **Variables de Environment:**
   ```json
   {
     "base_url": "http://localhost:8080/api/v1",
     "api_key": "sk-4a478b7a14c44e10b8342c526be652b7",
     "timeout": 30000
   }
   ```

### Modelos Disponibles (Basado en Tests Previos)

- `deepseek-r1:1.5b` ✅ (Disponible y funcional)
- `arena-model` ✅ (Disponible)
- `deepseek-chat` ❌ (No disponible - causa error 400)
- `deepseek-coder` ❓ (Por verificar)

---

## 🔗 1. ENDPOINT: GET /api/v1/models

### 1.1 Pruebas de Conectividad Básica (Sin Autenticación)

#### **Test 1.1.1: Conectividad Básica**

- **Request:**
  ```
  GET {{base_url}}/models
  Headers: Content-Type: application/json
  ```
- **Expected Response:**
  - Status: `401 Unauthorized`
  - Body: `{"detail":"Not authenticated"}`
- **Criterios de Éxito:**
  - ✅ Servidor responde (no timeout)
  - ✅ Status code 401 (autenticación requerida)
  - ✅ Mensaje de error claro
- **Tiempo Esperado:** < 1 segundo

#### **Test 1.1.2: Endpoint No Encontrado**

- **Request:**
  ```
  GET {{base_url}}/modelos
  Headers: Content-Type: application/json
  ```
- **Expected Response:**
  - Status: `404 Not Found`
- **Criterios de Éxito:**
  - ✅ Status 404 para endpoint incorrecto

### 1.2 Pruebas con Autenticación

#### **Test 1.2.1: Lista de Modelos - Caso Éxito**

- **Request:**
  ```
  GET {{base_url}}/models
  Headers:
    Content-Type: application/json
    Authorization: Bearer {{api_key}}
  ```
- **Expected Response:**
  ```json
  {
    "object": "list",
    "data": [
      {
        "id": "deepseek-r1:1.5b",
        "object": "model",
        "created": 1234567890,
        "owned_by": "deepseek"
      },
      {
        "id": "arena-model",
        "object": "model",
        "created": 1234567890,
        "owned_by": "deepseek"
      }
    ]
  }
  ```
- **Criterios de Éxito:**
  - ✅ Status: `200 OK`
  - ✅ Array `data` con al menos 1 modelo
  - ✅ Cada modelo tiene `id`, `object`, `created`, `owned_by`
  - ✅ Modelos conocidos presentes: `deepseek-r1:1.5b`
- **Tiempo Esperado:** < 2 segundos

#### **Test 1.2.2: Autenticación Inválida**

- **Request:**
  ```
  GET {{base_url}}/models
  Headers:
    Content-Type: application/json
    Authorization: Bearer invalid_key_123
  ```
- **Expected Response:**
  - Status: `401 Unauthorized`
  - Body: `{"detail":"Invalid API key"}`
- **Criterios de Éxito:**
  - ✅ Status 401
  - ✅ Mensaje de error específico

#### **Test 1.2.3: Header de Autenticación Malformado**

- **Request:**
  ```
  GET {{base_url}}/models
  Headers:
    Content-Type: application/json
    Authorization: Basic {{api_key}}
  ```
- **Expected Response:**
  - Status: `401 Unauthorized`
- **Criterios de Éxito:**
  - ✅ Status 401 (Bearer esperado, no Basic)

---

## 💬 2. ENDPOINT: POST /api/v1/chat/completions

### 2.1 Casos de Éxito con Payloads Válidos

#### **Test 2.1.1: Chat Simple - Modelo deepseek-r1:1.5b**

- **Request:**

  ```json
  POST {{base_url}}/chat/completions
  Headers:
    Content-Type: application/json
    Authorization: Bearer {{api_key}}

  Body:
  {
    "model": "deepseek-r1:1.5b",
    "messages": [
      {
        "role": "user",
        "content": "Hola, ¿cómo estás?"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 100
  }
  ```

- **Expected Response:**
  ```json
  {
    "id": "chatcmpl-123",
    "object": "chat.completion",
    "created": 1234567890,
    "model": "deepseek-r1:1.5b",
    "choices": [
      {
        "index": 0,
        "message": {
          "role": "assistant",
          "content": "¡Hola! Estoy bien, gracias por preguntar..."
        },
        "finish_reason": "stop"
      }
    ],
    "usage": {
      "prompt_tokens": 10,
      "completion_tokens": 20,
      "total_tokens": 30
    }
  }
  ```
- **Criterios de Éxito:**
  - ✅ Status: `200 OK`
  - ✅ Estructura JSON completa
  - ✅ `choices[0].message.content` no vacío
  - ✅ `usage` object presente
  - ✅ `finish_reason` válido
- **Tiempo Esperado:** < 10 segundos

#### **Test 2.1.2: Conversación Multi-turno**

- **Request:**
  ```json
  {
    "model": "deepseek-r1:1.5b",
    "messages": [
      {
        "role": "system",
        "content": "Eres un asistente útil y amable."
      },
      {
        "role": "user",
        "content": "¿Cuál es la capital de Francia?"
      },
      {
        "role": "assistant",
        "content": "La capital de Francia es París."
      },
      {
        "role": "user",
        "content": "¿Cuántos habitantes tiene?"
      }
    ],
    "temperature": 0.3,
    "max_tokens": 150
  }
  ```
- **Criterios de Éxito:**
  - ✅ Mantiene contexto de conversación
  - ✅ Respuesta relevante a la pregunta de seguimiento

#### **Test 2.1.3: Mensaje Largo (Edge Case)**

- **Request:**
  ```json
  {
    "model": "deepseek-r1:1.5b",
    "messages": [
      {
        "role": "user",
        "content": "Escribe un ensayo completo sobre los beneficios de la inteligencia artificial en la medicina. Debe tener al menos 500 palabras y cubrir temas como diagnóstico asistido por IA, descubrimiento de fármacos, telemedicina, y consideraciones éticas. Estructura el ensayo con introducción, cuerpo y conclusión."
      }
    ],
    "max_tokens": 1000,
    "temperature": 0.8
  }
  ```
- **Criterios de Éxito:**
  - ✅ Maneja mensajes largos correctamente
  - ✅ Genera respuesta coherente y estructurada
  - ✅ No trunca inesperadamente

### 2.2 Casos de Error

#### **Test 2.2.1: Modelo No Disponible**

- **Request:**
  ```json
  {
    "model": "deepseek-chat",
    "messages": [
      {
        "role": "user",
        "content": "Hola"
      }
    ]
  }
  ```
- **Expected Response:**
  - Status: `400 Bad Request`
  - Body: `{"detail":"Model not found"}`
- **Criterios de Éxito:**
  - ✅ Status 400
  - ✅ Mensaje de error claro

#### **Test 2.2.2: Payload Malformado - Sin Messages**

- **Request:**
  ```json
  {
    "model": "deepseek-r1:1.5b"
  }
  ```
- **Expected Response:**
  - Status: `400 Bad Request`
  - Body: `{"detail":"messages is required"}`
- **Criterios de Éxito:**
  - ✅ Status 400
  - ✅ Validación de campos requeridos

#### **Test 2.2.3: Payload Malformado - Messages Vacío**

- **Request:**
  ```json
  {
    "model": "deepseek-r1:1.5b",
    "messages": []
  }
  ```
- **Expected Response:**
  - Status: `400 Bad Request`
- **Criterios de Éxito:**
  - ✅ Status 400
  - ✅ Validación de array no vacío

#### **Test 2.2.4: Temperature Fuera de Rango**

- **Request:**
  ```json
  {
    "model": "deepseek-r1:1.5b",
    "messages": [{ "role": "user", "content": "Hola" }],
    "temperature": 3.0
  }
  ```
- **Expected Response:**
  - Status: `400 Bad Request`
- **Criterios de Éxito:**
  - ✅ Validación de parámetros

### 2.3 Edge Cases

#### **Test 2.3.1: Caracteres Especiales y Emojis**

- **Request:**
  ```json
  {
    "model": "deepseek-r1:1.5b",
    "messages": [
      {
        "role": "user",
        "content": "Explica qué significa este emoji: 🤖💻🚀 y cómo se relaciona con la programación"
      }
    ]
  }
  ```
- **Criterios de Éxito:**
  - ✅ Maneja caracteres Unicode correctamente
  - ✅ Respuesta coherente

#### **Test 2.3.2: Mensaje Muy Corto**

- **Request:**
  ```json
  {
    "model": "deepseek-r1:1.5b",
    "messages": [
      {
        "role": "user",
        "content": "?"
      }
    ],
    "max_tokens": 10
  }
  ```
- **Criterios de Éxito:**
  - ✅ Respuesta apropiada para input mínimo

#### **Test 2.3.3: Max Tokens Muy Alto**

- **Request:**
  ```json
  {
    "model": "deepseek-r1:1.5b",
    "messages": [{ "role": "user", "content": "Cuenta una historia" }],
    "max_tokens": 4000
  }
  ```
- **Criterios de Éxito:**
  - ✅ Maneja límites altos correctamente
  - ✅ No causa errores de memoria

#### **Test 2.3.4: Temperature = 0 (Determinístico)**

- **Request:**
  ```json
  {
    "model": "deepseek-r1:1.5b",
    "messages": [
      { "role": "user", "content": "Di un número aleatorio entre 1 y 10" }
    ],
    "temperature": 0,
    "max_tokens": 20
  }
  ```
- **Criterios de Éxito:**
  - ✅ Respuesta consistente en múltiples ejecuciones

#### **Test 2.3.5: Stream = true**

- **Request:**
  ```json
  {
    "model": "deepseek-r1:1.5b",
    "messages": [{ "role": "user", "content": "Cuenta hasta 5 lentamente" }],
    "stream": true,
    "max_tokens": 50
  }
  ```
- **Expected Response:**
  - Stream de datos SSE (Server-Sent Events)
- **Criterios de Éxito:**
  - ✅ Respuesta en formato stream
  - ✅ Múltiples chunks de datos

---

## 📊 3. ENDPOINT: POST /api/v1/completions (Si Disponible)

### 3.1 Pruebas Básicas

- **Nota:** Este endpoint puede no estar disponible en setups locales de DeepSeek
- **Request:**

  ```json
  POST {{base_url}}/completions
  Headers:
    Content-Type: application/json
    Authorization: Bearer {{api_key}}

  Body:
  {
    "model": "deepseek-r1:1.5b",
    "prompt": "Completa esta oración: El futuro de la IA es",
    "max_tokens": 50
  }
  ```

- **Expected Response:**
  - Status: `200 OK` o `404 Not Found`
- **Criterios de Éxito:**
  - ✅ Endpoint responde (aunque sea 404)

---

## ⚡ 4. PRUEBAS DE PERFORMANCE

### 4.1 Tiempos de Respuesta

#### **Test 4.1.1: Response Time - Mensaje Simple**

- **Request:** Chat simple (Test 2.1.1)
- **Métricas Esperadas:**
  - ✅ < 5 segundos para respuesta simple
  - ✅ < 15 segundos para respuesta compleja
  - ✅ < 30 segundos para respuesta máxima

#### **Test 4.1.2: Concurrent Requests**

- **Ejecutar Test 2.1.1** simultáneamente 3 veces
- **Criterios de Éxito:**
  - ✅ Todas las requests exitosas
  - ✅ No degradación significativa de performance

### 4.2 Rate Limiting

#### **Test 4.2.1: Rate Limit Detection**

- **Ejecutar Test 2.1.1** repetidamente por 1 minuto
- **Expected Response:**
  - Status: `429 Too Many Requests` (eventualmente)
- **Criterios de Éxito:**
  - ✅ Rate limiting funciona
  - ✅ Headers incluyen `X-RateLimit-*`

---

## 🔧 5. CONFIGURACIÓN DE INSOMNIA

### 5.1 Variables de Environment

```json
{
  "base_url": "http://localhost:8080/api/v1",
  "api_key": "sk-4a478b7a14c44e10b8342c526be652b7",
  "timeout": 30000,
  "test_model": "deepseek-r1:1.5b",
  "invalid_model": "deepseek-chat"
}
```

### 5.2 Tests Scripts (Para Automatización)

```javascript
// Test Script para validar respuestas
const response = pm.response.json();

pm.test('Status code is 200', function () {
  pm.response.to.have.status(200);
});

pm.test('Response has required fields', function () {
  pm.expect(response).to.have.property('choices');
  pm.expect(response.choices).to.be.an('array').that.is.not.empty;
  pm.expect(response.choices[0]).to.have.property('message');
  pm.expect(response.choices[0].message).to.have.property('content');
});

pm.test('Response time is acceptable', function () {
  pm.expect(pm.response.responseTime).to.be.below(10000);
});
```

### 5.3 Workflows Recomendados

1. **Workflow Básico:**
   - Test 1.2.1 → Test 2.1.1 → Test 2.1.2

2. **Workflow de Error:**
   - Test 2.2.1 → Test 2.2.2 → Test 2.2.3

3. **Workflow Completo:**
   - Todos los tests en orden secuencial

---

## 📈 6. REPORTING Y MÉTRICAS

### 6.1 Métricas a Capturar

- ✅ Tasa de éxito general
- ✅ Tiempos de respuesta promedio
- ✅ Tipos de errores más comunes
- ✅ Coverage de casos de prueba

### 6.2 Formato de Reporte

```markdown
## Reporte de Pruebas - API DeepSeek Local

### Resumen Ejecutivo

- **Fecha:** YYYY-MM-DD
- **Total Tests:** X
- **Tests Exitosos:** Y (Z%)
- **Tiempo Total:** W segundos

### Resultados por Endpoint

- **GET /models:** A/B tests exitosos
- **POST /chat/completions:** C/D tests exitosos

### Errores Identificados

- Lista de errores encontrados y recomendaciones

### Recomendaciones

- Próximos pasos para mejorar coverage
- Issues identificados para desarrollo
```

---

## 🚀 7. EJECUCIÓN Y AUTOMATIZACIÓN

### 7.1 Orden Recomendado de Ejecución

1. **Fase 1 - Conectividad:** Tests 1.1.x
2. **Fase 2 - Autenticación:** Tests 1.2.x
3. **Fase 3 - Funcionalidad Básica:** Tests 2.1.x
4. **Fase 4 - Manejo de Errores:** Tests 2.2.x
5. **Fase 5 - Edge Cases:** Tests 2.3.x
6. **Fase 6 - Performance:** Tests 4.x

### 7.2 Automatización con Newman (Opcional)

```bash
# Exportar colección de Insomnia como JSON
# Ejecutar con Newman
npx newman run deepseek-api-tests.json \
  --environment local-deepseek-env.json \
  --reporters cli,json \
  --reporter-json-export results.json
```

---

## 📝 8. CONSIDERACIONES ADICIONALES

### 8.1 Pre-requisitos

- ✅ Servidor DeepSeek ejecutándose en `localhost:8080`
- ✅ API Key válida configurada
- ✅ Conexión de red estable
- ✅ Insomnia instalado y configurado

### 8.2 Troubleshooting Común

- **Error 401:** Verificar API key
- **Error 400:** Verificar payload y modelo
- **Timeout:** Verificar estado del servidor
- **Error 404:** Verificar URL del endpoint

### 8.3 Versionado

- **v1.0:** Plan inicial completo
- **v1.1:** Agregar tests de streaming
- **v1.2:** Incluir tests de carga

---

**📧 Contacto:** Para preguntas sobre este plan de pruebas
**🔄 Actualización:** Revisar periódicamente conforme evolucione la API
