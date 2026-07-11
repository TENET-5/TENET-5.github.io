import os
import glob

acts = glob.glob('act-ii.html') + glob.glob('act-iii.html') + glob.glob('act-iv.html') + glob.glob('act-v.html')
for act in acts:
    with open(act, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace literal backtick-r-backtick-n with empty string or space
    content = content.replace("`r`n", "")
    
    with open(act, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Fixed {act}")
