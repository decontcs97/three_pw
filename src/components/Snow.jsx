import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import chars from '../assets/chars.png';


let video, ctx, canvas, size, plane;
const Snow = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let scene, camera, renderer;
    let time = 0.0;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);


    //camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.001, 1000);
    camera = new THREE.OrthographicCamera(1.4 * 1 / - 2, 1.4 * 1 / 2, 1.4 / 2, 1.4 / -2, -1000, 1000);
    camera.position.set(0,0,2);

    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasRef.current });
    renderer.setSize(window.innerWidth, window.innerHeight);

    let controls = new OrbitControls(camera, renderer.domElement);
    let material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        chars: { type: "t", value: new THREE.TextureLoader().load(chars) },
        resolution: { type: "v4", value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1,1)
        }
      },
        vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        attribute float instanceScale;
        varying float vScale;

        void main() {
          vUv = uv;
          vScale = instanceScale;
          gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position.x, position.y, position.z, 1.0); 
        }
        `,
        fragmentShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform sampler2D chars;
        varying float vScale;

        void main() {
          float size = 66.;
          vec2 newUV = vUv;
          newUV.x = vUv.x/size + floor(vScale*size)/size;
          vec4 charsMap = texture2D(chars, newUV);
          gl_FragColor = vec4(vUv,0.0,1.);
          gl_FragColor = charsMap;
          // gl_FragColor = vec4(vScale);
        }
        `,
    });

    let gridSize = 1;
    size = 50;
    let cellSize = gridSize / size;


    let geometry = new THREE.PlaneGeometry(cellSize,cellSize);

    plane = new THREE.InstancedMesh(geometry, material, size**2);
    let dummy = new THREE.Object3D();
    let count = 0;
    let scales = new Float32Array(size**2);

    for(let i = 0; i < size; i++) {
      for(let j = 0; j < size; j++) {
        dummy.position.set(j*cellSize-0.5, i*cellSize+.5);
        dummy.updateMatrix();
        scales.set([Math.random()],count);
        plane.setMatrixAt(count++, dummy.matrix);

      }
    }
    plane.instanceMatrix.needsUpdate = true;
    plane.geometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(scales, 1));

    scene.add(plane);
    // Animation loop
    const animate = () => {
      time += 0.05;
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();
    initVideo();
    /*
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call handleResize initially to set container height

    // Clean up the scene on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();

    };
    */
  }, []);

  return <canvas ref={canvasRef} />;
};

function initVideo() {
  
  video = document.getElementById('vid');
  canvas = document.createElement('canvas');
  ctx = canvas.getContext('2d');
  canvas.width = size;
  canvas.height = size;

  document.body.appendChild(canvas);


  video.addEventListener("play", ()=> {
    timerCallback();
  }, false);
}

function timerCallback() {
  if( video.paused || video.ended) {
    return;
  }
  computeFrame();
  setTimeout(()=> {
    timerCallback();
  }, 0);
}
/*TODO:
Video is rotated improperly. Characters need to be realigned(make a new png for characters)
remove all the random borat videos



*/
function computeFrame() {
  console.log('compute frame');
  let scales = new Float32Array(size**2);
  ctx.drawImage(video,0,0,size,size);
  let imageData = ctx.getImageData(0,0,size,size);

  for(let i = 0; i < imageData.data.length; i+= 4) {
    let x = (i/4)%size;
    let y = Math.floor((i/4)/size);

    scales.set([imageData.data[i]/255],i/4);
  }
  plane.geometry.attributes.instanceScale.array = scales;
  plane.geometry.attributes.instanceScale.needsUpdate = true;

}

export default Snow;