import json
import sys

import pymupdf


def main() -> None:
    path = sys.argv[1]
    spec = sys.argv[2] if len(sys.argv) > 2 else "all"
    budget = int(sys.argv[3]) if len(sys.argv) > 3 else 4000

    doc = pymupdf.open(path)
    count = doc.page_count
    if spec == "all":
        numbers = list(range(1, count + 1))
    else:
        numbers = [int(part) for part in spec.split(",") if part.strip()]

    texts = {}
    for number in numbers:
        if number < 1 or number > count:
            continue
        text = doc[number - 1].get_text("text")
        texts[str(number)] = text[:budget]
    doc.close()
    print(json.dumps({"texts": texts}, ensure_ascii=False))


if __name__ == "__main__":
    main()
