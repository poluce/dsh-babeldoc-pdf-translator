import json
import sys

import pymupdf


def main() -> None:
    path = sys.argv[1]
    doc = pymupdf.open(path)
    found = []
    for index in range(doc.page_count):
        data = doc[index].get_text("dict")
        score = 0
        lines = 0
        width = doc[index].rect.width
        for block in data["blocks"]:
            for line in block.get("lines", []):
                lines += 1
                spans = line["spans"]
                text = "".join(span["text"] for span in spans)
                if text.count(".") >= 8:
                    score += 1
                    continue
                if spans:
                    last = spans[-1]
                    tail = last["text"].strip()
                    if tail.isdigit() and len(tail) <= 4 and last["bbox"][2] > width - 60:
                        head = text[:24]
                        if head[:1].isdigit() or head.startswith("Chapter ") or head.startswith("Appendix "):
                            score += 1
        if lines >= 5 and score >= 3:
            found.append(index + 1)
    doc.close()
    print(json.dumps({"toc": found}))


if __name__ == "__main__":
    main()
