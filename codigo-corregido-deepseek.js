/**
 * Código corregido para llamar a la API local de DeepSeek
 * Basado en el análisis y tests realizados
 */

async function llamarApiDeepseekCorregida() {
    // API Key correcta (ya estaba bien configurada)
    const API_KEY = 'sk-4a478b7a14c44e10b8342c526be652b7';

    // Endpoint correcto
    const url = 'http://localhost:8080/api/v1/chat/completions';

    // CORRECCIÓN PRINCIPAL: Cambiar el modelo a uno que existe
    const data = {
        "model": "deepseek-r1:1.5b", // ✅ Modelo correcto disponible en el servidor
        "messages": [
            {
                "role": "system",
                "content": "Eres un asistente de programación y lógica útil, que responde de manera concisa."
            },
            {
                "role": "user",
                "content": "Explica la diferencia entre un bucle 'for' y un bucle 'while'."
            }
        ],
        "temperature": 0.7,
        "max_tokens": 200,
        "stream": false
    };

    console.log('🚀 Enviando request a DeepSeek API...');
    console.log(`📋 Modelo: ${data.model}`);
    console.log(`🔗 Endpoint: ${url}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}` // ✅ Autenticación correcta
            },
            body: JSON.stringify(data)
        });

        console.log(`📊 Código de respuesta: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error en la solicitud:', errorText);
            throw new Error(`Error HTTP ${response.status}: ${errorText}`);
        }

        const jsonResponse = await response.json();
        console.log('✅ ¡Respuesta exitosa!');
        console.log('🤖 Respuesta del modelo:');
        console.log(jsonResponse.choices[0].message.content);

        // Información adicional útil
        console.log('\n📊 Información de uso:');
        console.log(`   • Tokens totales: ${jsonResponse.usage?.total_tokens || 'N/A'}`);
        console.log(`   • Tokens de respuesta: ${jsonResponse.usage?.completion_tokens || 'N/A'}`);
        console.log(`   • Modelo usado: ${jsonResponse.model}`);

        return jsonResponse;

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    }
}

// Función para verificar modelos disponibles antes de usar la API
async function verificarModelosDisponibles() {
    const API_KEY = 'sk-4a478b7a14c44e10b8342c526be652b7';

    try {
        console.log('🔍 Verificando modelos disponibles...');
        const response = await fetch('http://localhost:8080/api/v1/models', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('📋 Modelos disponibles:', data.data.map(m => m.id));
            return data.data;
        } else {
            console.error('❌ Error obteniendo modelos:', response.status);
            return null;
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        return null;
    }
}

// Ejecutar la función corregida
async function main() {
    try {
        // Primero verificar qué modelos están disponibles
        await verificarModelosDisponibles();

        console.log('\n' + '='.repeat(50) + '\n');

        // Luego ejecutar la request corregida
        await llamarApiDeepseekCorregida();

    } catch (error) {
        console.error('❌ Error en main:', error.message);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

module.exports = {
    llamarApiDeepseekCorregida,
    verificarModelosDisponibles
};