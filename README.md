# The Book Lovers Club — Frontend

Interface web do The Book Lovers Club, desenvolvida com HTML, CSS e JavaScript puro (sem frameworks). Permite visualizar o acervo de livros lidos pelo clube, registrar avaliações e acompanhar estatísticas de leitura.

---

## Pré-requisitos

- A **Book Club API** deve estar rodando localmente em `http://127.0.0.1:5000`
- Os membros do clube devem estar cadastrados via `populate_member.py` (ver README da API)
- Consulte o repositório da API para instruções de execução

---

## Como executar

Não há dependências ou instalação necessária. Basta abrir o arquivo diretamente no navegador:

1. Clone ou baixe este repositório
2. Abra o arquivo `index.html` no navegador (duplo clique ou arraste para o browser)

> O frontend consome a API em `http://127.0.0.1:5000`. Certifique-se de que o backend está rodando antes de usar.

---

## Funcionalidades

| Funcionalidade | Descrição |
|---------------|-----------|
| Livro do Mês | Exibe o livro do mês com capa automática via Open Library |
| Estatísticas | Mostra o autor mais lido e top três gêneros mais lidos |
| Lista de Livros | Tabela com todos os livros e média de estrelas |
| Adicionar Livro | Formulário para adicionar livros à lista |
| Remover Livro | Remove livro diretamente pela tabela |
| Filtrar Livros | Filtra por autor, gênero, quem indicou e/ou data |
| Avaliar Livro | Registra avaliações de 1 a 5 estrelas |

---

## Tecnologias utilizadas

- HTML5
- CSS3 (flexbox, animações, variáveis de cor)
- JavaScript puro (Fetch API, DOM manipulation)
- [Open Library Search API](https://openlibrary.org/dev/docs/api) — capas dos livros automáticas