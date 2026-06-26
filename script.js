/*
  --------------------------------------------------------------------------------------
        BOOK CLUB — script.js
  --------------------------------------------------------------------------------------
*/

const API         = 'http://127.0.0.1:5000/books';
const API_MEMBERS = 'http://127.0.0.1:5000/members';
const API_RATINGS = 'http://127.0.0.1:5000/ratings';

/*
  --------------------------------------------------------------------------------------
        Navegação entre telas
  --------------------------------------------------------------------------------------
*/
const openScreen = (screenId) => {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');

  if (screenId === 'screen-books') getList();
};

/*
  --------------------------------------------------------------------------------------
        GET /books/stats — Estatísticas: autor mais lido e top 3 gêneros
  --------------------------------------------------------------------------------------
*/
const getStats = async () => {
  fetch(`${API}/stats`, { method: 'get' })
    .then(response => response.json())
    .then(data => {
      document.getElementById('home-author-name').textContent =
        data.most_read_author || '—';

      const ranking = document.getElementById('genre-ranking');
      ranking.innerHTML = '';

      if (!data.top_genres || data.top_genres.length === 0) {
        ranking.innerHTML = '<p class="empty-msg">Sem dados ainda.</p>';
        return;
      }

      const medals = ['1º', '2º', '3º'];

      data.top_genres.forEach((item, index) => {
        const heights = [100, 70, 40];
        const pct = heights[index];
        const bar = document.createElement('div');
        bar.className = 'genre-bar-wrap';
        bar.innerHTML = `
          <span class="genre-name">${item.genre}</span>
          <div class="genre-bar-bg">
            <div class="genre-bar-fill" style="height: ${pct}%"></div>
          </div>
          <span class="genre-medal">${medals[index]}</span>
        `;
        ranking.appendChild(bar);
      });
    })
    .catch(error => console.error('Erro ao carregar stats:', error));
};

/*
  --------------------------------------------------------------------------------------
        GET /books/month — Livro do mês com capa via Open Library Search API
  --------------------------------------------------------------------------------------
*/
const getBookOfMonth = async () => {
  fetch(`${API}/month`, { method: 'get' })
    .then(response => {
      if (response.status === 404) return null;
      return response.json();
    })
    .then(data => {
      if (!data) {
        document.getElementById('month-title-home').textContent       = 'Nenhum ainda';
        document.getElementById('month-author-home').textContent      = '';
        document.getElementById('month-genre-home').textContent       = '';
        document.getElementById('month-recommended-home').textContent = '';
        document.getElementById('month-cover').style.display          = 'none';
        return;
      }

      document.getElementById('month-title-home').textContent       = data.title;
      document.getElementById('month-author-home').textContent      = 'Autor: ' + data.author;
      document.getElementById('month-genre-home').textContent       = 'Gênero: ' + data.genre;
      document.getElementById('month-recommended-home').textContent = 'Indicação: ' + data.recommended_by;

      // Busca capa via Open Library Search API
      const query = encodeURIComponent(data.title + ' ' + data.author);
      fetch(`https://openlibrary.org/search.json?q=${query}&limit=1`)
        .then(r => r.json())
        .then(olData => {
          const coverImg = document.getElementById('month-cover');

          if (olData.docs && olData.docs.length > 0 && olData.docs[0].cover_i) {
            const coverId  = olData.docs[0].cover_i;
            coverImg.src   = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
            coverImg.style.display = 'block';
          } else {
            coverImg.style.display = 'none';
          }
        })
        .catch(() => {
          document.getElementById('month-cover').style.display = 'none';
        });
    })
    .catch(error => console.error('Erro ao carregar livro do mês:', error));
};

/*
  --------------------------------------------------------------------------------------
        GET /books/ — Lista de livros
  --------------------------------------------------------------------------------------
*/
const getList = async () => {
  fetch(`${API}/`, { method: 'get' })
    .then(response => response.json())
    .then(data => {
      clearTable();
      data.books.forEach(book =>
        insertRow(book.id, book.title, book.author, book.genre,
                  book.read_date, book.recommended_by, book.avg_stars)
      );
    })
    .catch(error => console.error('Erro ao carregar livros:', error));
};

