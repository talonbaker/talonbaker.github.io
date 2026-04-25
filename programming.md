---
title: "Code & Game Projects"
layout: single
permalink: /programming/
---

# **Programming • Game Design • Producing**
A collection of projects spanning VR games, graphics programming, AI agents, web interactives, and game design.

---

## 🎮 Wacktory™

<figure class="project-figure">
  <a href="https://store.steampowered.com/app/1082750/Wacktory/" target="_blank" rel="noopener">
    <img src="/assets/images/programming/project_wacktory/WacktoryAwardBanner.png" alt="Wacktory UCSC Grand Prize Award" class="project-thumb project-thumb--clickable" />
  </a>
  <figcaption>🏆 UCSC Games Showcase Grand Prize Winner — click to view on Steam</figcaption>
</figure>

Wacktory™ is a new take on cooperative gameplay that pushes the limits of both Virtual Reality and traditional couch co-op. Players work together to beat the clock and create the most advanced product ever seen — **The Cube**. **PLAYERS AREN'T JUST WAITING FOR THEIR TURN IN VR.**

Over the last 6 months of my graduate year, I helped lead the Wacktory team from game concept to a fully playable VR demo available on Steam. Using Agile/Scrum frameworks to track weekly milestones, I helped the team maintain a steady workflow with positive output throughout the process.

