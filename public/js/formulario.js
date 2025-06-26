document.getElementById('gerarReceitaBtn').addEventListener('click', () => {
  const formData = {
    raca: document.getElementById('raca').value.trim(),
    peso: document.getElementById('peso').value.trim(),
    altura: document.getElementById('altura').value.trim(),
    idade: document.getElementById('idade').value.trim(),
    porte: document.getElementById('porte').value,
    atividade: document.getElementById('atividade').value,
    objetivo: document.getElementById('objetivo').value,
    restricoes: document.getElementById('restricoes').value.trim(),
    genero: document.querySelector('.gender-btn.bg-blue-600')?.dataset.genero || ''
  };


  const camposObrigatorios = ['raca', 'peso', 'altura', 'idade', 'porte', 'atividade', 'objetivo', 'genero'];
  const camposVazios = camposObrigatorios.filter(campo => !formData[campo]);

  if (camposVazios.length > 0) {
    alert('Por favor, preencha todos os campos obrigatórios antes de gerar a dieta.');
    return;
  }


  sessionStorage.setItem('formData', JSON.stringify(formData));


  window.location.href = '/pages/planos/';
});
