# Meu Modo, ajuda guiada e Segurança Digital

Evolução incremental do Se Conecte. HTML5, CSS, JavaScript sem framework, PHP/PDO e banco existentes foram mantidos. Os quatro cursos anteriores, login/cadastro demonstrativos, navegação, perfil, oportunidades e recursos de acessibilidade continuam disponíveis.

## Arquivos criados

| Arquivo | Responsabilidade |
| --- | --- |
| `assets/css/inclusion.css` | Extensões do Design System para preferências, ajuda, aulas, simulador, contraste, foco e responsividade. |
| `assets/js/storage.js` | Adaptador de armazenamento local, leitura tolerante a JSON inválido e fallback em memória. |
| `assets/js/accessibility.js` | Primeiro acesso, sete preferências, salvamento automático e Aprender+ nos cursos existentes. |
| `assets/js/speech.js` | Voz pt-BR, iniciar/pausar/continuar/parar, controles acessíveis também dentro de modais e fallback textual. |
| `assets/js/help.js` | Cinco respostas guiadas locais, com ações úteis e provedor substituível por uma futura integração. |
| `assets/js/safety-data.js` | Oito módulos, cinco cenários fictícios e cinco conquistas; acrescenta a trilha sem substituir o catálogo. |
| `assets/js/learning-progress.js` | Conclusões, respostas por índice, XP, nível, percentuais e conquistas, sem repetir recompensas. |
| `assets/js/safety.js` | Preenche os templates HTML, controla os cinco passos de cada aula e o simulador; integra Dashboard, progresso e Passaporte. |
| `assets/js/navigation.js` | Menu móvel com foco, isolamento do conteúdo, Tab e Escape. |
| `database/002_inclusao_seguranca.sql` | Migração aditiva de preferências, itens da trilha, respostas/conclusões e eventos de XP. |
| `backend/LearningRepository.php` | Preparação PDO para preferências e conclusão autenticada; usa transação, validação e XP calculado no servidor. |
| `tests/accessibility-safety.html` | Página de teste com a aplicação real em iframe. |
| `tests/accessibility-safety.js` | Testes de preferências, ajuda, aulas, simulador, progresso, persistência, voz e cache. Restaura o armazenamento ao terminar normalmente. |
| `tests/ui-test.css` | Apresentação do resultado dos testes. |
| `tests/run-browser.py` | Runner opcional sem dependências externas, usando um perfil isolado de Chrome/Edge e tempo real; inclui navegação offline. |
| `tests/training-desktop.png` e `tests/aprender-plus-mobile.png` | Capturas para revisão visual. |
| `MELHORIAS-INCLUSAO-SEGURANCA.md` | Este roteiro de implementação e teste. |

## Arquivos modificados

- `index.html`: painel Meu Modo ampliado; primeiro acesso; ajuda; controles de voz; templates semânticos da trilha, aulas, simulador, regra de segurança e conquistas. Botões visíveis com texto e carregamento dos módulos separados.
- `assets/js/app.js`: pequenas integrações com os novos módulos, rotas e dados; títulos/nível e XP atualizados; acesso ao simulador; preservação dos fluxos antigos. Link Pular para o conteúdo move o foco sem alterar a rota. A retomada da nova trilha considera também as simulações restantes.
- `sw.js`: cache `se-conecte-v6` com os arquivos novos; limpeza dos caches anteriores na ativação.
- `tests/ui-smoke.html`: expectativas de busca e não iniciados ajustadas para o catálogo com cinco cursos e tratamento do primeiro acesso no teste antigo.
- `README.md` e `ANALISE-E-ALTERACOES.md`: referências à evolução e ao roteiro de testes.

`styles.css`, `data.js`, API existente, configuração de conexão e esquema inicial foram preservados nesta etapa. O CSS novo utiliza as mesmas variáveis, cores e componentes. O HTML está no documento e nos templates; JavaScript preenche conteúdo e controla comportamentos.

## Como testar manualmente

