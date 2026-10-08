import argparse
import os
import sys

from .seed_database import seed_diseases


def main():
    parser = argparse.ArgumentParser(description="PlantGuard ML Model Runner")
    parser.add_argument("command", choices=["seed-db", "info"], help="Command to run")
    args = parser.parse_args()

    if args.command == "seed-db":
        seed_diseases()
    elif args.command == "info":
        script_dir = os.path.dirname(os.path.abspath(__file__))
        print(f"ML Model Directory: {script_dir}")
        print(f"Available commands: seed-db, info")
        print(f"Note: train.py and predict.py require TensorFlow and a dataset.")


if __name__ == "__main__":
    main()
