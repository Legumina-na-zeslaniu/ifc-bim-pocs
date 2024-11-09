// import './style.css'
// import javascriptLogo from './javascript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.js'

// document.querySelector('#app').innerHTML = `
//   <div>
//     <a href="https://vite.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
//       <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
//     </a>
//     <h1>Hello Vite!</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite logo to learn more
//     </p>
//   </div>
// `

// setupCounter(document.querySelector('#counter'))

import * as WEBIFC from "web-ifc";
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let container = null; // Reference for the container div
let components = null;
let world = null;
let raycaster = new THREE.Raycaster(); // For detecting click positions
let mouse = new THREE.Vector2(); // For storing mouse coordinates
const loader = new GLTFLoader();

// Function to add a custom polygon at a given 3D position
function addCustomPolygon(position, normal) {
  const radius = 0.5;  // You can adjust the radius as needed

  // Create a sphere geometry
  const geometry = new THREE.SphereGeometry(radius, 32, 32); // 32 segments for a smoother sphere

  // Create a material for the sphere
  const material = new THREE.MeshBasicMaterial({
    color: 0x0000ff,  // Red color for the sphere
    transparent: true,
    opacity: 0.6,  // Transparency
  });

  // Create the sphere mesh
  const sphereMesh = new THREE.Mesh(geometry, material);

  // Position the sphere at the correct location
  sphereMesh.position.copy(position);

  // Optionally align the sphere to the wall (if you want it to stick to the surface in a specific orientation)
  alignCuboidToWall(sphereMesh, normal);  // You can use the same alignment function for consistency

  // Add the sphere to the scene
  world.scene.three.add(sphereMesh);
}

function getClosestFragment(intersectPoint) {
  const fragments = components.get(OBC.FragmentsManager);

  let closestFragment = null;
  let closestDistance = Infinity;
  let fragmentNormal = null;

  console.log("FRAGMENTS");
  console.log(fragments);

  // Check if fragments are available and ensure they're processed as expected
  if (fragments.list) {
    fragments.list.forEach((fragment) => {
      // Assuming fragment has a transformation matrix that we can use to calculate position
      const fragmentPosition = new THREE.Vector3();

      // We will attempt to extract the world position using the fragment's local matrix.
      // Since the fragment is an IFC model entity, we will use the matrix information to derive its position
      if (fragment.mesh.geometry) {
        // Extract the matrixWorld (transformation matrix) from the fragment's geometry
        fragment.mesh.geometry.computeBoundingBox();
        const center = fragment.mesh.geometry.boundingBox.getCenter(new THREE.Vector3());

        // Assuming the center of the bounding box corresponds to the fragment's position in local space
        fragmentPosition.copy(center); // Use center of bounding box as fragment position
      }

      // Calculate distance between fragment and clicked point
      const distance = fragmentPosition.distanceTo(intersectPoint);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestFragment = fragment;

        // Get the normal vector of the closest fragment (assuming it’s a simple geometry like a plane or a wall)
        fragmentNormal = getFragmentNormal(fragment);
      }
    });
  }

  // console.log(closestFragment, fragmentNormal)
  return { closestFragment, fragmentNormal };
}

function getFragmentNormal(fragment) {
  const geometry = fragment.mesh.geometry;
  const normal = new THREE.Vector3();

  // Check if the geometry has faces and compute normal based on the first face
  if (geometry.isBufferGeometry) {
    geometry.computeVertexNormals(); // Compute normals if none exist

    // If vertex normals are still not available, we can calculate a face normal
    const position = geometry.attributes.position;
    const i1 = 0; // Index for first vertex
    const i2 = 1; // Index for second vertex
    const i3 = 2; // Index for third vertex

    const v1 = new THREE.Vector3(position.array[i1 * 3], position.array[i1 * 3 + 1], position.array[i1 * 3 + 2]);
    const v2 = new THREE.Vector3(position.array[i2 * 3], position.array[i2 * 3 + 1], position.array[i2 * 3 + 2]);
    const v3 = new THREE.Vector3(position.array[i3 * 3], position.array[i3 * 3 + 1], position.array[i3 * 3 + 2]);

    const edge1 = new THREE.Vector3().subVectors(v2, v1);
    const edge2 = new THREE.Vector3().subVectors(v3, v1);
    normal.crossVectors(edge1, edge2).normalize(); // Cross product to get face normal

    normal.transformDirection(fragment.mesh.matrixWorld); // Convert to world space
  }

  return normal;
}