1. Na pasta do projeto execute `php -S localhost:8000` e abra `http://localhost:8000`. Para testar apenas a interface, também é possível abrir `index.html`; PWA exige HTTP local/HTTPS.
2. Entre com o login demonstrativo preenchido. No primeiro acesso, escolha uma das cinco opções. Confirme que aparece “Tudo certo!” e clique em Começar. Recarregue: a escolha permanece e o modal não se repete. Para repetir sem apagar seu progresso, use outro perfil do navegador.
3. Abra **Meu Modo**, disponível no cabeçalho e no menu. Teste A/A+/A++, contraste, voz, Aprender+, reduzir animações, botões maiores e destacar ações. Feche e reabra: os valores ficam salvos automaticamente. Restaurar padrão não apaga progresso nem respostas.
4. Abra **Preciso de ajuda**. Experimente as cinco opções e Ouvir estas opções. As respostas permitem abrir os cursos, ativar Aprender+, melhorar a legibilidade, abrir Meu Modo ou voltar ao início.
5. No Dashboard selecione **Começar treinamento**, ou procure “segurança” em Aprender. Abra **Segurança Digital: proteja-se na internet**. Os oito módulos têm cinco passos: explicação, exemplo, prática, revisão da resposta e conclusão. Antes da resposta, o avanço da prática fica desativado. Depois de responder, a explicação aparece imediatamente.
6. Ative Aprender+ na aula. A explicação mostra uma ideia numerada por vez, com botões para avançar e voltar. Nos cursos anteriores, há explicações introdutórias por categoria; o conteúdo aprofundado desta entrega está na nova trilha. Desative Aprender+ para retornar à apresentação normal.
7. Escolha **Ouvir explicação** ou **Ouvir situação**. Use Pausar, Continuar leitura e Parar. Nenhuma fala começa automaticamente. Com a preferência desligada, a plataforma orienta a ativá-la em Meu Modo; sem suporte do navegador, o texto permanece disponível. As vozes e o áudio real dependem do aparelho e do navegador.
8. Abra **Treine antes que aconteça**. Responda às cinco simulações. Há feedback de boa escolha ou atenção e uma explicação; não há campos de dados pessoais, links ativos dos exemplos nem pagamentos reais.
9. Confira Meu progresso, conquistas, Dashboard e Passaporte após concluir atividades. Recarregue e revise uma atividade concluída: XP e progresso não devem duplicar. Ao terminar oito módulos e cinco simulações, a trilha chega a 100%, libera Guardião Digital e atualiza Segurança Digital no Passaporte.
10. No celular, abra Menu, use Tab/Shift+Tab e Esc. O menu fechado não recebe foco; aberto mantém a navegação dentro dele. Teste também os modais com teclado e o link Pular para o conteúdo.
11. Para atualizar uma PWA antiga, carregue a página uma vez, feche todas as abas do projeto e abra novamente. A nova versão do Service Worker ativa quando as abas antigas forem encerradas.

## Progresso e gamificação

- Cada aula concluída concede **25 XP**, e a prática com revisão concede **10 XP**, registrados juntos ao concluir o quinto passo. Revisar não repete o prêmio.
- Cada uma das cinco simulações concede **15 XP**, uma única vez. O total da trilha é **355 XP**.
- A recompensa reconhece a participação e revisão, mesmo quando a primeira resposta foi incorreta. A primeira escolha é registrada por índice; a explicação apresenta o cuidado adequado. A conclusão não certifica domínio profissional em segurança.
- O percentual considera **13 atividades**: oito módulos e cinco simulações.
- O protótipo começa com os 1.240 XP demonstrativos existentes. A nova trilha soma seu XP a esse valor; a partir de 1.500 XP, o nível exibido passa a Conectado.
- As quatro conquistas iniciais são liberadas nos módulos correspondentes. Guardião Digital exige as treze atividades.
- A competência Segurança Digital usa o percentual da nova trilha. Os demais valores históricos, certificados, vagas e parte das conquistas dos cursos antigos continuam demonstrativos.

## Persistência e integração futura

