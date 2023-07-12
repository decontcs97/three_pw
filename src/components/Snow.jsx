import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import sColor from '../assets/Snow_004_COLOR.jpg'
import sNorm from '../assets/Snow_004_NORM.jpg'
import sDisp from '../assets/Snow_004_DISP.png'
import sRough from '../assets/Snow_004_ROUGH.jpg'

const Snow = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let scene, camera, renderer;
    const planeW = 200;
    const planeH = 200;

    // Set up the scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasRef.current });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Load snow texture for plane
    const textureLoader = new THREE.TextureLoader();
    const sCol = textureLoader.load(sColor);
    const sNor = textureLoader.load(sNorm);
    const sDis = textureLoader.load(sDisp);
    const sRo = textureLoader.load(sRough);

    // Create the flat plane
    const planeGeometry = new THREE.PlaneGeometry(planeW, planeH, 1024, 1024);
    const snowMaterial = new THREE.MeshStandardMaterial({
      map: sCol,
      normalMap: sNor,
      displacementMap: sDis,
      displacementScale: 5.5,
      roughnessMap: sRo
    });

    //EDIT: MAKE A LOOP TO DO THIS...JUST LAZY RIGHT NOW
    const planeMesh = new THREE.Mesh(planeGeometry, snowMaterial);
    const planeMesh2 = new THREE.Mesh(planeGeometry, snowMaterial); 
    const planeMesh3 = new THREE.Mesh(planeGeometry, snowMaterial);
    const planeMesh4 = new THREE.Mesh(planeGeometry, snowMaterial);
    const planeMesh5 = new THREE.Mesh(planeGeometry, snowMaterial);
    const planeMesh6 = new THREE.Mesh(planeGeometry, snowMaterial);
    
    scene.add(planeMesh);
    planeMesh.rotation.x = -Math.PI / 2;
    planeMesh.position.set(0,0,0);

    scene.add(planeMesh3);
    planeMesh3.rotation.x = -Math.PI / 2;
    planeMesh3.position.set(0,0,planeW - 1);


    // Create the starfield geometry
    const starCount = 1000;
    const starFieldGeometry = new THREE.BufferGeometry();
    const starFieldMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false 
    });

    const starPositions = new Float32Array(starCount * 3);
    const starVelocities = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      starPositions[i3] = Math.random() * 2000 - 1000; // x 
      starPositions[i3 + 1] = Math.random() * 2000 - 1000; // y 
      starPositions[i3 + 2] = Math.random() * 2000 - 1000; // z 

      starVelocities[i3] = -Math.random() * 0.5; // x velocity
      starVelocities[i3 + 1] = -Math.random() * 0.5; // y velocity
      starVelocities[i3 + 2] = Math.random() * 0.2 - 0.1; // z velocity
    }

    starFieldGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starFieldPoints = new THREE.Points(starFieldGeometry, starFieldMaterial);
    scene.add(starFieldPoints);

    // Adjust camera position and look at the plane
    camera.position.set(0, 100, 300);
    camera.lookAt(planeMesh.position);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update star positions
      const positions = starFieldGeometry.attributes.position.array;
      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        positions[i3] += starVelocities[i3];
        positions[i3 + 1] += starVelocities[i3 + 1];
        if (positions[i3] < -1000 || positions[i3 + 1] < -1000) {
          positions[i3] = 1000;
          positions[i3 + 1] = 1000;
        }
      }
      starFieldGeometry.attributes.position.needsUpdate = true;

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
      scene.remove(starFieldPoints);
      scene.remove(planeMesh);
      scene.remove(ambientLight);
      scene.remove(directionalLight);
      renderer.dispose();

    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }} />;
};


export default Snow;