# FUSEX — Frontend

Interface HTML, CSS e JavaScript do projeto FUSEX, mantida separada da API Spring Boot.

## Executar o frontend com Docker

Requisitos: Docker Desktop com Docker Compose.

Na raiz deste repositório, execute:

```powershell
docker compose up --build -d
```

Acesse http://localhost:5500.

Para parar o servidor:

```powershell
docker compose down
```

Esse contêiner serve somente os arquivos estáticos do frontend. Ele não inicia o banco nem o backend Spring Boot.

## Executar o backend

O backend está no repositório [api03-backend](https://github.com/Eaglefatec/api03-backend). Para testar a aplicação completa, mantenha o backend ativo na porta `8080` antes de usar telas que consultam ou alteram dados.

No backend, o fluxo local é:
1. `docker compose up -d` para iniciar o MySQL.
2. `.\mvnw.cmd test` para executar os testes.
3. `.\mvnw.cmd spring-boot:run` para iniciar a API.

A API usa o contexto `/api`; a URL base configurada no frontend é `http://localhost:8080`.

## Configurar a URL da API

Edite `js/config.js`:

```javascript
const API_BASE = window.FUSEX_API_BASE || 'http://localhost:8080';
```

O backend deve permitir a origem do frontend via CORS. A configuração atual permite origens de desenvolvimento `localhost` e `127.0.0.1`.

## Estrutura

- `*.html`: telas do sistema.
- `css/`: folhas de estilo.
- `js/config.js`: URL base da API.

Parte do JavaScript permanece embutida nos HTMLs, preservando a estrutura das telas atuais. A extração desses scripts para arquivos separados pode ser feita em outra etapa, se necessário.
