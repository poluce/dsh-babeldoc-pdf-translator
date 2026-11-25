import json
import os
import sys

import pymupdf


def main() -> None:
    mono_path = sys.argv[1]
    out_dir = sys.argv[2]
    lang = sys.argv[3]
    numbers = [int(part) for part in sys.argv[4].split(",") if part.strip()]
    os.makedirs(out_dir, exist_ok=True)

    doc = pymupdf.open(mono_path)
    written = []
    for index, number in enumerate(numbers):
        if index >= doc.page_count:
            break
        single = pymupdf.open()
        single.insert_pdf(doc, from_page=index, to_page=index)
        target = os.path.join(out_dir, "p" + str(number) + "." + lang + ".pdf")
        single.save(target)
        single.close()
        written.append(number)
    doc.close()
    print(json.dumps({"written": written}))


if __name__ == "__main__":
    main()