/*
  --------------------------------------------------------------------------------------
        GET /members/ — Carrega membros no dropdown de "Indicado por"
  --------------------------------------------------------------------------------------
*/
const loadMembersDropdown = async () => {
  fetch(`${API_MEMBERS}/`, { method: 'get' })
    .then(r => r.json())
    .then(data => {
      const sel = document.getElementById('input-recommended');
      sel.innerHTML = '<option value="">Indicado por...</option>';
      data.members.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.name;
        opt.textContent = m.name;
        sel.appendChild(opt);
      });
    })
    .catch(error => console.error('Erro ao carregar membros:', error));
};

/*
  --------------------------------------------------------------------------------------
        Formulário de adição (toggle / cancelar)
  --------------------------------------------------------------------------------------
*/
const toggleAddForm = () => {
  const form = document.getElementById('add-form');
  const btn  = document.getElementById('btn-toggle-add');
  const isVisible = form.style.display !== 'none';

  if (isVisible) {
    form.style.display = 'none';
    btn.textContent = '+ Adicionar Livro';
    btn.classList.remove('active');
    clearInputs();
  } else {
    form.style.display = 'flex';
    btn.textContent = '− Adicionar Livro';
    btn.classList.add('active');
    loadMembersDropdown();
    document.getElementById('input-title').focus();
  }
};

const cancelAdd = () => {
  const form = document.getElementById('add-form');
  const btn  = document.getElementById('btn-toggle-add');
  form.style.display = 'none';
  btn.textContent = '+ Adicionar Livro';
  btn.classList.remove('active');
  clearInputs();
};

/*
  --------------------------------------------------------------------------------------
        POST /books/ — Adicionar livro
  --------------------------------------------------------------------------------------
*/
const addBook = () => {
  const title          = document.getElementById('input-title').value.trim();
  const author         = document.getElementById('input-author').value.trim();
  const genre          = document.getElementById('input-genre').value.trim();
  const read_date      = document.getElementById('input-date').value.trim();
  const recommended_by = document.getElementById('input-recommended').value;

  if (!title || !author || !genre || !read_date || !recommended_by) {
    alert('Preencha todos os campos!');
    return;
  }

  if (!/^\d{2}\/\d{4}$/.test(read_date)) {
    alert('Data deve estar no formato MM/AAAA. Ex: 03/2024');
    return;
  }

  fetch(`${API}/`, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, author, genre, read_date, recommended_by })
  })
    .then(response => {
      if (response.status === 409) {
        alert('Este livro já está cadastrado!');
        return null;
      }
      return response.json();
    })
    .then(data => {
      if (!data) return;
      cancelAdd();
      getList();
      getStats();
      getBookOfMonth();
      alert('Livro adicionado!');
    })
    .catch(error => console.error('Erro ao adicionar livro:', error));
};

/*
  --------------------------------------------------------------------------------------
        DELETE /books/book — Deletar livro
  --------------------------------------------------------------------------------------
*/
const deleteBook = (title, author, row) => {
  if (!confirm(`Remover "${title}" de ${author}?`)) return;

  fetch(`${API}/book?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`, { method: 'delete' })
    .then(response => response.json())
    .then(() => {
      row.remove();
      getStats();
      getBookOfMonth();
    })
    .catch(error => console.error('Erro ao remover livro:', error));
};

/*
  --------------------------------------------------------------------------------------
        GET /books/filter — Filtrar livros
  --------------------------------------------------------------------------------------
*/
const filterBooks = () => {
  const title          = document.getElementById('filter-title').value;
  const author         = document.getElementById('filter-author').value;
  const genre          = document.getElementById('filter-genre').value;
  const recommended_by = document.getElementById('filter-recommended').value;
  const read_date      = document.getElementById('filter-date').value;

  const params = new URLSearchParams();
  if (title)          params.append('title', title);
  if (author)         params.append('author', author);
  if (genre)          params.append('genre', genre);
  if (recommended_by) params.append('recommended_by', recommended_by);
  if (read_date)      params.append('read_date', read_date);

  fetch(`${API}/filter?${params.toString()}`, { method: 'get' })
    .then(response => response.json())
    .then(data => {
      clearTable();
      data.books.forEach(book =>
        insertRow(book.id, book.title, book.author, book.genre,
                  book.read_date, book.recommended_by, book.avg_stars)
      );
    })
    .catch(error => console.error('Erro ao filtrar:', error));
};

