#!/usr/bin/env node

/**
 * Script rápido para verificar el estado del servidor DeepSeek
 * Uso: node verify-deepseek-server.js
 */

const API_KEY = 'sk-4a478b7a14c44e10b8342c526be652b7';

async function verificarEstadoServidor() {
    console.log('🔍 Verificando servidor DeepSeek en localhost:8080...\n');

    try {
        // Verificar endpoint de modelos
        console.log('1. Verificando endpoint /api/v1/models...');
        const modelsResponse = await fetch('http://localhost:8080/api/v1/models', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (modelsResponse.ok) {
            const modelsData = await modelsResponse.json();
            console.log('   ✅ Endpoint de modelos funciona');
            console.log(`   📋 Modelos disponibles: ${modelsData.data.map(m => m.id).join(', ')}\n`);
        } else {
            console.log(`   ❌ Error en modelos: ${modelsResponse.status} ${modelsResponse.statusText}\n`);
        }

        // Verificar endpoint de chat completions
        console.log('2. Verificando endpoint /api/v1/chat/completions...');
        const chatResponse = await fetch('http://localhost:8080/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 10
            })
        });

        if (chatResponse.ok) {
            const chatData = await chatResponse.json();
            console.log('   ✅ Endpoint de chat funciona');
            console.log(`   🤖 Respuesta de prueba: ${chatData.choices[0].message.content}\n`);
        } else {
            console.log(`   ❌ Error en chat: ${chatResponse.status} ${chatResponse.statusText}`);

            if (chatResponse.status === 400) {
                console.log('   💡 Error 400 - Causas comunes:');
                console.log('      • Modelo no soportado');
                console.log('      • Parámetros inválidos');
                console.log('      • Autenticación requerida');
            }

            try {
                const errorBody = await chatResponse.text();
                console.log(`   📄 Detalles del error: ${errorBody}\n`);
            } catch (e) {
                console.log('   📄 No se pudieron obtener detalles del error\n');
            }
        }

    } catch (error) {
        console.log('❌ Error de conexión:');
        console.log(`   ${error.message}`);
        console.log('\n💡 Verifica que:');
        console.log('   • El servidor DeepSeek esté ejecutándose');
        console.log('   • El puerto 8080 esté disponible');
        console.log('   • No haya firewall bloqueando la conexión\n');
    }

    // Mostrar comandos de troubleshooting
    console.log('🔧 Comandos de troubleshooting:');
    console.log('   • Ver procesos en puerto 8080: lsof -i :8080');
    console.log('   • Verificar conectividad: curl http://localhost:8080/api/v1/models');
    console.log('   • Ejecutar tests completos: node test-deepseek-api.js --test');
}

async function probarSinAuth() {
    console.log('\n🔓 Probando sin autenticación...\n');

    try {
        const response = await fetch('http://localhost:8080/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 10
            })
        });

        if (response.ok) {
            console.log('✅ Funciona sin autenticación');
            const data = await response.json();
            console.log(`🤖 Respuesta: ${data.choices[0].message.content}`);
        } else {
            console.log(`❌ También falla sin auth: ${response.status}`);
        }
    } catch (error) {
        console.log(`❌ Error sin auth: ${error.message}`);
    }
}

// Ejecutar verificación
verificarEstadoServidor()
    .then(() => probarSinAuth())
    .catch(console.error);