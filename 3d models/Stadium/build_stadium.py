"""
KICKDOM ARENA - procedural stadium generator
=============================================
Builds the main game stadium (arena floor, barrier wall with neon strips and
chevrons, hexagonal neon goals with nets, tiered stands full of ball-character
fans, LED rim, floodlights, geometric roof truss with hanging banners, base
plinth, collision meshes) as a clean, game-ready Blender scene.

Run it:
  * inside Blender 5.x : Scripting tab -> open this file -> Run Script
  * headless           : blender -b -P build_stadium.py -- --out <folder>
  * bpy module         : python build_stadium.py --out <folder>

Units are metres, Z up, origin at pitch centre. Red goal at +X, blue goal at -X.
"""
import bpy, bmesh, math, random, sys, os, argparse
from mathutils import Vector, Matrix

# ----------------------------------------------------------------------------
# CLI
# ----------------------------------------------------------------------------
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
ap = argparse.ArgumentParser()
ap.add_argument("--out", default=os.path.join(os.getcwd(), "stadium_out"))
ap.add_argument("--no-render", action="store_true")
ap.add_argument("--no-export", action="store_true")
ap.add_argument("--samples", type=int, default=96)
ap.add_argument("--res", type=int, default=1600)
ap.add_argument("--cams", default="")
ap.add_argument("--hide-roof", action="store_true", help="render without the roof truss and banners (top-down game camera view)")
ARGS, _ = ap.parse_known_args(argv)
OUT = ARGS.out
os.makedirs(os.path.join(OUT, "previews"), exist_ok=True)
random.seed(2026)

# ----------------------------------------------------------------------------
# Scene reset & collections
# ----------------------------------------------------------------------------
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.name = "KickdomArena"

def coll(name, parent=None):
    c = bpy.data.collections.new(name)
    (parent or scene.collection).children.link(c)
    return c

C_ROOT   = coll("KickdomArena")
C_ARENA  = coll("Arena", C_ROOT)
C_WALL   = coll("Barrier", C_ROOT)
C_GOALS  = coll("Goals", C_ROOT)
C_STANDS = coll("Stands", C_ROOT)
C_SEATS  = coll("Seats", C_ROOT)
C_FANS   = coll("Fans", C_ROOT)
C_RIM    = coll("RimAndFloodlights", C_ROOT)
C_ROOF   = coll("RoofTruss", C_ROOT)
C_DRESS  = coll("Banners", C_ROOT)
C_BASE   = coll("BasePlinth", C_ROOT)
C_COL    = coll("Collision", C_ROOT)
C_LIGHT  = coll("Lighting", C_ROOT)
C_CAMS   = coll("PreviewCameras", C_ROOT)
C_LIB    = coll("_MeshLibrary", C_ROOT)   # source objects for instanced meshes (hidden)

# ----------------------------------------------------------------------------
# Palette (sRGB hex -> linear)
# ----------------------------------------------------------------------------
def srgb(hexstr):
    h = hexstr.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4))
    lin = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (lin(r), lin(g), lin(b))

MATS = {}
def mat(name, color, rough=0.55, metal=0.0, emit=None, emit_str=0.0, alpha=1.0):
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*srgb(color), 1.0)
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metal
    if emit is not None:
        bsdf.inputs["Emission Color"].default_value = (*srgb(emit), 1.0)
        bsdf.inputs["Emission Strength"].default_value = emit_str
    if alpha < 1.0:
        bsdf.inputs["Alpha"].default_value = alpha
        m.surface_render_method = 'BLENDED'
        m.use_transparency_overlap = True
    m.diffuse_color = (*srgb(color), alpha)
    MATS[name] = m
    return m

M_CONC    = mat("Concrete_Light",   "#9A9EAB", rough=0.62)   # walls, pillars, rim
M_CONC_M  = mat("Concrete_Mid",     "#7C808D", rough=0.65)   # recessed panels
M_CONC_D  = mat("Concrete_Dark",    "#5B5F6B", rough=0.7)    # bases, undersides
M_FLOOR   = mat("Pitch_Floor",      "#4B4F5B", rough=0.72)
M_GROOVE  = mat("Pitch_Groove",     "#3A3D47", rough=0.75)
M_LINE    = mat("Pitch_Line",       "#D9DCE3", rough=0.5)
M_STEP    = mat("Stand_Step",       "#8F93A0", rough=0.7)
M_RISER   = mat("Stand_Riser",      "#6F7380", rough=0.7)
M_CONCOURSE = mat("Concourse",      "#666A76", rough=0.8)
M_TRUSS   = mat("Truss_Steel",      "#8C909C", rough=0.5, metal=0.2)
M_TRUSS_D = mat("Truss_Dark",       "#5E626E", rough=0.55, metal=0.2)
M_RED     = mat("Team_Red",         "#E0262E", rough=0.45)
M_BLUE    = mat("Team_Blue",        "#2158E0", rough=0.45)
M_RED_E   = mat("Neon_Red",         "#FF2F36", rough=0.3, emit="#FF3A40", emit_str=4.5)
M_BLUE_E  = mat("Neon_Blue",        "#2F73FF", rough=0.3, emit="#3F80FF", emit_str=4.5)
M_RED_N   = mat("Net_Red",          "#FF6A6E", rough=0.5, emit="#FF4A50", emit_str=1.5)
M_BLUE_N  = mat("Net_Blue",         "#6A9CFF", rough=0.5, emit="#4A86FF", emit_str=1.5)
M_RED_G   = mat("GoalFloor_Red",    "#FF3A40", rough=0.15, emit="#FF3A40", emit_str=1.5, alpha=0.6)
M_BLUE_G  = mat("GoalFloor_Blue",   "#3A7CFF", rough=0.15, emit="#3A7CFF", emit_str=1.5, alpha=0.6)
M_SEAT_R  = mat("Seat_Red",         "#B8222A", rough=0.6)
M_SEAT_B  = mat("Seat_Blue",        "#1F4BC2", rough=0.6)
M_LED_W   = mat("LED_White",        "#FFFFFF", rough=0.3, emit="#F4F7FF", emit_str=5.0)
M_FLOOD   = mat("Floodlight_Lamp",  "#FFFFFF", rough=0.2, emit="#FFF8EC", emit_str=25.0)
M_FLOOD_H = mat("Floodlight_Housing", "#4E525E", rough=0.5, metal=0.3)
M_YELLOW  = mat("Fan_Body",         "#F4C531", rough=0.45)
M_BLACK   = mat("Fan_Limb",         "#1E1B22", rough=0.6)
M_EYE     = mat("White",            "#F6F6F6", rough=0.3)
M_POLE    = mat("Flag_Pole",        "#DDDDDD", rough=0.4, metal=0.6)
M_COLL    = mat("COLLISION_hidden", "#00FF88", rough=1.0, alpha=0.25)

# ----------------------------------------------------------------------------
# bmesh helpers
# ----------------------------------------------------------------------------
def faces_of(verts):
    fs = set()
    for v in verts:
        fs.update(v.link_faces)
    return list(fs)

def edges_of(verts):
    es = set()
    for v in verts:
        es.update(v.link_edges)
    return list(es)

def set_mat(faces, mi, smooth=None):
    for f in faces:
        f.material_index = mi
        if smooth is not None:
            f.smooth = smooth

def box(bm, size, center=(0, 0, 0), mi=0, matrix=None):
    r = bmesh.ops.create_cube(bm, size=1.0)
    vs = r["verts"]
    bmesh.ops.scale(bm, vec=Vector(size), verts=vs)
    if matrix is not None:
        bmesh.ops.transform(bm, matrix=matrix, verts=vs)
    bmesh.ops.translate(bm, vec=Vector(center), verts=vs)
    set_mat(faces_of(vs), mi, False)
    return vs

def beam(bm, p1, p2, w, h, mi=0):
    """Box beam between two points (local X along beam, Z up-ish)."""
    p1, p2 = Vector(p1), Vector(p2)
    d = p2 - p1
    q = d.to_track_quat('X', 'Z')
    M = Matrix.Translation((p1 + p2) / 2) @ q.to_matrix().to_4x4()
    r = bmesh.ops.create_cube(bm, size=1.0)
    vs = r["verts"]
    bmesh.ops.scale(bm, vec=Vector((d.length, w, h)), verts=vs)
    bmesh.ops.transform(bm, matrix=M, verts=vs)
    set_mat(faces_of(vs), mi, False)
    return vs

def sphere(bm, r, center, u=10, v=6, mi=0, scale=(1, 1, 1)):
    res = bmesh.ops.create_uvsphere(bm, u_segments=u, v_segments=v, radius=r)
    vs = res["verts"]
    bmesh.ops.scale(bm, vec=Vector(scale), verts=vs)
    bmesh.ops.translate(bm, vec=Vector(center), verts=vs)
    set_mat(faces_of(vs), mi, True)
    return vs

