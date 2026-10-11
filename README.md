# Microprojeto de Visão Computacional: Reconhecimento de Gestos Manuais

**Instituição:** IFPE  
**Projeto:** Microprojeto de Visão Computacional  
**Autora:** Ana Luiza Leão

## 1. Descrição do projeto

Este projeto utiliza visão computacional para reconhecer três gestos manuais: mão aberta, punho fechado e polegar para cima.

A detecção da mão é realizada com o **MediaPipe Hand Landmarker**, que identifica 21 pontos de referência. A partir desses pontos, são calculadas medidas geométricas utilizadas por um classificador baseado em regras.

O projeto possui um notebook para análise e experimentação e um aplicativo móvel com interface para selecionar imagens e visualizar os resultados da classificação.

## 2. Objetivos

- Detectar mãos em imagens.
- Extrair pontos de referência da mão.
- Classificar três gestos manuais.
- Avaliar os resultados e identificar limitações do classificador.

## 3. Estrutura do repositório

- `dados/`: conjunto de 15 imagens utilizadas nos testes.
- `notebooks/`: notebook com a implementação, experimentos e avaliação.
- `mobile/`: aplicativo desenvolvido com React Native e Expo.

## 4. Tecnologias utilizadas

- Python e Jupyter Notebook.
- MediaPipe Hand Landmarker.
- OpenCV e NumPy.
- React Native, Expo e TypeScript.

## 5. Resultados

Na avaliação exploratória do classificador do notebook, foram obtidos 15 acertos em 15 imagens. No aplicativo, foram obtidos 11 acertos em 15 imagens, correspondendo a uma acurácia de 73,3%.

Os resultados são preliminares, pois foram utilizados apenas 15 exemplos. O desempenho pode variar em imagens inéditas, com diferentes condições de iluminação, ângulos e posicionamentos das mãos.

## 6. Como executar o aplicativo

É necessário ter Node.js e npm instalados.

No terminal, entre na pasta `mobile` e execute:

```bash
npm install
npx expo start --web
```

O aplicativo utiliza um modelo local em `mobile/public/models/hand_landmarker.task` e carrega os recursos JavaScript e WebAssembly do MediaPipe a partir de uma CDN. Portanto, é necessária uma conexão com a internet para carregar esses recursos externos.

## 7. Ética e limitações

O projeto utiliza imagens para fins educacionais. O conjunto de dados é pequeno e não representa a diversidade de pessoas e condições de captura encontradas no mundo real. O sistema pode cometer erros e não deve ser utilizado como mecanismo de identificação pessoal ou para decisões importantes.

## 8. Trabalhos futuros

Como melhorias, propõe-se ampliar o conjunto de imagens, realizar testes independentes, avaliar diferentes condições de captura e aprimorar as regras de classificação.

## 9. Demonstração

O repositório deve incluir um vídeo curto demonstrando o funcionamento do aplicativo e a classificação dos gestos.