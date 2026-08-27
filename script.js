// ===== CONFIGURAÇÃO DO WHATSAPP =====
// Substitua o número abaixo pelo seu número de WhatsApp de atendimento.
const WHATSAPP_NUMBER = '5521996768132'; 

// ===== CONFIGURAÇÃO DO FORMINIT =====
// Cole o ID ou o endpoint completo do formulário do Forminit abaixo.
const FORMINIT_URL = 'https://forminit.com/f/xuln4myvz9f'; 

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('app-form');
  const formContent = document.getElementById('form-content');
  const successContent = document.getElementById('success-content');
  const formNotice = document.getElementById('form-notice');
  const waActionBtn = document.getElementById('wa-action-btn');

  // Limpa o estado de erro quando o usuário interage
  form.addEventListener('input', (e) => {
    const group = e.target.closest('.q-group');
    if (group) group.classList.remove('invalid');
    formNotice.classList.remove('show');
  });

  form.addEventListener('change', (e) => {
    const group = e.target.closest('.q-group');
    if (group) group.classList.remove('invalid');
    formNotice.classList.remove('show');
  });

  // Evento de Envio
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;
    let firstInvalidGroup = null;

    // Seleciona todos os grupos obrigatórios
    const requiredGroups = form.querySelectorAll('[data-required]');

    requiredGroups.forEach((group) => {
      let isGroupFilled = false;

      // Verifica Textareas/Inputs de texto, telefone e select
      const fields = group.querySelectorAll('textarea, input[type="text"], input[type="tel"], select');
      if (fields.length > 0) {
        fields.forEach((field) => {
          if (field.value && field.value.trim() !== '') {
            isGroupFilled = true;
          }
        });
      }

      // Verifica Radios
      const radioGroupAttr = group.querySelector('[data-radio-group]');
      if (radioGroupAttr) {
        const radioName = radioGroupAttr.getAttribute('data-radio-group');
        const checkedRadio = group.querySelector(`input[name="${radioName}"]:checked`);
        if (checkedRadio) {
          isGroupFilled = true;
        }
      }

      // Aplica classes de erro se inválido
      if (!isGroupFilled) {
        group.classList.add('invalid');
        isValid = false;
        if (!firstInvalidGroup) {
          firstInvalidGroup = group;
        }
      } else {
        group.classList.remove('invalid');
      }
    });

    if (!isValid) {
      formNotice.classList.add('show');
      if (firstInvalidGroup) {
        firstInvalidGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Desabilita o botão de submit e mostra "Enviando..."
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Enviar Minha Aplicação';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Enviando...';
    }

    // Coleta dos dados do formulário
    const formData = new FormData(form);
    const data = {
      nome: formData.get('nome'),
      whatsapp: formData.get('whatsapp'),
      negocio: formData.get('negocio'),
      produto_digital: formData.get('produto_digital'),
      faturamento: formData.get('faturamento'),
      dificuldade: formData.get('dificuldade')
    };

    // Geração da mensagem formatada para o WhatsApp
    const message = [
      '*SESSÃO ESTRATÉGICA*',
      '',
      `*Nome:* ${data.nome}`,
      `*WhatsApp:* ${data.whatsapp}`,
      '',
      `*1. O que vende ou deseja vender:*`,
      data.negocio,
      '',
      `*2. Já tem um produto digital?* ${data.produto_digital}`,
      `*3. Qual a média do faturamento mensal?* ${data.faturamento}`,
      '',
      `*4. Maior dificuldade hoje:*`,
      data.dificuldade
    ].join('\n');

    // Envia os dados para o Forminit e aguarda o término da requisição
    if (FORMINIT_URL) {
      const formDataToSend = new FormData();
      formDataToSend.append('fi-text-NomeCompleto', data.nome);
      formDataToSend.append('fi-text-WhatsApp', data.whatsapp);
      formDataToSend.append('fi-text-SobreONegocio', data.negocio);
      formDataToSend.append('fi-text-JaTemProdutoDigital', data.produto_digital);
      formDataToSend.append('fi-text-FaturamentoMensal', data.faturamento);
      formDataToSend.append('fi-text-MaiorDificuldade', data.dificuldade);

      try {
        await fetch(FORMINIT_URL, {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          },
          body: formDataToSend
        });
        console.log('Dados enviados ao Forminit com sucesso!');
      } catch (err) {
        console.warn('Erro ao enviar dados para o Forminit:', err);
      }
    }

    // Restaura o botão de submit
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    // Dispara Evento de Lead no Meta Pixel (se existir na página)
    try {
      if (typeof fbq === 'function') {
        fbq('track', 'Lead');
      }
    } catch (err) {
      console.warn('Meta Pixel não inicializado ou bloqueado:', err);
    }

    // Configura o link do botão de ação da tela de sucesso
    waActionBtn.href = whatsappUrl;

    // Transição de tela (Oculta formulário, exibe sucesso)
    formContent.style.display = 'none';
    successContent.style.display = 'block';

    // Rola de volta para o topo da coluna do formulário
    const formContainer = document.getElementById('form-container');
    if (formContainer) {
      formContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Redireciona a página atual para o WhatsApp automaticamente após 1.5 segundos
    setTimeout(() => {
      window.location.href = whatsappUrl;
    }, 1500);
  });
});

// ===== TRAVAMENTO DE ZOOM NO MOBILE (SAFARI/iOS E OUTROS NAVEGADORES) =====
// Impede o gesto de pinça (pinch-to-zoom) e zoom por escala
document.addEventListener('touchmove', function (event) {
  if (event.scale !== undefined && event.scale !== 1) {
    event.preventDefault();
  }
}, { passive: false });

document.addEventListener('touchstart', function (event) {
  if (event.touches.length > 1) {
    event.preventDefault();
  }
}, { passive: false });

// Impede o duplo toque rápido para dar zoom (double-tap zoom)
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
  const now = (new Date()).getTime();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);

// Impede gestos nativos do Safari
document.addEventListener('gesturestart', function (event) {
  event.preventDefault();
});

