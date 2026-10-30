/* Conteúdo autoral educativo. Endereços .example são fictícios e não são links. */
window.SCSafetyData = {
  id: 'seguranca-digital',
  modules: [
    {
      id: 'internet', title: 'Segurança na internet', heading: 'Cuidado também faz parte de estar conectado',
      explanation: 'Golpes digitais são tentativas de enganar alguém para obter dinheiro ou informações. Podem parecer uma conversa comum. Qualquer pessoa pode ser enganada; pedir ajuda é uma boa atitude.',
      simple: ['Uma mensagem pode tentar enganar você.', 'Isso pode acontecer com qualquer pessoa.', 'Pare antes de pagar ou enviar informações.'],
      tips: ['Não compartilhe senhas, códigos de confirmação ou dados completos de cartão.', 'Desconfie de mensagens que exigem uma decisão imediata.', 'Confirme pedidos por um canal que você já conhece.'],
      example: 'Uma mensagem diz: “Sua conta será bloqueada em cinco minutos. Envie sua senha agora.” O prazo curto tenta impedir que você confira o pedido.',
      question: 'Uma mensagem urgente pede sua senha. Qual é o próximo passo?',
      options: ['Enviar a senha para resolver logo', 'Parar e conferir pelo aplicativo ou telefone oficial', 'Encaminhar a senha para um amigo'], correct: 1,
      feedback: 'A pressa pode esconder um golpe. Não envie sua senha. Abra o aplicativo oficial ou procure o telefone que você já conhece.'
    },
    {
      id: 'whatsapp', title: 'Golpes no WhatsApp', heading: 'Confirme quem está do outro lado',
      explanation: 'Alguém pode usar a foto de um familiar, dizer que mudou de número ou assumir uma conta para pedir dinheiro. Nome e foto conhecidos não confirmam a identidade. Nunca repasse um código recebido por SMS.',
      simple: ['Uma foto conhecida pode estar em um perfil falso.', 'Um pedido urgente de PIX precisa de confirmação.', 'Ligue para o número que você já conhecia.'],
      tips: ['Desconfie de “troquei de número” junto com um pedido de dinheiro.', 'Confirme por outro meio, mesmo que a mensagem venha de uma conta conhecida.', 'Não envie códigos: eles podem permitir que outra pessoa entre na sua conta.'],
      example: 'Exemplo fictício: “Oi mãe, troquei de número. Preciso pagar uma conta urgente. Você consegue fazer um PIX para mim?”',
      question: 'O que você faria?', options: ['Faria o PIX', 'Ligaria para o familiar usando o número que já conheço', 'Enviaria meus dados'], correct: 1,
      feedback: 'Ligar para o número já conhecido ajuda a conferir se o pedido é verdadeiro. Evite confirmar apenas pela mesma conversa suspeita.'
    },
    {
      id: 'pix', title: 'PIX e falsos pagamentos', heading: 'Confira antes de pagar',
      explanation: 'Antes de confirmar um PIX no aplicativo oficial, confira o nome do destinatário e o valor. Um pedido por mensagem, mesmo de alguém conhecido, precisa ser confirmado por outro meio. Uma imagem de comprovante não prova que o dinheiro entrou.',
      simple: ['Confira quem vai receber o dinheiro.', 'Não pague só porque a mensagem pede pressa.', 'Para saber se recebeu, veja o extrato no aplicativo oficial.'],
      tips: ['Se o destinatário for diferente do esperado, pare e confira.', 'Não confie apenas em imagens de comprovantes.', 'Não há pagamento real nesta aula.'],
      example: 'Simulação: você esperava pagar uma loja, mas a tela mostra outro nome. Em outra situação, alguém envia uma imagem dizendo que pagou, mas o valor não aparece no seu extrato.',
      question: 'Você recebeu somente uma imagem de comprovante. Como confere o recebimento?',
      options: ['Aceito a imagem como prova', 'Clico em um link enviado junto com a imagem', 'Abro meu aplicativo oficial e verifico o extrato'], correct: 2,
      feedback: 'Confira o valor no seu extrato pelo aplicativo oficial. Imagens podem ser alteradas e pagamentos agendados podem ainda não ter sido feitos.'
    },
    {
      id: 'links', title: 'Links e sites falsos', heading: 'Olhe o endereço com calma',
      explanation: 'Uma página pode copiar a aparência de uma loja ou serviço. Confira o endereço inteiro, sem confiar apenas no logotipo ou no cadeado. Promoções muito exageradas e links por SMS ou WhatsApp merecem cuidado.',
      simple: ['Um site pode parecer verdadeiro e ser falso.', 'Não confie só na imagem ou no cadeado.', 'Abra o aplicativo oficial ou digite um endereço que você já conhece.'],
      tips: ['Não instale aplicativos enviados por desconhecidos.', 'Use o site oficial ou a loja de aplicativos do aparelho.', 'Os endereços abaixo são fictícios e não podem ser acessados.'],
      example: 'Comparação fictícia: loja.exemplo.example e loja-premio-urgente.example. O segundo tenta chamar atenção para um prêmio. Só o nome ou a aparência não provam que o site é confiável.',
      addresses: ['loja.exemplo.example', 'loja-premio-urgente.example'],
      question: 'Uma promoção chega por mensagem com um link desconhecido. O que é mais seguro?',
      options: ['Abrir a loja pelo aplicativo oficial e conferir a oferta', 'Informar meus dados para garantir o desconto', 'Instalar o aplicativo enviado na mensagem'], correct: 0,
      feedback: 'Procure a oferta pelo canal oficial que você já conhece. Não precisa abrir o link recebido nem instalar arquivos da mensagem.'
    },
    {
      id: 'contas', title: 'Senhas e contas', heading: 'Proteja melhor sua conta',
      explanation: 'Use uma senha longa e diferente em cada serviço. Não compartilhe senhas. A verificação em duas etapas pede uma segunda confirmação além da senha, como um código gerado por um aplicativo. Ative essa proteção nas configurações oficiais da conta.',
      simple: ['Use uma senha longa e diferente em cada conta.', 'Além da senha, alguns sites pedem um código.', 'Digite esse código somente no serviço em que você está entrando. Nunca o envie a outra pessoa.'],
      tips: ['Um gerenciador de senhas pode ajudar a guardar senhas diferentes.', 'Um aplicativo de verificação pode gerar o segundo código; alguns serviços também usam SMS.', 'Não informe sua senha nem seus códigos nesta plataforma de treinamento.'],
      example: 'Você entra no site oficial com sua senha. O serviço pede um código do seu aplicativo de verificação. Essa segunda confirmação ajuda a proteger a conta, mesmo se alguém descobrir a senha.',
      question: 'Uma pessoa pede o código de confirmação que chegou ao seu celular. O que fazer?',
      options: ['Enviar só desta vez', 'Não compartilhar o código', 'Publicar o código no grupo para pedir ajuda'], correct: 1,
      feedback: 'Esse código é uma confirmação de acesso. Use-o apenas no serviço oficial quando você iniciar a ação. Não compartilhe com outra pessoa.'
    },
    {
      id: 'suporte', title: 'Falsos bancos e falso suporte', heading: 'Banco não precisa saber sua senha',
      explanation: 'Um falso atendente pode dizer que há um problema e pressionar você a agir rápido. Pode pedir senha, código ou a instalação de um aplicativo para controlar o aparelho. Encerre o contato e procure o canal oficial por conta própria.',
      simple: ['Banco não precisa saber sua senha.', 'Não instale um aplicativo porque alguém ligou pedindo.', 'Encerre a ligação. Depois procure o canal oficial.'],
      tips: ['Não entregue o controle do aparelho a um contato inesperado.', 'Não use um número enviado pela própria mensagem suspeita.', 'Confira o telefone no aplicativo ou em outro canal oficial conhecido.'],
      example: 'Exemplo fictício: “Sou do Banco Horizonte Fictício. Instale este aplicativo e diga sua senha para cancelar uma compra.” Esse banco foi inventado para a aula.',
      question: 'Um suposto atendente pede sua senha e um aplicativo de acesso remoto. Qual atitude tomar?',
      options: ['Instalar para receber ajuda', 'Entregar a senha, mas não o código', 'Encerrar e buscar o atendimento oficial'], correct: 2,
      feedback: 'Não compartilhe senha nem permita acesso remoto por um contato inesperado. Você pode conferir a situação pelo canal oficial.'
    },
    {
      id: 'perfis', title: 'Redes sociais e perfis falsos', heading: 'Foto e nome não bastam',
      explanation: 'Um perfil pode copiar o nome e a foto de outra pessoa. Informações públicas podem ser usadas para criar uma história convincente. Golpistas tentam ganhar sua confiança ou provocar pressa para levar você a uma decisão sem conferir.',
      simple: ['Um perfil pode copiar a foto de alguém.', 'Compartilhe menos informações pessoais em público.', 'Confirme pedidos fora da conversa suspeita.'],
      tips: ['Confira pedidos incomuns, mesmo de conhecidos.', 'Revise quem pode ver suas publicações.', 'Você não precisa fornecer dados para provar que confia em alguém.'],
      example: 'Um perfil com a foto de uma amiga pede seu endereço e documentos para um “presente”. Você não conversava com essa pessoa há muito tempo.',
      question: 'Um perfil conhecido pede documentos de forma inesperada. O que fazer?',
      options: ['Mandar tudo para não parecer mal-educado', 'Publicar os documentos no perfil', 'Confirmar com a pessoa por um contato já conhecido'], correct: 2,
      feedback: 'O perfil pode ser uma cópia. Confirme por outro meio e evite enviar documentos sem saber a finalidade e quem vai receber.'
    },
    {
      id: 'confirme', title: 'O que fazer quando desconfiar', heading: 'Pare, confira, confirme',
      explanation: 'Você não precisa decidir na hora. Interrompa a ação, observe a mensagem e confirme pelo canal oficial. Se já enviou dinheiro ou informações, procure rapidamente o serviço envolvido pelo canal oficial e peça orientação.',
      simple: ['Pare: não pague nem envie informações.', 'Confira: observe a mensagem, o perfil e o endereço.', 'Confirme: procure um canal oficial que você já conhece.'],
      tips: ['Guarde mensagens e comprovantes para pedir ajuda.', 'Se fez um pagamento suspeito, avise seu banco rapidamente pelo canal oficial.', 'Se compartilhou uma senha, altere-a pelo serviço oficial. Pedir ajuda é uma boa atitude.'],
      example: 'Você recebe um pedido de dinheiro com muita pressa. Em vez de responder imediatamente, para, observa o número e liga para a pessoa pelo contato antigo.',
      question: 'Qual sequência ajuda a conferir um pedido suspeito?',
      options: ['Pagar, responder, conferir', 'PARE → CONFIRA → CONFIRME', 'Enviar dados, esperar, perguntar'], correct: 1,
      feedback: 'Primeiro pare. Depois confira os sinais. Por fim, confirme por um canal que você já conhece. Se algo já aconteceu, procure ajuda sem se culpar.'
    }
  ],
  scenarios: [
    { id: 'familiar', title: 'Falso familiar no WhatsApp', sender: 'Filho — perfil fictício', message: 'Oi mãe. Meu celular quebrou. Esse é meu número novo. Preciso fazer um PIX de R$ 850. Depois te explico.', question: 'O que você faria?', options: ['Fazer o PIX', 'Pedir a chave PIX', 'Ligar para meu filho no número antigo'], correct: 2, feedback: 'Nome e foto podem ser copiados. Confirme com seu filho pelo contato que você já conhece antes de qualquer pagamento.' },
    { id: 'banco', title: 'Falso banco', sender: 'Banco Horizonte Fictício', message: 'Detectamos uma compra. Para cancelar agora, responda com sua senha e o código recebido.', question: 'Como conferir essa informação?', options: ['Enviar senha e código', 'Encerrar o contato e abrir o aplicativo oficial', 'Responder com uma foto do cartão'], correct: 1, feedback: 'Nenhum atendente precisa receber sua senha. Confira a situação diretamente no aplicativo ou telefone oficial. O banco desta simulação é inventado.' },
    { id: 'promocao', title: 'Promoção falsa', sender: 'Loja Prêmio — empresa fictícia', message: 'Você ganhou um celular! Promoção por cinco minutos: premio-urgente.example. Pague uma taxa para receber.', question: 'Qual atitude é mais segura?', options: ['Pagar a taxa para garantir o prêmio', 'Enviar meus documentos', 'Conferir a oferta no canal oficial, sem abrir o link'], correct: 2, feedback: 'Pressa e prêmio inesperado são sinais para conferir. Não pague uma taxa por impulso nem use o link desconhecido. O endereço é fictício.' },
    { id: 'suporte', title: 'Falso suporte técnico', sender: 'Suporte Conserta — empresa fictícia', message: 'Seu aparelho está em risco. Instale o arquivo que enviamos e permita que eu controle a tela.', question: 'O que fazer?', options: ['Não instalar e procurar suporte oficial se precisar', 'Instalar para ver o que acontece', 'Permitir o controle por alguns minutos'], correct: 0, feedback: 'Um contato inesperado não deve controlar seu aparelho. Não instale o arquivo. Procure suporte por um canal oficial se precisar de ajuda.' },
    { id: 'codigo', title: 'Pedido de código de confirmação', sender: 'Contato fictício', message: 'Mandei um código para seu celular por engano. Pode me passar os seis números?', question: 'Como responder?', options: ['Enviar o código', 'Não compartilhar o código', 'Enviar só metade dos números'], correct: 1, feedback: 'Um código pode autorizar acesso à sua conta. Não o compartilhe. Se você não solicitou o código, confira a segurança da conta pelo canal oficial.' }
  ],
  achievements: [
    { id: 'primeiros', icon: '🛡', title: 'Primeiros passos em segurança', lesson: 'internet' },
    { id: 'conta', icon: '🔐', title: 'Conta protegida', lesson: 'contas' },
    { id: 'olho', icon: '👀', title: 'Olho vivo', lesson: 'links' },
    { id: 'whatsapp', icon: '📱', title: 'WhatsApp seguro', lesson: 'whatsapp' },
    { id: 'guardiao', icon: '🏆', title: 'Guardião Digital', all: true }
  ]
};
window.SC.courses.push({
  id: SCSafetyData.id, icon: '🛡', title: 'Segurança Digital: proteja-se na internet', cat: 'Segurança digital', catId: 'seguranca',
  desc: 'Aprenda a reconhecer golpes, proteger seus dados e usar a internet com mais segurança.', duration: '1h 30min', xp: 355,
  progress: 0, color: 'orange', lessons: SCSafetyData.modules.map(module => module.title), training: true
});
