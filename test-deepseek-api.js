/**
 * Script mejorado para probar la API local de DeepSeek
 * Incluye verificaciones de conectividad y opciones de debugging
 */

async function verificarServidorDeepSeek() {
    console.log('🔍 Verificando conectividad del servidor DeepSeek...');

    const API_KEY = 'sk-4a478b7a14c44e10b8342c526be652b7';

    try {
        const response = await fetch('http://localhost:8080/api/v1/models', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Servidor DeepSeek está activo');
            console.log('📋 Modelos disponibles:', data.data.map(m => m.id));
            return data.data;
        } else {
            console.log(`❌ Servidor responde con código: ${response.status}`);
            if (response.status === 401) {
                console.log('🔐 El servidor requiere autenticación');
            }
            return null;
        }
    } catch (error) {
        console.error('❌ Error conectando al servidor:', error.message);
        console.log('💡 Asegúrate de que el servidor DeepSeek esté ejecutándose en localhost:8080');
        return null;
    }
}

async function probarApiDeepSeek(modelo = 'deepseek-chat', usarAuth = true) {
    const API_KEY = 'sk-4a478b7a14c44e10b8342c526be652b7';

    const url = 'http://localhost:8080/api/v1/chat/completions';

    const data = {
        "model": modelo,
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

    const headers = {
        'Content-Type': 'application/json',
    };

    if (usarAuth) {
        headers['Authorization'] = `Bearer ${API_KEY}`;
        console.log('🔐 Usando autenticación con API Key');
    } else {
        console.log('🔓 Probando sin autenticación');
    }

    console.log(`🚀 Probando modelo: ${modelo}`);
    console.log(`📡 Endpoint: ${url}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });

        console.log(`📊 Código de respuesta: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error en la solicitud:', errorText);

            if (response.status === 400) {
                console.log('💡 Error 400 - Posibles causas:');
                console.log('   • Modelo no soportado');
                console.log('   • Parámetros inválidos');
                console.log('   • Formato de mensaje incorrecto');
            } else if (response.status === 401) {
                console.log('💡 Error 401 - Autenticación requerida o inválida');
            } else if (response.status === 404) {
                console.log('💡 Error 404 - Endpoint no encontrado');
            }

            return null;
        }

        const jsonResponse = await response.json();
        console.log('✅ Respuesta exitosa!');
        console.log('🤖 Respuesta del modelo:', jsonResponse.choices[0].message.content);
        console.log('📊 Uso de tokens:', jsonResponse.usage);

        return jsonResponse;

    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        return null;
    }
}

async function ejecutarTestsCompletos() {
    console.log('🧪 Iniciando tests completos de la API DeepSeek...\n');

    // Paso 1: Verificar servidor
    const modelos = await verificarServidorDeepSeek();

    if (!modelos) {
        console.log('❌ No se puede continuar sin servidor activo');
        return;
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Paso 2: Probar diferentes configuraciones
    const configuraciones = [
        { modelo: 'deepseek-chat', auth: true, descripcion: 'Modelo estándar con auth' },
        { modelo: 'deepseek-chat', auth: false, descripcion: 'Modelo estándar sin auth' },
        { modelo: 'deepseek-r1:1.5b', auth: true, descripcion: 'Modelo original con auth' },
        { modelo: 'deepseek-r1:1.5b', auth: false, descripcion: 'Modelo original sin auth' },
    ];

    for (const config of configuraciones) {
        console.log(`\n🔬 Probando: ${config.descripcion}`);
        await probarApiDeepSeek(config.modelo, config.auth);
        console.log('-'.repeat(30));
    }

    console.log('\n✨ Tests completados');
}

// Función principal
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--verify')) {
        await verificarServidorDeepSeek();
    } else if (args.includes('--test')) {
        await ejecutarTestsCompletos();
    } else if (args.includes('--simple')) {
        await probarApiDeepSeek();
    } else {
        console.log('📖 Uso del script:');
        console.log('  node test-deepseek-api.js --verify    # Solo verificar servidor');
        console.log('  node test-deepseek-api.js --test      # Ejecutar tests completos');
        console.log('  node test-deepseek-api.js --simple    # Probar configuración básica');
        console.log('  node test-deepseek-api.js             # Mostrar esta ayuda');
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    verificarServidorDeepSeek,
    probarApiDeepSeek,
    ejecutarTestsCompletos
};