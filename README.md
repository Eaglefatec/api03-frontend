# FUSEX — Frontend (Sprint 2)

Interface HTML/CSS/JavaScript separada do backend Spring Boot.

## Executar com Docker

Na raiz da branch de integração, execute:

```bash
docker compose up --build
```

A interface ficará disponível em http://localhost:5500 e o backend em http://localhost:8080. O Compose inicia MySQL, backend e frontend. A configuração padrão do frontend chama a API em `http://localhost:8080`.

## Executar apenas o frontend para desenvolvimento

Se o backend já estiver executando na porta 8080, é possível servir os arquivos estáticos com Python:

```bash
python -m http.server 5500
```

No Windows, também pode usar `py -m http.server 5500`. Acesse http://localhost:5500. Esse servidor Python é opcional e serve somente os arquivos estáticos; ele não inicia nem substitui o backend.

## Configuração da API

O arquivo `js/config.js` define `API_BASE`, por padrão, como `http://localhost:8080`. Para outro ambiente, ajuste o valor ou defina `window.FUSEX_API_BASE` antes de carregar o arquivo.

## Escopo

- Inclui as 10 páginas HTML da versão integrada da Sprint 2 e os estilos CSS.
- As chamadas `fetch` usam uma URL base configurável.
- Parte do JavaScript continua embutida nos HTMLs; sua extração em arquivos próprios pode ser feita posteriormente.
- Este projeto contém apenas a interface. Autenticação, regras de negócio e persistência dependem do backend.
