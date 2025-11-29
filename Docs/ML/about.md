
# Bőrtípus-osztályozó Modell Tanító Szkript Dokumentáció


## 1. Alkalmazott Technológiák és Csomagok

A szkript az alábbi könyvtárakra és modulokra támaszkodik:

* **TensorFlow és Keras (`tensorflow`, `tensorflow.keras`):** Ez a projekt alapvető mélytanulási keretrendszere. A Keras magas szintű API-ját használjuk a modell rétegeinek definiálására, a tanítási folyamat vezérlésére és az adatbetöltésre.
* **EfficientNetB3 (`tensorflow.keras.applications`):** Egy előtanított (pre-trained) neurális hálózat architektúra. Ezt használjuk a modell gerincének (backbone), kihasználva a `imagenet` adathalmazon szerzett előzetes tudását a képi jellemzők kinyerésére.
* **ImageDataGenerator (`preprocessing.image`):** A képek memóriahatékony betöltésére és valós idejű augmentációjára (adatszaporításra) szolgál.
* **Scikit-learn (`class_weight`):** Az osztályok közötti egyensúlyhiány kezelésére használjuk. Kiszámolja a súlyokat, hogy a ritkábban előforduló osztályok nagyobb jelentőséget kapjanak a tanítás során.
* **NumPy (`numpy`):** Numerikus számításokhoz és tömbműveletekhez szükséges a súlyszámítás során.
* **OS (`os`):** A fájlrendszer eléréséhez és az útvonalak dinamikus kezeléséhez használjuk, biztosítva, hogy a szkript a saját könyvtárához képest találja meg az adatokat.

## 2. Adatfolyam és Előkészítés

### Útvonalak és Konfiguráció
A szkript dinamikusan határozza meg a gyökérkönyvtárat (`SCRIPT_DIR`), így nem függ fix elérési útvonalaktól. A képeket a szkript melletti `data` mappából várja.
* **Képfelbontás:** 300x300 pixel (az EfficientNetB3 optimális bemeneti méretéhez igazítva).
* **Batch Size:** 16 (egyszerre ennyi képet dolgoz fel a GPU/CPU).
* **Kiválasztott osztályok:** A szkript szűri a bemenetet, és kizárólag az `['oily', 'dry', 'normal']` mappák tartalmát dolgozza fel.

### Adatbetöltés és Augmentáció
A modell általánosító képességének javítása érdekében a `train_datagen` objektum erős augmentációt végez a tanító adatokon. Minden betöltött képen véletlenszerűen az alábbi transzformációkat hajtja végre:
* **Forgatás:** 90 fokos tartományban.
* **Eltolás:** Vízszintesen és függőlegesen 20%-os mértékig.
* **Nagyítás (Zoom):** 30%-os tartományban (fontos a bőrtextúra részleteihez).
* **Fényerő:** 0.7 és 1.3 közötti szorzóval (a zsíros bőr csillogásának szimulálása vagy elfedése).
* **Tükrözés:** Vízszintesen és függőlegesen.
* **Kitöltés:** `reflect` módban, ami tükrözéssel tölti ki az elforgatás miatt keletkező üres területeket.

A validációs adatok (`valid_datagen`) esetében kizárólag a `preprocess_input` skálázást alkalmazzuk, augmentáció nélkül, hogy a mérés objektív maradjon.

## 3. Modell Architektúra

A rendszer a **Transfer Learning** (tudástranszfer) módszertanát követi.

### Alapmodell (Backbone)
* **Típus:** EfficientNetB3.
* **Súlyok:** ImageNet (előtanított).
* **Bemenet:** (300, 300, 3).
* **Include Top:** `False` (az eredeti osztályozó réteget eltávolítjuk).

### Osztályozó Fej (Custom Head)
Az alapmodell kimenetére egy egyedi, sűrűn kapcsolt hálózat épül:
1.  **GlobalAveragePooling2D:** A térbeli dimenziókat átlagolással vektorrá alakítja.
2.  **BatchNormalization:** Stabilizálja a bemeneti eloszlást a rétegek között.
3.  **Dense Réteg (512 neuron):** ReLU aktivációval és L2 regularizációval (`0.001`) a túltanulás csökkentésére.
4.  **Dropout (0.5):** A neuronok 50%-ának véletlenszerű kikapcsolása tanítás közben.
5.  **Dense Réteg (256 neuron):** ReLU aktivációval.
6.  **Dropout (0.3):** További regularizáció.
7.  **Kimeneti Réteg (3 neuron):** Softmax aktivációval, amely valószínűségi eloszlást ad a három osztályra (oily, dry, normal).

## 4. Tanítási Stratégia (Progresszív Finomhangolás)

A szkript egy háromfázisú tanítási folyamatot valósít meg, amely fokozatosan engedi a modellt alkalmazkodni az új adathalmazhoz. A modell mentése a `callbacks` segítségével történik, amely figyeli a validációs pontosságot (`val_accuracy`), és csak a legjobb eredményt menti el a `models/skin_accurate_model.keras` fájlba.

### 1. Fázis: "Head" Tanítása
* **Állapot:** Az EfficientNetB3 alapmodell rétegei le vannak fagyasztva (`trainable = False`).
* **Cél:** Csak az új, véletlenszerűen inicializált osztályozó rétegek (Head) súlyainak beállítása.
* **Optimizer:** Adam, tanulási ráta: `0.001`.
* **Időtartam:** 10 epoch.

### 2. Fázis: Részleges Finomhangolás (Partial Fine-Tuning)
* **Állapot:** Az alapmodell utolsó 100 rétege feloldásra kerül, a többi (alsóbb rétegek) továbbra is fagyasztott.
* **Cél:** A modell absztraktabb jellemzőket felismerő rétegeinek hangolása a bőrtextúrákra.
* **Optimizer:** Adam, csökkentett tanulási ráta: `0.0001`.
* **Időtartam:** 15 epoch.

### 3. Fázis: Teljes Finomhangolás (Full Fine-Tuning)
* **Állapot:** A teljes modell (beleértve az összes EfficientNet réteget) taníthatóvá válik (`base_model.trainable = True`).
* **Cél:** A teljes hálózat finomhangolása a maximális pontosság elérése érdekében.
* **Optimizer:** Adam, nagyon alacsony tanulási ráta: `0.00001` (hogy ne rontsuk el a már megtanult súlyokat).
* **Időtartam:** 25 epoch.

A szkript futása végén a konzolra kiírja: "A modell elkészült", jelezve a folyamat sikeres befejezését.