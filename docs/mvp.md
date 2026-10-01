# Visão funcional do MVP

O CineVerso possui duas áreas integradas: a experiência pública do cliente e o painel administrativo do cinema. O projeto simula a confirmação de ingressos, mas não realiza cobrança ou integração com meios de pagamento.

## Área pública

- Página inicial com filmes em cartaz e filmes em breve.
- Busca de filmes por título ou gênero.
- Página de detalhes de cada filme com suas sessões disponíveis.
- Identificação de formato e versão da sessão, como 2D, 3D, dublado, legendado ou original.
- Mapa da sala com poltronas disponíveis, selecionadas e indisponíveis.
- Escolha do tipo de ingresso para cada poltrona.
- Confirmação da compra simulada e geração de códigos para a compra e os ingressos.
- Consulta de ingressos pelo código da compra.

## Painel administrativo

- Login exclusivo para administradores.
- Visão geral com estatísticas do cinema.
- Gerenciamento de cinemas, salas, filmes, sessões e tipos de ingresso.
- Geração automática dos assentos a partir das dimensões da sala.
- Cartaz do filme enviado pela interface, com pré-visualização.
- Consulta das vendas registradas e dos respectivos ingressos.
- Visualização da ocupação de cada sessão no mapa da sala.

## Regras do MVP

- O cliente não precisa criar uma conta.
- Não existe pagamento real; a compra representa uma confirmação de ingressos para fins acadêmicos.
- Uma poltrona não pode ser vendida duas vezes na mesma sessão.
- Filmes ativos sem sessões futuras aparecem como “Em breve”.
- Filmes ativos com sessões futuras publicadas aparecem como “Em cartaz”.
- A exclusão de dados vinculados ao histórico pode ser impedida para preservar a consistência das vendas.

## Fora do escopo atual

- Pagamento online.
- Cadastro e autenticação de clientes.
- Cancelamento ou reembolso de compras.
- Envio de ingressos por email.
- Leitura ou geração visual de QR Code.
