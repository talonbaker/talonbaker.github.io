---
title: "Graphics & Systems Programming"
layout: single
permalink: /programming/graphics-systems/
---

# 🖥️ Graphics & Systems

<figure class="project-figure">
  <img src="/assets/images/programming/project_glsl_pixelationshader/glslShader_1.png" alt="GLSL Pixelation Shader" class="project-thumb" />
  <figcaption>GLSL Pixelation Post-Processing Shader</figcaption>
</figure>

## Overview

A collection of graphics programming projects spanning OpenGL, WebGL, GLSL shaders, and Three.js. This work includes AI agents, C++ data structures, and C# tools.

---

## ✨ GLSL, WebGL — "Pixelation" Post-Processing Shader

Implemented a GLSL **"Pixelation" post-processing shader** in WebGL. I wanted an effect similar to the classic blur you might see on a TV censor. The user can select the amount of blur they want.

- **Technologies Used:** GLSL, WebGL, JavaScript

<div class="project-gallery">
  <figure>
    <img src="/assets/images/programming/project_glsl_pixelationshader/glslShader_1.png" alt="GLSL Pixelation shader 1" class="project-thumb" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_glsl_pixelationshader/glslShader_2.png" alt="GLSL Pixelation shader 2" class="project-thumb" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_glsl_pixelationshader/glslShader_3.png" alt="GLSL Pixelation shader 3" class="project-thumb" />
  </figure>
</div>

---

## 🌐 WebGL — Interactive Examples

Interactable examples of **WebGL and JavaScript** covering rotation, translation, texturing, camera control, FOV, ray-casting, and item selection.

- **Technologies Used:** WebGL, JavaScript
- **Code:** [**View on GitHub**](https://github.com/talonbaker/CMPS160)

<div class="project-gallery">
  <figure>
    <img src="/assets/images/programming/project_webgl/WebGL.png" alt="WebGL example" class="project-thumb" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_webgl/160P3_shape.png" alt="WebGL shape" class="project-thumb" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_webgl/160P4_color.png" alt="WebGL color" class="project-thumb" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_webgl/160P5_texture.png" alt="WebGL texture" class="project-thumb" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_webgl/160P6_rayCast.png" alt="WebGL ray cast" class="project-thumb" />
  </figure>
</div>

---

## 💡 Three.js — Interactive Examples

Interactable examples of **Three.js and JavaScript** including lighting & object manipulation, a mouse-movement-based shader, and Conway's Game of Life in Three.js.

- **Technologies Used:** Three.js, GLSL, JavaScript
- **Code:** [**View on GitHub**](https://github.com/talonbaker/CMPM163_Homework_1)

<div class="project-gallery">
  <figure>
    <img src="/assets/images/programming/project_threejs/163p1_screenshot.png" alt="Three.js example 1" class="project-thumb" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_threejs/163p2_screenshot.png" alt="Three.js example 2" class="project-thumb" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_threejs/163p3_screenshot.png" alt="Three.js example 3" class="project-thumb" />
  </figure>
</div>

---

## 🖥️ C++, OpenGL — Hexboard

The game of Hex is played on an 11×11 board with each player placing tokens of their color until there is a winner. I represented this in C++ using OpenGL and populated the board with a random, even placement of red and blue tokens. The game of Hex necessarily must have a winner and is calculated using a simple **weighted graph for node traversal**.

- **Technologies Used:** C++, OpenGL
- **Code:** [**View on GitHub**](https://github.com/talonbaker/HexBoard)

<div class="project-gallery">
  <figure>
    <img src="/assets/images/programming/project_opengl_hexboard/step_3.png" alt="Hexboard step 3" class="project-thumb" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_opengl_hexboard/step_6.png" alt="Hexboard step 6" class="project-thumb" />
  </figure>
  <figure>
    <img src="/assets/images/programming/project_opengl_hexboard/output.png" alt="Hexboard final output" class="project-thumb" />
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
  <img src="/assets/images/programming/project_opengl_conwaysgameoflife/conwaygl.png" alt="Conway's Game of Life in OpenGL — still life" class="project-thumb" />
  <figcaption>Still life… get it?</figcaption>
</figure>

---

[← Back to Projects](/programming/)
