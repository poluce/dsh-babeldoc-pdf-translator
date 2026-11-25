import pymupdf, sys, re, json, os

orig_path = sys.argv[1]
trans_path = sys.argv[2]
page_idx = int(sys.argv[3])
out_path = sys.argv[4] if len(sys.argv) > 4 else trans_path

NUM_RE = re.compile("^[.]?[0-9]{1,4}$")
NUM_PREF_RE = re.compile("^[0-9]+([.][0-9]+)*[.][ \t\n\r]*")
ZW = "".join(chr(c) for c in (0x2060, 0x200b, 0x200d, 0xfeff, 0x2009))
ZERO_W = re.compile("[" + ZW + "]")

odoc = pymupdf.open(orig_path)
op = odoc[page_idx]

rows = []
d = op.get_text("dict")
for b in d["blocks"]:
    for l in b.get("lines", []):
        spans = l["spans"]
        t = "".join(s["text"] for s in spans)
        if not t.strip():
            continue
        y = (l["bbox"][1] + l["bbox"][3]) / 2
        x_ref = max(s["bbox"][2] for s in spans)
        clean = ZERO_W.sub("", t.strip())
        if re.fullmatch("[0-9]{1,4}", clean):
            continue
        m = re.search("([0-9]{1,4})$", clean)
        num = m.group(1) if m else None
        pm = NUM_PREF_RE.match(clean)
        pref = pm.group(0).strip().rstrip(".") if pm else None
        rows.append({"y": y, "text": clean, "num": num, "x_ref": x_ref, "pref": pref,
                     "size": max(s["size"] for s in spans),
                     "x0": min(s["bbox"][0] for s in spans)})

tdoc = pymupdf.open(trans_path)
tp = tdoc[0]
tspans = []
dt = tp.get_text("dict")
for b in dt["blocks"]:
    for l in b.get("lines", []):
        for s in l["spans"]:
            txt = s["text"]
            if not txt.strip():
                continue
            x0, y0, x1, y1 = s["bbox"]
            tspans.append({"bbox": s["bbox"], "text": txt, "yc": (y0 + y1) / 2, "x1": x1,
                           "size": s["size"], "font": s["font"]})

tspans.sort(key=lambda s: (s["yc"], s["x1"]))
tlines = []
for s in tspans:
    if tlines and abs(s["yc"] - tlines[-1]["yc"]) < 8:
        tlines[-1]["spans"].append(s)
        tlines[-1]["yc"] = (tlines[-1]["yc"] + s["yc"]) / 2
    else:
        tlines.append({"yc": s["yc"], "spans": [s]})
for tl in tlines:
    tl["spans"].sort(key=lambda s: s["x1"])
    tl["text"] = "".join(s["text"] for s in tl["spans"])


def tpref(txt):
    pm = NUM_PREF_RE.match(txt)
    return pm.group(0).strip().rstrip(".") if pm else None


used_t = set()
paired_rows = set()
pairs = []
for r in rows:
    if r["num"] is None:
        continue
    if r["pref"]:
        best = None
        for i, tl in enumerate(tlines):
            if i in used_t:
                continue
            if tpref(tl["text"]) == r["pref"]:
                best = i
                break
        if best is not None:
            used_t.add(best)
            pairs.append((r, tlines[best]))
            continue
    best = None
    best_d = 1e9
    for i, tl in enumerate(tlines):
        if i in used_t:
            continue
        dd = abs(tl["yc"] - r["y"])
        if dd < best_d:
            best_d = dd
            best = i
    if best is not None and best_d < 30:
        used_t.add(best)
        pairs.append((r, tlines[best]))
    paired_rows.add(id(r))

remaining_rows = [r for r in rows if r["num"] is not None and id(r) not in paired_rows]
remaining_tl = [(i, tl) for i, tl in enumerate(tlines) if i not in used_t]
remaining_rows.sort(key=lambda r: r["y"])
remaining_tl.sort(key=lambda item: item[1]["yc"])
for r, (i, tl) in zip(remaining_rows, remaining_tl):
    if abs(tl["yc"] - r["y"]) < 40:
        used_t.add(i)
        pairs.append((r, tl))


def is_numfrag(s):
    t = s["text"].strip()
    return bool(NUM_RE.match(t)) or t == "."


