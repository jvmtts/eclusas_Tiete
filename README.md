# Expedição Rio Tietê — JetChula + Usina do Jet

Formulário responsivo para a expedição de 22 a 29 de novembro de 2026, de Barra Bonita a Santa Clara D’Oeste.

## Executar

Requer Node.js 22 ou superior. Não há dependências para instalar nem etapa de build.

```sh
npm run dev
```

Abra http://127.0.0.1:4173. No PowerShell, use `npm.cmd` se a política de execução bloquear o comando `npm`.

```sh
npm test
npm run check
```

O servidor incluído é uma prévia local. Em produção, hospede os arquivos estáticos com HTTPS. Na Vercel: preset Other, sem comando de build, diretório de saída `.`. Também funciona em hospedagem estática e GitHub Pages; os caminhos são relativos.

## Basin

O endpoint `https://usebasin.com/f/9de4a82af40b` já está configurado em `config.js`. O formulário usa o endereço informado para receber inscrições. Não foi feito envio real de teste nesta implementação. Para trocar o destino, altere `basinEndpoint`; não coloque uma chave de API.

Se o endpoint for removido, todas as etapas e a revisão podem ser usadas, mas o envio volta a ficar bloqueado. Não há confirmação fictícia, envio ao formulário de Monte Verde ou chamada ao Google Apps Script.

O envio usa `multipart/form-data`, com `Accept: application/json`, e só apresenta sucesso após uma resposta HTTP válida com `success: true`. Confira no painel do Basin o recebimento de anexos, limites do plano, domínios permitidos, filtros de spam e notificações. Referência: https://docs.usebasin.com/creating-forms/form-backend/

Após configurar, faça uma inscrição de teste expressamente autorizada, confira todos os campos e os dois documentos no painel e remova o registro de teste pelo fluxo normal do Basin. A configuração isolada não comprova a integração.

## Fluxo e tratamento dos dados

São sete etapas: dados pessoais, endereço, camiseta, saúde, tripulação, moto aquática e revisão com os seis termos de responsabilidade da referência. A camiseta do acompanhante fica junto aos dados dele. Habilitação e documento da moto são exigidos no formulário.

Os dados ficam na memória da página durante o preenchimento, sem localStorage, cookies ou rascunho em servidor. Recarregar ou fechar a página perde os dados; há aviso de saída após iniciar o preenchimento. Nenhum dado pessoal é incluído em logs ou URLs.

Os campos de saúde exigem detalhes apenas para respostas afirmativas. Campos de acompanhante são exigidos somente quando houver acompanhante. Dados condicionais antigos não entram no payload ao mudar a resposta para não.

Uploads: PDF, JPG e PNG, até 5 MB por documento. O frontend verifica extensão, MIME quando disponível e assinatura inicial do arquivo; isso não substitui as validações e controles de segurança do serviço que recebe os documentos. Há suporte a selecionar, arrastar, remover e substituir arquivos.

Não existe contador sequencial de inscritos. Cada tentativa recebe um UUID para correlação no Basin. Isso não é garantia de idempotência do serviço. Não há reenvio automático. Em falha de rede ou resposta ambígua, o formulário orienta contato com a equipe e bloqueia uma nova tentativa nesta página para evitar duplicidades. Retornar a etapas e corrigir dados não os apaga.

## Arquitetura

- `index.html` e `styles.css`: identidade, estrutura, estilos e responsividade.
- `js/app.js`: etapas, controles, acessibilidade, revisão, anexos e envio.
- `js/domain.js`: validações e montagem do payload, testáveis sem navegador.
- `config.js`: dados da expedição e endpoint.
- `server.mjs`: prévia local sem dependências.
- `tests/domain.test.mjs`: testes das regras e casos extremos.
- `vercel.json`: cabeçalhos para hospedagem na Vercel.

Os termos foram transcritos do formulário de referência. O campo de documento chamado “Arrais amador” na referência é apresentado aqui como “Habilitação náutica”, sem fazer afirmações sobre a categoria legal exigida.

Fontes Barlow Condensed e DM Sans hospedadas localmente em WOFF2, com suas licenças OFL em `assets/fonts/`. O carregamento da página não consulta Google Fonts nem utiliza scripts de terceiros.

Os efeitos de abertura, entrada ao rolar e troca de etapa usam CSS e um IntersectionObserver leve em `js/effects.js`. A preferência por movimento reduzido é respeitada. Não há biblioteca de animação ou processamento contínuo de rolagem. Os ícones do navegador e de atalho no celular usam o logo original da Usina do Jet, em PNG com fundo escuro para legibilidade.

## Identidade e imagem

Logos originais fornecidos: Usina do Jet e JetChula. O enquadramento do JetChula é feito no SVG da página, sem modificar o arquivo original.

`assets/eclusas-hero.webp` e `assets/eclusas-mobile.webp` são versões otimizadas da mesma imagem ilustrativa criada com a ferramenta integrada ImageGen, sem referências fotográficas externas. A cena não é registro documental de uma eclusa específica. A página identifica a imagem como ilustração gerada por IA. O prompt completo está em `assets/IMAGE-PROMPT.md`.

Formulário de referência: https://script.google.com/macros/s/AKfycbyLIDfl-euCooPr0oJOTdvTuiv_HR0AXDZTcSc05yKr369BpD0GeFJ9hAzKdQJFoqS1jA/exec
