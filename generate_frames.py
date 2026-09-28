import math
import os
from multiprocessing import Pool, cpu_count
from PIL import Image, ImageDraw, ImageFilter

def render_single_frame(args):
    frame_idx, total_frames, output_path = args
    t = (frame_idx - 1) / float(total_frames)
    
    # 2x supersampling for ultra-crisp antialiasing
    SCALE = 2
    W, H = 960 * SCALE, 540 * SCALE
    cx, cy = W // 2, H // 2
    
    # Base transparent canvas
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Glow layer for additive neon luminescence
    glow_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    
    # 1. Subtle Radial Cosmic Vignette & Dim Matrix Grid
    grid_size = 54 * SCALE
    for x in range(0, W, grid_size):
        dist_c = abs(x - cx) / cx
        alpha = int(max(2, 12 * (1 - dist_c * 0.85)))
        draw.line([(x, 0), (x, H)], fill=(130, 80, 230, alpha), width=1)
    for y in range(0, H, grid_size):
        dist_c = abs(y - cy) / cy
        alpha = int(max(2, 12 * (1 - dist_c * 0.85)))
        draw.line([(0, y), (W, y)], fill=(20, 180, 220, alpha), width=1)

    # Ambient radial purple/cyan glow in background center
    glow_rad = 340 * SCALE
    for gr in range(glow_rad, 20 * SCALE, -25 * SCALE):
        frac = 1.0 - (gr / glow_rad)
        ga = int(frac * frac * 28)
        glow_draw.ellipse([cx - gr, cy - gr, cx + gr, cy + gr], fill=(147, 51, 234, ga))

    # 2. 3D Isometric Projection Helper
    pitch_deg = 28 + math.sin(t * math.pi * 2) * 5
    yaw_deg = t * 360.0  # Full 360 degree smooth rotation across 60 frames
    pitch = math.radians(pitch_deg)
    yaw = math.radians(yaw_deg)
    
    def project(x, y, z):
        # Rotation around Y (yaw)
        xz = x * math.cos(yaw) + z * math.sin(yaw)
        yz = y
        zz = -x * math.sin(yaw) + z * math.cos(yaw)
        
        # Rotation around X (pitch)
        x2 = xz
        y2 = yz * math.cos(pitch) - zz * math.sin(pitch)
        z2 = yz * math.sin(pitch) + zz * math.cos(pitch)
        
        fov = 1100 * SCALE
        dist = fov + z2
        factor = fov / max(dist, 100)
        
        return (cx + x2 * factor, cy + y2 * factor, z2)

    # 3. Vertical Binary Code Cascades on left and right flanks
    binary_cols = 16
    for b in range(binary_cols):
        bx = int((b / binary_cols) * W)
        if abs(bx - cx) < 230 * SCALE:
            continue
            
        stream_speed = 2.5 + (b % 4) * 1.2
        stream_offset = (t * stream_speed + (b * 0.17)) % 1.0
        
        bits_count = 12
        for bit_i in range(bits_count):
            bit_y = int(((stream_offset + bit_i / bits_count) % 1.0) * H)
            val = "1" if (b * 7 + bit_i + frame_idx) % 3 == 0 else "0"
            fade = 1.0 - (bit_i / bits_count)
            b_alpha = int(fade * 120)
            color = (56, 189, 248, b_alpha) if b % 2 == 0 else (168, 85, 247, b_alpha)
            draw.text((bx, bit_y), val, fill=color)

    # 4. Concentric Holographic HUD Telemetry & Gyroscope Rings
    # Outer Degree Marker Ring
    r_outer = 295 * SCALE
    num_ticks = 48
    for i in range(num_ticks):
        angle = (i / num_ticks) * math.pi * 2 + math.radians(-yaw_deg * 0.4)
        p_in = project(math.cos(angle) * (r_outer - 7 * SCALE), 0, math.sin(angle) * (r_outer - 7 * SCALE))
        p_out = project(math.cos(angle) * (r_outer + 7 * SCALE), 0, math.sin(angle) * (r_outer + 7 * SCALE))
        tick_col = (56, 189, 248, 180) if i % 4 == 0 else (168, 85, 247, 60)
        draw.line([p_in[:2], p_out[:2]], fill=tick_col, width=1 * SCALE)

    # Segmented Cyan Data Bus Arc
    r_mid = 215 * SCALE
    for s in range(32):
        if s % 4 == 0: continue
        a1 = (s / 32) * math.pi * 2 + math.radians(yaw_deg * 0.6)
        a2 = ((s + 0.75) / 32) * math.pi * 2 + math.radians(yaw_deg * 0.6)
        pts = [project(math.cos(a1 + (a2 - a1) * (k / 8)) * r_mid, 0, math.sin(a1 + (a2 - a1) * (k / 8)) * r_mid)[:2] for k in range(9)]
        draw.line(pts, fill=(6, 182, 212, 150), width=2 * SCALE)

    # Neural Network Node Ring
    num_nodes = 12
    nodes_3d = []
    for n in range(num_nodes):
        node_ang = (n / num_nodes) * math.pi * 2 + math.radians(-yaw_deg * 1.0)
        n_proj = project(math.cos(node_ang) * 165 * SCALE, 0, math.sin(node_ang) * 165 * SCALE)
        nodes_3d.append(n_proj)

    for n in range(num_nodes):
        p1 = nodes_3d[n][:2]
        p2 = nodes_3d[(n + 1) % num_nodes][:2]
        p3 = nodes_3d[(n + 3) % num_nodes][:2]
        draw.line([p1, p2], fill=(168, 85, 247, 100), width=1 * SCALE)
        if n % 2 == 0:
            draw.line([p1, p3], fill=(236, 72, 153, 50), width=1 * SCALE)
            
        n_rad = 4 * SCALE
        draw.ellipse([p1[0] - n_rad, p1[1] - n_rad, p1[0] + n_rad, p1[1] + n_rad], fill=(52, 211, 153, 240))
        glow_draw.ellipse([p1[0] - n_rad * 3, p1[1] - n_rad * 3, p1[0] + n_rad * 3, p1[1] + n_rad * 3], fill=(52, 211, 153, 110))

    # 5. Circuit PCB Bus Traces (Gold & Violet)
    for bus_i in range(8):
        bus_ang = (bus_i / 8) * math.pi * 2 + (math.pi / 8)
        p_start = (cx + math.cos(bus_ang) * 110 * SCALE, cy + math.sin(bus_ang) * 60 * SCALE)
        p_corner = (p_start[0] + math.cos(bus_ang + 0.4) * 80 * SCALE, p_start[1] + math.sin(bus_ang + 0.4) * 80 * SCALE)
        p_end = (p_corner[0] + math.cos(bus_ang) * 110 * SCALE, p_corner[1] + math.sin(bus_ang) * 110 * SCALE)
        
        draw.line([p_start, p_corner, p_end], fill=(168, 85, 247, 45), width=2 * SCALE)
        draw.ellipse([p_end[0] - 3 * SCALE, p_end[1] - 3 * SCALE, p_end[0] + 3 * SCALE, p_end[1] + 3 * SCALE], fill=(245, 158, 11, 180))

        # Traveling Data Pulse along trace
        pulse_val = (t * 3 + bus_i * 0.25) % 1.0
        if pulse_val < 0.5:
            f_p = pulse_val / 0.5
            px = p_start[0] + (p_corner[0] - p_start[0]) * f_p
            py = p_start[1] + (p_corner[1] - p_start[1]) * f_p
        else:
            f_p = (pulse_val - 0.5) / 0.5
            px = p_corner[0] + (p_end[0] - p_corner[0]) * f_p
            py = p_corner[1] + (p_end[1] - p_corner[1]) * f_p
        draw.ellipse([px - 3 * SCALE, py - 3 * SCALE, px + 3 * SCALE, py + 3 * SCALE], fill=(236, 72, 153, 230))
        glow_draw.ellipse([px - 8 * SCALE, py - 8 * SCALE, px + 8 * SCALE, py + 8 * SCALE], fill=(236, 72, 153, 140))

    # 6. Central 3D AI Quantum Processor (Isometric Die & Tensor Grid)
    chip_w = 95 * SCALE
    chip_d = 95 * SCALE
    chip_h = 16 * SCALE
    
    sub_top = [
        project(-chip_w, -chip_h, -chip_d),
        project( chip_w, -chip_h, -chip_d),
        project( chip_w, -chip_h,  chip_d),
        project(-chip_w, -chip_h,  chip_d)
    ]
    sub_bot = [
        project(-chip_w, 0, -chip_d),
        project( chip_w, 0, -chip_d),
        project( chip_w, 0,  chip_d),
        project(-chip_w, 0,  chip_d)
    ]
    
    st_2d = [p[:2] for p in sub_top]
    sb_2d = [p[:2] for p in sub_bot]
    
    # Gold Pins around processor perimeter
    pins_per_side = 7
    for edge in range(4):
        p_a = sub_bot[edge]
        p_b = sub_bot[(edge + 1) % 4]
        for pin_i in range(1, pins_per_side):
            pf = pin_i / float(pins_per_side)
            base_x = p_a[0] + (p_b[0] - p_a[0]) * pf
            base_y = p_a[1] + (p_b[1] - p_a[1]) * pf
            norm_ang = yaw + (edge * math.pi / 2) + math.pi / 2
            pin_tip = (base_x + math.cos(norm_ang) * 12 * SCALE, base_y + math.sin(norm_ang) * 6 * SCALE)
            draw.line([(base_x, base_y), pin_tip], fill=(245, 158, 11, 200), width=2 * SCALE)

    # Substrate side walls
    for edge in range(4):
        p1 = st_2d[edge]
        p2 = st_2d[(edge + 1) % 4]
        p3 = sb_2d[(edge + 1) % 4]
        p4 = sb_2d[edge]
        side_shade = 20 + edge * 8
        draw.polygon([p1, p2, p3, p4], fill=(side_shade, side_shade - 5, side_shade + 15, 255))
        draw.line([p1, p2, p3, p4, p1], fill=(168, 85, 247, 160), width=1 * SCALE)

    # Silicon Top Die Surface
    draw.polygon(st_2d, fill=(13, 11, 24, 255))
    draw.line(st_2d + [st_2d[0]], fill=(56, 189, 248, 255), width=2 * SCALE)
    glow_draw.line(st_2d + [st_2d[0]], fill=(56, 189, 248, 160), width=6 * SCALE)

    # Tensor matrix core grid
    tensor_cores = 3
    for tx in range(tensor_cores):
        for ty in range(tensor_cores):
            fx1 = (tx + 0.15) / tensor_cores
            fx2 = (tx + 0.85) / tensor_cores
            fy1 = (ty + 0.15) / tensor_cores
            fy2 = (ty + 0.85) / tensor_cores
            
            def uv_to_xy(u, v):
                top_edge_x = st_2d[0][0] + (st_2d[1][0] - st_2d[0][0]) * u
                top_edge_y = st_2d[0][1] + (st_2d[1][1] - st_2d[0][1]) * u
                bot_edge_x = st_2d[3][0] + (st_2d[2][0] - st_2d[3][0]) * u
                bot_edge_y = st_2d[3][1] + (st_2d[2][1] - st_2d[3][1]) * u
                return (top_edge_x + (bot_edge_x - top_edge_x) * v, top_edge_y + (bot_edge_y - top_edge_y) * v)
                
            block_pts = [uv_to_xy(fx1, fy1), uv_to_xy(fx2, fy1), uv_to_xy(fx2, fy2), uv_to_xy(fx1, fy2)]
            block_fill = (26, 18, 48, 255) if (tx + ty) % 2 == 0 else (18, 28, 48, 255)
            draw.polygon(block_pts, fill=block_fill)
            draw.line(block_pts + [block_pts[0]], fill=(168, 85, 247, 120), width=1 * SCALE)

    # 7. Holographic Pulsing AI Core Sphere
    core_h = -chip_h - 28 * SCALE + math.sin(t * math.pi * 4) * 6 * SCALE
    core_pt = project(0, core_h, 0)
    c_x, c_y = core_pt[0], core_pt[1]
    
    pulse_size = (18 + math.sin(t * math.pi * 6) * 3) * SCALE
    glow_draw.ellipse([c_x - pulse_size * 4, c_y - pulse_size * 4, c_x + pulse_size * 4, c_y + pulse_size * 4], fill=(168, 85, 247, 70))
    glow_draw.ellipse([c_x - pulse_size * 2.5, c_y - pulse_size * 2.5, c_x + pulse_size * 2.5, c_y + pulse_size * 2.5], fill=(236, 72, 153, 140))
    glow_draw.ellipse([c_x - pulse_size * 1.5, c_y - pulse_size * 1.5, c_x + pulse_size * 1.5, c_y + pulse_size * 1.5], fill=(56, 189, 248, 200))
    draw.ellipse([c_x - pulse_size, c_y - pulse_size, c_x + pulse_size, c_y + pulse_size], fill=(255, 255, 255, 255))

    # 8. Floating Holographic Coding, AI & IT Badges
    badges = [
        ("{ ...AI.Core }", 185 * SCALE, 0.0),
        ("tensor.backward()", 235 * SCALE, 0.2),
        ("<NeuralLayer />", 215 * SCALE, 0.4),
        ("async/await", 245 * SCALE, 0.6),
        ("0x7F_KERNEL", 195 * SCALE, 0.8),
        ("git::deploy()", 225 * SCALE, 0.1),
        ("REST_API 200_OK", 255 * SCALE, 0.35),
        ("Docker::Container", 205 * SCALE, 0.75)
    ]
    
    for text_val, radius, phase in badges:
        b_angle = ((t + phase) * math.pi * 2) % (math.pi * 2)
        b_proj = project(math.cos(b_angle) * radius, -42 * SCALE + math.sin(b_angle * 2) * 15 * SCALE, math.sin(b_angle) * radius)
        bx, by, bz = b_proj
        
        depth_norm = (bz + 300 * SCALE) / (600 * SCALE)
        b_alpha = int(max(40, min(240, 60 + depth_norm * 180)))
        
        padding_x = 8 * SCALE
        box_w = len(text_val) * 7.2 * SCALE + padding_x * 2
        box_h = 16 * SCALE
        
        draw.rectangle([bx - padding_x, by - 2 * SCALE, bx + box_w - padding_x, by + box_h], fill=(12, 10, 22, int(b_alpha * 0.75)), outline=(56, 189, 248, int(b_alpha * 0.85)), width=1 * SCALE)
        draw.text((bx, by), text_val, fill=(224, 231, 255, b_alpha))

    # 9. Blend Luminescence & Downscale to 960x540
    glow_blurred = glow_img.filter(ImageFilter.GaussianBlur(radius=8 * SCALE))
    img = Image.alpha_composite(img, glow_blurred)
    
    final_img = img.resize((960, 540), Image.Resampling.LANCZOS)
    final_img.save(output_path, "PNG", optimize=True)

def generate_all_frames():
    output_dir = "assets/frames"
    os.makedirs(output_dir, exist_ok=True)
    total_frames = 60
    
    tasks = []
    for i in range(1, total_frames + 1):
        pad = str(i).zfill(3)
        out_file = os.path.join(output_dir, f"frame-{pad}.png")
        tasks.append((i, total_frames, out_file))
        
    print(f"Generating {total_frames} frames using {cpu_count()} CPU cores...")
    with Pool(processes=max(1, cpu_count() - 1)) as pool:
        pool.map(render_single_frame, tasks)
    print("All 60 frames generated successfully!")

if __name__ == "__main__":
    generate_all_frames()
