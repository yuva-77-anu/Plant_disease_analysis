import os
import shutil

SRC = r"D:\ANU\Plant Disease Detection\PlantVillageDataset\PlantVillage"
DST = r"D:\ANU\Plant Disease Detection\dataset"

TOMATO = {
    "Tomato_Bacterial_spot": "Bacterial_spot",
    "Tomato_Early_blight": "Early_blight",
    "Tomato_healthy": "healthy",
    "Tomato_Late_blight": "Late_blight",
    "Tomato_Leaf_Mold": "Leaf_Mold",
    "Tomato_Septoria_leaf_spot": "Septoria_leaf_spot",
    "Tomato_Spider_mites_Two_spotted_spider_mite": "Spider_mites_Two_spotted_spider_mite",
    "Tomato__Target_Spot": "Target_Spot",
    "Tomato__Tomato_mosaic_virus": "Tomato_mosaic_virus",
    "Tomato__Tomato_YellowLeaf__Curl_Virus": "Tomato_YellowLeaf_Curl_Virus",
}

def parse(class_name):
    if class_name.startswith("Pepper__bell"):
        disease = class_name.split("___", 1)[1] if "___" in class_name else "healthy"
        return "Pepper", disease
    if class_name.startswith("Potato"):
        disease = class_name.split("___", 1)[1] if "___" in class_name else "healthy"
        return "Potato", disease
    if class_name in TOMATO:
        return "Tomato", TOMATO[class_name]
    return None, None

os.makedirs(DST, exist_ok=True)
for class_name in os.listdir(SRC):
    src_dir = os.path.join(SRC, class_name)
    if not os.path.isdir(src_dir):
        continue
    plant, disease = parse(class_name)
    if not plant:
        print("SKIP:", class_name)
        continue
    new_class = f"{plant}___{disease}"
    dst_dir = os.path.join(DST, new_class)
    os.makedirs(dst_dir, exist_ok=True)
    for fname in os.listdir(src_dir):
        shutil.copy2(os.path.join(src_dir, fname), os.path.join(dst_dir, fname))
    print(f"{class_name} -> {new_class}")

for d in os.listdir(DST):
    p = os.path.join(DST, d)
    if os.path.isdir(p):
        sub = os.listdir(p)
        if sub and os.path.isdir(os.path.join(p, sub[0])):
            shutil.rmtree(p)
            print("removed nested:", d)
print("Done.")