| Chave local | Conteúdo |
| --- | --- |
| `sc_a11y` | font, contrast, voice, easy, motion, targets, highlight. Preferências antigas são aceitas e recebem os novos padrões. |
| `sc_onboarded` | Indica que o usuário confirmou a configuração inicial. |
| `sc_safety_progress_v1` | Conclusões dos módulos e cenários: índice escolhido, acerto e data. O XP é derivado das conclusões válidas. |
| `sc_progress` | Progresso anterior, preservado. |

O protótipo tem uma identidade demonstrativa local: os dados pertencem ao navegador/origem, não a múltiplos usuários reais. Não sincroniza dispositivos. Quando o armazenamento está indisponível, os ajustes funcionam na sessão e a interface informa que não conseguiu salvar. O fallback em memória não sobrevive ao recarregamento.

A migração SQL **não foi aplicada automaticamente**. Em uma cópia de desenvolvimento, importe primeiro `database/se_conecte.sql`, depois execute `database/002_inclusao_seguranca.sql` **uma vez**. Ela acrescenta colunas à tabela de preferências e cria itens da trilha, eventos de aprendizagem e conclusões. Não é necessário banco para testar o protótipo.

O repositório PHP está preparado, mas **ainda não está ligado à interface nem exposto pela API**. Um controlador futuro deve obter o usuário da sessão autenticada, validar autorização e CSRF e chamar:

- `preferences($usuarioId)` / `savePreferences($usuarioId, $preferencias)`;
- `progress($usuarioId)`;
- `complete($usuarioId, 'aula' ou 'simulacao', $slug, $indice)`.

No servidor, gabaritos, valores de XP e itens vêm do banco. A transação e a chave única impedem duplicação de conclusão/XP. Ao completar a trilha, atualiza progresso, conclusão e competência. As conquistas podem ser derivadas desses eventos. O adaptador local e o provedor da ajuda oferecem pontos separados para futuras APIs, sem integrar IA externa nesta entrega.

## Testes executados e limites

Os testes de interface verificam primeiro acesso, sete controles, fonte efetiva, ajuda, modos normal/simplificado, oito módulos e suas práticas, cinco cenários, XP idempotente, retomada, nível, conquistas, competência, persistência após recarregar, menu móvel, foco e ausência de overflow nas telas testadas. Voz é testada com um substituto controlado para não depender de áudio no computador de teste.

Foram exercitadas larguras de **320, 390, 768, 1024 e 1440 pixels**, incluindo A++, alto contraste, redução de movimentos e alvos maiores. Foram inspecionadas capturas de desktop e Aprender+ em celular. O runner também verifica o cache de todos os arquivos e carrega Dashboard e uma aula com a rede desativada.

Para repetir no navegador, abra `/tests/accessibility-safety.html`; use `?width=390` para a largura móvel. Para executar com tempo real e teste offline:

```powershell
python tests/run-browser.py --base http://localhost:8000 --width 390
python tests/run-browser.py --base http://localhost:8000 --width 1440
```

O runner usa Python com biblioteca padrão e Chrome/Edge instalado; não altera seu perfil pessoal. `--verbose` mostra todos os itens verificados. O teste antigo continua em `/tests/ui-smoke.html`.

Os três arquivos PHP passaram em `php -l`. Não foram realizados testes de integração com MySQL/MariaDB nem avaliação com leitores de tela e usuários reais. As melhorias seguem práticas orientadas à WCAG 2.2 AA, sem afirmar certificação de conformidade. A navegação offline foi verificada no Chrome; o manifest ainda usa a base do projeto e não recebeu ícones de instalação.

## Referências do conteúdo educativo

- CERT.br: https://cartilha.cert.br/dicas-rapidas/
- CERT.br, autenticação: https://cartilha.cert.br/fasciculos/autenticacao/fasciculo-autenticacao-grafica.pdf
- Banco Central, golpes: https://www.bcb.gov.br/meubc/faqs/s/golpes

O material foi escrito para o treinamento com exemplos fictícios e orientação prática. Nenhuma marca bancária real é usada nos cenários.