def cyl_between(bm, p1, p2, r, segs=6, mi=0, r2=None, smooth=False, caps=True):
    p1, p2 = Vector(p1), Vector(p2)
    d = p2 - p1
    q = d.to_track_quat('Z', 'Y')
    M = Matrix.Translation((p1 + p2) / 2) @ q.to_matrix().to_4x4()
    res = bmesh.ops.create_cone(bm, cap_ends=caps, cap_tris=False, segments=segs,
                                radius1=r, radius2=(r if r2 is None else r2), depth=d.length, matrix=M)
    vs = res["verts"]
    set_mat(faces_of(vs), mi, smooth)
    return vs

def bevel_edges(bm, edges, offset, segments=1, mi=None, profile=0.5):
    edges = [e for e in edges if e.is_valid]
    if not edges:
        return []
    res = bmesh.ops.bevel(bm, geom=edges, offset=offset, offset_type='OFFSET', segments=segments,
                          profile=profile, affect='EDGES', clamp_overlap=True, loop_slide=True)
    if mi is not None:
        set_mat(res["faces"], mi)
    return res["faces"]

def bbox_of(verts):
    xs = [v.co.x for v in verts]; ys = [v.co.y for v in verts]; zs = [v.co.z for v in verts]
    return (Vector((min(xs), min(ys), min(zs))), Vector((max(xs), max(ys), max(zs))))

def edges_in(bm, bb, eps=1e-3):
    lo, hi = bb
    def inside(v):
        return (lo.x - eps <= v.co.x <= hi.x + eps and lo.y - eps <= v.co.y <= hi.y + eps and lo.z - eps <= v.co.z <= hi.z + eps)
    return [e for e in bm.edges if inside(e.verts[0]) and inside(e.verts[1])]

def top_edges(bm, bb, eps=1e-3):
    """Edges on the top plane of a bounding box (bb from bbox_of, taken before any bevel)."""
    zmax = bb[1].z
    return [e for e in edges_in(bm, bb) if all(abs(v.co.z - zmax) < eps for v in e.verts)]

def vertical_edges(bm, bb, eps=1e-3):
    return [e for e in edges_in(bm, bb)
            if abs(e.verts[0].co.x - e.verts[1].co.x) < eps and abs(e.verts[0].co.y - e.verts[1].co.y) < eps
            and abs(e.verts[0].co.z - e.verts[1].co.z) > 0.05]

def face_by_normal(faces, n, eps=0.9):
    n = Vector(n)
    best = None
    for f in faces:
        if f.normal.dot(n) > eps and (best is None or f.calc_area() > best.calc_area()):
            best = f
    return best

def recess(bm, face, thickness, depth, mi):
    res = bmesh.ops.inset_individual(bm, faces=[face], thickness=thickness, depth=0.0, use_even_offset=True)
    bmesh.ops.translate(bm, vec=-face.normal * depth, verts=list(face.verts))
    face.material_index = mi
    for f in res["faces"]:
        f.material_index = mi
    return face

def poly_face(bm, pts3d, mi=0, flip=False, tri=True):
    vs = [bm.verts.new(p) for p in pts3d]
    f = bm.faces.new(vs[::-1] if flip else vs)
    f.material_index = mi
    if tri and len(vs) > 4:
        bmesh.ops.triangulate(bm, faces=[f])
    return vs

def poly_prism(bm, pts, z0, z1, mi_top=0, mi_side=0, mi_bot=None, tri=True):
    vs = [bm.verts.new((p[0], p[1], z0)) for p in pts]
    bot = bm.faces.new(vs)
    res = bmesh.ops.extrude_face_region(bm, geom=[bot])
    newv = [g for g in res["geom"] if isinstance(g, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, vec=(0, 0, z1 - z0), verts=newv)
    allf = list(set(faces_of(vs) + faces_of(newv)))
    bmesh.ops.recalc_face_normals(bm, faces=allf)
    for f in allf:
        if f.normal.z > 0.9:
            f.material_index = mi_top
        elif f.normal.z < -0.9:
            f.material_index = mi_top if mi_bot is None else mi_bot
        else:
            f.material_index = mi_side
    if tri:
        bmesh.ops.triangulate(bm, faces=[f for f in allf if len(f.verts) > 4])
    return vs + newv

def ring_quads(bm, inner, outer, z_in, z_out, mi):
    n = len(inner)
    vi = [bm.verts.new((p[0], p[1], z_in)) for p in inner]
    vo = [bm.verts.new((p[0], p[1], z_out)) for p in outer]
    fs = []
    for i in range(n):
        j = (i + 1) % n
        f = bm.faces.new((vi[i], vi[j], vo[j], vo[i]))
        f.material_index = mi
        fs.append(f)
    return fs

def finish(name, bm, mats, collection, loc=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1), merge=True, parent=None):
    if merge:
        bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for m in mats:
        me.materials.append(m)
    ob = bpy.data.objects.new(name, me)
    collection.objects.link(ob)
    ob.location, ob.rotation_euler, ob.scale = loc, rot, scale
    if parent:
        ob.parent = parent
    return ob

def library(name, bm, mats):
    """Store a mesh in the hidden library collection, return the mesh datablock."""
    ob = finish(name, bm, mats, C_LIB)
    ob.location = (0, 0, -60)
    return ob.data

def instance(name, mesh, collection, loc, rot=(0, 0, 0), scale=(1, 1, 1), parent=None):
    ob = bpy.data.objects.new(name, mesh)
    collection.objects.link(ob)
    ob.location, ob.rotation_euler, ob.scale = loc, rot, scale
    if parent:
        ob.parent = parent
    return ob

def empty(name, collection, loc=(0, 0, 0), parent=None):
    e = bpy.data.objects.new(name, None)
    e.empty_display_type = 'PLAIN_AXES'
    e.empty_display_size = 2
    collection.objects.link(e)
    e.location = loc
    if parent:
        e.parent = parent
    return e

# ----------------------------------------------------------------------------
# 2D polygon helpers
# ----------------------------------------------------------------------------
def offset_poly(P, d):
    n = len(P)
    out = []
    for i in range(n):
        a, b, c = Vector(P[i - 1]), Vector(P[i]), Vector(P[(i + 1) % n])
        t1 = (b - a).normalized(); t2 = (c - b).normalized()
        n1 = Vector((t1.y, -t1.x)); n2 = Vector((t2.y, -t2.x))
        m = n1 + n2
        if m.length < 1e-6:
            out.append((b.x, b.y)); continue
        m = m / (1.0 + n1.dot(n2))
        p = b + m * d
        out.append((p.x, p.y))
    return out

def walk_poly(P, spacing, start=0.0):
    n = len(P)
    pts = []
    for i in range(n):
        a, b = Vector(P[i]), Vector(P[(i + 1) % n])
        L = (b - a).length
        t = (b - a) / L
        s = start
        while s < L:
            p = a + t * s
            pts.append((p, t, min(s, L - s)))
            s += spacing
        start = s - L
    return pts

def regular_poly(n, r, phase=0.0):
    return [(r * math.cos(phase + 2 * math.pi * i / n), r * math.sin(phase + 2 * math.pi * i / n)) for i in range(n)]

# ----------------------------------------------------------------------------
# ARENA LAYOUT
# ----------------------------------------------------------------------------
GOAL_HALF = 5.7
PITCH_L, PITCH_W = 19.5, 11.0
Q1 = [(22.6, 10.0), (19.2, 13.4), (13.5, 15.6), (6.8, 16.4)]
P_WALL = ([(24.0, -GOAL_HALF), (24.0, GOAL_HALF)] + Q1 + [(0.0, 16.6)] + [(-x, y) for x, y in Q1[::-1]]
          + [(-24.0, GOAL_HALF), (-24.0, -GOAL_HALF)] + [(-x, -y) for x, y in Q1] + [(0.0, -16.6)]
          + [(x, -y) for x, y in Q1[::-1]])
NV = len(P_WALL)
GOAL_EDGES = {0: "red", 11: "blue"}
NO_PILLAR = {0, 1, 11, 12}
ROOT = empty("KickdomArena_Root", C_ROOT)

def edge_frame(i):
    a, b = Vector(P_WALL[i]), Vector(P_WALL[(i + 1) % NV])
    t = b - a; L = t.length; t /= L
    return a, b, t, L, math.atan2(t.y, t.x), (a + b) / 2

def vertex_rot(P, i):
    n = len(P)
    a, b, c = Vector(P[i - 1]), Vector(P[i]), Vector(P[(i + 1) % n])
    t = ((b - a).normalized() + (c - b).normalized()).normalized()
    return math.atan2(t.y, t.x)

def team_of_x(x):
    return "red" if x > 0 else "blue"

TEAM = {"red": dict(solid=M_RED, neon=M_RED_E, net=M_RED_N, glass=M_RED_G, seat=M_SEAT_R),
        "blue": dict(solid=M_BLUE, neon=M_BLUE_E, net=M_BLUE_N, glass=M_BLUE_G, seat=M_SEAT_B)}

CROWN = [(-0.5, -0.36), (0.5, -0.36), (0.5, 0.02), (0.29, 0.5), (0.145, 0.08), (0.0, 0.58),
         (-0.145, 0.08), (-0.29, 0.5), (-0.5, 0.02)]   # unit crown outline (x, y), CCW

