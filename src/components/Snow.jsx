import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const Snow = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let scene, camera, renderer;
    let time = 0.0;

    scene = new THREE.Scene();



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
        resolution: { type: "v4", value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1,1)
        }
      },
        vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position.x, position.y, position.z, 1.0); 
        }
        `,
        fragmentShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          gl_FragColor = vec4(vUv,0.0,1.0);
        }
        `,
    });

    let gridSize = 1;
    let size = 50;
    let cellSize = gridSize / size;


    let geometry = new THREE.PlaneGeometry(cellSize,cellSize);

    let plane = new THREE.InstancedMesh(geometry, material, size**2);
    let dummy = new THREE.Object3D();
    let count = 0;
    for(let i = 0; i < size; i++) {
      for(let j = 0; j < size; j++) {
        dummy.position.set(i*cellSize-0.5, j*cellSize-0.5);
        dummy.updateMatrix();
        plane.setMatrixAt(count++, dummy.matrix);
      }
    }
    plane.instanceMatrix.needsUpdate = true;
    plane.geometry

    scene.add(plane);
    // Animation loop
    const animate = () => {
      time += 0.05;
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

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
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }} />;
};

export default Snow;