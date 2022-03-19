# Exports the map from Blender into a json file
import bpy
import bmesh
import json
D = bpy.data

oneoff_names = [ "megaMe", "keyDoor" ]

with open('./map.json', 'w') as fp:
    oneoffs = {}
    for o in D.objects:
        if o.name in oneoff_names:
            oneoffs[o.name] = o.location[:2]
    json.dump({
        'oneoffs': oneoffs,
        'doors': [{ 'scale': o.scale.x, 'pos': o.location[:2] } for o in D.objects if o.name.startswith("Door")],
        'circles': [{ 'scale': o.scale.x, 'pos': o.location[:2] } for o in D.objects if o.name.startswith("Circle")],
        'rectangles': [{ 'scale': o.scale[:2], 'pos': o.location[:2] } for o in D.objects if o.name.startswith("Plane")]
    }, fp)