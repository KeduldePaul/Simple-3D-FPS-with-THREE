import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js';

export class Player {
  constructor(x, y) {
    // (x, y) in grid space = (x, z) in 3d space
    this.loc = new THREE.Vector3(x, 0, y);
    this.vel = new THREE.Vector3();
    
    this.facing = new THREE.Vector3(1,0, -1);
    
    this.facing.normalize();
    this.pitch = Math.asin(this.facing.y);
    
    this.yawVelocity   = 0;
    this.pitchVelocity = 0;
  }
  
  setCam(cam) {
    this.cam = cam;
  }
  
  move(x, z, dt) {
    const speed = 25; //per second
    
    if (Math.abs(x) > 0 || Math.abs(z) > 0) {
      const front = new THREE.Vector3(this.facing.x, 0, this.facing.z);
      const right = new THREE.Vector3(this.facing.z, 0, -this.facing.x); // f+90°
      
      const xs = right.x * x + front.x * z;
      const zs = right.z * x + front.z * z;
      this.vel.setX(-xs * speed);
      this.vel.setZ(-zs * speed);
    }
    
    let limit = speed;
    let mag = this.vel.length();
    if (mag > limit) {
      this.vel.normalize();
      this.vel.multiplyScalar(limit);
    }
  }
  
  //--Overrided funcs: Touchlookable--// 
  onLookStart(xLoc, yLoc) {
    // TODO: Nothing
  }
  
  onLookMove(dx, dy) {
    const QUARTER_PI = Math.PI * 0.25;
    const calibration = 0.028;
    let dyaw   = -dx * calibration;
    let dpitch =  dy * calibration;
    
    dyaw *= Math.sign(dyaw) * dyaw;
    dpitch *= Math.sign(dpitch) * dpitch;
    
    this.yawVelocity   += dyaw;
    this.pitchVelocity += dpitch;
    
    const maxSpd = 1;
    this.yawVelocity   = THREE.MathUtils.clamp(this.yawVelocity, -maxSpd, maxSpd);
    this.pitchVelocity = THREE.MathUtils.clamp(this.pitchVelocity, -maxSpd, maxSpd);
    // console.log(THREE.MathUtils.radToDeg(dpitch));
    
    this.pitch += this.pitchVelocity;
    if (this.pitch < -QUARTER_PI || this.pitch > QUARTER_PI) {
      this.pitch -= this.pitchVelocity;
      this.pitchVelocity = 0;
    }
  }
  
  onLookRelease(dx, dy) {
    this.yawVelocity   = 0;
    this.pitchVelocity = 0;
    
    this.pitch = 0;
  }
  
  update(dt, time) {
    const ds = this.vel.clone().multiplyScalar(dt);
    this.loc.add(ds);
    
    // Head bobs
    const speed = this.vel.length();
    if (speed > 1) {
      this.timeStart = this.timeStart || time;
      const bobFreq = speed < 10 ? 8 : 20;
      this.loc.y = 0.2 * Math.sin((time- this.timeStart) * bobFreq);
    } else if (speed <= 0.001) {
      this.timeStart = void this.timeStart;
    }
    
    // For using frame rate independent, rather than using val *= dampen
    // which {dampen ∈ ℝ | 0 ≤ dampen ≤ 1}
    // use val *= e^(-decayRate * dt) !
    // which decayRate = -ln(1-dampen);
    this.loc.y *= Math.exp(-25.5 * dt); 
    
    const yawing = new THREE.Matrix4();
    yawing.makeRotationY(this.yawVelocity * dt);
    this.facing.applyMatrix4(yawing);
    
    const R = new THREE.Vector3(this.facing.z, 0, -this.facing.x)
    const pitching = new THREE.Matrix4();
    pitching.makeRotationAxis(R, this.pitchVelocity * dt);
    this.facing.applyMatrix4(pitching);
    
    this.facing.normalize();
    
    const camHeight = 5;
    this.cam?.position.set(this.loc.x, this.loc.y + camHeight, this.loc.z);
    
    const lookAtTarget = this.loc.clone();
    lookAtTarget.add(new THREE.Vector3(0, camHeight, 0));
    lookAtTarget.add(this.facing);
    this.cam?.lookAt(lookAtTarget);
    
    this.vel.multiplyScalar(Math.exp(-4.605170185988091, dt));
    // this.vel.multiplyScalar(0.09);
  }
  
  show(ctx) {
    ctx.save();
    ctx.translate(this.loc.x, this.loc.z);
    ctx.rotate(new THREE.Vector2(this.facing.x, this.facing.z).angle());
    ctx.scale(0.5, 0.5);
    
    ctx.fillStyle = '#36ed97';
    ctx.fillRect(-10, -10, 20, 20);
    
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(20, 0);
    ctx.stroke();
    
    ctx.restore();
    
    ctx.save();
    ctx.translate(this.loc.x, this.loc.z);
    ctx.rotate(new THREE.Vector2(1, this.facing.y).angle());
    ctx.strokeStyle = '#9c0e69';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(20, 0);
    ctx.stroke();
    ctx.restore();
  }
}