def crown(bm, center, size, mi, normal_axis='Y', flip=False, extrude=0.06):
    """Extruded crown emblem lying in a plane; normal along +normal_axis (or -)."""
    pts = []
    for x, y in CROWN:
        if normal_axis == 'Y':
            pts.append(Vector((x * size, 0, y * size)))
        else:
            pts.append(Vector((0, x * size, y * size)))
    pts = [Vector(center) + p for p in pts]
    vs = poly_face(bm, pts, mi, flip=flip, tri=False)
    f = vs[0].link_faces[0]
    res = bmesh.ops.extrude_face_region(bm, geom=[f])
    nv = [g for g in res["geom"] if isinstance(g, bmesh.types.BMVert)]
    nrm = Vector((0, 1, 0)) if normal_axis == 'Y' else Vector((1, 0, 0))
    if flip:
        nrm = -nrm
    bmesh.ops.translate(bm, vec=nrm * extrude, verts=nv)
    fs = list(set(faces_of(vs) + faces_of(nv)))
    set_mat(fs, mi)
    bmesh.ops.triangulate(bm, faces=[ff for ff in fs if len(ff.verts) > 4])
    return vs + nv

CHEVRON = [(-0.55, -0.5), (-0.1, -0.5), (0.55, 0.0), (-0.1, 0.5), (-0.55, 0.5), (0.1, 0.0)]  # ">" band

# ----------------------------------------------------------------------------
# ARENA FLOOR + PITCH LINES
# ----------------------------------------------------------------------------
def build_floor():
    bm = bmesh.new()
    poly_prism(bm, offset_poly(P_WALL, 1.4), -0.8, 0.0, mi_top=0, mi_side=1)
    finish("Arena_FloorSlab", bm, [M_FLOOR, M_CONC_D], C_ARENA, parent=ROOT)

    # subtle floor tile grooves (large tiles like the concept), very low profile
    bm = bmesh.new()
    gw = 0.05
    for x in range(-18, 19, 6):
        vs = [bm.verts.new(p) for p in ((x - gw, -PITCH_W - 1.5, 0.004), (x + gw, -PITCH_W - 1.5, 0.004),
                                         (x + gw, PITCH_W + 1.5, 0.004), (x - gw, PITCH_W + 1.5, 0.004))]
        bm.faces.new(vs)
    for y in range(-12, 13, 6):
        vs = [bm.verts.new(p) for p in ((-PITCH_L - 2, y - gw, 0.004), (PITCH_L + 2, y - gw, 0.004),
                                         (PITCH_L + 2, y + gw, 0.004), (-PITCH_L - 2, y + gw, 0.004))]
        bm.faces.new(vs)
    finish("Arena_FloorGrooves", bm, [M_GROOVE], C_ARENA, parent=ROOT, merge=False)

    # pitch lines
    bm = bmesh.new()
    w = 0.16
    z = 0.012
    def loop_line(pts):
        ring_quads(bm, offset_poly(pts, -w / 2), offset_poly(pts, w / 2), z, z, 0)
    c = 3.5
    outer_line = [(-PITCH_L + c, -PITCH_W), (PITCH_L - c, -PITCH_W), (PITCH_L, -PITCH_W + c), (PITCH_L, PITCH_W - c),
                  (PITCH_L - c, PITCH_W), (-PITCH_L + c, PITCH_W), (-PITCH_L, PITCH_W - c), (-PITCH_L, -PITCH_W + c)]
    loop_line(outer_line)
    loop_line(regular_poly(32, 3.2))                                         # centre circle
    for y0, y1 in ((-PITCH_W, -3.2), (3.2, PITCH_W)):                          # halfway line
        bm.faces.new([bm.verts.new(p) for p in ((-w / 2, y0, z), (w / 2, y0, z), (w / 2, y1, z), (-w / 2, y1, z))])
    loop_line(regular_poly(12, 0.35))                                        # centre spot
    for sx in (1, -1):                                                       # chamfered goal boxes
        ga = [(PITCH_L, -6.0), (PITCH_L - 3.0, -6.0), (PITCH_L - 5.0, -4.0), (PITCH_L - 5.0, 4.0), (PITCH_L - 3.0, 6.0), (PITCH_L, 6.0)]
        ga = [(sx * x, y) for x, y in ga]
        for a, b in zip(ga[:-1], ga[1:]):
            a, b = Vector(a), Vector(b)
            t = (b - a).normalized(); nrm = Vector((-t.y, t.x)) * (w / 2)
            bm.faces.new([bm.verts.new((*(a - nrm), z)), bm.verts.new((*(b - nrm), z)),
                          bm.verts.new((*(b + nrm), z)), bm.verts.new((*(a + nrm), z))])
    finish("Pitch_Lines", bm, [M_LINE], C_ARENA, parent=ROOT, merge=False)

# ----------------------------------------------------------------------------
# BARRIER: PANELS & PILLARS
# ----------------------------------------------------------------------------
def panel_bm(bm, L, H=2.9, T=1.0, plinth=0.45, chamfer=0.25, inset=0.3, depth=0.1, split=1):
    """Concrete frame with recessed panels both faces + dark plinth. Local X along wall, +Y = pitch side."""
    box(bm, (L, T + 0.35, plinth), (0, 0, plinth / 2), mi=2)
    body = box(bm, (L - 0.05, T, H - plinth), (0, 0, plinth + (H - plinth) / 2), mi=0)
    bb = bbox_of(body)
    bfaces = faces_of(body)
    for nrm in ((0, 1, 0), (0, -1, 0)):
        f = face_by_normal(bfaces, nrm)
        if split > 1:
            res = bmesh.ops.subdivide_edges(bm, edges=[e for e in f.edges if abs(e.verts[0].co.x - e.verts[1].co.x) > 0.5],
                                            cuts=split - 1, use_grid_fill=True)
            fs = [g for g in res["geom_inner"] if isinstance(g, bmesh.types.BMFace)]
            fs = [ff for ff in set(fs) if ff.is_valid and ff.normal.dot(Vector(nrm)) > 0.9]
            for ff in fs:
                recess(bm, ff, inset, depth, 1)
        else:
            recess(bm, f, inset, depth, 1)
    bevel_edges(bm, top_edges(bm, bb), chamfer, mi=0)
    return body

def panel_mesh(L, team, chevron_dir=0, name="Barrier_Panel"):
    """Panel with neon strip on the pitch-side top edge; optional chevron pair pointing chevron_dir (+1/-1)."""
    t = TEAM[team]
    bm = bmesh.new()
    H = 2.9
    panel_bm(bm, L, H=H)
    mats = [M_CONC, M_CONC_M, M_CONC_D, t["neon"], M_LED_W]
    # neon strip along the top pitch-side edge (team colour) + white LED strip on the outer side
    box(bm, (L - 0.5, 0.2, 0.14), (0, 0.42, H - 0.02), mi=3)       # top pitch-side edge (visible from above)
    box(bm, (L - 0.5, 0.1, 0.16), (0, 0.52, H - 0.75), mi=3)       # pitch face strip
    box(bm, (L - 0.5, 0.1, 0.12), (0, -0.52, H - 0.6), mi=4)       # outer white LED
    if chevron_dir:
        for k in (-1, 1):
            cx = k * 1.35
            pts = [Vector((cx + chevron_dir * x * 1.6, 0.52, 1.55 + y * 1.5)) for x, y in CHEVRON]
            vs = poly_face(bm, pts, mi=3, flip=(chevron_dir < 0), tri=False)
            f = vs[0].link_faces[0]
            res = bmesh.ops.extrude_face_region(bm, geom=[f])
            nv = [g for g in res["geom"] if isinstance(g, bmesh.types.BMVert)]
            bmesh.ops.translate(bm, vec=(0, 0.05, 0), verts=nv)
            fs = list(set(faces_of(vs) + faces_of(nv)))
            set_mat(fs, 3)
            bmesh.ops.triangulate(bm, faces=[ff for ff in fs if len(ff.verts) > 4])
    return library(name, bm, mats)

def pillar_mesh(name, W=1.5, H=3.4, base=0.7, chamfer=0.32, slit=None, led=True):
    bm = bmesh.new()
    b = box(bm, (W, W, base), (0, 0, base / 2), mi=1)
    bevel_edges(bm, top_edges(bm, bbox_of(b)), 0.1, mi=1)
    body = box(bm, (W - 0.15, W - 0.15, H - base), (0, 0, base + (H - base) / 2), mi=0)
    bb = bbox_of(body)
    bevel_edges(bm, vertical_edges(bm, bb), 0.07, mi=0)
    bevel_edges(bm, top_edges(bm, bb), chamfer, mi=0)
    mats = [M_CONC, M_CONC_D, M_LED_W]
    if slit is not None:
        mats.append(slit)
        box(bm, (0.32, 0.08, 1.4), (0, (W - 0.15) / 2, base + 1.3), mi=3)
        box(bm, (0.32, 0.08, 1.4), (0, -(W - 0.15) / 2, base + 1.3), mi=3)
    elif led:
        box(bm, (0.32, 0.08, 0.9), (0, (W - 0.15) / 2, base + 1.4), mi=2)
    return library(name, bm, mats)

