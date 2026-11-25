import json
import sys

import pymupdf


def main() -> None:
    path = sys.argv[1]
    doc = pymupdf.open(path)
    items = []
    for row in doc.get_toc() or []:
        if len(row) < 3:
            continue
        title = str(row[1] or "").strip()
        page = int(row[2] or 0)
        if not title or page < 1:
            continue
        items.append({"level": max(1, int(row[0] or 1)), "title": title, "page": page})
    print(json.dumps({"outline": items}, ensure_ascii=False))
    doc.close()


if __name__ == "__main__":
    main()
