import json
import sys

import pymupdf


def main() -> None:
    path = sys.argv[1]
    index = max(0, int(sys.argv[2]))
    out = sys.argv[3]
    target_width = max(160, int(sys.argv[4])) if len(sys.argv) > 4 else 1200

    doc = pymupdf.open(path)
    index = min(index, doc.page_count - 1)
    page = doc[index]
    rect = page.rect
    zoom = target_width / rect.width if rect.width > 0 else 2.0
    pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
    pix.save(out)
    print(json.dumps({"width": pix.width, "height": pix.height, "pages": doc.page_count}))
    doc.close()


if __name__ == "__main__":
    main()
