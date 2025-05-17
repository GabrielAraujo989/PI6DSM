# Recognition System

Este projeto é um sistema de reconhecimento de imagens que trabalha em conjunto com um modelo de detecção. O sistema é dividido em várias partes, cada uma responsável por uma funcionalidade específica.

## Estrutura do Projeto

- **src/detection/detector.ts**: Implementação do modelo de detecção. Contém a classe `Detector` com métodos para detectar objetos em imagens.
  
- **src/recognition/recognizer.ts**: Implementação do sistema de reconhecimento. Contém a classe `Recognizer` com métodos como `recognizeImage` e `getRecognitionData`, que utilizam Nome e ID para reconhecer imagens.

- **src/photos**: Pasta destinada ao armazenamento de fotos que serão utilizadas para reconhecimento. 

- **src/photos/README.md**: Instruções sobre como adicionar fotos para o reconhecimento, incluindo informações sobre o formato das imagens e o processamento realizado pelo sistema.

- **src/types/index.ts**: Exporta interfaces que definem a estrutura dos dados utilizados no sistema, como `RecognitionResult`, que inclui propriedades como `name` e `id`.

- **tsconfig.json**: Configuração do TypeScript, especificando opções do compilador e arquivos a serem incluídos na compilação.

- **package.json**: Configuração do npm, listando dependências e scripts para o projeto.

## Como Usar

1. Adicione suas imagens na pasta `src/photos`.
2. Utilize a classe `Recognizer` para reconhecer as imagens com base no Nome e ID.
3. Consulte o arquivo `src/photos/README.md` para mais detalhes sobre o formato das imagens e instruções de uso.

## Contribuição

Sinta-se à vontade para contribuir com melhorias e correções. Para isso, faça um fork do repositório e envie suas alterações através de um pull request.