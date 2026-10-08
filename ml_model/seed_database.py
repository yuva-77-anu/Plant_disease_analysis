import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app
from backend.extensions import db
from backend.models import DiseaseInfo

def seed_diseases():
    app = create_app()
    with app.app_context():
        json_path = os.path.join(os.path.dirname(__file__), 'diseases_database.json')
        with open(json_path, 'r', encoding='utf-8') as f:
            diseases = json.load(f)
        
        count = 0
        for d in diseases:
            exists = DiseaseInfo.query.filter(
                db.func.lower(DiseaseInfo.plant_name) == d['plant_name'].lower(),
                db.func.lower(DiseaseInfo.disease_name) == d['disease_name'].lower(),
            ).first()
            if not exists:
                info = DiseaseInfo(
                    plant_name=d['plant_name'],
                    disease_name=d['disease_name'],
                    description=d.get('description'),
                    treatment=d.get('treatment'),
                    organic_treatment=d.get('organic_treatment'),
                    fertilizer=d.get('fertilizer'),
                    prevention_tips=d.get('prevention_tips'),
                    symptoms=d.get('symptoms'),
                )
                db.session.add(info)
                count += 1
        
        db.session.commit()
        print(f"Seeded {count} diseases into the database.")

if __name__ == '__main__':
    seed_diseases()
