import json
import os
import sys
import tempfile

import pymupdf


def main() -> None:
    original = sys.argv[1]
    pages_dir = sys.argv[2]
    lang = sys.argv[3]
    out = sys.argv[4]

    source = pymupdf.open(original)
    result = pymupdf.open()
    translated = 0
    for index in range(1, source.page_count + 1):
        page_path = os.path.join(pages_dir, "p" + str(index) + "." + lang + ".pdf")
        inserted = False
        if os.path.exists(page_path):
            try:
                page_doc = pymupdf.open(page_path)
                if page_doc.page_count >= 1:
                    result.insert_pdf(page_doc, from_page=0, to_page=0)
                    translated += 1
                    inserted = True
                page_doc.close()
            except Exception:
                inserted = False
        if not inserted:
            result.insert_pdf(source, from_page=index - 1, to_page=index - 1)

    directory = os.path.dirname(os.path.abspath(out))
    os.makedirs(directory, exist_ok=True)
    handle, temp_path = tempfile.mkstemp(suffix=".tmp", dir=directory)
    os.close(handle)
    result.save(temp_path, garbage=3, deflate=True)
    result.close()
    source.close()
    os.replace(temp_path, out)
    print(json.dumps({"translated": translated}))


if __name__ == "__main__":
    main()