- **Role:** Producer & Programmer
- **Technologies Used:** Unity 3D, Unity VR, C#, Steam SDK
- **Links:** [**Steam Store**](https://store.steampowered.com/app/1082750/Wacktory/) · [**Wacktory.com**](https://wacktory.com)

<div class="video-embed">
  <iframe
    src="https://www.youtube.com/embed/avccGwMOnUY"
    title="Wacktory - Teaser Trailer"
    loading="lazy"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen></iframe>
</div>

<div class="project-gallery">
  <figure>
    <img src="/assets/images/programming/project_wacktory/WacktoryLogo.png" alt="Wacktory Logo" class="project-thumb project-thumb--plain" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_wacktory/teamGrandPrizePhotoCROP.JPG" alt="Wacktory team Grand Prize photo" class="project-thumb project-thumb--plain" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_wacktory/ucscGamesShowcase2019GrandPrizeWacktoryCROP.JPG" alt="UCSC Games Showcase 2019 Grand Prize" class="project-thumb project-thumb--plain" />
  </figure>
</div>

---

## 🖥️ C++, OpenGL — Hexboard

The game of Hex is played on an 11×11 board with each player placing tokens of their color until there is a winner. I represented this in C++ using OpenGL and populated the board with a random, even placement of red and blue tokens. The game of Hex necessarily must have a winner and is calculated using a simple **weighted graph for node traversal**.

- **Technologies Used:** C++, OpenGL
- **Code:** [**View on GitHub**](https://github.com/talonbaker/HexBoard)

<div class="project-gallery">
  <figure>
    <img src="/assets/images/programming/project_opengl_hexboard/step_3.png" alt="Hexboard step 3" class="project-thumb project-thumb--plain" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_opengl_hexboard/step_6.png" alt="Hexboard step 6" class="project-thumb project-thumb--plain" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_opengl_hexboard/output.png" alt="Hexboard final output" class="project-thumb project-thumb--plain" />
  </figure>
</div>

---

## 🖥️ C++, OpenGL — Conway's Game of Life

I wanted to implement Conway's Game of Life in OpenGL where **every pixel on the screen is a cell** and every cell interacts with every other. The Game of Life is a "zero player" game governed by these rules:

1. Any live cell with fewer than two live neighbours dies (underpopulation).
2. Any live cell with two or three live neighbours lives on.
3. Any live cell with more than three live neighbours dies (overpopulation).

- **Technologies Used:** C++, OpenGL
- **Code:** [**View on GitHub**](https://github.com/talonbaker/Conwaygl)

<figure class="project-figure">
  <img src="/assets/images/programming/project_opengl_conwaysgameoflife/conwaygl.png" alt="Conway's Game of Life in OpenGL — still life" class="project-thumb project-thumb--plain" />
  <figcaption>Still life… get it?</figcaption>
</figure>

---

## 🐍 Python, PILlow — Puzzle Solving AI Agent

Constructed an AI agent using **Python and Pillow (Python Image Library)** that uses visual inputs to recognize patterns, manipulate input frames, and calculate the probability of the most likely answer to **Raven's Progressive Matrices** Tests of Intelligence puzzles.

- **Technologies Used:** Python, Pillow (PIL)
- **Note:** All code is on Georgia Tech's private GitHub class repository.

<div class="project-gallery">
  <figure>
    <img src="/assets/images/programming/project_python_pillow/generated_1.png" alt="Python PIL output 1" class="project-thumb project-thumb--plain" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_python_pillow/generated_2.png" alt="Python PIL output 2" class="project-thumb project-thumb--plain" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_python_pillow/generated_4.png" alt="Python PIL output 4" class="project-thumb project-thumb--plain" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_python_pillow/generated_5.png" alt="Python PIL output 5" class="project-thumb project-thumb--plain" />
  </figure>
</div>

---

## 🪟 C#, Windows Forms — Minesweeper

In familiarizing myself with Windows Forms, I recreated Minesweeper. The player can select any number of rows/columns and any number of bombs, and the board generates itself randomly. It's not flashy, but it was fun to get working.

- **Technologies Used:** C#, Windows Forms (.NET)
- **Code:** [**View on GitHub**](https://github.com/talonbaker/MinesweeperForms)

<div class="project-gallery">
  <figure>
    <img src="/assets/images/programming/project_winforms_minesweeper/MSFormsControlForm.png" alt="Minesweeper control form" class="project-thumb project-thumb--plain" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_winforms_minesweeper/MSFormsGeneratedBoardReveal.png" alt="Minesweeper board revealed" class="project-thumb project-thumb--plain" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_winforms_minesweeper/MSFormsGeneratedBoardBoomed.png" alt="Minesweeper — boom!" class="project-thumb project-thumb--plain" />
  </figure>
</div>

---

## 🧪 C#, AI — Water Sort Puzzle Solver

An AI agent for solving the **"Water Sort"** mobile puzzle game. Given a puzzle input, the agent will solve it and return the sequence of steps needed to complete the game.

- **Technologies Used:** C#, BFS/graph search
- **Code:** [**View on GitHub**](https://github.com/talonbaker/TubeSolver)

<figure class="project-figure">
  <img src="/assets/images/programming/project_csharp_watersortpuzzle/WaterSortScreenshot.png" alt="Water Sort Puzzle Solver" class="project-thumb project-thumb--plain" />
</figure>

---

## ✨ GLSL, WebGL — "Pixelation" Post-Processing Shader

Implemented a GLSL **"Pixelation" post-processing shader** in WebGL. I wanted an effect similar to the classic blur you might see on a TV censor. The user can select the amount of blur they want.

- **Technologies Used:** GLSL, WebGL, JavaScript

<div class="project-gallery">
  <figure>
    <img src="/assets/images/programming/project_glsl_pixelationshader/glslShader_1.png" alt="GLSL Pixelation shader 1" class="project-thumb project-thumb--plain" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_glsl_pixelationshader/glslShader_2.png" alt="GLSL Pixelation shader 2" class="project-thumb project-thumb--plain" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_glsl_pixelationshader/glslShader_3.png" alt="GLSL Pixelation shader 3" class="project-thumb project-thumb--plain" />
  </figure>
</div>

---

## 🌐 WebGL — Interactive Examples

Interactable examples of **WebGL and JavaScript** covering rotation, translation, texturing, camera control, FOV, ray-casting, and item selection.

- **Technologies Used:** WebGL, JavaScript
- **Code:** [**View on GitHub**](https://github.com/talonbaker/CMPS160)

<div class="project-gallery">
  <figure>
    <img src="/assets/images/programming/project_webgl/WebGL.png" alt="WebGL example" class="project-thumb project-thumb--plain" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_webgl/160P3_shape.png" alt="WebGL shape" class="project-thumb project-thumb--plain" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_webgl/160P4_color.png" alt="WebGL color" class="project-thumb project-thumb--plain" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_webgl/160P5_texture.png" alt="WebGL texture" class="project-thumb project-thumb--plain" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_webgl/160P6_rayCast.png" alt="WebGL ray cast" class="project-thumb project-thumb--plain" />
  </figure>
</div>

---

## 💡 Three.js — Interactive Examples

Interactable examples of **Three.js and JavaScript** including lighting & object manipulation, a mouse-movement-based shader, and Conway's Game of Life in Three.js.

- **Technologies Used:** Three.js, GLSL, JavaScript
- **Code:** [**View on GitHub**](https://github.com/talonbaker/CMPM163_Homework_1)

<div class="project-gallery">
  <figure>
    <img src="/assets/images/programming/project_threejs/163p1_screenshot.png" alt="Three.js example 1" class="project-thumb project-thumb--plain" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_threejs/163p2_screenshot.png" alt="Three.js example 2" class="project-thumb project-thumb--plain" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_threejs/163p3_screenshot.png" alt="Three.js example 3" class="project-thumb project-thumb--plain" />
  </figure>
</div>

---

## 🌄 P5.js — Infinite Rolling Landscape (Hash Maps)

**Infinite and interactive rolling landscape generation** using hash maps and P5.js. Also check out **Marbelous** — a collaborative game built on the same concept.

- **Technologies Used:** P5.js, JavaScript, HTML
- **Play Marbelous:** [**jeremylafond.itch.io/marbelous**](https://jeremylafond.itch.io/marbelous)

<div class="project-gallery">
  <figure>
    <img src="/assets/images/programming/project_marbelous/marbelousImage.png" alt="Marbelous game" class="project-thumb project-thumb--plain" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_infiniteroller/hashLandscapeScreenshot.png" alt="Hash Landscape" class="project-thumb project-thumb--plain" />
  </figure>
</div>

---

## 🎭 Producing — The Guardians of UCSC

**The Guardians of UCSC** is an ARG (Alternate Reality Game) that took place in Winter 2018 throughout the UC Santa Cruz campus. Players were taken on a journey leading them to physical locations and online places to solve riddles and work together to uncover the dark history of UC Santa Cruz.

Over a 10-week period I helped lead a team to produce this ARG. I used a Gantt chart to track progress and regularly coordinated all departments. During the live game we scheduled performances, demonstrations, held cryptic online Reddit conversations to advance the plot, and invited the school to a vigil to mark the end. **There are still artifacts at the school to this day.**

- **Role:** Producer, Game Designer
- **Website:** [**goucsc.weebly.com**](https://goucsc.weebly.com/)

<figure class="project-figure">
  <a href="https://goucsc.weebly.com/" target="_blank" rel="noopener">
    <img src="/assets/images/programming/project_theguardiansofucsc/GoUCSCRiddlePoster.png" alt="The Guardians of UCSC — Riddle Poster" class="project-thumb project-thumb--clickable" />
  </a>
  <figcaption>Click to visit The Guardians of UCSC website</figcaption>
</figure>

<div class="video-embed">
  <iframe
    src="https://www.youtube.com/embed/q4WQaD0bkjs"
    title="The Guardians of UCSC — ARG Video"
    loading="lazy"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen></iframe>
</div>

---

## 🕹️ Game Design — A Collection

Some digital, some analog, some just experiments.

<div class="project-gallery">
  <figure>
    <a href="https://tebaker.itch.io/salt" target="_blank" rel="noopener">
      <img src="/assets/images/programming/project_aswadw/aswadwImage.png" alt="A Salt With A Deadly Weapon" class="project-thumb project-thumb--clickable" />
    </a>
    <figcaption><strong>A Salt With A Deadly Weapon</strong></figcaption>
  </figure>
  <figure>
    <img src="/assets/images/programming/project_ratsinasewer/riasImage.png" alt="Rats in a Sewer" class="project-thumb project-thumb--plain" />
    <figcaption><strong>Rats in a Sewer</strong></figcaption>
  </figure>
  <figure>
    <img src="/assets/images/programming/project_theobsessivehobbyist/theObsessiveHobbyistImage.png" alt="The Obsessive Hobbyist" class="project-thumb project-thumb--plain" />
    <figcaption><strong>The Obsessive Hobbyist</strong></figcaption>
  </figure>
  <figure>
    <img src="/assets/images/programming/project_latourdebike/LaTourDeBikeImage.png" alt="La Tour De Bike" class="project-thumb project-thumb--plain" />
    <figcaption><strong>La Tour De Bike</strong></figcaption>
  </figure>
  <figure>
    <a href="https://tebaker.itch.io/surrogate" target="_blank" rel="noopener">
      <img src="/assets/images/programming/project_surrogate/surrogateImage.png" alt="Surrogate" class="project-thumb project-thumb--clickable" />
    </a>
    <figcaption><strong>Surrogate</strong></figcaption>
  </figure>
  <figure>
    <a href="https://tebaker.itch.io/bakerrunner" target="_blank" rel="noopener">
      <img src="/assets/images/programming/project_fattybird/fattyBirdImage.png" alt="Fatty Bird Learns to Fly" class="project-thumb project-thumb--clickable" />
    </a>
    <figcaption><strong>Fatty Bird Learns to Fly</strong></figcaption>
  </figure>
</div>
