# Eclusas do Tietê — React + TypeScript + Tailwind

Site de inscrição da Expedição Rio Tietê, de 22 a 29 de novembro de 2026, com JetChula e Usina do Jet. Percurso: Barra Bonita → Santa Clara D’Oeste.

## Stack

- React 19 e TypeScript em modo estrito.
- Tailwind CSS 4, compilado pelo plugin oficial do Vite.
- Vite 8 para desenvolvimento, preview e produção.
- Lucide React para ícones importados individualmente.
- Fontes locais em WOFF2; nenhuma biblioteca de animação, script remoto ou armazenamento de dados pessoais no navegador.

## Executar

Requer Node.js 22.18 ou superior.

```sh
npm ci
npm run dev
```

No PowerShell, use `npm.cmd` se o shim de script estiver bloqueado pela política do sistema.

```sh
npm run check
npm test
npm run build
npm run preview
```

## Arquitetura

- `src/components/Landing.tsx`: apresentação, informações da expedição e contatos.
- `src/components/registration/`: formulário, navegação, campos de cada etapa, revisão e confirmação.
- `src/components/Fields.tsx` e `FileUpload.tsx`: controles acessíveis reutilizáveis.
- `src/hooks/useRegistration.ts`: estado controlado do formulário, navegação, arquivos, erros e bloqueio de envio duplicado.
- `src/hooks/useReveal.ts`: entrada de seções com IntersectionObserver e movimento reduzido.
- `src/lib/validation.ts`: validações independentes da interface.
- `src/lib/payload.ts`: tradução dos dados para os campos recebidos pelo Basin.
- `src/lib/submission.ts`: envio multipart, timeout, cancelamento e classificação de respostas ambíguas.
- `src/config.ts`: endpoint e dados da expedição.
- `src/data/expedition.ts`: tamanhos, estados, perguntas de saúde e termos da referência.
- `src/styles.css`: Tailwind, fontes, tokens de identidade, controles comuns e animações leves.

Não há geração da interface por strings HTML nem manipulação manual do DOM para atualizar os campos. Os refs são usados para foco, rolagem e observação de elementos.

## Formulário

Seis etapas: perfil, endereço, tripulação, saúde, moto aquática e revisão/termos. Os tamanhos das camisetas ficam junto à tripulação, evitando uma etapa isolada com um único campo.

O estado permanece na memória enquanto a página está aberta. Trocar de etapa não apaga dados nem arquivos. Depois de chegar à revisão, editar uma seção permite salvar e voltar diretamente à conferência. Recarregar ou fechar a página perde os dados; há aviso de saída após o início do preenchimento.

Campos condicionais antigos não entram no payload quando a resposta muda para não. O acompanhante precisa de dados próprios e camiseta. As respostas afirmativas de saúde exigem descrição. Os seis termos da referência são obrigatórios e enviados com o texto completo e o aceite.

Anexos: PDF, JPG ou PNG, até 5 MB por arquivo. A validação verifica extensão, MIME quando disponível, assinatura inicial e tamanho; os controles do serviço que recebe os documentos continuam necessários. É possível selecionar, arrastar, remover e reescolher o mesmo arquivo.

## Basin

Endpoint configurado: `https://usebasin.com/f/9de4a82af40b`.

O envio só acontece depois de validar todas as etapas e os documentos. A confirmação exige resposta HTTP válida e JSON com `success: true`. Não há reenvio automático. Uma resposta de rede ambígua bloqueia uma nova tentativa nesta página e orienta contato com a equipe para evitar duplicidade.

O identificador UUID serve para correlação, não representa contador de inscritos nem garantia de idempotência do Basin. Nenhum dado pessoal é enviado em URLs, logs, cookies ou localStorage.

Os testes automatizados de envio usam respostas simuladas e arquivos sintéticos. Não foi criada uma inscrição real no Basin. O recebimento final de campos, arquivos e notificações no painel ainda depende de um teste de integração expressamente autorizado.

## Vercel

O `vercel.json` usa preset **Vite**, instalação **npm ci**, build **npm run build** e saída **dist**. O lockfile está versionado. O site continua estático; não há servidor Node de prévia publicado como backend.

Após enviar um commit à branch de produção, aguarde o deployment correspondente. Não faça redeploy de um commit antigo esperando que ele inclua mudanças locais.

## Identidade

Logos originais da Usina do Jet e JetChula. Os favicons e o atalho de celular usam a Usina. A imagem de abertura é a ilustração já criada com ImageGen; versões WebP para desktop e celular em `public/assets/`. O prompt está em `public/assets/IMAGE-PROMPT.md`. As fontes incluem suas licenças em `public/assets/fonts/`.

Os termos foram preservados do formulário de referência. A habilitação náutica tem rótulo neutro, sem acrescentar afirmações sobre a categoria legal exigida.
