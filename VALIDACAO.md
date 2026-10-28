# Validação da reformulação React — 28/10/2026

## Automatizada

- TypeScript estrito sem erros.
- Build de produção com Vite e Tailwind concluído.
- 30 testes passaram: 19 de regras e payload, 11 de transporte com respostas simuladas.
- Casos de transporte: sucesso confirmado, dados incompletos, arquivo inválido, HTTP 400/429/503, falha de rede, JSON inválido, `success: false`, cancelamento anterior e posterior ao início da requisição.
- Os testes de rede não enviam dados ao Basin.

## Navegador

- Abertura em azul profundo, areia e laranja; logos Usina e JetChula preservados.
- Campos vazios bloqueiam o avanço e focam o primeiro erro.
- CPF, CEP e telefones mascarados em controles React.
- Data de nascimento testada com interação nativa de teclado.
- Camisetas selecionadas por seus controles visíveis; nome, CPF e RG do acompanhante exigidos quando há acompanhante.
- Alternar a resposta sobre acompanhante preserva os dados em memória e remove os campos condicionais da interface.
- Saúde afirmativa exige descrição e foca o detalhe que falta.
- Os dois documentos são exigidos; PDF de teste com conteúdo incompatível rejeitado, PNG local aceito.
- Revisão com cinco grupos de informações e seis termos completos.
- Editar perfil preserva os valores e permite salvar e voltar direto à revisão.
- Tentativa de finalizar com termos desmarcados produz seis erros, sem iniciar envio.
- Nenhum erro no console durante o fluxo conferido.
- Celular de 390 px e desktop de 1440 px sem rolagem horizontal no fluxo testado.
- Cabeçalho ajustado e conferido em 320 px no build do repositório original, sem rolagem horizontal.
- Contraste dos textos secundários e dos botões reforçado na paleta final.
- `npm ci`, build com checagem de TypeScript e os 30 testes executados também no checkout original após a migração.

## Limites

Não foi feita inscrição real no Basin. O recebimento final dos documentos e notificações continua dependendo de teste de integração autorizado. A publicação deve ser conferida no domínio público após o novo deployment.
