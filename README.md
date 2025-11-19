# ♻️ Reciman Game — Projeto Extensionista

Um jogo educativo desenvolvido para reforçar a conscientização ambiental, incentivo à reciclagem e introdução à lógica de programação por meio de um jogo 2D em pixel art.  
Criado no contexto de um **projeto extensionista**, o Reciman Game apresenta desafios de coleta seletiva, movimentação estratégica, perigos com ratos ladrões e ratos reis, além de mecânicas dinâmicas que evoluem por fases.

---

## 🎮 Sobre o Jogo

O jogador assume o papel de **Reciman**, um agente ambiental que deve:

- Coletar diferentes tipos de resíduos (Plástico, Papel, Metal e Orgânico)
- Levar cada item para a **lixeira correta**
- Fugir ou capturar ratos que atrapalham a coleta
- Lidar com **ratos ladrões** (que roubam itens)
- Tomar cuidado com **ratos reis** (que causam dano)
- Usar **gaiolas** para capturar ratos
- Avançar por fases progressivamente mais difíceis

Tudo isso em um mapa estilo labirinto gerado proceduralmente.

---

## 🕹️ Funcionalidades Principais

### ✔️ Mecânica de Movimentação
- Teclas WASD ou Setas para se mover  
- Barra de espaço para interagir (pegar/soltar item e capturar rato)

### ✔️ Sistema de Fases
- Fases incrementam conforme o jogador descarta corretamente
- Novos ratos aparecem a cada fase
- Ratos ficam mais rápidos conforme o jogo avança

### ✔️ Sistema de Vida
- O jogador possui **5 vidas**
- Rato Rei causa dano
- Dano gera efeito de piscar e teleporte seguro

### ✔️ Itens e Lixeiras
- 4 tipos de resíduos
- 4 lixeiras correspondentes (Plástico, Papel, Metal, Orgânico)
- Sistema que evita spawns sobrepostos

### ✔️ HUD Completo
- Pontuação 🎯  
- Fase 🚀  
- Contador de ratos 🐭  
- Vidas ❤️❤️❤️🖤🖤  
- Mensagens rápidas e coloridas de feedback

### ✔️ Inimigos
- **Rato ladrão**: rouba o lixo do jogador  
- **Rato rei**: causa dano  
- Ambos possuem animação (idle / walk)

### ✔️ Sistema de Gaiolas
- Gaiolas podem aparecer aleatoriamente
- Jogador usa para capturar ratos
- Pontuação e HUD atualizam dinamicamente

---

## 🧩 Tecnologias Utilizadas

- **HTML5 Canvas**
- **CSS3**
- **JavaScript Puro (ES6+)**
- Pixel Art 32×32
- Estruturas de matriz, grid e colisão

Nenhuma engine foi utilizada — tudo feito manualmente para fins educativos.

---

## 📚 Objetivos Extensionistas

O projeto busca:

- Incentivar boas práticas de **reciclagem**  
- Promover **consciência ambiental**  
- Introduzir jovens à **programação de jogos**  
- Estimular raciocínio lógico em um ambiente divertido  
- Servir como material pedagógico em escolas e oficinas  