def build_barrier():
    panels = {}
    for i in range(NV):
        if i in GOAL_EDGES:
            continue
        a, b, t, L, rot, mid = edge_frame(i)
        team = team_of_x(mid.x)
        chev = 0
        if 2.0 < abs(mid.x) < 10.0 and abs(mid.y) > 15.0:
            goal_dir = 1 if team == "red" else -1
            chev = 1 if t.x * goal_dir > 0 else -1
        key = (round(L - 1.3, 2), team, chev)
        if key not in panels:
            panels[key] = panel_mesh(L - 1.3, team, chev, name=f"Lib_Panel_{key[0]}m_{team}{'_chev' if chev else ''}")
        instance(f"Barrier_Panel_{i:02d}", panels[key], C_WALL, (mid.x, mid.y, 0), (0, 0, rot), parent=ROOT)
    plain = pillar_mesh("Lib_Pillar")
    slits = {"red": pillar_mesh("Lib_Pillar_RedSlit", slit=M_RED_E), "blue": pillar_mesh("Lib_Pillar_BlueSlit", slit=M_BLUE_E)}
    for i in range(NV):
        if i in NO_PILLAR:
            continue
        x, y = P_WALL[i]
        src = slits[team_of_x(x)] if abs(x) > 21 else plain
        instance(f"Barrier_Pillar_{i:02d}", src, C_WALL, (x, y, 0), (0, 0, vertex_rot(P_WALL, i)), parent=ROOT)

# ----------------------------------------------------------------------------
# GOALS
# ----------------------------------------------------------------------------
def bake_modifiers(ob):
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
    old = ob.data
    ob.modifiers.clear()
    ob.data = me
    bpy.data.meshes.remove(old)
    return ob

def hex_opening(w, h, cham):
    """Elongated hexagon outline (x, z) centred at origin: flat top/bottom, angled sides."""
    return [(-w / 2 + cham, -h / 2), (w / 2 - cham, -h / 2), (w / 2, 0.0), (w / 2 - cham, h / 2), (-w / 2 + cham, h / 2), (-w / 2, 0.0)]

