# 🧪 Guía de Pruebas para API Chatbot Backend - NestJS

## 📋 Información General

Esta guía proporciona un plan completo y estructurado para probar la API del backend de chatbot desarrollado en NestJS. Incluye tanto documentación detallada como archivos listos para importar en Insomnia.

## 📁 Archivos Incluidos

| Archivo                           | Descripción                                  | Uso                       |
| --------------------------------- | -------------------------------------------- | ------------------------- |
| `plan-pruebas-chatbot-api.md`     | Documentación completa del plan de pruebas   | Referencia detallada      |
| `insomnia-chatbot-api-tests.json` | Colección de Insomnia lista para importar    | Importar directamente     |
| `verify-deepseek-server.js`       | Script de verificación del servidor DeepSeek | Diagnóstico de IA         |
| `test-deepseek-api.js`            | Tests automatizados para API DeepSeek        | Testing de integración IA |

## 🚀 Inicio Rápido

### 1. Verificar Estado de Servicios

```bash
# Verificar que PostgreSQL esté ejecutándose
ps aux | grep postgres

# Verificar que Redis esté ejecutándose
redis-cli ping

# Verificar que la aplicación NestJS esté ejecutándose
curl http://localhost:3000/health
```

### 2. Importar en Insomnia

1. Abrir Insomnia
2. **Application > Preferences > Data > Import Data > From File**
3. Seleccionar `insomnia-chatbot-api-tests.json`
4. Seleccionar Environment "Local NestJS"

### 3. Configurar Variables de Entorno

```bash
# Archivo .env en el proyecto
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_DATABASE=chatbot_db
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h
DEEPSEEK_API_KEY=sk-4a478b7a14c44e10b8342c526be652b7
```

### 4. Ejecutar Tests Básicos

1. Seleccionar carpeta "3. Health & System"
2. Ejecutar "7.1.1 - Health Check Básico"
3. Verificar respuesta exitosa (Status 200)

## 📊 Estructura de las Pruebas

### 🗂️ Organización por Carpetas

```
📁 1. Authentication
├── Registro de usuarios
├── Login y autenticación
├── Gestión de API keys
└── Perfil de usuario

📁 2. Chat & Conversations
├── Envío de mensajes
├── Gestión de conversaciones
├── Historial de mensajes
└── Operaciones CRUD de conversaciones

📁 3. Health & System
├── Health checks básicos
└── Health checks detallados
```

### 🎯 Tipos de Pruebas Incluidas

| Tipo               | Descripción          | Ejemplos                   |
| ------------------ | -------------------- | -------------------------- |
| **Autenticación**  | JWT, registro, login | Tests 1.x, 2.x, 3.x        |
| **Autorización**   | Guards, permisos     | Tests con Bearer token     |
| **Validación**     | DTOs, pipes          | Tests de campos requeridos |
| **Integración IA** | DeepSeek API         | Tests 5.x                  |
| **Gestión DB**     | CRUD operations      | Tests de conversaciones    |
| **Health Checks**  | System status        | Tests 7.x                  |

## ⚙️ Configuración de Insomnia

### Variables de Environment (Insomnia)

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

### Flujo de Autenticación

1. **Registro/Login** → Guarda JWT token
2. **Usar JWT** → En headers de requests autenticadas
3. **Crear conversación** → Guarda conversation_id
4. **Enviar mensajes** → Usar conversation_id guardada

## 🧪 Guías de Ejecución

### Orden Recomendado de Ejecución

#### **Fase 1: Health & Setup**

1. `7.1.1 - Health Check Básico`
2. `7.1.2 - Health Check Detallado`

#### **Fase 2: Autenticación**

1. `1.1.1 - Registro Exitoso`
2. `2.1.1 - Login Exitoso`
3. `3.1.1 - Obtener Perfil`
4. `4.1.1 - Generar API Key`

#### **Fase 3: Funcionalidad Core**

1. `5.1.1 - Enviar Mensaje Simple`
2. `6.1.1 - Listar Conversaciones`
3. `6.1.2 - Crear Conversación`
4. `6.1.3 - Obtener Historial`

#### **Fase 4: Casos de Error**

1. `1.2.1 - Email Duplicado`
2. `2.2.1 - Credenciales Incorrectas`
3. `5.2.1 - Sin Autenticación`

#### **Fase 5: Cleanup**

1. `6.1.4 - Eliminar Conversación`

### Tests Críticos

- ✅ **7.1.1**: Verificar servicio operativo
- ✅ **1.1.1**: Registro exitoso
- ✅ **2.1.1**: Login exitoso
- ✅ **5.1.1**: Chat completion funcional
- ✅ **6.1.3**: Historial de conversaciones

