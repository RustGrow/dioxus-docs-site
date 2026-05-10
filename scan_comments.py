import os, re

def check_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    blocks = re.findall(r'```rust\n(.*?)\n```', content, re.DOTALL)
    issues = []
    for block in blocks:
        for line in block.split('\n'):
            stripped = line.strip()
            if not stripped or stripped.startswith('//') or stripped.startswith('/*'):
                continue
            # Must look like a sentence: starts with capital letter, contains at least 3 words, mostly letters/spaces
            words = stripped.split()
            if len(words) < 3:
                continue
            if not re.match(r'^[A-ZА-Я]', stripped):
                continue
            # Check for code punctuation - if it contains these, it's likely code
            code_chars = set('{}();=-><[].,"\'!#@$%^&*|+?~`')
            if any(c in code_chars for c in stripped):
                continue
            # Must be mostly letters and spaces
            if not re.match(r'^[A-Za-zА-Яа-я\s\-\(\)]+$', stripped):
                continue
            issues.append(stripped)
    return issues

files_checked = 0
files_with_issues = 0
total_issues = 0
base = r'D:\dioxus\docs\starlight\src\content\docs'
for root, dirs, files in os.walk(base):
    for fname in files:
        if fname.endswith('.md'):
            path = os.path.join(root, fname)
            issues = check_file(path)
            if issues:
                files_with_issues += 1
                total_issues += len(issues)
                rel_path = os.path.relpath(path, base)
                print(f'FILE: {rel_path}')
                for issue in issues[:10]:
                    print(f'  LINE: {issue}')
                if len(issues) > 10:
                    print(f'  ... and {len(issues)-10} more')
            files_checked += 1

print(f'\nSUMMARY: Checked {files_checked} files, {files_with_issues} files with potential issues, {total_issues} total potential issues')