const clearFilter = () => {
  document.getElementById('filter-title').value       = '';
  document.getElementById('filter-author').value      = '';
  document.getElementById('filter-genre').value       = '';
  document.getElementById('filter-recommended').value = '';
  document.getElementById('filter-date').value        = '';
  getList();
};

/*
  --------------------------------------------------------------------------------------
        Modal de avaliação — abrir/fechar
  --------------------------------------------------------------------------------------
*/
const openRatingModal = async () => {
  document.getElementById('rating-stars').value = '0';
  document.querySelectorAll('.star').forEach(s => s.classList.remove('selected'));

  await fetch(`${API_MEMBERS}/`, { method: 'get' })
    .then(r => r.json())
    .then(data => {
      const sel = document.getElementById('rating-member');
      sel.innerHTML = '<option value="">Selecione seu nome...</option>';
      data.members.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.name;
        sel.appendChild(opt);
      });
    });

  await fetch(`${API}/`, { method: 'get' })
    .then(r => r.json())
    .then(data => {
      const sel = document.getElementById('rating-book');
      sel.innerHTML = '<option value="">Selecione o livro...</option>';
      data.books.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.id;
        opt.textContent = `${b.title} — ${b.author}`;
        sel.appendChild(opt);
      });
    });

  document.getElementById('modal-rating').style.display = 'flex';
};

const closeRatingModal = () => {
  document.getElementById('modal-rating').style.display = 'none';
};

/*
  --------------------------------------------------------------------------------------
        GET /ratings/book — Modal de avaliações de um livro específico
  --------------------------------------------------------------------------------------
*/
const openBookRatingsModal = (bookId, bookTitle) => {
  const modal = document.getElementById('modal-book-ratings');
  const list  = document.getElementById('book-ratings-list');

  document.getElementById('book-ratings-title').textContent = `Avaliações: ${bookTitle}`;
  list.innerHTML = '<p class="empty-msg">Carregando...</p>';
  modal.style.display = 'flex';

  fetch(`${API_RATINGS}/book?book_id=${bookId}`, { method: 'get' })
    .then(r => r.json())
    .then(data => {
      if (!data.ratings || data.ratings.length === 0) {
        list.innerHTML = '<p class="empty-msg">Nenhuma avaliação ainda.</p>';
        return;
      }
      list.innerHTML = '';
      data.ratings.forEach(r => {
        const item = document.createElement('div');
        item.className = 'rating-item';
        item.innerHTML = `
          <span class="rating-member-name">${r.member_name}</span>
          <span class="rating-stars">${renderStars(r.stars)}</span>
          <span class="rating-value">${r.stars}/5</span>
        `;
        list.appendChild(item);
      });
    })
    .catch(error => {
      list.innerHTML = '<p class="empty-msg">Erro ao carregar avaliações.</p>';
      console.error('Erro ao carregar avaliações do livro:', error);
    });
};

const closeBookRatingsModal = () => {
  document.getElementById('modal-book-ratings').style.display = 'none';
};

/*
  --------------------------------------------------------------------------------------
        GET /ratings/ — Modal com todas as avaliações
  --------------------------------------------------------------------------------------
*/
const openAllRatingsModal = () => {
  const modal = document.getElementById('modal-all-ratings');
  const list  = document.getElementById('all-ratings-list');

  list.innerHTML = '<p class="empty-msg">Carregando...</p>';
  modal.style.display = 'flex';

  fetch(`${API_RATINGS}/`, { method: 'get' })
    .then(r => r.json())
    .then(data => {
      if (!data.ratings || data.ratings.length === 0) {
        list.innerHTML = '<p class="empty-msg">Nenhuma avaliação cadastrada ainda.</p>';
        return;
      }
      list.innerHTML = '';
      data.ratings.forEach(r => {
        const item = document.createElement('div');
        item.className = 'rating-item';
        item.innerHTML = `
          <span class="rating-book-name">${r.book_title} — ${r.book_author}</span>
          <span class="rating-member-name">${r.member_name}</span>
          <span class="rating-stars">${renderStars(r.stars)}</span>
          <span class="rating-value">${r.stars}/5</span>
        `;
        list.appendChild(item);
      });
    })
    .catch(error => {
      list.innerHTML = '<p class="empty-msg">Erro ao carregar avaliações.</p>';
      console.error('Erro ao carregar todas as avaliações:', error);
    });
};