## 🔍 Troubleshooting

### Problemas Comunes

| Problema         | Síntoma               | Solución                      |
| ---------------- | --------------------- | ----------------------------- |
| **Error 500**    | Internal Server Error | Revisar logs de NestJS        |
| **Error 401**    | Unauthorized          | Verificar JWT token           |
| **Error 400**    | Bad Request           | Validar payload JSON          |
| **ECONNREFUSED** | Conexión rechazada    | Verificar puerto 3000         |
| **Timeout**      | Sin respuesta         | Verificar DB/Redis conectados |

### Comandos de Diagnóstico

```bash
# Verificar aplicación NestJS
curl http://localhost:3000/health

# Verificar base de datos
psql -h localhost -U postgres -d chatbot_db -c "SELECT 1;"

# Verificar Redis
redis-cli -h localhost -p 6379 ping

# Verificar DeepSeek API
curl -H "Authorization: Bearer sk-4a478b7a14c44e10b8342c526be652b7" \
     http://localhost:8080/api/v1/models

# Ver logs de la aplicación
tail -f logs/application.log
```

### Logs de NestJS

```bash
# Ver logs en desarrollo
npm run start:dev

# Ver logs de producción
tail -f /var/log/chatbot-backend/app.log
```

## 📈 Métricas y Reportes

### Métricas a Capturar

- ✅ Tasa de éxito por módulo (Auth, Chat, Health)
- ✅ Tiempos de respuesta promedio
- ✅ Cobertura de casos de prueba
- ✅ Errores más comunes por tipo

### Formato de Reporte

```markdown
## Reporte de Pruebas - API Chatbot Backend

### Resumen Ejecutivo

- **Fecha:** YYYY-MM-DD
- **Total Tests:** 12
- **Tests Exitosos:** 10 (83%)
- **Tiempo Total:** 25 segundos

### Resultados por Módulo

- **Authentication:** 6/7 ✅ (86%)
- **Chat:** 4/4 ✅ (100%)
- **Health:** 2/2 ✅ (100%)

### Problemas Identificados

- Rate limiting no configurado en algunos endpoints
- Validación de entrada podría ser más estricta
```

## 🔄 Automatización

### Con Newman (CLI)

```bash
# Instalar Newman
npm install -g newman

# Ejecutar tests completos
npx newman run insomnia-chatbot-api-tests.json \
  --environment insomnia-chatbot-env.json \
  --reporters cli,json,html \
  --reporter-json-export results.json \
  --reporter-html-export report.html
```

### Tests de Regresión

- **Diario:** Health checks + login flow
- **Semanal:** Suite completa de pruebas
- **Post-deploy:** Todos los tests críticos

### Integración CI/CD

```yaml
# .github/workflows/api-tests.yml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run API tests
        run: npx newman run insomnia-chatbot-api-tests.json
```

## 📝 Notas Importantes

### Pre-requisitos

- ✅ PostgreSQL 15+ ejecutándose en puerto 5432
- ✅ Redis 7+ ejecutándose en puerto 6379
- ✅ Node.js 18+ instalado
- ✅ Variables de entorno configuradas
- ✅ Base de datos inicializada con `init-db.sql`

### Base de Datos

- **Esquema:** TypeORM maneja automáticamente
- **Datos de Prueba:** Tests crean usuarios automáticamente
- **Limpieza:** Tests incluyen eliminación de datos de prueba

### Consideraciones de Seguridad

- **JWT Secret:** Cambiar en producción
- **API Keys:** Rotar periódicamente
- **Rate Limiting:** Configurar límites apropiados
- **CORS:** Configurar orígenes permitidos

### Variables de Entorno Requeridas

```bash
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_DATABASE=chatbot_db

# Cache
REDIS_HOST=localhost
REDIS_PORT=6379

# Seguridad
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h

# IA Integration
DEEPSEEK_API_KEY=your-deepseek-api-key-here

# Aplicación
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3001
```

## 🎯 Próximos Pasos

1. **Importar** colección en Insomnia
2. **Configurar** variables de entorno
3. **Ejecutar** tests de health primero
4. **Verificar** autenticación completa
5. **Probar** funcionalidad de chat
6. **Documentar** resultados y anomalías

## 📞 Soporte

Para preguntas sobre estas pruebas:

1. Revisar la documentación en `plan-pruebas-chatbot-api.md`
2. Verificar logs de la aplicación NestJS
3. Revisar configuración de base de datos y Redis
4. Verificar conectividad con API de DeepSeek

---

**🎯 Objetivo**: Proporcionar una suite de pruebas completa, estructurada y automatizable para validar todas las funcionalidades del backend de chatbot, asegurando calidad y confiabilidad en el desarrollo y deployment.
