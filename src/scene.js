import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js';

import {Player} from './player.js';

export default class GameScene extends THREE.Scene {
  _loadPromises = [];
  
  constructor(canvas3d, uiCanvas, ctx2d) {
    super();
    
    this.cnv   = canvas3d;
    this.cnvui = uiCanvas;
    this.ctx2d = ctx2d;
    
    this.player = new Player(0, 10);
    
    // this._loadPromises.all((res, rej) => {
    //   this.setup();
    //   this.draw();
    // });
    
    this.mapSize = {x:10, y:20};
    
    this.map = `
      ####################
      #.............D....#
      #..####.......####.#
      #..#...........#...#
      #.....#..E.....#...#
      #..####........#...#
      #...............#..#
      #.....#######...#..#
      #.....#.....#...#..#
      ####################
    `.trim().split('\n');

  }
  
  setPlayerController(joystick, touchlook) {
    this.joys = joystick;
    this.lookControl = touchlook;
    this.lookControl.setEntity(this.player);
  }
  
  start() {
    // this.preload();
    this.init3D();
    this.setup();
  }
  
  preload() {
    
  }
  
  reinitCamera(newW, newH) {
    this.cam.aspect = newW / newH;
    thie.cam.updateProjectionMatrix();
  }
  
  init3D() {
    let {cnv} = this;
    
    this.background = new THREE.Color(0xcccccc);
    
    this.cam = new THREE.PerspectiveCamera(75, cnv.width/cnv.height, 0.1, 1000);
    this.cam.position.set(0, 2, 20);
    
    this.rend = new THREE.WebGLRenderer({canvas: cnv, antialias:true});
    this.rend.setSize(cnv.width, cnv.height);
    this.rend.setPixelRatio(2);
    
    this.directLight = new THREE.DirectionalLight(0xaabac8, 6);
    this.directLight.position.set(10, 10, 10);
    this.add(this.directLight);
    
    this.ambientLight = new THREE.AmbientLight(0xe5e5ff, 2);
    this.add(this.ambientLight);
    
    this.plane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshPhongMaterial({color: 0x2255ccc}));
    this.plane.rotation.x = -Math.PI * 0.5;
    this.add(this.plane);
    
    this.box = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), new THREE.MeshStandardMaterial({color: 0xa61732}));
    this.box.position.set(0, 5, 0);
    
    const boxquaternion = new THREE.Quaternion();
    boxquaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ).normalize(), Math.PI / 4 );

    this.box.applyQuaternion(boxquaternion);

    // this.box.rotateX(Math.PI / 4);
    // this.box.rotateY(Math.PI / 4);
    this.add(this.box);
    console.log(this.box.quaternion)
  }
  
  setup() {
    this.player.setCam(this.cam);
  }
  
  draw(time, dt) {
    const qtr = new THREE.Quaternion();
    let angleSpeed = Math.PI * 0.5; //Per second
    qtr.setFromAxisAngle(new THREE.Vector3(1, Math.sqrt(2), 0).normalize(), angleSpeed * dt);
    // this.box.applyQuaternion(qtr);
    // this.box.rotateX(0.023);
    // this.box.rotateY(0.037);
    
    this.ctx2d.clearRect(0, 0, this.cnvui.width, this.cnvui.height);
    this.player.move(this.joys.vx *2, this.joys.vy *2, dt);
  
    this.player.update(dt, time);
    this.ctx2d.save();
    this.ctx2d.translate(this.cnvui.width * 0.5, this.cnvui.height * 0.5);
    this.player.show(this.ctx2d);
    this.ctx2d.restore();
    
    this.rend.render(this, this.cam);
  }
}