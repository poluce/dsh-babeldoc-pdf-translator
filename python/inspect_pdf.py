import json
import sys

import pymupdf


def main() -> None:
    path = sys.argv[1]
    want_text = len(sys.argv) > 2 and sys.argv[2] == "text"
    doc = pymupdf.open(path)
    pages = []
    for index in range(doc.page_count):
        page = doc[index]
        rect = page.rect
        item = {"w": round(rect.width, 1), "h": round(rect.height, 1)}
        if want_text:
            item["text"] = page.get_text("text")
        pages.append(item)
    print(json.dumps({"pages": doc.page_count, "dims": pages}, ensure_ascii=False))
    doc.close()


if __name__ == "__main__":
    main()