def goal_mesh(team):
    t = TEAM[team]
    mats = [M_CONC, M_CONC_M, t["neon"], t["glass"], t["net"], M_CONC_D]
    W, D, H = 8.6, 4.6, 4.3          # hood
    cw, ch, cd = 5.8, 3.1, 3.6        # opening / tunnel
    cham = 1.1
    zc = 0.05 + ch / 2                # opening centre height
    # ---- hood with boolean tunnel
    bm = bmesh.new()
    hood = box(bm, (W, D, H), (0, 0.5 - D / 2, H / 2), mi=0)
    bb = bbox_of(hood)
    bevel_edges(bm, vertical_edges(bm, bb), 0.5, mi=0)
    bevel_edges(bm, top_edges(bm, bb), 0.8, mi=0)
    hood_ob = finish("Goal_Hood_tmp", bm, mats, C_GOALS)
    bm = bmesh.new()
    pts = [(x, 2.0, zc + z) for x, z in hex_opening(cw, ch, cham)]
    vs = poly_face(bm, pts, mi=1, tri=False)
    f = vs[0].link_faces[0]
    res = bmesh.ops.extrude_face_region(bm, geom=[f])
    nv = [g for g in res["geom"] if isinstance(g, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, vec=(0, -(cd + 2.0 - 0.5), 0), verts=nv)
    cut_ob = finish("Goal_Cutter_tmp", bm, [M_CONC_M], C_GOALS)
    mod = hood_ob.modifiers.new("cut", 'BOOLEAN')
    mod.operation, mod.object, mod.solver, mod.material_mode = 'DIFFERENCE', cut_ob, 'EXACT', 'TRANSFER'
    bake_modifiers(hood_ob)
    bpy.data.objects.remove(cut_ob)
    me = hood_ob.data
    for p in me.polygons:                       # tunnel interior -> mid concrete
        c = p.center
        if abs(c.x) < cw / 2 + 0.01 and 0.5 - cd - 0.2 < c.y < 0.55 and c.z < ch + 0.15 and abs(p.normal.y) < 0.99:
            p.material_index = 1
        if abs(p.normal.y) > 0.99 and c.y < 0.5 - cd + 0.2 and abs(c.x) < cw / 2:
            p.material_index = 1
    # ---- details joined in
    bm = bmesh.new()
    bm.from_mesh(me)
    # neon outline tubes around the hex opening (front face y=0.5)
    op = hex_opening(cw + 0.36, ch + 0.36, cham + 0.05)
    for k in range(6):
        a, b = op[k], op[(k + 1) % 6]
        cyl_between(bm, (a[0], 0.5, zc + a[1]), (b[0], 0.5, zc + b[1]), 0.11, segs=8, mi=2, smooth=True)
        sphere(bm, 0.11, (a[0], 0.5, zc + a[1]), u=8, v=5, mi=2)
    # second, thinner inner outline (double neon like the concept)
    op2 = hex_opening(cw - 0.1, ch - 0.1, cham)
    for k in range(6):
        a, b = op2[k], op2[(k + 1) % 6]
        cyl_between(bm, (a[0], 0.46, zc + a[1]), (b[0], 0.46, zc + b[1]), 0.05, segs=6, mi=2)
    # tunnel edge neon (depth) at the four side corners
    for x, z in ((-cw / 2, 0.0), (cw / 2, 0.0)):
        cyl_between(bm, (x * 0.995, 0.4, zc + z), (x * 0.995, 0.5 - cd + 0.2, zc + z), 0.05, segs=6, mi=2)
    # net: lattice of thin bars on back wall, sides and roof of tunnel
    def lattice(origin, ax_u, ax_v, nu, nv, sp, r=0.022):
        o = Vector(origin); u = Vector(ax_u); v = Vector(ax_v)
        for i in range(nu + 1):
            cyl_between(bm, o + u * (i * sp), o + u * (i * sp) + v * (nv * sp), r, segs=4, mi=4, caps=False)
        for j in range(nv + 1):
            cyl_between(bm, o + v * (j * sp), o + v * (j * sp) + u * (nu * sp), r, segs=4, mi=4, caps=False)
    yb = 0.5 - cd + 0.25
    sp = 0.36
    lattice((-cw / 2 + 0.3, yb, 0.12), (1, 0, 0), (0, 0, 1), int((cw - 0.6) / sp), int((ch - 0.3) / sp), sp)
    for sx in (1, -1):
        lattice((sx * (cw / 2 - 0.25), 0.3, 0.12), (0, -1, 0), (0, 0, 1), int((cd - 0.2) / sp), int((ch - 0.3) / sp), sp)
    lattice((-cw / 2 + 0.3, 0.3, ch - 0.12), (1, 0, 0), (0, -1, 0), int((cw - 0.6) / sp), int((cd - 0.2) / sp), sp)
    # translucent team floor plate + glow floor strip
    box(bm, (cw - 0.2, cd - 0.2, 0.06), (0, 0.5 - cd / 2 + 0.05, 0.08), mi=3)
    box(bm, (cw + 0.6, 0.18, 0.06), (0, 0.6, 0.03), mi=2)
    # crown emblem above the opening
    crown(bm, (0, 0.52, H - 0.55), 1.15, 2, normal_axis='Y', extrude=0.08)
    # wings (flanking pillars) with tall slits both faces
    for sx in (1, -1):
        wx = sx * (W / 2 + 0.8)
        b = box(bm, (1.6, 2.3, 0.85), (wx, 0, 0.425), mi=5)
        bevel_edges(bm, top_edges(bm, bbox_of(b)), 0.1, mi=5)
        body = box(bm, (1.45, 2.15, 3.7), (wx, 0, 0.85 + 1.85), mi=0)
        bb = bbox_of(body)
        bevel_edges(bm, vertical_edges(bm, bb), 0.08, mi=0)
        bevel_edges(bm, top_edges(bm, bb), 0.35, mi=0)
        box(bm, (0.42, 0.08, 2.4), (wx, 1.08, 2.7), mi=2)
        box(bm, (0.42, 0.08, 2.4), (wx, -1.08, 2.7), mi=2)
    ob = finish(f"Goal_{team.capitalize()}", bm, mats, C_GOALS)
    bpy.data.objects.remove(hood_ob)
    return ob

def build_goals():
    for i, team in GOAL_EDGES.items():
        a, b, t, L, rot, mid = edge_frame(i)
        g = goal_mesh(team)
        g.location = (mid.x, mid.y, 0)
        g.rotation_euler = (0, 0, rot)
        g.parent = ROOT

# ----------------------------------------------------------------------------
# STANDS
# ----------------------------------------------------------------------------
D0 = 3.4
RISE, RUN = 0.62, 1.45
ROWS_LOW, ROWS_UP = 9, 8
WALK = 3.0
LOW_Z0 = 1.1
UP_PARAPET = 1.3
ROW_INFO = []
ST = {}
PLACEMENTS = []

def build_stands():
    P = P_WALL
    bm = bmesh.new()
    ring_quads(bm, offset_poly(P, D0 - 0.5), offset_poly(P, D0 - 0.5), -0.02, LOW_Z0, 0)
    ring_quads(bm, offset_poly(P, D0 - 0.5), offset_poly(P, D0), LOW_Z0, LOW_Z0, 0)
    d, z = D0, LOW_Z0
    for r in range(ROWS_LOW):
        ROW_INFO.append((d, z, "low"))
        ring_quads(bm, offset_poly(P, d), offset_poly(P, d + RUN), z, z, 1)
        ring_quads(bm, offset_poly(P, d + RUN), offset_poly(P, d + RUN), z, z + RISE, 2)
        d += RUN; z += RISE
    ring_quads(bm, offset_poly(P, d), offset_poly(P, d + WALK), z, z, 3)
    d += WALK
    ST["mid_d"], ST["mid_z"] = d, z
    ring_quads(bm, offset_poly(P, d), offset_poly(P, d), z, z + UP_PARAPET, 0)
    ring_quads(bm, offset_poly(P, d), offset_poly(P, d + 0.6), z + UP_PARAPET, z + UP_PARAPET, 0)
    d += 0.6; z += UP_PARAPET
    for r in range(ROWS_UP):
        ROW_INFO.append((d, z, "up"))
        ring_quads(bm, offset_poly(P, d), offset_poly(P, d + RUN), z, z, 1)
        ring_quads(bm, offset_poly(P, d + RUN), offset_poly(P, d + RUN), z, z + RISE, 2)
        d += RUN; z += RISE
    ring_quads(bm, offset_poly(P, d), offset_poly(P, d + 2.2), z, z, 3)
    d += 2.2
    ST["top_d"], ST["top_z"] = d, z
    finish("Stands_Bowl", bm, [M_CONC, M_STEP, M_RISER, M_CONCOURSE], C_STANDS, parent=ROOT)

    # aisle stairs at each section boundary (lighter steps overlaid)
    bm = bmesh.new()
    for i in range(NV):
        for (dd, zz, deck) in ROW_INFO:
            pts = offset_poly(P, dd)
            pts2 = offset_poly(P, dd + RUN)
            a = Vector(pts[i]); b = Vector(pts2[i])
            t = (b - a).normalized(); nrm = Vector((-t.y, t.x)) * 0.7
            box_pts = [a - nrm, b - nrm, b + nrm, a + nrm]
            vs = [bm.verts.new((p.x, p.y, zz + 0.02)) for p in box_pts]
            f = bm.faces.new(vs); f.material_index = 0
    finish("Stands_Aisles", bm, [M_CONC], C_STANDS, parent=ROOT, merge=False)

    # neon ribbons on the front parapet and the mid parapet (team colour per half + white line)
    bm = bmesh.new()
    def ribbon(dd, z0, z1, mi_white=2):
        pts = offset_poly(P, dd - 0.55)
        for i in range(NV):
            a, b = Vector(pts[i]), Vector(pts[(i + 1) % NV])
            segs = [(a, b)]
            if (a.x < 0) != (b.x < 0):
                tt = a.x / (a.x - b.x); m = a + (b - a) * tt
                segs = [(a, m), (m, b)]
            for p, q in segs:
                mi = 0 if (p.x + q.x) > 0 else 1
                # shorten each segment slightly so the strip reads as separate bars
                dirv = (q - p); Lr = dirv.length
                if Lr < 1.2:
                    continue
                dirv /= Lr
                p2, q2 = p + dirv * 0.35, q - dirv * 0.35
                f = bm.faces.new([bm.verts.new((p2.x, p2.y, z0)), bm.verts.new((q2.x, q2.y, z0)),
                                  bm.verts.new((q2.x, q2.y, z1)), bm.verts.new((p2.x, p2.y, z1))]); f.material_index = mi
                f = bm.faces.new([bm.verts.new((p2.x, p2.y, z1 + 0.08)), bm.verts.new((q2.x, q2.y, z1 + 0.08)),
                                  bm.verts.new((q2.x, q2.y, z1 + 0.14)), bm.verts.new((p2.x, p2.y, z1 + 0.14))]); f.material_index = mi_white
    ribbon(D0, 0.35, 0.72)
    ribbon(ST["mid_d"], ST["mid_z"] + 0.35, ST["mid_z"] + 0.8)
    finish("Stands_NeonRibbons", bm, [M_RED_E, M_BLUE_E, M_LED_W], C_STANDS, parent=ROOT, merge=False)

# ----------------------------------------------------------------------------
# RIM: parapet with LED bars, floodlight grids
# ----------------------------------------------------------------------------
def build_rim():
    P = P_WALL
    d, z = ST["top_d"], ST["top_z"]
    zr = z + 4.2
    bm = bmesh.new()
    ring_quads(bm, offset_poly(P, d), offset_poly(P, d), z, zr, 0)                 # inner face
    ring_quads(bm, offset_poly(P, d), offset_poly(P, d + 1.6), zr, zr, 0)          # cap
    ring_quads(bm, offset_poly(P, d + 1.6), offset_poly(P, d + 1.6), zr, -0.02, 0) # outer skin
    # chamfer-like ledge (angled facet) near the top of the inner face
    ring_quads(bm, offset_poly(P, d - 0.35), offset_poly(P, d), zr - 1.0, zr - 0.4, 1)
    ring_quads(bm, offset_poly(P, d - 0.35), offset_poly(P, d - 0.35), z, zr - 1.0, 0)
    ring_quads(bm, offset_poly(P, d - 0.35), offset_poly(P, d), zr - 0.4, zr, 1)
    finish("Rim_Parapet", bm, [M_CONC, M_CONC_M], C_RIM, parent=ROOT)
    ST["rim_z"], ST["rim_d"] = zr, d

    # recessed panel facade on the outer skin (reuse the panel language) + white LED bars on the inner face
    bm = bmesh.new()
    pts_in = offset_poly(P, d - 0.42)
    pts_out = offset_poly(P, d + 1.62)
    for i in range(NV):
        a, b = Vector(pts_in[i]), Vector(pts_in[(i + 1) % NV])
        L = (b - a).length; t = (b - a) / L
        m = (a + b) / 2
        bar_len = min(4.5, L * 0.55)
        for zz, hh in ((zr - 2.2, 0.32),):
            p, q = m - t * bar_len / 2, m + t * bar_len / 2
            f = bm.faces.new([bm.verts.new((p.x, p.y, zz)), bm.verts.new((q.x, q.y, zz)),
                              bm.verts.new((q.x, q.y, zz + hh)), bm.verts.new((p.x, p.y, zz + hh))]); f.material_index = 0
    finish("Rim_LEDBars", bm, [M_LED_W], C_RIM, parent=ROOT, merge=False)

    # outer facade panels
    fp = panel_mesh(6.4, "red", 0, name="Lib_FacadePanel")   # neon strip colour irrelevant -> replaced below
    # rebuild a neutral facade panel (white LED strip only)
    bm = bmesh.new()
    panel_bm(bm, 6.4, H=6.0, T=0.7, plinth=0.7, chamfer=0.35, inset=0.5, depth=0.14, split=2)
    box(bm, (6.0, 0.1, 0.14), (0, 0.37, 5.45), mi=3)
    fpm = library("Lib_FacadePanel_Neutral", bm, [M_CONC, M_CONC_M, M_CONC_D, M_LED_W])
    bpy.data.meshes.remove(fp)
    fpil = pillar_mesh("Lib_FacadePillar", W=1.3, H=7.0, base=0.9, chamfer=0.35, led=False)
    idx = 0
    for tier_z in (0.0, 7.0, 14.0):
        if tier_z + 6.0 > zr + 0.5:
            continue
        for i in range(NV):
            a, b = Vector(pts_out[i]), Vector(pts_out[(i + 1) % NV])
            L = (b - a).length; t = (b - a) / L
            rot = math.atan2(t.y, t.x)
            k = max(1, round(L / 7.4))
            step = L / k
            for j in range(k):
                m = a + t * (step * (j + 0.5))
                instance(f"Facade_Panel_{idx:03d}", fpm, C_RIM, (m.x, m.y, tier_z), (0, 0, rot + math.pi), parent=ROOT)
                pm = a + t * (step * j)
                instance(f"Facade_Pillar_{idx:03d}", fpil, C_RIM, (pm.x, pm.y, tier_z), (0, 0, rot), parent=ROOT)
                idx += 1

    # floodlight grids on posts on the rim cap
    bm = bmesh.new()
    box(bm, (0.5, 0.5, 3.0), (0, 0, 1.5), mi=0)
    box(bm, (0.9, 0.9, 0.25), (0, 0, 0.12), mi=0)
    head = box(bm, (2.6, 0.5, 1.8), (0, 0.2, 3.6), mi=0)
    bmesh.ops.rotate(bm, cent=Vector((0, 0, 3.0)), matrix=Matrix.Rotation(math.radians(-18), 3, 'X'), verts=head)
    for ix in range(4):
        for iz in range(2):
            lamp = sphere(bm, 0.24, (-0.9 + ix * 0.6, 0.47, 3.15 + iz * 0.6), u=8, v=4, mi=1, scale=(1, 0.35, 1))
            bmesh.ops.rotate(bm, cent=Vector((0, 0, 3.0)), matrix=Matrix.Rotation(math.radians(-18), 3, 'X'), verts=lamp)
    fl = library("Lib_Floodlight", bm, [M_FLOOD_H, M_FLOOD])
    cap = offset_poly(P, d + 0.9)
    for k in range(NV):
        if k in (0, 11):
            continue
        x, y = cap[k]
        if k % 2 == 1:
            continue
        instance(f"Floodlight_{k:02d}", fl, C_RIM, (x, y, zr), (0, 0, vertex_rot(P, k) + math.pi), parent=ROOT)

# ----------------------------------------------------------------------------
# ROOF TRUSS: outer ring, ribs to a central ring hub, glow ring, banners
# ----------------------------------------------------------------------------
def build_roof():
    P = P_WALL
    zr, d = ST["rim_z"], ST["rim_d"]
    hub_r, hub_z = 21.0, zr + 19.0
    bm = bmesh.new()
    # outer ring beam on top of the rim (octagonal cross-section look via two stacked boxes)
    ring_pts = offset_poly(P, d + 0.8)
    for i in range(NV):
        a, b = ring_pts[i], ring_pts[(i + 1) % NV]
        beam(bm, (a[0], a[1], zr + 0.6), (b[0], b[1], zr + 0.6), 1.3, 1.2, mi=0)
    # ribs: from evenly spaced rim points up to the hub ring, in 6 segments with a gentle arc
    hub_pts = regular_poly(12, hub_r, math.pi / 12)
    rib_bases = [pt for pt, t, vd in walk_poly(ring_pts, 1.0)]
    n_ribs = 12
    total = len(rib_bases)
    ST["rib_paths"] = []
    for k in range(n_ribs):
        base = rib_bases[int(total * (k / n_ribs + 1 / (2 * n_ribs))) % total]
        ang = math.atan2(base.y, base.x)
        hub = Vector((hub_r * math.cos(ang), hub_r * math.sin(ang)))
        p0, p1 = Vector((base.x, base.y, zr + 1.2)), Vector((hub.x, hub.y, hub_z))
        path = []
        segs = 6
        for s in range(segs + 1):
            u = s / segs
            p = p0.lerp(p1, u) + Vector((0, 0, math.sin(u * math.pi) * 3.5))
            path.append(p)
        ST["rib_paths"].append(path)
        for s in range(segs):
            beam(bm, path[s], path[s + 1], 0.95, 0.85, mi=0)
            # angular joint block
            box(bm, (1.3, 1.3, 1.2), path[s + 1], mi=1)
        # short vertical strut at the base
        box(bm, (1.6, 1.6, 1.4), (base.x, base.y, zr + 0.7), mi=1)
    # hub ring
    ring_i, ring_o = regular_poly(12, hub_r - 1.4, math.pi / 12), regular_poly(12, hub_r + 1.0, math.pi / 12)
    ring_quads(bm, ring_i, ring_o, hub_z + 0.7, hub_z + 0.7, 0)
    ring_quads(bm, ring_o, ring_i, hub_z - 0.7, hub_z - 0.7, 1)
    ring_quads(bm, ring_i, ring_i, hub_z - 0.7, hub_z + 0.7, 0)
    ring_quads(bm, ring_o, ring_o, hub_z + 0.7, hub_z - 0.7, 0)
    # central hexagonal pod hanging in the ring centre (like the concept's hub)
    for r_, z0, z1 in ((4.5, hub_z - 1.2, hub_z + 1.6), (3.0, hub_z - 2.4, hub_z - 1.2)):
        poly_prism(bm, regular_poly(6, r_, math.pi / 6), z0, z1, mi_top=0, mi_side=1)
    for k in range(6):
        a = hub_pts[k * 2]; ang = math.atan2(a[1], a[0])
        beam(bm, (4.4 * math.cos(ang), 4.4 * math.sin(ang), hub_z), (a[0] - 1.2 * math.cos(ang), a[1] - 1.2 * math.sin(ang), hub_z), 0.8, 0.7, mi=1)
    finish("Roof_Truss", bm, [M_TRUSS, M_TRUSS_D], C_ROOF, parent=ROOT)

    # glow: LED ring under the hub ring + bars along the outer ring beam + rib underside bars
    bm = bmesh.new()
    gi, go = regular_poly(12, hub_r - 1.1, math.pi / 12), regular_poly(12, hub_r + 0.7, math.pi / 12)
    ring_quads(bm, go, gi, hub_z - 0.72, hub_z - 0.72, 0)
    for i in range(NV):
        a, b = Vector(ring_pts[i]), Vector(ring_pts[(i + 1) % NV])
        L = (b - a).length; t = (b - a) / L; m = (a + b) / 2
        team = 0 if m.x > 0 else 1
        p, q = m - t * min(3.5, L * 0.45), m + t * min(3.5, L * 0.45)
        inward = Vector((-t.y, t.x))
        p2, q2 = p + inward * 0.66, q + inward * 0.66
        f = bm.faces.new([bm.verts.new((p2.x, p2.y, zr + 0.35)), bm.verts.new((q2.x, q2.y, zr + 0.35)),
                          bm.verts.new((q2.x, q2.y, zr + 0.85)), bm.verts.new((p2.x, p2.y, zr + 0.85))])
        f.material_index = 1 + team
    for path in ST["rib_paths"]:
        for s in (1, 3):
            a, b = path[s], path[s + 1]
            dv = (b - a); Ln = dv.length; dv /= Ln
            p, q = a + dv * 0.9, b - dv * 0.9
            beam(bm, (p.x, p.y, p.z - 0.56), (q.x, q.y, q.z - 0.56), 0.5, 0.1, mi=0)
    finish("Roof_Glow", bm, [M_LED_W, M_RED_E, M_BLUE_E], C_ROOF, parent=ROOT, merge=False)

    # floodlight grids hanging from the ribs
    bm = bmesh.new()
    box(bm, (2.4, 0.45, 1.6), (0, 0, 0), mi=0)
    box(bm, (0.5, 0.5, 1.2), (0, 0, 1.3), mi=0)
    for ix in range(4):
        for iz in range(2):
            sphere(bm, 0.24, (-0.9 + ix * 0.6, -0.25, -0.35 + iz * 0.65), u=8, v=4, mi=1, scale=(1, 0.35, 1))
    fl = library("Lib_RoofFloodlight", bm, [M_FLOOD_H, M_FLOOD])
    for k, path in enumerate(ST["rib_paths"]):
        p = path[2]
        ang = math.atan2(p.y, p.x)
        instance(f"Roof_Floodlight_{k:02d}", fl, C_ROOF, (p.x, p.y, p.z - 1.9), (math.radians(-25), 0, ang + math.pi / 2), parent=ROOT)

    # banners hanging from the ribs
    def banner_mesh(team):
        t = TEAM[team]
        bm = bmesh.new()
        box(bm, (3.2, 0.06, 5.2), (0, 0, -2.8), mi=0)
        # pointed bottom (swallow-tail cut) via two angled boxes removed is costly; add a pennant tip instead
        poly_face(bm, [(-1.6, -0.031, -5.4), (1.6, -0.031, -5.4), (0.0, -0.031, -6.6)], mi=0, flip=True, tri=False)
        poly_face(bm, [(-1.6, 0.031, -5.4), (1.6, 0.031, -5.4), (0.0, 0.031, -6.6)], mi=0, tri=False)
        box(bm, (3.6, 0.16, 0.16), (0, 0, -0.1), mi=2)
        box(bm, (0.12, 0.12, 0.8), (0, 0, 0.4), mi=2)
        crown(bm, (0, -0.03, -2.9), 2.0, 1, normal_axis='Y', flip=True, extrude=0.05)
        crown(bm, (0, 0.03, -2.9), 2.0, 1, normal_axis='Y', flip=False, extrude=0.05)
        return library(f"Lib_Banner_{team}", bm, [t["solid"], M_EYE, M_TRUSS_D])
    bmr, bmb = banner_mesh("red"), banner_mesh("blue")
    for k, path in enumerate(ST["rib_paths"]):
        p = path[1]
        team = team_of_x(p.x)
        ang = math.atan2(p.y, p.x)
        instance(f"Banner_{k:02d}", bmr if team == "red" else bmb, C_DRESS, (p.x, p.y, p.z - 0.5), (0, 0, ang + math.pi / 2), parent=ROOT)

# ----------------------------------------------------------------------------
# FANS (ball characters) - shared meshes, instanced
# ----------------------------------------------------------------------------
def fan_mesh(team, pose, jersey, lod=0):
    """Ball-character fan facing -Y. ~1.75 m tall."""
    t = TEAM[team]
    mats = [M_YELLOW, M_BLACK, t["solid"], M_EYE, M_POLE]
    bm = bmesh.new()
    R, bz = 0.46, 1.02
    u, v = (12, 8) if lod == 0 else (8, 5)
    body_mi = 2 if jersey else 0
    sphere(bm, R, (0, 0, bz), u=u, v=v, mi=body_mi)
    if jersey:                                       # yellow head cap on a team jersey body
        cap = sphere(bm, R * 1.01, (0, 0, bz), u=u, v=v, mi=0)
        bmesh.ops.delete(bm, geom=[f for f in faces_of(cap) if f.calc_center_median().z < bz - 0.02], context='FACES')
    res = bmesh.ops.create_cone(bm, cap_ends=False, cap_tris=False, segments=u, radius1=R * 0.95, radius2=R * 0.95,
                                depth=0.13, matrix=Matrix.Translation((0, 0, bz + 0.16)))
    set_mat(faces_of(res["verts"]), 2, True)
    if lod == 0:
        for sx in (1, -1):
            tail = box(bm, (0.09, 0.42, 0.05), (sx * 0.12, R + 0.18, bz + 0.16), mi=2)
            bmesh.ops.rotate(bm, cent=Vector((sx * 0.12, R * 0.9, bz + 0.16)),
                             matrix=Matrix.Rotation(sx * math.radians(25), 3, 'Z') @ Matrix.Rotation(math.radians(-20), 3, 'X'), verts=tail)
        for sx in (1, -1):
            sphere(bm, 0.105, (sx * 0.16, -R * 0.86, bz + 0.03), u=8, v=4, mi=3, scale=(1.0, 0.45, 1.25))
            brow = box(bm, (0.26, 0.06, 0.07), (sx * 0.17, -R * 0.93, bz + 0.15), mi=1)
            bmesh.ops.rotate(bm, cent=Vector((sx * 0.17, -R * 0.93, bz + 0.15)), matrix=Matrix.Rotation(-sx * math.radians(22), 3, 'Y'), verts=brow)
        box(bm, (0.16, 0.04, 0.05), (0, -R * 0.99, bz - 0.2), mi=1)
    for sx in (1, -1):
        cyl_between(bm, (sx * 0.16, 0, bz - R * 0.75), (sx * 0.22, -0.05, 0.16), 0.06, segs=6 if lod == 0 else 5, mi=1)
        shoe = box(bm, (0.24, 0.42, 0.16), (sx * 0.22, -0.12, 0.16), mi=2)
        if lod == 0:
            bevel_edges(bm, top_edges(bm, bbox_of(shoe)), 0.05, mi=2)
        box(bm, (0.26, 0.44, 0.07), (sx * 0.22, -0.12, 0.05), mi=3)
    def arm(sx, kind):
        sh = (sx * R * 0.85, 0, bz + 0.05)
        if kind == "up":
            el, hand = (sx * (R + 0.25), 0.05, bz + 0.35), (sx * (R + 0.2), 0.0, bz + 0.85)
        elif kind == "flag":
            el, hand = (sx * (R + 0.25), -0.15, bz + 0.3), (sx * (R + 0.15), -0.25, bz + 0.75)
        else:
            el, hand = (sx * (R + 0.2), 0.0, bz - 0.25), (sx * (R + 0.12), -0.1, bz - 0.6)
        cyl_between(bm, sh, el, 0.055, segs=6 if lod == 0 else 5, mi=1)
        cyl_between(bm, el, hand, 0.055, segs=6 if lod == 0 else 5, mi=1)
        sphere(bm, 0.12, hand, u=8 if lod == 0 else 6, v=5 if lod == 0 else 4, mi=2)
        return hand
    if pose == "up":
        arm(1, "up"); arm(-1, "up")
    elif pose == "one":
        arm(1, "up"); arm(-1, "down")
    elif pose == "down":
        arm(1, "down"); arm(-1, "down")
    elif pose == "flag":
        hand = arm(1, "flag"); arm(-1, "down")
        top = (hand[0], hand[1], hand[2] + 1.45)
        cyl_between(bm, (hand[0], hand[1], hand[2] - 0.35), top, 0.02, segs=5, mi=4)
        fx = hand[0]
        box(bm, (0.04, 1.1, 0.72), (fx + 0.03, hand[1] + 0.57, top[2] - 0.36), mi=2)
        crown(bm, (fx + 0.03 - 0.02, hand[1] + 0.57, top[2] - 0.38), 0.5, 3, normal_axis='X', flip=True, extrude=0.015)
        crown(bm, (fx + 0.03 + 0.02, hand[1] + 0.57, top[2] - 0.38), 0.5, 3, normal_axis='X', flip=False, extrude=0.015)
    return library(f"Lib_Fan_{team}_{pose}{'_jersey' if jersey else ''}_LOD{lod}", bm, mats)

def seat_mesh(team):
    bm = bmesh.new()
    b = box(bm, (0.82, 0.5, 0.42), (0, 0.42, 0.21), mi=0)
    bevel_edges(bm, top_edges(bm, bbox_of(b)), 0.06, mi=0)
    back = box(bm, (0.82, 0.12, 0.45), (0, 0.6, 0.63), mi=0)
    bevel_edges(bm, top_edges(bm, bbox_of(back)), 0.04, mi=0)
    return library(f"Lib_Seat_{team}", bm, [TEAM[team]["seat"]])

def build_fans():
    poses = ["up", "one", "down", "flag"]
    weights = [0.36, 0.26, 0.2, 0.18]
    meshes = {}
    seats = {"red": seat_mesh("red"), "blue": seat_mesh("blue")}
    fans_root = empty("Fans_Root", C_FANS, parent=ROOT)
    seats_root = empty("Seats_Root", C_SEATS, parent=ROOT)
    count = 0
    P = P_WALL
    PLACEMENTS.clear()
    for ri, (d, z, deck) in enumerate(ROW_INFO):
        lod = 0 if deck == "low" else 1
        pts = walk_poly(offset_poly(P, d + 0.6), 1.12, start=random.uniform(0, 1.0))
        for (p, t, vdist) in pts:
            if vdist < 0.85:
                continue
            team = "red" if p.x > 2.5 else "blue" if p.x < -2.5 else random.choice(("red", "blue"))
            to_c = Vector((-p.x, -p.y)).normalized()
            yaw = math.atan2(to_c.x, -to_c.y) + random.uniform(-0.25, 0.25)
            inward = Vector((-t.y, t.x))
            sp = p - inward * 0.42
            instance(f"Seat_{count:04d}", seats[team], C_SEATS, (sp.x, sp.y, z),
                     (0, 0, math.atan2(-inward.x, inward.y) + math.pi), parent=seats_root)
            if random.random() < 0.1:
                continue
            pose = random.choices(poses, weights)[0]
            jersey = random.random() < 0.45
            key = (team, pose, jersey, lod)
            if key not in meshes:
                meshes[key] = fan_mesh(*key)
            s = random.uniform(0.9, 1.1)
            fp = p + Vector((random.uniform(-0.1, 0.1), random.uniform(-0.1, 0.1))) + inward * 0.15
            instance(f"Fan_{count:04d}", meshes[key], C_FANS, (fp.x, fp.y, z), (0, 0, yaw), (s, s, s), parent=fans_root)
            PLACEMENTS.append({"m": meshes[key].name, "t": team, "p": [round(fp.x, 3), round(fp.y, 3), round(z, 3)],
                               "r": round(yaw, 4), "s": round(s, 3), "row": ri, "deck": deck})
            count += 1
    return count

# ----------------------------------------------------------------------------
# BASE PLINTH (the stadium sits on a massive chamfered base with neon strips)
# ----------------------------------------------------------------------------
def build_base():
    P = P_WALL
    d_out = ST["rim_d"] + 1.6
    bm = bmesh.new()
    top = offset_poly(P, d_out + 2.5)
    mid = offset_poly(P, d_out + 3.5)
    bot = offset_poly(P, d_out - 1.0)
    ring_quads(bm, offset_poly(P, d_out), top, -0.9, -0.9, 0)            # ledge around the facade
    ring_quads(bm, top, top, -0.9, -2.2, 0)
    ring_quads(bm, top, mid, -2.2, -3.4, 1)
    ring_quads(bm, mid, mid, -3.4, -6.5, 0)
    ring_quads(bm, mid, bot, -6.5, -9.5, 1)
    ring_quads(bm, bot, bot, -9.5, -12.0, 0)
    poly_prism(bm, offset_poly(P, d_out - 1.0), -12.6, -12.0, mi_top=1, mi_side=1)
    finish("Base_Plinth", bm, [M_CONC_D, M_CONC_M], C_BASE, parent=ROOT)
    # neon strips around the base (team halves)
    bm = bmesh.new()
    pts = offset_poly(P, d_out + 3.52)
    for i in range(NV):
        a, b = Vector(pts[i]), Vector(pts[(i + 1) % NV])
        m = (a + b) / 2; t = (b - a).normalized(); L = (b - a).length
        p, q = m - t * L * 0.38, m + t * L * 0.38
        for z0 in (-4.4, -5.4):
            f = bm.faces.new([bm.verts.new((p.x, p.y, z0)), bm.verts.new((q.x, q.y, z0)),
                              bm.verts.new((q.x, q.y, z0 + 0.22)), bm.verts.new((p.x, p.y, z0 + 0.22))])
            f.material_index = 0 if m.x > 0 else 1
    finish("Base_NeonStrips", bm, [M_RED_E, M_BLUE_E], C_BASE, parent=ROOT, merge=False)

# ----------------------------------------------------------------------------
# COLLISION
# ----------------------------------------------------------------------------
def build_collision():
    bm = bmesh.new()
    poly_prism(bm, offset_poly(P_WALL, 0.0), -0.5, 0.0)
    ob = finish("COL_PitchFloor", bm, [M_COLL], C_COL, parent=ROOT)
    bm = bmesh.new()
    inner, outer = offset_poly(P_WALL, -0.5), offset_poly(P_WALL, 0.7)
    ring_quads(bm, inner, inner, 0.0, 3.4, 0)
    ring_quads(bm, outer, outer, 3.4, 0.0, 0)
    ring_quads(bm, inner, outer, 3.4, 3.4, 0)
    ob2 = finish("COL_BarrierWall", bm, [M_COLL], C_COL, parent=ROOT)
    # goal mouths: simple open boxes so the ball can enter
    for i, team in GOAL_EDGES.items():
        a, b, t, L, rot, mid = edge_frame(i)
        bm = bmesh.new()
        box(bm, (5.8, 0.2, 3.1), (0, 0.5 - 3.6, 1.6), mi=0)      # back
        box(bm, (0.2, 3.6, 3.1), (-2.9, 0.5 - 1.8, 1.6), mi=0)
        box(bm, (0.2, 3.6, 3.1), (2.9, 0.5 - 1.8, 1.6), mi=0)
        box(bm, (5.8, 3.6, 0.2), (0, 0.5 - 1.8, 3.15), mi=0)     # roof
        g = finish(f"COL_Goal_{team.capitalize()}", bm, [M_COLL], C_COL, (mid.x, mid.y, 0), (0, 0, rot), parent=ROOT)
        g["team"] = team
    for o in C_COL.objects:
        o.hide_render = True
        o.display_type = 'WIRE'
        o["collision"] = True

# ----------------------------------------------------------------------------
# LIGHTING + CAMERAS
# ----------------------------------------------------------------------------
def build_lighting():
    world = bpy.data.worlds.new("World")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (0.42, 0.47, 0.62, 1.0)
    bg.inputs[1].default_value = 1.0
    sun_d = bpy.data.lights.new("Sun", 'SUN')
    sun_d.energy = 3.0
    sun_d.angle = math.radians(5)
    sun_d.color = (1.0, 0.96, 0.9)
    sun = bpy.data.objects.new("Sun_Key", sun_d)
    C_LIGHT.objects.link(sun)
    sun.rotation_euler = (math.radians(50), math.radians(10), math.radians(-40))
    fill_d = bpy.data.lights.new("Fill", 'SUN')
    fill_d.energy = 1.0
    fill_d.color = (0.8, 0.88, 1.0)
    fill = bpy.data.objects.new("Sun_Fill", fill_d)
    C_LIGHT.objects.link(fill)
    fill.rotation_euler = (math.radians(60), math.radians(-30), math.radians(140))

def camera(name, loc, target, lens=35):
    cd = bpy.data.cameras.new(name)
    cd.lens = lens
    cd.clip_end = 1000
    cam = bpy.data.objects.new(name, cd)
    C_CAMS.objects.link(cam)
    cam.location = loc
    cam.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    return cam

# ----------------------------------------------------------------------------
# BUILD
# ----------------------------------------------------------------------------
print("floor..."); build_floor()
print("barrier..."); build_barrier()
print("goals..."); build_goals()
print("stands..."); build_stands()
print("rim..."); build_rim()
print("roof..."); build_roof()
print("fans..."); NFANS = build_fans(); print("fans:", NFANS)
print("base..."); build_base()
print("collision..."); build_collision()
build_lighting()

for ob in bpy.data.objects:
    if ob.type == 'MESH' and not ob.name.startswith(("Fan_", "Lib_Fan")):
        ob.data.shade_flat()
C_LIB.hide_render = True
C_LIB.hide_viewport = True
for lc in bpy.context.view_layer.layer_collection.children[C_ROOT.name].children:
    if lc.collection is C_LIB:
        lc.exclude = True

ROOT["asset"] = "Kickdom Arena"
ROOT["units"] = "metres"
ROOT["pitch_size_m"] = f"{PITCH_L * 2:.0f} x {PITCH_W * 2:.0f}"
ROOT["red_goal"] = "+X"
ROOT["blue_goal"] = "-X"
ROOT["fans"] = NFANS

CAMS = {
    "hero_low":  camera("Cam_Hero", (-38, -46, 17), (12, 4, 4), lens=30),
    "overview":  camera("Cam_Overview", (-100, -125, 90), (0, 0, 12), lens=40),
    "topdown":   camera("Cam_TopDown", (0, -95, 112), (0, -3, 0), lens=45),
    "red_goal":  camera("Cam_RedGoal", (0, -16, 5), (24, 0, 2.5), lens=40),
    "crowd":     camera("Cam_Crowd", (12, -12, 4), (34, -30, 12), lens=35),
    "in_goal":   camera("Cam_InGoal", (-25.5, 0.4, 2.3), (10, 0, 5), lens=22),
}
scene.camera = CAMS["hero_low"]

tris = sum(sum(len(p.vertices) - 2 for p in ob.data.polygons) for ob in bpy.data.objects if ob.type == 'MESH' and ob.name[:4] != "Lib_")
print(f"objects={len(bpy.data.objects)} meshes={len(bpy.data.meshes)} tris(instanced total)={tris}")

# ----------------------------------------------------------------------------
# SAVE / EXPORT
# ----------------------------------------------------------------------------
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "KickdomArena.blend"), compress=True)
print("saved blend")