const closeAllRatingsModal = () => {
  document.getElementById('modal-all-ratings').style.display = 'none';
};

/*
  --------------------------------------------------------------------------------------
        Seletor de estrelas
  --------------------------------------------------------------------------------------
*/
document.querySelectorAll('.star').forEach(star => {
  star.addEventListener('click', () => {
    const value = parseInt(star.dataset.value);
    document.getElementById('rating-stars').value = value;
    document.querySelectorAll('.star').forEach(s => {
      s.classList.toggle('selected', parseInt(s.dataset.value) <= value);
    });
  });
});

/*
  --------------------------------------------------------------------------------------
        POST /ratings/ — Submeter avaliação
  --------------------------------------------------------------------------------------
*/
const submitRating = () => {
  const member_id = document.getElementById('rating-member').value;
  const book_id   = document.getElementById('rating-book').value;
  const stars     = parseInt(document.getElementById('rating-stars').value);

  if (!member_id) {
    alert('Selecione seu nome!');
    return;
  }
  if (!book_id) {
    alert('Selecione um livro!');
    return;
  }
  if (!stars || stars < 1) {
    alert('Selecione uma nota de 1 a 5 estrelas!');
    return;
  }

  fetch(`${API_RATINGS}/`, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      member_id: parseInt(member_id),
      book_id:   parseInt(book_id),
      stars
    })
  })
    .then(response => {
      if (response.status === 409) {
        alert('Você já avaliou este livro!');
        return null;
      }
      if (response.status === 404) {
        alert('Livro não encontrado.');
        return null;
      }
      return response.json();
    })
    .then(data => {
      if (!data) return;
      closeRatingModal();
      getList();
      alert('Avaliação registrada!');
    })
    .catch(error => console.error('Erro ao registrar avaliação:', error));
};

/*
  --------------------------------------------------------------------------------------
        Helpers — tabela, estrelas, inputs
  --------------------------------------------------------------------------------------
*/
const renderStars = (avg) => {
  if (avg === null || avg === undefined) return '☆☆☆☆☆';
  const full = Math.round(avg);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
};

const insertRow = (id, title, author, genre, read_date, recommended_by, avg_stars) => {
  const table = document.getElementById('books-table');
  const row   = table.insertRow();

  // Título clicável — abre avaliações do livro (GET /ratings/book)
  const titleCell = row.insertCell(-1);
  const titleLink = document.createElement('span');
  titleLink.textContent = title;
  titleLink.className   = 'book-title-link';
  titleLink.onclick     = () => openBookRatingsModal(id, title);
  titleCell.appendChild(titleLink);

  [author, genre, read_date, recommended_by].forEach(value => {
    const cell = row.insertCell(-1);
    cell.textContent = value;
  });

  // Coluna de estrelas
  const starsCell = row.insertCell(-1);
  starsCell.textContent = renderStars(avg_stars);
  starsCell.title = avg_stars !== null ? `${avg_stars} / 5` : 'Sem avaliações';

  // Botão de deletar
  const deleteCell = row.insertCell(-1);
  const btn = document.createElement('button');
  btn.textContent = '✕';
  btn.className   = 'btn-delete';
  btn.onclick     = () => deleteBook(title, author, row);
  deleteCell.appendChild(btn);
};

const clearTable = () => {
  const table = document.getElementById('books-table');
  while (table.rows.length > 1) table.deleteRow(1);
};

const clearInputs = () => {
  ['input-title', 'input-author', 'input-genre', 'input-date']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('input-recommended').selectedIndex = 0;
};

/*
  --------------------------------------------------------------------------------------
        Inicialização
  --------------------------------------------------------------------------------------
*/
getStats();
getBookOfMonth();