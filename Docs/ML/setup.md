# Skin Type Classification AI - Setup Guide

### Virtuális Környezet (Venv) Létrehozása

1. Környezet létrehozása:
python -m venv .venv

2. Környezet aktiválása:
.venv\Scripts\Activate.ps1

### Csomagok telepítése

pip install -r requirements.txt

## Adatstruktúra

A projektnek szüksége van a nyers képekre, ezeket a databan tároljuk

A "data" mappán belül három almappa van:
- train 
- valid 
- test 

Mindhárom almappán belül (train, valid, test) minden kategóriának külön mappája van:
- oily
- dry
- normal

## Modell Betanítása (Training)

Ha az előfeldolgozás végzett, indulhat a tanulás. A rendszer EfficientNetB3 modellt használ 300x300-as felbontással.

Futtasd a tanítást:

python train_accurate.py

Fontos tudnivalók:
- A folyamat 3 fázisban zajlik (Head tanítása -> Részleges finomhangolás -> Teljes finomhangolás).
- Ez a folyamat időigényes lehet.
- A kész modell a "models" mappába kerül "skin_accurate_model.keras" néven.

## Kiértékelés (Evaluation)

Amennyiben végeztünk a tanítással, érdemes lehet futtatni az `evaluate.py` filet, ebben rendelkezésünkre fog állni egy tévesztési mátrix, osztályonkénti pontosság, és egy magabiztossági hisztogram.

## Használat (Prediction)

Amennyiben tesztelni akarjuk a modellt, úgy futassuk a `predict_app-ot`, érdemes átírni (sőt kell is), a `test_img` értékét annak a filenak a nevére, amire futtatni akarjuk.



