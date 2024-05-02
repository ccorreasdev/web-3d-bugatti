console.log("THREE JS RUNNING")
import * as THREE from "./build/three.module.js";
import { GLTFLoader } from "./jsm/loaders/GLTFLoader.js"

const progressBar = document.querySelector("#progress-bar");
const canvas = document.querySelector("#canvas");
const sectionText = document.querySelector(".section__text");
const enter = document.querySelector("#enter");
const enterLayout = document.querySelector("#enter-layout");
const sectionaLayout = document.querySelector("#section-layout");
let camera, scene, renderer;
let model1, model2, model3, model4;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let posXMouse = 85;
let posYMouse = 40;
let loadingProgress = 0;

window.scrollTo({
    top: 0,
    behavior: 'smooth' // Esto hace que el scroll sea suave
  });

enter.addEventListener("click", (e) => {
    sectionaLayout.style["z-index"] = 200;
    document.body.style["overflow-y"] = "scroll";
    enterLayout.style.opacity = 0;
    var sound = new Audio('./assets/audio/melody.mp3');
    sound.play();
});

const scaleValue = (value, minInput, maxInput, minOutput, maxOutput) => {
    return minOutput + (maxOutput - minOutput) * ((value - minInput) / (maxInput - minInput));
}

const onWindowResize = () => {

    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

    if(width > 1280) {
        camera.position.set(0, 0, 100);
        posXMouse = 85;
        posYMouse = 40;
    } else if(width > 1024) {
        camera.position.set(0, 0, 105);
        posXMouse = 60;
        posYMouse = 40;
    } else if(width > 768) {
        camera.position.set(0, 0, 110);
        posXMouse = 45;
        posYMouse = 40;
    } else if(width > 540) {
        camera.position.set(0, 0, 115);
        posXMouse = 30;
        posYMouse = 40;
    } else if (width > 400) {
        camera.position.set(0, 0, 120);
        posXMouse = 25;
        posYMouse = 40;
    }

};

const onMouseClick = (event) => {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        console.log(selectedObject);
    }
}

const onScroll = (e) => {

    const scrollY = window.scrollY || window.pageYOffset;
    const scrollMaxY = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = scrollY / scrollMaxY;
    const progressPercent = scaleValue(scrollProgress, 0, 1, -100, 0);

    const model3Percent = scaleValue(scrollProgress, 0, 1, -200, 15);
    const model4Percent = scaleValue(scrollProgress,0,1,-200,25);


    console.log("SCROLL: ", scrollProgress);
    console.log("PROGRESS: ", progressPercent);

    gsap.to(sectionText, {
        duration: 0.1,
        left: progressPercent + "%",
        ease: "power1.inOut"
    });

    
    gsap.to(model1.position, {
        duration: 0.2, 
        z: scrollProgress * 20, // Aplica el progreso del scroll a la posición Y de la cámara
        ease: "power1.inOut" // Easing (opcional)
    });


    gsap.to(model3.position, {
        duration: 0.2, 
        y: model3Percent, // Aplica el progreso del scroll a la posición Y de la cámara
        ease: "power1.inOut" // Easing (opcional)
    });


    gsap.to(model4.position, {
        duration: 0.2, 
        y: model4Percent, // Aplica el progreso del scroll a la posición Y de la cámara
        ease: "power1.inOut" // Easing (opcional)
    });

};

const loadModelGLTF = (modelURL) => {
    const loader = new GLTFLoader();
    let objectGroup = new THREE.Group();

    return new Promise((resolve, reject) => {
        loader.load(
            `../assets/models/${modelURL}/scene.gltf`,
            function (gltf) {
                const container = new THREE.Group();
                container.add(gltf.scene);
                objectGroup = container;
                resolve(objectGroup);
            },
            function (xhr) {
                //console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                //console.log('An error happened', error);
            }
        );
    })
};

const onMouseMove = (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const posX = scaleValue(mouseX, 0, window.innerWidth, -posXMouse, posXMouse);
    const posY = scaleValue(mouseY, 0, window.innerHeight, posYMouse, -posYMouse);



    gsap.to(model2.position, {
        duration: 0.01, // Duración de la animación en segundos
        x: posX, // Nueva posición X
        y: posY, // Nueva posición Y
        z: 25, // Nueva posición Z
        ease: "power1.inOut" // Easing (opcional)
    });


}

const init = async () => {
    window.addEventListener("scroll", onScroll);
    document.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onWindowResize);
    window.addEventListener('click', onMouseClick);
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 4000);
    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 2000, 1000);
    directionalLight.lookAt(0, 0, 0);
    directionalLight.intensity = 2;
    scene.add(directionalLight);

    const ambientlight = new THREE.AmbientLight(0xffffff, 1);
    ambientlight.position.set(0, 0, 0);
    ambientlight.intensity = 10;
    scene.add(ambientlight);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvas.appendChild(renderer.domElement);

    await loadModelGLTF("mountains").then((resolve) => {
        loadingProgress = 25;
        progressBar.innerHTML = `${loadingProgress}%`;
        progressBar.style.width = `${loadingProgress}%`;
        model1 = resolve;
        return loadModelGLTF("light");
    }).then((resolve) => {
        loadingProgress = 50;
        progressBar.innerHTML = `${loadingProgress}%`;
        progressBar.style.width = `${loadingProgress}%`;
        model2 = resolve;
        return loadModelGLTF("bugatti");
    }).then((resolve) => {
        loadingProgress = 75;
        progressBar.innerHTML = `${loadingProgress}%`;
        progressBar.style.width = `${loadingProgress}%`;
        model3 = resolve;
        return loadModelGLTF("engine");
    }).then((resolve) => {
        loadingProgress = 100;
        progressBar.innerHTML = `${loadingProgress}%`;
        progressBar.style.width = `${loadingProgress}%`;
        model4 = resolve;
    })


    const model1Scale = 0.6;
    scene.add(model1);
    model1.scale.set(model1Scale, model1Scale, model1Scale);
    model1.position.set(0, 0, 0)

    scene.add(model2);
    model2.scale.set(7, 7, 7);
    model2.rotation.x = 1;

    scene.add(model3);
    model3.scale.set(1500, 1500, 1500);
    model3.rotation.set(20 * Math.PI / 180, 45 * Math.PI / 180, 0);
    model3.position.set(-25,-200,0);

    scene.add(model4);
    model4.scale.set(30, 30, 30);
    model4.rotation.set(20 * Math.PI / 180, 45 * Math.PI / 180, 0);
    model4.position.set(40,-200,0);

};



const render = () => {
    renderer.render(scene, camera);
};

const animate = () => {
    requestAnimationFrame(animate);

    if(model1 && model2 && model3 && model4) {
        model1.rotation.y += 0.002;
        model2.rotation.y += 0.05;
        model3.rotation.y += 0.001;
        model4.rotation.y += 0.005;
    }

    render();
};

init();
animate();
onWindowResize();