def is_numpref(s):
    return bool(re.match("^[0-9]+([.][0-9]+)*[.][ \t\n\r]*$", s["text"]))


def num_tail_cover(s):
    m = re.search("([.]?[0-9]{1,4})$", s["text"].strip())
    if not m:
        return None
    tail = m.group(1)
    w = len(tail) * s["size"] * 0.55
    x0, y0, x1, y1 = s["bbox"]
    return ((x1 - w, y0, x1, y1), w)


fixed = 0
for r, tl in pairs:
    yc = tl["yc"]
    frags = list(tl["spans"])
    tl_idx = tlines.index(tl)
    i = tl_idx - 1
    while i >= 0 and tl["yc"] - tlines[i]["yc"] < 24:
        if tpref(tlines[i]["text"]) is not None:
            break
        for s in tlines[i]["spans"]:
            frags.append(s)
        i -= 1
    i = tl_idx + 1
    while i < len(tlines) and tlines[i]["yc"] - tl["yc"] < 24:
        if tpref(tlines[i]["text"]) is not None:
            break
        for s in tlines[i]["spans"]:
            frags.append(s)
        i += 1

    best_by_text = {}
    for s in frags:
        key = s["text"].strip()
        if key and (key not in best_by_text or s["size"] > best_by_text[key]["size"]):
            best_by_text[key] = s
    covers = []
    for s in frags:
        key = s["text"].strip()
        if key and best_by_text.get(key) is not s:
            covers.append(s["bbox"])

    nonnum = []
    tailfrags = []
    pref_tex = None
    for s in frags:
        key = s["text"].strip()
        if key and best_by_text.get(key) is not s:
            continue
        if is_numfrag(s):
            covers.append(s["bbox"])
            continue
        res = num_tail_cover(s)
        if res is not None:
            rect, w = res
            covers.append(rect)
            tailfrags.append((s, w))
            continue
        if is_numpref(s):
            if "TeXGyrePagella" in s["font"]:
                pref_tex = s
                covers.append(s["bbox"])
            else:
                nonnum.append(s)
            continue
        if "TeXGyrePagella" in s["font"] and re.match("^[A-Za-z]{1,3}$", key):
            covers.append(s["bbox"])
            continue
        nonnum.append(s)
    for bbox in covers:
        tp.draw_rect(bbox, color=(1, 1, 1), fill=(1, 1, 1))
    size = r["size"] or 9
    width = size * 0.55 * len(r["num"])
    x_num = r["x_ref"] - width - 2
    tp.insert_text((x_num, yc + size * 0.35), r["num"], fontsize=size, fontname="helv",
                   color=(0, 0, 0))
    if pref_tex is not None:
        body_kept = [s for s in nonnum if not is_numpref(s)]
        main_y0 = min(s["bbox"][1] for s in body_kept) if body_kept else (tl["yc"] - 5.5)
        px = r.get("x0", pref_tex["bbox"][0])
        tp.insert_text((px, main_y0 + pref_tex["size"] * 0.85), pref_tex["text"],
                       fontsize=pref_tex["size"], fontname="helv", color=(0, 0, 0))
    if nonnum or tailfrags:
        x_start = max(s["x1"] for s in nonnum) + 6 if nonnum else 0
        for s, w in tailfrags:
            x_start = max(x_start, s["x1"] - w + 6)
        if pref_tex is not None:
            x_start = max(x_start, pref_tex["bbox"][0] + pref_tex["size"] * 0.55 * len(pref_tex["text"]) + 6)
        x_end = x_num - 6
        if x_end > x_start:
            x = x_start
            while x < x_end:
                tp.draw_circle((x, yc), 0.7, color=(0.2, 0.2, 0.2), fill=(0.2, 0.2, 0.2))
                x += 9
    fixed += 1

if out_path == trans_path:
    tmp = trans_path + ".fixtmp.pdf"
    tdoc.save(tmp, garbage=3, deflate=True)
    tdoc.close()
    odoc.close()
    os.replace(tmp, trans_path)
else:
    tdoc.save(out_path, garbage=3, deflate=True)
    tdoc.close()
    odoc.close()

print(json.dumps({"fixed": fixed, "orig_rows": len(rows), "pairs": len(pairs)}))
