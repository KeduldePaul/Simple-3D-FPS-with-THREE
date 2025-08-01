import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js';

import KUI from './KUILib4Three/KUI.js';
import {controlSetup} from './KUILib4Three/Touches.js';
import KUIManager from './KUILib4Three/KUIManager.js';
import Joystick from './KUILib4Three/Joystick.js';
import Touchlook from './KUILib4Three//Touchlook.js';

import GameScene from './scene.js';
import {Player} from './player.js';

const cnv = document.querySelector('#cnv');
const cnvUi = document.querySelector('#cnv-ui');
const ctx = cnvUi.getContext('2d');

let uiManager;
let joys;
let lookControl;

let gameScene;

let previousTime, dt;

function resizeCanvas(frontDPI) {
  cnv.width  = window.innerWidth;
  cnv.height = window.innerHeight;
  
  cnvUi.style.width  = window.innerWidth+'px';
  cnvUi.style.height = window.innerHeight+'px';
  cnvUi.width  = window.innerWidth * frontDPI;
  cnvUi.height = window.innerHeight * frontDPI;
  
  if (gameScene) {
    gameScene.reinitCamera(window.innerWidth, window.innerHeight);
  }
}

function preload() {
  
}

function setup() {
  previousTime = 0;
  
  gameScene = new GameScene(cnv, cnvUi, ctx);
  
  controlSetup(cnvUi, {touchDown, touchMove, touchUp});
  
  uiManager = new KUIManager();
  joys = new Joystick();
  joys.setLocation(50, 200);
  joys.setBoundary(0, 0, cnvUi.width /2, cnvUi.height);
  uiManager.add(joys);
  
  lookControl = new Touchlook();
  lookControl.setZone(cnvUi.width /2, 0, cnvUi.width, cnvUi.height);
  // lookControl.setEntity(player);
  uiManager.add(lookControl);
  
  gameScene.setPlayerController(joys, lookControl);
  gameScene.start();
}

function touchDown(id, x, y, t) {
  uiManager.onDown(id, x, y, t);
}

function touchMove(id, x, y, t) {
  uiManager.onMove(id, x, y, t);
}

function touchUp(id, x, y, t) {
  uiManager.onUp(id, x, y, t);
}

function animate(time) {
  time *= 0.001;
  
  dt = time - previousTime;
  previousTime = time;
  
  gameScene.draw(time, dt);
  
  lookControl.show(ctx);
  
  requestAnimationFrame(animate);
}

window.onload = () => {
  resizeCanvas(1);
  
  const start = () => {
    setup();
    animate(0);
  };
  
  if (typeof preload === 'function') {
    preload();
    
    // Promises...
    
    start();
  } else {
    start();
  }
}

window.addEventListener('resize', () => {
  resizeCanvas(1);
});