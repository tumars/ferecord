"""在 Blender 中生成一体成形的低面数云团，导出为网页 GLB。"""
import argparse
import sys
from pathlib import Path

import bpy

parser = argparse.ArgumentParser()
parser.add_argument("--output", required=True)
args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:])
output = Path(args.output).resolve()
output.parent.mkdir(parents=True, exist_ok=True)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

parts = []
for x, z, radius in [(-0.62, -0.03, 0.38), (-0.21, 0.20, 0.53), (0.29, 0.08, 0.45), (0.66, -0.08, 0.29)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=radius, location=(x, 0, z))
    parts.append(bpy.context.object)
bpy.ops.object.select_all(action="DESELECT")
for part in parts:
    part.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
cloud = bpy.context.object
cloud.name = "Cloud"
cloud.data.remesh_voxel_size = 0.055
bpy.ops.object.voxel_remesh()
smooth = cloud.modifiers.new("SoftSurface", "SMOOTH")
smooth.factor = 0.8
smooth.iterations = 4
bpy.ops.object.modifier_apply(modifier=smooth.name)
cloud.scale.y = 0.65
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
decimate = cloud.modifiers.new("WebMesh", "DECIMATE")
decimate.ratio = 0.3
bpy.ops.object.modifier_apply(modifier=decimate.name)
for polygon in cloud.data.polygons:
    polygon.use_smooth = True

material = bpy.data.materials.new("SoftCloud")
material.use_nodes = True
bsdf = material.node_tree.nodes.get("Principled BSDF")
bsdf.inputs["Base Color"].default_value = (0.72, 0.79, 0.76, 1.0)
bsdf.inputs["Roughness"].default_value = 0.92
cloud.data.materials.append(material)

bpy.ops.export_scene.gltf(
    filepath=str(output),
    export_format="GLB",
    use_selection=True,
    export_materials="EXPORT",
    export_yup=True,
)
print(f"Cloud: {len(cloud.data.vertices)} vertices, {len(cloud.data.polygons)} faces; {output.stat().st_size} bytes")
