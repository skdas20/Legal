import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeDChart = ({ data, type = 'bar', height = 300, width = '100%', className = '' }) => {
  const mountRef = useRef(null);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(5, 5, 5);
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Grid helper
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);
    
    // Create chart based on type
    if (type === 'bar') {
      createBarChart(scene, data);
    } else if (type === 'pie') {
      createPieChart(scene, data);
    }
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, [data, type]);
  
  // Function to create a 3D bar chart
  const createBarChart = (scene, data) => {
    const maxValue = Math.max(...data.map(item => item.value));
    const barWidth = 0.5;
    const spacing = 0.2;
    const totalWidth = data.length * (barWidth + spacing) - spacing;
    const startX = -totalWidth / 2 + barWidth / 2;
    
    // Add bars
    data.forEach((item, index) => {
      const normalizedHeight = (item.value / maxValue) * 5; // Scale height
      const geometry = new THREE.BoxGeometry(barWidth, normalizedHeight, barWidth);
      
      // Generate color based on index
      const hue = (index / data.length) * 360;
      const color = new THREE.Color(`hsl(${hue}, 70%, 60%)`);
      
      const material = new THREE.MeshPhongMaterial({ 
        color: item.color || color,
        transparent: true,
        opacity: 0.8,
        shininess: 100
      });
      
      const bar = new THREE.Mesh(geometry, material);
      bar.position.x = startX + index * (barWidth + spacing);
      bar.position.y = normalizedHeight / 2;
      bar.castShadow = true;
      bar.receiveShadow = true;
      
      scene.add(bar);
      
      // Add text label
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 128;
      canvas.height = 64;
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = '24px Arial';
      context.fillStyle = '#000000';
      context.textAlign = 'center';
      context.fillText(item.label, canvas.width / 2, canvas.height / 2);
      
      const texture = new THREE.CanvasTexture(canvas);
      const labelMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
      });
      
      const labelGeometry = new THREE.PlaneGeometry(1, 0.5);
      const label = new THREE.Mesh(labelGeometry, labelMaterial);
      label.position.set(bar.position.x, -0.5, bar.position.z + 0.5);
      label.rotation.x = -Math.PI / 4;
      scene.add(label);
    });
    
    // Add floor
    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xcccccc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);
  };
  
  // Function to create a 3D pie chart
  const createPieChart = (scene, data) => {
    const radius = 2;
    const height = 0.5;
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    let startAngle = 0;
    
    // Add pie segments
    data.forEach((item, index) => {
      const angle = (item.value / totalValue) * Math.PI * 2;
      const endAngle = startAngle + angle;
      
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(radius * Math.cos(startAngle), radius * Math.sin(startAngle));
      
      const curve = new THREE.EllipseCurve(
        0, 0,
        radius, radius,
        startAngle, endAngle,
        false, 0
      );
      
      const curvePoints = curve.getPoints(32);
      curvePoints.forEach(point => {
        shape.lineTo(point.x, point.y);
      });
      
      shape.lineTo(0, 0);
      
      const extrudeSettings = {
        steps: 1,
        depth: height,
        bevelEnabled: false
      };
      
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      
      // Generate color based on index
      const hue = (index / data.length) * 360;
      const color = new THREE.Color(`hsl(${hue}, 70%, 60%)`);
      
      const material = new THREE.MeshPhongMaterial({ 
        color: item.color || color,
        transparent: true,
        opacity: 0.8,
        shininess: 100
      });
      
      const segment = new THREE.Mesh(geometry, material);
      segment.castShadow = true;
      segment.receiveShadow = true;
      
      // Slightly separate segments for visual effect
      const midAngle = startAngle + angle / 2;
      segment.position.x = Math.cos(midAngle) * 0.05;
      segment.position.z = Math.sin(midAngle) * 0.05;
      
      scene.add(segment);
      
      startAngle = endAngle;
    });
  };
  
  return (
    <div 
      ref={mountRef} 
      style={{ height: height, width: width }} 
      className={`rounded-lg overflow-hidden ${className}`}
    />
  );
};

export default ThreeDChart; 