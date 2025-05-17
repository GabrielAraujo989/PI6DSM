# Documentação do Treinamento

Esta pasta contém arquivos e instruções relacionadas ao processo de treinamento de modelos de detecção facial.

## Estrutura

- **Face Detection.v27i.yolov11/**: Dataset preparado para treinamento e validação.
- **WIDER_FACE/**: Outro dataset utilizado para treinar e validar modelos de detecção facial.
- **img_1.txt, 239739723-57391d0f-1848-4388-9f30-88c2fb79233f.jpg**: Exemplos de arquivos de anotação e imagem.

## Como utilizar os datasets

1. Os datasets já estão organizados em subpastas `train/`, `valid/` e `test/`.
2. Os arquivos `data.yaml` contêm as configurações de classes e caminhos para o treinamento.
3. Utilize scripts Python ou notebooks (ver pasta Model/) para treinar modelos YOLO ou outros frameworks.

## Observações
- Os datasets são grandes e estão ignorados no Git.
- Consulte os arquivos README.dataset.txt e README.roboflow.txt em cada dataset para detalhes de origem e estrutura.