function alignCuboidToWall(cuboidMesh, normal) {
  // We want the cuboid to have one of its sides aligned with the wall (parallel)
  const up = new THREE.Vector3(0, 1, 0); // Default up vector for cuboid

  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(up, normal); // Align the cuboid to the normal of the wall

  cuboidMesh.rotation.setFromQuaternion(quaternion); // Apply the rotation to the cuboid

  // If the fragment's normal vector is vertical (like a wall), we might need to adjust
  // the dimensions of the cuboid. For example, rotating the cuboid to match the wall:
  // Swap width and height to make the cuboid "hang" from the wall
  if (Math.abs(normal.y) > 0.9) { // If the wall is vertical (normal roughly pointing up/down)
    const tempWidth = cuboidMesh.scale.x;
    cuboidMesh.scale.x = cuboidMesh.scale.y;
    cuboidMesh.scale.y = tempWidth;
  }
}

// Function to handle mouse click and add a polygon at the clicked location
function onDocumentMouseClick(event) {
  if (event.ctrlKey) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, world.camera.three);

    const intersects = raycaster.intersectObjects(world.scene.three.children, true);
    console.log(intersects);
    if (intersects.length > 0) {
      const intersectPoint = intersects[0].point;

      // Find the closest fragment to the clicked point
      const { closestFragment, fragmentNormal } = getClosestFragment(intersectPoint);
      console.log(closestFragment);
      console.log(fragmentNormal);
      if (closestFragment && fragmentNormal) {
        addCustomPolygon(intersectPoint, fragmentNormal);
        console.log("AAAA");
        // Place the cuboid at the intersection point, aligned to the wall's normal
      } else {
        // If no fragment is found, place the cuboid at the clicked location
        addCustomPolygon(intersectPoint, new THREE.Vector3(0, 1, 0)); // Default to vertical alignment
        console.log("BBB")
      }
    }
  }
}

async function loadIfc() {
  const fragments = components.get(OBC.FragmentsManager);
  const fragmentIfcLoader = components.get(OBC.IfcLoader);

  const file = await fetch(
    "https://maciejaroslaw.github.io/Kaapelitehdas_junction.ifc",
  );
  const data = await file.arrayBuffer();
  const buffer = new Uint8Array(data);
  const model = await fragmentIfcLoader.load(buffer);
  model.name = "example";
  world.scene.three.add(model);
}

window.onload = async () => {
  container = document.getElementById("container");

  // Create components
  components = new OBC.Components();

  // Access the worlds and create a new world with SimpleScene, SimpleCamera, and SimpleRenderer
  const worlds = components.get(OBC.Worlds);
  world = worlds.create();

  // Set up the scene, renderer, and camera
  if (world) {
    world.scene = new OBC.SimpleScene(components);
    world.renderer = new OBC.SimpleRenderer(components, container);
    world.camera = new OBC.SimpleCamera(components);

    // Initialize components
    components.init();

    // Set camera controls
    world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);

    // Set up the scene
    world.scene.setup();

    // Set up grids
    const grids = components.get(OBC.Grids);
    grids.create(world);

    const fragments = components.get(OBC.FragmentsManager);
    const fragmentIfcLoader = components.get(OBC.IfcLoader);

    await fragmentIfcLoader.setup();
    fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;

    await loadIfc()

    // const model = await loader.loadAsync('/model.glb');
    // model.scene.children[0].position.set(-0.5, 3, 0);
    // model.scene.children[0].rotation.set(0, Math.PI / 2, 0);
    // world.scene.three.add(model.scene.children[0]);

    // const geometry = new THREE.BoxGeometry();
    // const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    // const cube = new THREE.Mesh(geometry, material);
    // cube.castShadow = true;
    // cube.receiveShadow = true;
    // cube.position.add(new THREE.Vector3(0, 2, 0));
    // world.scene.three.add(cube);

    container.addEventListener("dblclick", onDocumentMouseClick);
  }
}

window.onbeforeunload = () => {
  if (world) {
    world.scene.dispose && world.scene.dispose(); // Dispose of scene if dispose method is available
    world.renderer.dispose && world.renderer.dispose(); // Dispose of renderer
    world.camera.dispose && world.camera.dispose(); // Dispose of camera
  }
  components = null;
  world = null;
};