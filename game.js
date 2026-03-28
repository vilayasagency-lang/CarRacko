window.addEventListener("DOMContentLoaded", function () {
    // ======================================================================
    // 🛠️ SAFE DOM BINDER
    // ======================================================================
    function bindBtn(id, event, callback) {
        let el = document.getElementById(id);
        if (el) el.addEventListener(event, callback);
    }

    function setUI(id, text) {
        let el = document.getElementById(id);
        if (el) el.innerText = text;
    }

    // ======================================================================
    // 💾 LOCAL STORAGE SYSTEM
    // ======================================================================
    let gameData = {
        coins: parseInt(localStorage.getItem("ts_coins")) || 0,
        highScore: parseInt(localStorage.getItem("ts_highscore")) || 0,
        unlockedCars: JSON.parse(localStorage.getItem("ts_unlockedCars")) || [0, 1], 
        nitroCount: parseInt(localStorage.getItem("ts_nitro")) || 5,
        leaderboard: JSON.parse(localStorage.getItem("ts_leaderboard")) ||[0, 0, 0]
    };

    function saveGameData() {
        localStorage.setItem("ts_coins", gameData.coins);
        localStorage.setItem("ts_highscore", gameData.highScore);
        localStorage.setItem("ts_unlockedCars", JSON.stringify(gameData.unlockedCars));
        localStorage.setItem("ts_nitro", gameData.nitroCount);
        localStorage.setItem("ts_leaderboard", JSON.stringify(gameData.leaderboard));
        updateMenuUI();
    }

    // ======================================================================
    // 🚘 UNLIMITED GARAGE & ROAD CONFIGURATION
    // ======================================================================
    let carConfig =[
        { file: "car.glb", name: "MERCEDES SLR", price: 0, scale: "15", yOffset: 2, rotY: 0 },
        { file: "carone.glb", name: "STREET RACER", price: 0, scale: "50", yOffset: 2, rotY: 0 }
    ];

    let roadConfig =[
        { file: "country side road seamless.glb", name: "SEAMLESS HIGHWAY", folder: "model/", length: 50, emissiveBoost: 0.0, itemYOffset: 0.6 },
        { file: "Path Straight.glb", name: "FOREST PATH", folder: "model/", length: 50, scale: "AUTO", emissiveBoost: 0.0, itemYOffset: 2.5 } 
    ];

    let currentCarIndex = 0, currentRoadIndex = 0;
    let loadedCars =[];
    let loadedRoadSets =[]; 
    for(let i=0; i<roadConfig.length; i++) loadedRoadSets.push([]);

    // ======================================================================
    // 🖥️ DOM ELEMENTS & SCREEN LOGIC
    // ======================================================================
    const canvas = document.getElementById("renderCanvas");
    const screens = {
        splash: document.getElementById("splashScreen"),
        loading: document.getElementById("loadingScreen"),
        menu: document.getElementById("mainMenuScreen"),
        hud: document.getElementById("hudScreen"),
        gameOver: document.getElementById("gameOverScreen")
    };

    let countdownDiv = document.createElement("div");
    countdownDiv.id = "countdownDisplay";
    countdownDiv.style.position = "absolute";
    countdownDiv.style.top = "40%";
    countdownDiv.style.left = "50%";
    countdownDiv.style.transform = "translate(-50%, -50%)";
    countdownDiv.style.fontSize = "6rem";
    countdownDiv.style.color = "#ffcc00";
    countdownDiv.style.fontFamily = "'Orbitron', sans-serif";
    countdownDiv.style.fontWeight = "900";
    countdownDiv.style.textShadow = "0 0 20px #ffcc00, 0 0 40px #ffcc00";
    countdownDiv.style.zIndex = "100";
    countdownDiv.style.display = "none";
    countdownDiv.style.pointerEvents = "none"; 
    
    let hudScreen = document.getElementById("hudScreen");
    if(hudScreen) hudScreen.appendChild(countdownDiv);

    function switchScreen(screenName) {
        Object.values(screens).forEach(s => { if (s) s.classList.add("hidden"); });
        if(screens[screenName]) screens[screenName].classList.remove("hidden");
    }

    function updateMenuUI() {
        setUI("menuCoins", gameData.coins);
        setUI("menuNitro", gameData.nitroCount);
        
        let isUnlocked = gameData.unlockedCars.includes(currentCarIndex) || carConfig[currentCarIndex].price === 0;
        let carLockStatus = document.getElementById("carLockStatus");
        let startBtn = document.getElementById("startBtn");

        if(isUnlocked) {
            if(carLockStatus) carLockStatus.classList.add("hidden");
            if(startBtn) startBtn.classList.remove("hidden");
        } else {
            if(carLockStatus) carLockStatus.classList.remove("hidden");
            if(startBtn) startBtn.classList.add("hidden");
            setUI("carCostText", carConfig[currentCarIndex].price);
        }
    }

    bindBtn("carNextBtn", "click", () => switchCar(1));
    bindBtn("carPrevBtn", "click", () => switchCar(-1));
    bindBtn("roadNextBtn", "click", () => switchRoad(1));
    bindBtn("roadPrevBtn", "click", () => switchRoad(-1));

    function switchCar(dir) {
        if (loadedCars.length === 0) return;
        loadedCars.forEach(c => { if (c.root) { c.root.setEnabled(false); c.root.getChildMeshes(false).forEach(m => m.setEnabled(false)); }});
        currentCarIndex = (currentCarIndex + dir + carConfig.length) % carConfig.length;
        let activeCar = loadedCars.find(c => c.id === currentCarIndex);
        if (activeCar && activeCar.root) { activeCar.root.setEnabled(true); activeCar.root.getChildMeshes(false).forEach(m => m.setEnabled(true)); }
        setUI("carNameText", carConfig[currentCarIndex].name);
        updateMenuUI();
    }

    function switchRoad(dir) {
        currentRoadIndex = (currentRoadIndex + dir + roadConfig.length) % roadConfig.length;
        loadedRoadSets.forEach((set, idx) => {
            let isVis = (idx === currentRoadIndex);
            set.forEach(mesh => { 
                mesh.setEnabled(isVis); 
                mesh.position.y = isVis ? 0 : -10000;
                if(mesh.getChildMeshes) mesh.getChildMeshes(false).forEach(m => m.setEnabled(isVis));
            });
        });
        setUI("roadNameText", roadConfig[currentRoadIndex].name);
    }

    bindBtn("buyCarBtn", "click", () => {
        let price = carConfig[currentCarIndex].price;
        if(gameData.coins >= price) {
            gameData.coins -= price;
            gameData.unlockedCars.push(currentCarIndex);
            saveGameData();
        } else { alert("NOT ENOUGH COINS! You need " + price); }
    });

    bindBtn("exitBtn", "click", () => {
        if (navigator.app) navigator.app.exitApp(); 
        else if (navigator.device) navigator.device.exitApp(); 
        else { window.close(); alert("App Closed! Press back button to exit."); }
    });

    bindBtn("closeDemoBtn", "click", () => {
        let modal = document.getElementById("demoModal");
        if(modal) modal.classList.add("hidden");
    });

    window.showDemo = function(title, desc) {
        setUI("demoTitle", title);
        setUI("demoDesc", desc);
        let modal = document.getElementById("demoModal");
        if(modal) modal.classList.remove("hidden");
    };

    // ======================================================================
    // 🎵 HTML5 DIRECT AUDIO BYPASS
    // ======================================================================
    let sfxCoin, sfxCrash, sfxCount, sfxCar;
    let countdownInterval;
    let carAudioDuckTimer = null;

    function createHTML5Sound(src, loop, volume) {
        let audio = new Audio(src);
        audio.loop = loop;
        audio.volume = volume;
        audio.crossOrigin = "anonymous"; 
        return {
            play: function() { 
                let playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => console.log("Audio block ignored:", e));
                }
            },
            pause: function() { audio.pause(); },
            stop: function() { audio.pause(); audio.currentTime = 0; },
            setVolume: function(v) { audio.volume = v; },
            get isPlaying() { return !audio.paused; },
            isReady: function() { return true; } 
        };
    }

    sfxCount = createHTML5Sound("assets/sound/count.mp3", false, 1.0);
    sfxCar = createHTML5Sound("assets/sound/car.mp3", true, 0.8);
    sfxCoin = createHTML5Sound("assets/sound/coin.mp3", false, 1.0);
    sfxCrash = createHTML5Sound("https://playground.babylonjs.com/sounds/explosion.wav", false, 1.0);

    // ======================================================================
    // 🚀 ENGINE & ASSET LOADING (BOOT)
    // ======================================================================
    let engine, scene, camera, hemiLight, dirLight, glowLayer;
    let gameState = "LOADING", isPaused = false, isDayMode = false;
    let score = 0, sessionCoins = 0;
    
    let baseSpeed = 1.0, speedMultiplier = 1.0;
    let distanceTraveled = 0, lastSpawnDistance = 0, spawnInterval = 35; 
    let carHitbox, targetX = 0, currentLane = 1; 
    let isBraking = false, isNitroActive = false, nitroTimer = 0;
    
    const laneX =[-2.5, 0, 2.5]; 
    let obstacles =[], coins =[];

    let assetsLoadedCount = 0;
    function checkAssetsLoaded() { assetsLoadedCount++; }

    setTimeout(() => {
        switchScreen("loading");
        startEngineLoad();
    }, 1500);

    function startEngineLoad() {
        let prog = 0;
        let loadInt = setInterval(() => {
            prog += Math.floor(Math.random() * 15);
            if (prog > 95) prog = 95; 
            let pb = document.getElementById("progressBar");
            if(pb) pb.style.width = prog + "%";
            setUI("loadingText", "LOADING " + prog + "%");
        }, 200);

        try {
            engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, alpha: true });
            scene = createScene();
            setupGameLoop(); 
            
            let isGameLoaded = false;
            function finishLoadingProcess() {
                if(isGameLoaded) return;
                isGameLoaded = true;
                clearInterval(loadInt);
                let pb = document.getElementById("progressBar");
                if(pb) pb.style.width = "100%";
                setUI("loadingText", "READY!");
                
                setTimeout(() => {
                    updateMenuUI();
                    switchScreen("menu");
                    gameState = "MENU";
                    engine.runRenderLoop(() => { scene.render(); });
                }, 500);
            }

            let checkInt = setInterval(() => {
                let totalAssets = carConfig.length + roadConfig.length;
                if (assetsLoadedCount >= totalAssets) { 
                    clearInterval(checkInt);
                    finishLoadingProcess();
                }
            }, 500);
            
            setTimeout(() => {
                clearInterval(checkInt);
                finishLoadingProcess();
            }, 10000); 

        } catch (err) { console.log("3D Engine Error: " + err); }
    }

    const createScene = function () {
        let s = new BABYLON.Scene(engine);
        s.clearColor = new BABYLON.Color4(0, 0, 0, 0); 
        
        camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 3.5, -7), s);
        camera.setTarget(new BABYLON.Vector3(0, 1, 5));

        s.fogMode = BABYLON.Scene.FOGMODE_EXP;
        s.fogDensity = 0.008; 
        s.fogColor = new BABYLON.Color3(0.05, 0.05, 0.1);

        hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), s);
        hemiLight.intensity = 1.2; hemiLight.groundColor = new BABYLON.Color3(0.2, 0.2, 0.2);

        dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(0, -1, 1), s);
        dirLight.intensity = 2.0;

        glowLayer = new BABYLON.GlowLayer("glow", s);
        glowLayer.intensity = 1.5;

        s.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("https://assets.babylonjs.com/environments/environmentSpecular.env", s);
        s.environmentIntensity = 1.2;

        setupMaterials(s);
        buildCars(s);
        buildEnvironments(s);
        buildPools(s);
        return s;
    };

    let matObstacle, matCoin;
    function setupMaterials(s) {
        matObstacle = new BABYLON.StandardMaterial("matObstacle", s);
        matObstacle.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        matObstacle.emissiveColor = new BABYLON.Color3(1, 0.1, 0.3); 
        
        matCoin = new BABYLON.StandardMaterial("matCoin", s);
        matCoin.diffuseColor = new BABYLON.Color3(1, 0.8, 0);
        matCoin.emissiveColor = new BABYLON.Color3(1, 0.8, 0); 
    }

    function buildCars(s) {
        carHitbox = BABYLON.MeshBuilder.CreateBox("carHitbox", { width: 1.2, height: 1.0, depth: 2.5 }, s);
        carHitbox.position = new BABYLON.Vector3(0, 0.5, 0); 
        carHitbox.isVisible = false; 

        carConfig.forEach((cfg, idx) => {
            BABYLON.SceneLoader.ImportMesh("", "assets/", cfg.file, s, 
                (newMeshes) => {
                    let masterCar = new BABYLON.TransformNode("masterCar_" + idx, s);
                    masterCar.parent = carHitbox; 
                    newMeshes.forEach(m => { if(!m.parent) m.parent = masterCar; });
                    
                    if (cfg.scale === "AUTO") {
                        let maxDim = 0.1;
                        newMeshes.forEach(m => {
                            m.computeWorldMatrix(true);
                            if(m.getBoundingInfo && m.getTotalVertices() > 0) {
                                let b = m.getBoundingInfo().boundingBox;
                                let dim = Math.max(b.maximumWorld.x - b.minimumWorld.x, b.maximumWorld.y - b.minimumWorld.y, b.maximumWorld.z - b.minimumWorld.z);
                                if(dim > maxDim && dim < 1000) maxDim = dim;
                            }
                        });
                        let autoScale = 2.5 / maxDim; 
                        masterCar.scaling = new BABYLON.Vector3(autoScale, autoScale, autoScale);
                    } else { masterCar.scaling = new BABYLON.Vector3(cfg.scale, cfg.scale, cfg.scale); }
                    
                    masterCar.position = new BABYLON.Vector3(0, cfg.yOffset - 0.5, 0); 
                    if (cfg.rotY !== 0) { masterCar.rotationQuaternion = null; masterCar.rotation.y = cfg.rotY; }
                    
                    let isVis = (idx === 0);
                    masterCar.setEnabled(isVis);
                    masterCar.getChildMeshes(false).forEach(m => m.setEnabled(isVis));
                    
                    loadedCars.push({ root: masterCar, id: idx });
                    checkAssetsLoaded();
                }, 
                null, 
                () => { 
                    let fallback = BABYLON.MeshBuilder.CreateBox("fallbackCar", {width: 1.2, height: 1.0, depth: 2.5}, s);
                    let mat = new BABYLON.StandardMaterial("fallMat", s); mat.emissiveColor = new BABYLON.Color3(0, 0.5, 1);
                    fallback.material = mat; fallback.parent = carHitbox; fallback.setEnabled(idx === 0);
                    loadedCars.push({ root: fallback, id: idx });
                    checkAssetsLoaded(); 
                }
            );
        });
    }

    function buildEnvironments(s) {
        roadConfig.forEach((cfg, idx) => {
            BABYLON.SceneLoader.ImportMesh("", cfg.folder, cfg.file, s, 
                (newMeshes) => {
                    let masterRoad = new BABYLON.TransformNode("masterRoad_" + idx, s);
                    newMeshes.forEach(mesh => { 
                        if (!mesh.parent) mesh.parent = masterRoad;
                        if (mesh.material && cfg.emissiveBoost > 0) mesh.material.emissiveColor = new BABYLON.Color3(cfg.emissiveBoost, cfg.emissiveBoost, cfg.emissiveBoost);
                    });

                    masterRoad.computeWorldMatrix(true);
                    let bounds = masterRoad.getHierarchyBoundingVectors();
                    let width = Math.abs(bounds.max.x - bounds.min.x);
                    if(width < 0.1) width = 10;
                    
                    let rScale = (cfg.scale === "AUTO") ? (24 / width) : (cfg.scale || 1);
                    masterRoad.scaling = new BABYLON.Vector3(rScale, rScale, rScale);
                    masterRoad.computeWorldMatrix(true);
                    
                    let scaledBounds = masterRoad.getHierarchyBoundingVectors();
                    let actualLength = Math.abs(scaledBounds.max.z - scaledBounds.min.z);
                    if(actualLength < 1) actualLength = 50 * rScale;
                    cfg.calculatedLength = actualLength; 
                    
                    let centerX = (scaledBounds.max.x + scaledBounds.min.x) / 2;
                    masterRoad.position.y = -10000; masterRoad.setEnabled(false);
                    
                    for (let i = 0; i < 15; i++) {
                        let clone = masterRoad.instantiateHierarchy(); 
                        let isVisible = (idx === 0);
                        clone.position.y = isVisible ? 0 : -10000; 
                        clone.position.x = -centerX; 
                        clone.position.z = (i * actualLength) - actualLength; 
                        clone.setEnabled(isVisible); 
                        if(clone.getChildMeshes) clone.getChildMeshes(false).forEach(m => m.setEnabled(isVisible));
                        loadedRoadSets[idx].push(clone); 
                    }
                    checkAssetsLoaded();
                },
                null,
                () => {
                    let fallbackRoad = BABYLON.MeshBuilder.CreateBox("fallRoad", {width: 24, height: 1, depth: 50}, s);
                    let mat = new BABYLON.StandardMaterial("fallRoadMat", s); mat.emissiveColor = new BABYLON.Color3(1, 0, 1);
                    fallbackRoad.material = mat; fallbackRoad.position.y = -10000; fallbackRoad.setEnabled(false);
                    cfg.calculatedLength = 50;
                    for (let i = 0; i < 15; i++) {
                        let clone = fallbackRoad.createInstance("rc"+i);
                        let isVisible = (idx === 0);
                        clone.position.y = isVisible ? 0 : -10000; 
                        clone.position.z = (i * 50) - 50; 
                        clone.setEnabled(isVisible); loadedRoadSets[idx].push(clone); 
                    }
                    checkAssetsLoaded();
                }
            );
        });
    }

    function buildPools(s) {
        for (let i = 0; i < 30; i++) {
            let obs = BABYLON.MeshBuilder.CreateBox("obs" + i, { width: 2.0, height: 1.5, depth: 2.0 }, s);
            obs.material = matObstacle; obs.position.y = -1000; obs.isVisible = false;
            obstacles.push({ mesh: obs, active: false });
        }
        for (let i = 0; i < 15; i++) {
            let coin = BABYLON.MeshBuilder.CreateCylinder("coin" + i, { diameter: 1.2, height: 0.3 }, s);
            coin.material = matCoin; coin.rotation.x = Math.PI / 2; coin.position.y = -1000; coin.isVisible = false;
            coins.push({ mesh: coin, active: false });
        }
    }

    function spawnItem() {
        let isCoin = Math.random() > 0.7;
        let poolArray = isCoin ? coins : obstacles;
        let obj = poolArray.find(o => !o.active);
        if (!obj) return; 
        
        obj.active = true; obj.mesh.isVisible = true;
        obj.mesh.position.x = laneX[Math.floor(Math.random() * 3)];
        obj.mesh.position.z = carHitbox ? carHitbox.position.z + 180 : 180; 

        let activeRoadOffset = roadConfig[currentRoadIndex].itemYOffset || 0;
        if (carHitbox) {
            obj.mesh.position.y = carHitbox.position.y + (isCoin ? 0.5 : 0.25) + activeRoadOffset;
        }
    }

    // ======================================================================
    // 🎮 12. CONTROLS (SMOOTH SLIDE, BRAKE, NITRO) 🎮
    // ======================================================================
    function switchLane(dir) {
        if (isPaused || gameState !== "PLAYING") return;
        currentLane = Math.max(0, Math.min(2, currentLane + dir));
        targetX = laneX[currentLane];
    }

    bindBtn("leftBtn", "pointerdown", (e) => { switchLane(-1); e.stopPropagation(); });
    bindBtn("rightBtn", "pointerdown", (e) => { switchLane(1); e.stopPropagation(); });
    
    bindBtn("brakeBtn", "pointerdown", () => isBraking = true);
    bindBtn("brakeBtn", "pointerup", () => isBraking = false);
    bindBtn("brakeBtn", "pointerleave", () => isBraking = false);

    bindBtn("nitroBtn", "pointerdown", () => {
        if(gameState === "PLAYING" && gameData.nitroCount > 0 && !isNitroActive) {
            gameData.nitroCount--;
            saveGameData();
            setUI("hudNitroCount", gameData.nitroCount);
            isNitroActive = true; nitroTimer = 3.0; glowLayer.intensity = 3.5; 
        }
    });

    bindBtn("playPauseBtn", "click", () => {
        if (gameState === "PLAYING") {
            isPaused = !isPaused;
            let btn = document.getElementById("playPauseBtn");
            if(btn) btn.innerHTML = isPaused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
            
            if (isPaused && sfxCar && sfxCar.isPlaying) sfxCar.pause();
            else if (!isPaused && sfxCar) { try{ sfxCar.play(); } catch(e){} }
        }
    });
    
    bindBtn("themeToggleBtn", "click", () => {
        if (!scene) return; 
        isDayMode = !isDayMode;
        if (isDayMode) {
            scene.fogColor = new BABYLON.Color3(0.5, 0.8, 1.0); 
            hemiLight.intensity = 2.0;
        } else {
            scene.fogColor = new BABYLON.Color3(0.05, 0.05, 0.1); 
            hemiLight.intensity = 1.2;
        }
    });

    window.addEventListener("keydown", (e) => {
        if (gameState !== "PLAYING" || isPaused) return;
        if (e.code === "ArrowLeft" || e.code === "KeyA") switchLane(-1);
        if (e.code === "ArrowRight" || e.code === "KeyD") switchLane(1);
        if (e.code === "ArrowDown" || e.code === "KeyS") isBraking = true;
        if (e.code === "Space") {
            let nBtn = document.getElementById("nitroBtn");
            if(nBtn) nBtn.dispatchEvent(new Event("pointerdown"));
        }
    });
    window.addEventListener("keyup", (e) => { if (e.code === "ArrowDown" || e.code === "KeyS") isBraking = false; });

    // ======================================================================
    // ♾️ 13. MASTER TREADMILL GAME LOOP (SMOOTH FLUID MOTION) ♾️
    // ======================================================================
    function setupGameLoop() {
        let startX = 0;
        scene.onPointerObservable.add((info) => {
            if (gameState !== "PLAYING" || isPaused) return;
            let ev = info.event;
            if (info.type === BABYLON.PointerEventTypes.POINTERDOWN) { startX = ev.clientX || (ev.touches && ev.touches[0].clientX); }
            if (info.type === BABYLON.PointerEventTypes.POINTERUP) {
                let endX = ev.clientX || (ev.changedTouches && ev.changedTouches[0].clientX);
                let diff = endX - startX;
                if(diff > 60) switchLane(1); 
                else if(diff < -60) switchLane(-1); 
            }
        });

        scene.onBeforeRenderObservable.add(() => {
            let rawDt = engine.getDeltaTime() / 16.66; 
            let dt = Math.min(rawDt, 1.5); 

            if (gameState === "MENU" && carHitbox) { carHitbox.position.x = 0; return; }
            if (gameState !== "PLAYING" || isPaused) return;

            if (isNitroActive) {
                speedMultiplier = 2.5; 
                nitroTimer -= (engine.getDeltaTime() / 1000);
                if(nitroTimer <= 0) { isNitroActive = false; glowLayer.intensity = 1.5; }
            } 
            else if (isBraking) { speedMultiplier = 0.5; } 
            else { speedMultiplier = 1.0; }

            let currentSpeed = baseSpeed * speedMultiplier * dt;
            distanceTraveled += currentSpeed;
            score = Math.floor(distanceTraveled);
            setUI("scoreDisplay", score);
            
            baseSpeed += 0.00005 * dt; 

            if (carHitbox) {
                carHitbox.position.x = BABYLON.Scalar.Lerp(carHitbox.position.x, targetX, 0.1 * dt);
                carHitbox.rotation.z = BABYLON.Scalar.Lerp(carHitbox.rotation.z, (targetX - carHitbox.position.x) * -0.08, 0.1 * dt);
            }

            if(camera && carHitbox) {
                let targetCamZ = isNitroActive ? -9 : -7;  
                let targetFov = isNitroActive ? 1.2 : ((window.innerWidth / window.innerHeight) < 1 ? 1.3 : 0.9);
                
                camera.position.x = 0; 
                camera.position.z = BABYLON.Scalar.Lerp(camera.position.z, targetCamZ, 0.05 * dt);
                camera.fov = BABYLON.Scalar.Lerp(camera.fov, targetFov, 0.05 * dt);
            }

            let activeRoads = loadedRoadSets[currentRoadIndex];
            let aLen = roadConfig[currentRoadIndex].calculatedLength || 50;
            
            if (activeRoads && activeRoads.length > 0) {
                for (let g of activeRoads) {
                    g.position.z -= currentSpeed;
                    if (g.position.z < -aLen * 1.5) {
                        g.position.z += aLen * activeRoads.length;
                    }
                }
            }

            for (let o of obstacles) {
                if (!o.active) continue;
                o.mesh.position.z -= currentSpeed;
                
                let zDist = Math.abs(o.mesh.position.z - carHitbox.position.z);
                let xDist = Math.abs(o.mesh.position.x - carHitbox.position.x);

                if (o.mesh.isVisible && zDist < 2.5 && xDist < 1.5) {
                    gameOver();
                }
                
                if (o.mesh.position.z < -10) { o.active = false; o.mesh.isVisible = false; }
            }

            for (let c of coins) {
                if (!c.active) continue;
                c.mesh.position.z -= currentSpeed; c.mesh.rotation.y += 0.05 * dt; 
                
                let zDist = Math.abs(c.mesh.position.z - carHitbox.position.z);
                let xDist = Math.abs(c.mesh.position.x - carHitbox.position.x);

                if (c.mesh.isVisible && zDist < 2.5 && xDist < 1.5) {
                    c.active = false; c.mesh.isVisible = false; 
                    sessionCoins++;
                    setUI("coinDisplay", sessionCoins);
                    
                    // 🎵 1. PLAY COIN SOUND
                    if (sfxCoin) { try { sfxCoin.stop(); sfxCoin.play(); } catch(e){} }
                    
                    // 🎵 2. HARD DUCK (PAUSE) CAR SOUND
                    if (sfxCar && sfxCar.isPlaying) {
                        try {
                            sfxCar.pause(); // Gaadi ki awaaz puri tarah band
                            if (carAudioDuckTimer) clearTimeout(carAudioDuckTimer);
                            carAudioDuckTimer = setTimeout(() => {
                                // 500ms baad wapas shuru, agar game chal raha ho
                                if (gameState === "PLAYING" && sfxCar && !isPaused) {
                                    sfxCar.play(); 
                                }
                            }, 500); 
                        } catch(e){}
                    }
                }
                
                if (c.mesh.position.z < -10) { c.active = false; c.mesh.isVisible = false; }
            }

            if (distanceTraveled - lastSpawnDistance > spawnInterval) {
                spawnItem(); lastSpawnDistance = distanceTraveled;
                if (spawnInterval > 15) spawnInterval -= 0.05 * dt; 
            }
        });
    }

    function adjustCameraForPortrait() {
        if (!camera) return;
        camera.fov = (window.innerWidth / window.innerHeight) < 1 ? 1.3 : 0.9;
    }

    function requestFullScreen() {
        try {
            let elem = document.documentElement;
            if (elem.requestFullscreen) elem.requestFullscreen().catch(function(){}); 
            else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
        } catch(e) {}
    }

    // ======================================================================
    // 🏆 14. COUNTDOWN & START GAME FLOW 🏆
    // ======================================================================
    bindBtn("startBtn", "click", () => {
        try {
            let elem = document.documentElement;
            if (elem.requestFullscreen) elem.requestFullscreen().catch(()=>{}); 
        } catch(e) {}
        
        switchScreen("hud");
        score = 0; sessionCoins = 0; setUI("coinDisplay", 0);
        baseSpeed = 1.0; spawnInterval = 35; distanceTraveled = 0; lastSpawnDistance = 0; 
        currentLane = 1; targetX = laneX[currentLane]; 
        
        if (carHitbox) { 
            carHitbox.position.x = targetX; 
            carHitbox.rotation.z = 0; 
        }
        
        let activeRoads = loadedRoadSets[currentRoadIndex];
        let aLen = roadConfig[currentRoadIndex].calculatedLength || 50;
        if (activeRoads) {
            for (let i = 0; i < activeRoads.length; i++) {
                activeRoads[i].position.z = (i * aLen) - aLen;
            }
        }

        isPaused = false; isBraking = false; isNitroActive = false;
        let pBtn = document.getElementById("playPauseBtn");
        if(pBtn) pBtn.innerHTML = '<i class="fas fa-pause"></i>';
        
        setUI("hudNitroCount", gameData.nitroCount);
        
        obstacles.forEach(o => { o.active = false; o.mesh.isVisible = false; });
        coins.forEach(c => { c.active = false; c.mesh.isVisible = false; });
        
        // 🌟 START COUNTDOWN LOGIC 🌟
        gameState = "COUNTDOWN";
        if(sfxCar) sfxCar.stop(); // Car chup rahegi
        
        if(countdownInterval) clearInterval(countdownInterval);
        
        let count = 5;
        let cdDiv = document.getElementById("countdownDisplay");
        cdDiv.style.display = "block";
        cdDiv.innerText = count;
        
        // 👉 Play count.mp3 FIRST time
        if (sfxCount) { try { sfxCount.stop(); sfxCount.play(); } catch(e){} }

        countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                cdDiv.innerText = count;
                if (sfxCount) { try { sfxCount.stop(); sfxCount.play(); } catch(e){} }
            } else if (count === 0) {
                // 🛑 AT GO: Stop count.mp3 & Start car.mp3 🛑
                cdDiv.innerText = "GO!";
                if (sfxCount) { try { sfxCount.stop(); } catch(e){} }
                if (sfxCar) { try { sfxCar.play(); } catch(e){} } // Start Car sound immediately
            } else {
                clearInterval(countdownInterval);
                cdDiv.style.display = "none";
                gameState = "PLAYING";
            }
        }, 1000);
    });

    function updateLeaderboardUI() {
        let ul = document.getElementById("leaderboardList");
        if(ul) {
            ul.innerHTML = "";
            gameData.leaderboard.forEach((s, i) => {
                ul.innerHTML += `<li>${i+1}. ${s} M</li>`;
            });
        }
    }

    function gameOver() {
        gameState = "GAMEOVER";
        
        // 🎵 CRASH LOGIC: Stop Car permanently, Play Crash 🎵
        if(sfxCar) sfxCar.stop();
        if(sfxCrash) { try { sfxCrash.stop(); sfxCrash.play(); } catch(e){} }

        switchScreen("gameOver");
        setUI("finalScore", score + " M");
        setUI("finalCoins", sessionCoins);
        
        gameData.coins += sessionCoins;
        if(score > gameData.highScore) gameData.highScore = score;

        gameData.leaderboard.push(score);
        gameData.leaderboard.sort((a,b) => b - a); 
        gameData.leaderboard = gameData.leaderboard.slice(0, 3); 

        saveGameData();
        updateLeaderboardUI();
    }

    bindBtn("restartBtn", "click", () => {
        let startBtn = document.getElementById("startBtn");
        if(startBtn) startBtn.click();
    });

    bindBtn("homeBtn", "click", () => {
        if(countdownInterval) clearInterval(countdownInterval);
        let cdDiv = document.getElementById("countdownDisplay");
        if(cdDiv) cdDiv.style.display = "none";
        
        if(sfxCar) sfxCar.stop();
        if(carAudioDuckTimer) clearTimeout(carAudioDuckTimer);
        
        updateMenuUI();
        switchScreen("menu");
        gameState = "MENU";
    });

    window.addEventListener("resize", () => { 
        if(engine) engine.resize(); 
        if(camera) adjustCameraForPortrait();
    });
});
