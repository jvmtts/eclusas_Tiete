# Verificação local — 28/10/2026

Fonte verificada: repositório `eclusas_Tiete` na Área de Trabalho, dentro de `Projeto Usina`.

## Automatizada

19 testes de domínio passaram. Sintaxe de `js/app.js`, `js/domain.js` e `server.mjs` verificada com Node.js.

Os testes cobrem CPF, nomes com acentos/apóstrofos/hífens, datas impossíveis e futuras, telefones, campos obrigatórios, condições de saúde, acompanhante, documentos, assinaturas de PDF/JPG/PNG, arquivos vazios ou grandes, os seis termos, endpoint e mapeamento dos dados.

## No navegador

- Abertura, logos e imagem inspecionados em computador e celular.
- Larguras de viewport 320, 390 e 768 px sem rolagem horizontal. A largura útil muda com a barra de rolagem do navegador.
- Fontes locais carregadas; nenhuma referência de descrição ou associação de rótulo quebrada; nenhum ID duplicado.
- Campos vazios bloqueiam avanço e levam o foco ao primeiro erro.
- Dados pessoais, endereço e camiseta preenchidos e preservados ao navegar.
- Resposta afirmativa de saúde exige descrição; resposta negativa oculta e desativa os detalhes.
- Acompanhante exige seus dados e camiseta; alternar sim/não preserva os valores na página e desativa os campos ocultos.
- Fluxos com e sem acompanhante percorridos até a revisão.
- Arquivo de teste com extensão PDF e conteúdo inválido rejeitado.
- PNG de teste aceito nos dois anexos, sem envio externo; remoção e reescolha do mesmo arquivo funcionaram.
- Revisão apresenta seis grupos com os dados e os nomes dos anexos, além dos seis termos.
- Editar uma seção permite salvar e retornar diretamente à revisão.
- Navegação por teclado inspecionada; foco alcança os controles nativos.
- Na versão inicial sem Basin configurado, o botão de envio permanecia desativado mesmo após aceitar todos os termos. Não há confirmação fictícia.

## Atualização: Basin, efeitos e ícone

- Endpoint informado pelo usuário configurado: `https://usebasin.com/f/9de4a82af40b`.
- 19 testes passaram novamente no repositório original. Sintaxe de `js/effects.js` e `js/app.js` verificada.
- Fluxo percorrido até a revisão após a atualização, com dados e anexos de teste locais. Botão de envio habilitado e aviso de configuração pendente oculto.
- Tentativa de finalizar com os termos desmarcados exibiu seis erros e focou o primeiro termo, sem entrar no estado de envio nem apresentar confirmação.
- Efeitos de abertura e imagem ativos no navegador; sem erros registrados no console.
- Entrada de seções com IntersectionObserver, transição de etapas e efeitos de hover sem bibliotecas adicionais. CSS respeita `prefers-reduced-motion`.
- Ícones PNG de 32 e 64 px e atalho de 180 px gerados a partir do logo original da Usina. Referências conferidas no navegador.

## Pendente de integração

Não houve envio real, publicação ou push ao GitHub. Nenhuma inscrição foi criada no Google Apps Script ou no Basin. O endpoint já está conectado à configuração, mas o recebimento de arquivos, notificações e regras do painel ainda precisa de um envio de teste expressamente autorizado. A configuração não comprova o recebimento em produção.
