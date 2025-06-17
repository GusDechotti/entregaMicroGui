-----

# Sistema de Tradução Assíncrona com Microsserviços

Projeto acadêmico desenvolvido para a disciplina de Tecnologias Emergentes, com o objetivo de demonstrar a implementação prática de comunicação assíncrona entre serviços utilizando uma fila de mensagens.

-----

### Links úteis

1.  [GitHub Dechotti](https://github.com/GusDechotti)
2.  [Repositório do projeto](https://github.com/GusDechotti/entregaMicroGui)

-----

## 1\. Visão Geral do Projeto

Este projeto consiste em um sistema de tradução de textos construído sobre uma arquitetura de microsserviços. A aplicação é composta por dois serviços principais:

  * **API de Tradução (`translation-api`):** Uma API REST responsável por receber as requisições de tradução dos usuários. Ela não executa a tradução diretamente, mas a delega para um serviço secundário.
  * **Worker de Tradução (`translation-worker`):** Um serviço de background que escuta por novas tarefas de tradução, processa-as e atualiza o resultado no banco de dados.

A comunicação entre a API e o Worker é feita de forma **assíncrona** através de uma fila de mensagens (RabbitMQ), que é o pilar central deste trabalho.

## 2\. Objetivo Acadêmico

O principal objetivo deste trabalho é aplicar e demonstrar os conceitos de **comunicação assíncrona** em uma arquitetura distribuída, destacando os seguintes benefícios:

  * **Desacoplamento:** A API (produtora) não precisa conhecer os detalhes de implementação do Worker (consumidor), nem mesmo saber se ele está online no momento da requisição. Isso permite que os serviços evoluam de forma independente.
  * **Resiliência e Tolerância a Falhas:** Se o Worker estiver offline ou falhar, as requisições de tradução não são perdidas. Elas permanecem na fila e serão processadas assim que o serviço se recuperar.
  * **Escalabilidade:** É possível escalar o sistema de forma independente. Se houver um grande volume de traduções, podemos adicionar mais instâncias do `translation-worker` para processar a fila mais rapidamente, sem precisar alterar a API.
  * **Melhora na Experiência do Usuário (UX):** O usuário recebe uma resposta imediata da API (`202 Accepted`), confirmando que sua solicitação foi recebida. Ele não precisa esperar o término de uma tarefa potencialmente demorada (a tradução), podendo consultar o status posteriormente.

## 3\. Arquitetura do Sistema

O fluxo de dados segue o padrão **Produtor-Consumidor**, mediado por uma fila de mensagens.

**Fluxo da Requisição:**

1.  O cliente envia uma requisição `POST /translations` para a **`translation-api`**.
2.  A API gera um `requestId` único, salva a requisição no **MongoDB** com status `"queued"`.
3.  A API publica uma mensagem contendo o `requestId` na fila do **RabbitMQ**.
4.  A API responde imediatamente ao cliente com o `requestId`, confirmando o recebimento.
5.  O **`translation-worker`**, que está escutando a fila, consome a mensagem.
6.  O Worker atualiza o status da requisição para `"processing"` no MongoDB.
7.  O Worker realiza a tradução (simulada).
8.  Ao concluir, o Worker atualiza o status para `"completed"` (ou `"failed"` em caso de erro) e salva o texto traduzido no MongoDB.
9.  O cliente pode usar o endpoint `GET /translations/:requestId` a qualquer momento para consultar o status final da sua solicitação.

## 4\. Tecnologias Utilizadas

| Componente | Tecnologia | Justificativa |
|---|---|---|
| **Orquestração** | **Docker & Docker Compose** | Isola e gerencia o ciclo de vida de todos os serviços de forma consistente. |
| **Serviço da API** | **Node.js + Express.js** | Ecossistema robusto e performático para a criação de APIs REST. |
| **Serviço Worker** | **Node.js** | Utiliza a mesma base tecnológica da API, facilitando o desenvolvimento. |
| **Banco de Dados** | **MongoDB** | Banco de dados NoSQL orientado a documentos, ideal para armazenar os dados de cada requisição. |
| **Fila de Mensagens** | **RabbitMQ** | Message broker robusto e confiável, padrão de mercado para implementação de filas de tarefas. |
| **Documentação da API**| **Swagger / OpenAPI** | Gera uma documentação interativa para a API, facilitando testes e o entendimento dos endpoints. |
| **Comunicação com o DB** | **Mongoose** | Biblioteca ODM que facilita a modelagem e interação com o MongoDB em um ambiente Node.js. |
| **Comunicação com a Fila**| **amqplib** | Biblioteca cliente AMQP para Node.js, permitindo a comunicação com o RabbitMQ. |

## 5\. Como Executar o Projeto

### Pré-requisitos

  * Git
  * Docker
  * Docker Compose

### Passo a Passo

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/GusDechotti/entregaMicroGui.git
    ```

2.  **Navegue até a pasta do projeto:**

    ```bash
    cd sistema-traducao-nodejs
    ```

3.  **Construa as imagens Docker dos serviços:**
    Este comando irá ler os `Dockerfiles` e instalar as dependências (`npm install`).

    ```bash
    docker-compose build
    ```

4.  **Inicie todos os contêineres:**
    Este comando subirá a API, o Worker, o MongoDB e o RabbitMQ.

    ```bash
    docker-compose up -d
    ```

5.  **Para verificar os logs e ver os serviços funcionando:**

    ```bash
    docker-compose logs -f
    ```

    Pressione `Ctrl + C` para sair da visualização de logs.

## 6\. Como Testar a Aplicação

Você pode testar a API de duas maneiras: através da documentação interativa com Swagger ou usando um cliente de API como o `curl`.

### 1\. Acessando a Documentação Interativa (Swagger)

A forma mais fácil de testar é usando a interface do Swagger, que documenta e permite interagir com a API diretamente pelo navegador.

1.  Após iniciar os contêineres, acesse o seguinte endereço no seu navegador:
    **[http://localhost:3000/api-docs](https://www.google.com/search?q=http://localhost:3000/api-docs)**

2.  Você verá os dois endpoints da API. Clique em um deles para expandir, preencha os parâmetros necessários e clique em "Execute" para enviar uma requisição real.

### 2\. Testando com `curl` (Linha de Comando)

#### a) Criar uma Requisição de Tradução

Envie uma requisição `POST` para criar uma nova tarefa.

```bash
curl -X POST http://localhost:3000/translations \
-H "Content-Type: application/json" \
-d '{
  "text": "world",
  "sourceLanguage": "en",
  "targetLanguage": "pt"
}'
```

A resposta será um JSON com o `requestId` gerado. **Guarde este ID.**

```json
{
  "message": "Translation request received.",
  "requestId": "687f191e810c19729de860ea" 
}
```

#### b) Consultar o Status da Tradução

Use o `requestId` recebido para consultar o status da tarefa.

```bash
# Substitua SEU_REQUEST_ID_AQUI pelo ID que você recebeu
curl http://localhost:3000/translations/SEU_REQUEST_ID_AQUI
```

  * **Resposta imediata:** O status provavelmente será `"processing"`.
  * **Resposta após alguns segundos:** O status mudará para `"completed"` e o campo `translatedText` será preenchido.

<!-- end list -->

```json
{
    "status": "completed",
    "requestId": "687f191e810c19729de860ea",
    "originalText": "world",
    "translatedText": "mundo",
    "sourceLanguage": "en",
    "targetLanguage": "pt",
    "errorMessage": null,
    "createdAt": "2025-06-18T22:00:30.178Z",
    "updatedAt": "2025-06-18T22:00:35.421Z"
}
```

## 7\. Estrutura de Pastas

```
/sistema-traducao-nodejs/
├── docker-compose.yml        # Orquestra todos os serviços
├── translation-api/          # Microsserviço da API REST (Produtor)
│   ├── Dockerfile
│   ├── package.json
│   └── src/                  # Código-fonte da API
│       └── swagger.json      # Definição da documentação OpenAPI
└── translation-worker/       # Microsserviço de tradução (Consumidor)
    ├── Dockerfile
    ├── package.json
    └── src/                  # Código-fonte do Worker
```

## 8\. Autor

**[Seu Nome Completo]**

  * **RA:** 20222949
  * **Curso:** Engenharia de Software
  * **Turma:** 5° Período
  * **Instituição:** Biopark Educação