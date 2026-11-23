/*
- Sessão única do FUSEX: o usuário entra em login.html e a sessão é compartilhada pelas telas do seu perfil.
 */
(function () {
  'use strict';

  var K_AUTH = 'fusex_auth';
  var K_USER = 'fusex_user';
  var K_MEDICO = 'fusex_medico';
  var K_ROLES = 'fusex_roles';

  // Tela inicial de cada perfil (a primeira regra compatível define o destino)
  var DESTINOS = [
    ['ROLE_ADMIN', 'index.html'],
    ['ROLE_LISURA', 'lisura.html'],
    ['ROLE_MEDICO_CHEFE', 'assinatura-guias.html'],
    ['ROLE_CHEFE_SECAO', 'assinatura-guias.html'],
    ['ROLE_OCS', 'validade-guia.html'],
    ['ROLE_FATURAMENTO', 'faturamento.html'],
    ['ROLE_EG', 'pre-guias.html'],
    ['ROLE_MEDICO', 'medico.html']
  ];

  var rawFetch = window.fetch.bind(window);

  function roles() {
    try { return JSON.parse(sessionStorage.getItem(K_ROLES) || '[]'); } catch (e) { return []; }
  }
  function token() { return sessionStorage.getItem(K_AUTH); }
  function user() { return sessionStorage.getItem(K_USER); }
  function isLoggedIn() { return !!token(); }
  function hasRole(r) { return roles().indexOf(r) >= 0; }
  function hasAny(list) { return list.some(hasRole); }
  function header() { return token() ? 'Basic ' + token() : null; }

  function destinoPara(rolesList) {
    for (var i = 0; i < DESTINOS.length; i++) {
      if (rolesList.indexOf(DESTINOS[i][0]) >= 0) return DESTINOS[i][1];
    }
    return null;
  }

  function clear() {
    [K_AUTH, K_USER, K_MEDICO, K_ROLES].forEach(function (k) { sessionStorage.removeItem(k); });
  }

  function paginaAtual() {
    var p = location.pathname.split('/').pop() || 'index.html';
    return p + location.search;
  }

  function irParaLogin() {
    var next = paginaAtual();
    var alvo = 'login.html';
    if (next && next !== 'login.html' && next !== 'index.html') alvo += '?next=' + encodeURIComponent(next);
    location.replace(alvo);
  }

  function logout() {
    clear();
    location.replace('login.html');
  }

  // Aceita apenas redirecionamentos internos para páginas .html do sistema
  function nextSeguro(n) {
    return (typeof n === 'string' && /^[a-z0-9-]+\.html(\?[^#]*)?$/i.test(n)) ? n : null;
  }

  async function login(email, senha) {
    var tk = btoa(unescape(encodeURIComponent(email + ':' + senha)));
    var res = await rawFetch('/api/auth/me', { headers: { 'Authorization': 'Basic ' + tk } });
    if (res.status === 401) throw new Error('E-mail ou senha incorretos.');
    if (!res.ok) throw new Error('Falha de conexão com o servidor (status ' + res.status + ').');
    var data = await res.json();
    var r = data.roles || [];
    var destino = destinoPara(r);
    if (!destino) throw new Error('Este usuário não possui perfil de acesso configurado.');
    clear();
    sessionStorage.setItem(K_AUTH, tk);
    sessionStorage.setItem(K_USER, data.username);
    sessionStorage.setItem(K_ROLES, JSON.stringify(r));
    if (data.medico) sessionStorage.setItem(K_MEDICO, JSON.stringify(data.medico));
    return { data: data, destino: destino };
  }

  // Garante que o usuário está autenticado e pertence a um dos perfis permitidos nesta página
  function require(allowedRoles) {
    if (!isLoggedIn()) { irParaLogin(); return false; }
    if (allowedRoles && allowedRoles.length && !hasAny(allowedRoles)) {
      var destino = destinoPara(roles());
      if (destino && destino !== paginaAtual().split('?')[0]) { location.replace(destino); } else { logout(); }
      return false;
    }
    return true;
  }

  function renderUserBox(el, rotulo) {
    if (!el) return;
    el.innerHTML = '';
    var b = document.createElement('b');
    b.textContent = user() || 'Não autenticado';
    el.appendChild(b);
    el.appendChild(document.createTextNode(rotulo || 'Autenticado'));
    var br = document.createElement('br');
    el.appendChild(br);
    var a = document.createElement('a');
    a.href = '#';
    a.textContent = 'Sair';
    a.style.cssText = 'color:inherit;text-decoration:underline;font-size:12px;';
    a.addEventListener('click', function (e) { e.preventDefault(); logout(); });
    el.appendChild(a);
  }

  // Se qualquer chamada à API retornar 401 durante a sessão, limpa os dados e volta ao login
  window.fetch = async function () {
    var res = await rawFetch.apply(null, arguments);
    if (res.status === 401 && isLoggedIn()) { clear(); irParaLogin(); }
    return res;
  };

  window.FusexAuth = {
    login: login, logout: logout, require: require, header: header, user: user, roles: roles,
    hasRole: hasRole, hasAny: hasAny, isLoggedIn: isLoggedIn, destinoPara: destinoPara,
    nextSeguro: nextSeguro, renderUserBox: renderUserBox, clear: clear
  };
})();