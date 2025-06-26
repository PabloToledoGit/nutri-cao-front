
function showMessage(message, isError = false) {
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');

    if (messageBox && messageText) {
        messageText.textContent = message;
        messageBox.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
        messageBox.style.color = isError ? '#721c24' : '#155724';
        messageBox.style.borderColor = isError ? '#f5c6cb' : '#c3e6cb';
        messageBox.style.display = 'block';

        if (!isError) {
            setTimeout(() => {
                messageBox.style.display = 'none';
            }, 5000);
        }
    } else {
        if (isError) {
            console.error('Erro:', message);
        } else {
            console.log('Mensagem:', message);
        }
    }
}

document.getElementById('pixForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Impede o recarregamento da página

    // Mostrar loading (opcional)
    const btn = document.querySelector('.btn-primary');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Gerando...';
    btn.disabled = true;

    try {
        await criarPagamento(); // Chama sua função de criação de pagamento
    } catch (error) {
        console.error('Erro ao gerar o PIX:', error);
        showMessage('Ocorreu um erro ao gerar o PIX: ' + error.message, true);
    } finally {
        // Restaurar botão
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

// Adicione também o evento de copiar código
document.getElementById('copyPixBtn').addEventListener('click', function () {
    const pixCode = document.getElementById('pixCode').textContent;

    // Cria um elemento textarea temporário para copiar o texto
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = pixCode;
    document.body.appendChild(tempTextArea);
    tempTextArea.select(); // Seleciona o texto dentro do textarea

    try {
        const successful = document.execCommand('copy'); // Tenta copiar
        if (successful) {
            showMessage('Código PIX copiado!', false);
        } else {
            showMessage('Falha ao copiar o código PIX. Por favor, copie manualmente.', true);
        }
    } catch (err) {
        showMessage('Falha ao copiar o código PIX: ' + err.message, true);
    } finally {
        document.body.removeChild(tempTextArea); // Remove o textarea temporário
    }
});

// Sua função existente (mantida igual)
function obterValorDoPlano() {
    const plano = sessionStorage.getItem('planoEscolhido');

    if (!plano) {
        showMessage('Nenhum plano selecionado. Por favor, volte e selecione um plano.', true);
        // Redireciona o usuário, pois não há plano selecionado
        window.location.href = 'planos.html';
        return null; // Retorna null para evitar prosseguir sem valor
    }

    const valores = {
        vitalidade: 14.90,
        controlePeso: 9.99,
        emagrecimento: 12.90,
    };

    return valores[plano] || null;
}

const criarPagamento = async () => {
    const email = document.getElementById('email').value;
    const nome = document.getElementById('nome').value;
    const petNome = document.getElementById('petNome').value;
    const formData = JSON.parse(sessionStorage.getItem('formData'));
    const valor = obterValorDoPlano();

    if (!email || !nome || !petNome || !formData || !valor) {
        showMessage('Preencha todos os dados corretamente antes de prosseguir!', true);
        return;
    }

    if (!formData.raca) {
        showMessage('Informação sobre a raça do pet está faltando no formulário.', true);
        return;
    }

    try {
        const response = await fetch('https://nutri-cao.vercel.app/api/criar-pagamento', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                nome,
                petNome,
                formData,
                valor,
                tipoReceita: sessionStorage.getItem('planoEscolhido') // Adicionado aqui!
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            // Lança um erro com a mensagem do backend, se disponível
            throw new Error(data.error || 'Erro desconhecido ao criar pagamento');
        }

        console.log('Pagamento criado com sucesso:', data);

        // Exibe na tela o QRCode PIX e outras informações
        document.getElementById('pixCode').textContent = data.qrCode;
        document.getElementById('pixQRCode').src = `data:image/png;base64,${data.qrCodeBase64}`;
        document.getElementById('pixResult').style.display = 'block';

        // Rolagem suave até a seção do resultado do PIX
        document.getElementById('pixResult').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Erro na criação do pagamento:', error);
        showMessage('Erro na criação do pagamento: ' + error.message, true);
    }
};