if not ARGS.no_export:
    def export(path, exclude=()):
        for c in exclude:
            c.hide_viewport = True
        bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', export_apply=True, export_yup=True,
                                  export_lights=True, export_cameras=False, export_extras=True, use_visible=True,
                                  export_animations=False, export_morph=False, export_skins=False)
        for c in exclude:
            c.hide_viewport = False
    export(os.path.join(OUT, "KickdomArena.glb"))
    export(os.path.join(OUT, "KickdomArena_NoFans.glb"), exclude=(C_FANS,))
    export(os.path.join(OUT, "KickdomArena_ArenaOnly.glb"), exclude=(C_FANS, C_SEATS, C_STANDS, C_RIM, C_ROOF, C_DRESS, C_BASE))
    # fan/seat variant library + placement table for engine-side instancing/animation
    import json
    with open(os.path.join(OUT, "fans_placement.json"), "w") as fh:
        json.dump({"units": "metres", "up": "Z (Blender) / Y (glTF)", "count": len(PLACEMENTS),
                   "note": "m = mesh name in KickdomFans_Library.glb; p = position (Blender Z-up); r = yaw radians about Z; s = uniform scale",
                   "fans": PLACEMENTS}, fh, separators=(",", ":"))
    lc = bpy.context.view_layer.layer_collection.children[C_ROOT.name].children[C_LIB.name]
    lc.exclude = False
    C_LIB.hide_viewport = False
    for o in bpy.data.objects:
        o.select_set(False)
    for o in C_LIB.objects:
        if o.name.startswith(("Lib_Fan_", "Lib_Seat_")):
            o.location = (0, 0, 0)
            o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, "KickdomFans_Library.glb"), export_format='GLB', export_apply=True,
                              export_yup=True, use_selection=True, export_lights=False, export_cameras=False,
                              export_animations=False, export_morph=False, export_skins=False)
    for o in C_LIB.objects:
        o.location = (0, 0, -60)
        o.select_set(False)
    lc.exclude = True
    C_LIB.hide_viewport = True
    bpy.ops.export_scene.fbx(filepath=os.path.join(OUT, "KickdomArena.fbx"), apply_scale_options='FBX_SCALE_ALL',
                             mesh_smooth_type='FACE', use_mesh_modifiers=True, object_types={'MESH', 'EMPTY', 'LIGHT'},
                             bake_anim=False, path_mode='COPY', embed_textures=False, use_visible=True)
    print("exported")

if not ARGS.no_render:
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = ARGS.samples
    scene.cycles.device = 'CPU'
    scene.cycles.use_denoising = True
    try:
        scene.cycles.denoiser = 'OPENIMAGEDENOISE'
    except Exception:
        pass
    scene.render.resolution_x = ARGS.res
    scene.render.resolution_y = int(ARGS.res * 9 / 16)
    scene.view_settings.view_transform = 'AgX'
    scene.view_settings.look = 'AgX - Medium High Contrast'
    scene.view_settings.exposure = 0.3
    wanted = [c for c in ARGS.cams.split(",") if c] or list(CAMS)
    if ARGS.hide_roof:
        C_ROOF.hide_render = True
        C_DRESS.hide_render = True
    for key in wanted:
        scene.camera = CAMS[key]
        scene.render.filepath = os.path.join(OUT, "previews", f"{key}{'_noroof' if ARGS.hide_roof else ''}.png")
        bpy.ops.render.render(write_still=True)
        print("rendered", key)
