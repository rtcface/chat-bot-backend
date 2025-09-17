# Chatbot Backend API

Una API backend completa para chatbot con soporte multi-proveedor de IA, utilizando el patrón Adapter para integración flexible con diferentes modelos de IA.

## 🚀 Características

- **Patrón Adapter**: Integración flexible con múltiples proveedores de IA (DeepSeek, OpenAI, Claude, Gemini)
- **Autenticación JWT**: Sistema seguro de autenticación con API keys
- **Gestión de Conversaciones**: Historial completo con paginación y contexto
- **Configuración de Roles**: Roles dinámicos para personalizar el comportamiento del chatbot
- **Rate Limiting**: Protección contra abuso con Redis
- **Documentación Swagger**: API completamente documentada
- **Arquitectura Modular**: Fácil de extender y mantener

## 🛠️ Tecnologías

- **Framework**: NestJS (Node.js/TypeScript)
- **Base de Datos**: PostgreSQL con TypeORM
- **Cache**: Redis para sesiones y rate limiting
- **Autenticación**: JWT + API Keys
- **Documentación**: Swagger/OpenAPI
- **Testing**: Jest con cobertura completa

## 📋 Prerrequisitos

- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- npm o yarn

## 🚀 Instalación y Configuración

### 1. Clona el repositorio
```bash
git clone <repository-url>
cd chatbot-backend
```

### 2. Instala dependencias
```bash
npm install
```

### 3. Configura variables de entorno
Copia el archivo de ejemplo y configura tus variables:
```bash
cp .env.example .env
```

Edita `.env` con tus configuraciones:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=chatbot_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1h

# AI Providers (configura según necesites)
DEEPSEEK_API_KEY=your_deepseek_api_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### 4. Configura la base de datos
```bash
# Asegúrate de que PostgreSQL esté ejecutándose
# Crea la base de datos:
createdb chatbot_db
```

### 5. Ejecuta las migraciones
```bash
npm run start:dev
# Las entidades se sincronizarán automáticamente en desarrollo
```

## 🏃‍♂️ Ejecución

### Desarrollo
```bash
npm run start:dev
```

### Producción
```bash
npm run build
npm run start:prod
```

### Con Docker
```bash
# Construir y ejecutar con Docker Compose
docker-compose up --build
```

## 📚 Documentación de la API

Una vez que la aplicación esté ejecutándose, accede a la documentación Swagger:

- **Swagger UI**: http://localhost:3000/api
- **OpenAPI JSON**: http://localhost:3000/api-json

## 🔐 Autenticación

### 1. Registro de Usuario
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

### 2. Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### 3. Generar API Key
```bash
POST /auth/api-keys
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "My API Key",
  "permissions": ["read", "write"]
}
```

## 💬 Uso del Chatbot

### Enviar Mensaje
```bash
POST /chat/send
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content": "Hola, ¿cómo estás?",
  "conversationId": "optional-conversation-id",
  "roleId": "optional-role-id",
  "temperature": 0.7
}
```

### Obtener Historial de Conversación
```bash
GET /chat/conversations/{conversationId}
Authorization: Bearer <jwt_token>
```

### Listar Conversaciones
```bash
GET /chat/conversations?page=1&limit=20
Authorization: Bearer <jwt_token>
```

## 🧪 Testing

### Ejecutar todos los tests
```bash
npm test
```

### Tests con cobertura
```bash
npm run test:cov
```

### Tests E2E
```bash
npm run test:e2e
```

## 🏗️ Arquitectura

```
src/
├── adapters/           # Adaptadores IA (Adapter Pattern)
│   ├── deepseek/       # Adaptador DeepSeek
│   ├── base/          # Clase base para adaptadores
│   └── interfaces/    # Interfaces comunes
├── auth/              # Módulo de autenticación
├── chat/              # Módulo principal de chat
├── conversations/     # Gestión de conversaciones
├── roles/             # Configuración de roles
├── core/              # Utilidades core (health checks)
├── shared/            # DTOs, entidades, utilidades
└── config/            # Configuraciones
```

## 🔧 Extensibilidad

### Agregar Nuevo Proveedor de IA

1. Crea un nuevo adaptador en `src/adapters/`:
```typescript
@Injectable()
export class NewProviderAdapter extends BaseAiAdapter {
  // Implementa los métodos requeridos
}
```

2. Registra el adaptador en el módulo de chat
3. Actualiza la configuración de variables de entorno

### Agregar Nuevo Rol

```bash
POST /roles
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Expert Programmer",
  "description": "Specialized in programming assistance",
  "systemPrompt": "You are an expert programmer with 10+ years of experience...",
  "configuration": {
    "temperature": 0.3,
    "maxTokens": 2000
  }
}
```

## 📊 Monitoreo

### Health Check
```bash
GET /health
```

### Health Check Detallado
```bash
GET /health/detailed
```

## 🚀 Despliegue

### Con Docker
```bash
# Construir imagen
docker build -t chatbot-backend .

# Ejecutar contenedor
docker run -p 3000:3000 --env-file .env chatbot-backend
```

### Con Docker Compose (Recomendado)
```bash
# Incluye PostgreSQL, Redis y la aplicación
docker-compose up -d
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Para soporte, por favor crea un issue en el repositorio de GitHub.

---

**Desarrollado con ❤️ usando NestJS**
