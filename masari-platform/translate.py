import re
from googletrans import Translator
import time
import os

def chunk_list(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

def main():
    file_path = 'src/data/jobs300.js'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all titles and descriptions
    titles = re.findall(r"title:\s*'(.*?)'", content)
    descs = re.findall(r"description:\s*'(.*?)'", content)
    
    if len(titles) == 0:
        print("No titles found.")
        return

    print(f"Translating {len(titles)} titles and {len(descs)} descriptions...")
    translator = Translator()
    
    ar_titles = []
    ar_descs = []
    
    try:
        # bulk translate titles
        for chunk in chunk_list(titles, 30):
            text = '\n<SEP>\n'.join(chunk)
            result = translator.translate(text, src='en', dest='ar')
            # It might translate <SEP> to Arabic characters if we aren't careful. 
            parts = result.text.split('<SEP>')
            if len(parts) == 1:
                # Fallback to translate items one by one 
                for item in chunk:
                    res = translator.translate(item, src='en', dest='ar')
                    ar_titles.append(res.text.strip())
            else:
                ar_titles.extend([t.strip() for t in parts])
            time.sleep(0.5)
            
        # bulk translate descriptions
        for chunk in chunk_list(descs, 30):
            text = '\n<SEP>\n'.join(chunk)
            result = translator.translate(text, src='en', dest='ar')
            parts = result.text.split('<SEP>')
            if len(parts) == 1:
                # Fallback
                for item in chunk:
                    res = translator.translate(item, src='en', dest='ar')
                    ar_descs.append(res.text.strip())
            else:
                ar_descs.extend([t.strip() for t in parts])
            time.sleep(0.5)
            
    except Exception as e:
        print(f"Translation failed: {e}")
        return

    # To ensure safety on splitting mismatch due to translating <SEP>
    if len(titles) != len(ar_titles) or len(descs) != len(ar_descs):
        print(f"Mismatch in translations length: {len(titles)} vs {len(ar_titles)}")
        print("Using item-by-item translation instead...")
        ar_titles = []
        ar_descs = []
        for t in titles:
            ar_titles.append(translator.translate(t, src='en', dest='ar').text)
            time.sleep(0.1)
        for d in descs:
            ar_descs.append(translator.translate(d, src='en', dest='ar').text)
            time.sleep(0.1)

    # Use iterator for replacement to handle duplicate items properly
    title_iter = iter(ar_titles)
    desc_iter = iter(ar_descs)

    def title_repl(match):
        t = match.group(1)
        try:
            ar_t = next(title_iter).replace("'", "\\'")
        except StopIteration:
            ar_t = t
        return f"title: '{t}', arTitle: '{ar_t}'"

    def desc_repl(match):
        d = match.group(1)
        try:
            ar_d = next(desc_iter).replace("'", "\\'")
        except StopIteration:
            ar_d = d
        return f"description: '{d}', arDescription: '{ar_d}'"

    content = re.sub(r"title:\s*'(.*?)'", title_repl, content)
    content = re.sub(r"description:\s*'(.*?)'", desc_repl, content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success: translations added to jobs300.js")

if __name__ == "__main__":
    main()
