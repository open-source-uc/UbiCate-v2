import json
import argparse


def load_geojson(filename):
    with open(filename, 'r') as file:
        return json.load(file)


def save_geojson(data, filename):
    with open(filename, 'w') as file:
        json.dump(data, file, indent=2)


def get_missing_objects(A, B):
    identifiers_in_A = {feature['properties']['identifier'].lower() for feature in A['features']}
    return [feature for feature in B['features'] if feature['properties']['identifier'].lower() not in identifiers_in_A]


def main():
    parser = argparse.ArgumentParser(description='Compare two GeoJSON files and add missing objects from B to A.')
    parser.add_argument('geojsonA', type=str, help='Path to the first GeoJSON file (A)')
    parser.add_argument('geojsonB', type=str, help='Path to the second GeoJSON file (B)')

    args = parser.parse_args()

    geojsonA = load_geojson(args.geojsonA)
    geojsonB = load_geojson(args.geojsonB)

    missing_objects = get_missing_objects(geojsonA, geojsonB)

    if not missing_objects:
        print('No missing objects found.')
        return

    print('Missing objects from B that are not in A:')
    for obj in missing_objects:
        print(json.dumps(obj, indent=2))

    answer = input('Do you want to add these missing objects to A? (yes/no): ')

    if answer.lower() == 'yes':
        geojsonA['features'].extend(missing_objects)
        save_geojson(geojsonA, args.geojsonA)
        print('Missing objects have been added to A.')
    else:
        print('No changes were made to A.')


if __name__ == '__main__':
    main()
