# 🧪 Guía de Pruebas para API Local DeepSeek

## 📋 Información General

Esta guía proporciona un plan completo y estructurado para probar la API local de DeepSeek usando Insomnia. Incluye tanto documentación detallada como archivos listos para importar.

## 📁 Archivos Incluidos

| Archivo                             | Descripción                                | Uso                          |
| ----------------------------------- | ------------------------------------------ | ---------------------------- |
| `plan-pruebas-insomnia-deepseek.md` | Documentación completa del plan de pruebas | Referencia detallada         |
| `insomnia-deepseek-tests.json`      | Colección de Insomnia lista para importar  | Importar directamente        |
| `verify-deepseek-server.js`         | Script de verificación rápida              | Diagnóstico rápido           |
| `test-deepseek-api.js`              | Tests automatizados completos              | Testing avanzado             |
| `codigo-corregido-deepseek.js`      | Código JavaScript corregido                | Referencia de implementación |

## 🚀 Inicio Rápido

### 1. Verificar Estado del Servidor

```bash
# Verificación rápida del estado
node verify-deepseek-server.js
```

### 2. Importar en Insomnia

1. Abrir Insomnia
2. **Application > Preferences > Data > Import Data > From File**
3. Seleccionar `insomnia-deepseek-tests.json`
4. Seleccionar Environment "Local DeepSeek"

### 3. Ejecutar Tests Básicos

1. Seleccionar carpeta "1. Models Endpoint"
2. Ejecutar "1.2.1 - Lista de Modelos (Con Auth)"
3. Verificar respuesta exitosa (Status 200)

## 📊 Estructura de las Pruebas

### 🗂️ Organización por Carpetas

```
📁 1. Models Endpoint
├── 1.1.1 - Conectividad Básica (Sin Auth)
└── 1.2.1 - Lista de Modelos (Con Auth)

📁 2. Chat Completions
├── 2.1.1 - Chat Simple (Caso Éxito)
├── 2.1.2 - Conversación Multi-turno
├── 2.3.1 - Caracteres Especiales
└── 2.3.4 - Temperature = 0

📁 3. Error Cases
├── 2.2.1 - Modelo No Disponible
└── 2.2.2 - Payload Sin Messages
```

### 🎯 Tipos de Pruebas Incluidas

| Tipo              | Descripción                 | Ejemplos    |
| ----------------- | --------------------------- | ----------- |
| **Conectividad**  | Verificar servidor responde | Tests 1.1.x |
| **Autenticación** | Validar API key             | Tests 1.2.x |
| **Casos Éxito**   | Funcionalidad normal        | Tests 2.1.x |
| **Casos Error**   | Manejo de errores           | Tests 2.2.x |
| **Edge Cases**    | Escenarios límite           | Tests 2.3.x |

## ⚙️ Configuración de Variables

### Variables de Environment (Insomnia)

```json
{
  "base_url": "http://localhost:8080/api/v1",
  "api_key": "sk-4a478b7a14c44e10b8342c526be652b7",
  "timeout": "30000",
  "test_model": "deepseek-r1:1.5b",
  "invalid_model": "deepseek-chat"
}
```

### Modelos Disponibles

- ✅ `deepseek-r1:1.5b` - Modelo principal (funciona)
- ✅ `arena-model` - Modelo alternativo
- ❌ `deepseek-chat` - No disponible (causa error 400)

## 🧪 Guías de Ejecución

### Orden Recomendado

1. **Fase 1**: Conectividad (`1. Models Endpoint`)
2. **Fase 2**: Funcionalidad básica (`2.1.1`, `2.1.2`)
3. **Fase 3**: Casos de error (`3. Error Cases`)
4. **Fase 4**: Edge cases (`2.3.x`)

### Tests Críticos

- ✅ **1.2.1**: Verificar modelos disponibles
- ✅ **2.1.1**: Chat completion básico
- ✅ **2.2.1**: Manejo de modelo inválido

## 🔍 Troubleshooting

### Problemas Comunes

| Problema      | Síntoma                | Solución                        |
| ------------- | ---------------------- | ------------------------------- |
| **Error 401** | "Not authenticated"    | Verificar API key               |
| **Error 400** | "Model not found"      | Usar `deepseek-r1:1.5b`         |
| **Timeout**   | Sin respuesta          | Verificar servidor ejecutándose |
| **Error 404** | Endpoint no encontrado | Verificar URL correcta          |

### Comandos de Diagnóstico

```bash
# Verificar servidor
curl -H "Authorization: Bearer sk-4a478b7a14c44e10b8342c526be652b7" \
     http://localhost:8080/api/v1/models

# Test básico de chat
curl -X POST http://localhost:8080/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-4a478b7a14c44e10b8342c526be652b7" \
  -d '{"model":"deepseek-r1:1.5b","messages":[{"role":"user","content":"Hola"}]}'
```

## 📈 Métricas y Reportes

### Métricas a Capturar

- ✅ Tasa de éxito por endpoint
- ✅ Tiempos de respuesta promedio
- ✅ Tipos de errores más comunes
- ✅ Coverage de casos de prueba

### Formato de Reporte

```markdown
## Reporte de Pruebas - API DeepSeek Local

### Resumen Ejecutivo

- **Fecha:** YYYY-MM-DD
- **Total Tests:** 8
- **Tests Exitosos:** 6 (75%)
- **Tiempo Promedio:** 2.3s

### Resultados por Endpoint

- **GET /models:** 2/2 ✅
- **POST /chat/completions:** 4/6 ⚠️

### Errores Identificados

- Modelo `deepseek-chat` no disponible
- Timeout en requests largos
```

## 🔄 Automatización

### Con Newman (CLI)

```bash
# Instalar Newman
npm install -g newman

# Ejecutar colección
newman run insomnia-deepseek-tests.json \
  --environment insomnia-deepseek-env.json \
  --reporters cli,json \
  --reporter-json-export results.json
```

### Tests Scripts en Insomnia

Cada request incluye tests automáticos que validan:

- ✅ Status codes correctos
- ✅ Estructura JSON válida
- ✅ Campos requeridos presentes
- ✅ Tiempos de respuesta aceptables

## 📝 Notas Importantes

### Pre-requisitos

- ✅ Servidor DeepSeek ejecutándose en `localhost:8080`
- ✅ API Key válida configurada
- ✅ Insomnia instalado (versión 8.0+)
- ✅ Node.js para scripts de testing

### Consideraciones de Performance

- **Tiempos esperados:** < 10s para requests normales
- **Rate limiting:** Verificar headers de respuesta
- **Concurrencia:** Máximo 3 requests simultáneas

### Versionado

- **v1.0**: Plan inicial con tests básicos
- **v1.1**: Agregar tests de streaming
- **v1.2**: Incluir tests de carga

## 📞 Soporte

Para preguntas sobre estas pruebas:

1. Revisar la documentación en `plan-pruebas-insomnia-deepseek.md`
2. Ejecutar `node verify-deepseek-server.js` para diagnóstico
3. Verificar logs del servidor DeepSeek

---

**🎯 Objetivo**: Proporcionar una suite de pruebas completa, reproducible y escalable para validar la funcionalidad de la API local DeepSeek.
