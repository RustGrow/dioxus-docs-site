import os, re

def check_ru_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    blocks = re.findall(r'```rust\n(.*?)\n```', content, re.DOTALL)
    issues = []
    for block in blocks:
        for line in block.split('\n'):
            stripped = line.strip()
            if not stripped or stripped.startswith('//') or stripped.startswith('/*'):
                continue
            # Look for lines with significant Russian text (more than 5 Cyrillic chars)
            if len(re.findall(r'[а-яА-Я]', stripped)) >= 5:
                # Skip common code patterns
                code_prefixes = [
                    'let ', 'fn ', 'use ', 'struct ', 'enum ', 'impl ', 'mod ', 'pub ',
                    'if ', 'for ', 'while ', 'match ', 'return ', 'rsx!', 'static ', 'const ',
                    'type ', 'async ', 'await', 'move ', 'spawn', 'tokio::', 'reqwest::',
                    'serde::', 'axum::', 'dioxus::', 'cargo ', 'println!', 'log!'
                ]
                if any(stripped.startswith(p) for p in code_prefixes):
                    continue
                if stripped.startswith('#[') or stripped.startswith('#'):
                    continue
                if stripped.startswith('"') or stripped.startswith('\"'):
                    continue
                if stripped.startswith('.') or stripped.startswith('(') or stripped.startswith(')'):
                    continue
                if stripped.startswith(',') or stripped.startswith(';') or stripped.startswith('->'):
                    continue
                if stripped.startswith('=>') or stripped.startswith('|') or stripped.startswith('!'):
                    continue
                if re.search(r'^<[a-z]|^</[a-z]', stripped):
                    continue
                if re.match(r'^\d', stripped):
                    continue
                if re.match(r'^[a-zA-Z_]\w*\.', stripped):
                    continue
                if '=' in stripped and not stripped.startswith('//'):
                    continue
                if '?' in stripped and not stripped.startswith('//'):
                    continue
                # Skip if mostly code symbols
                code_symbols = set('(){}[];:!@#$%^&*|+-=<>/\\')
                symbol_count = sum(1 for c in stripped if c in code_symbols)
                if symbol_count > 2:
                    # But allow if clearly a Russian sentence
                    words = stripped.split()
                    cyrillic_words = [w for w in words if re.search(r'[а-яА-Я]', w)]
                    if len(cyrillic_words) < 2:
                        continue
                issues.append(stripped)
    return issues

output = []
files_checked = 0
files_with_issues = 0
total_issues = 0
base = r'D:\dioxus\docs\starlight\src\content\docs\ru'
for root, dirs, files in os.walk(base):
    for fname in files:
        if fname.endswith('.md'):
            path = os.path.join(root, fname)
            issues = check_ru_file(path)
            if issues:
                files_with_issues += 1
                total_issues += len(issues)
                rel_path = os.path.relpath(path, base)
                output.append(f'FILE: {rel_path}')
                for issue in issues[:20]:
                    output.append(f'  ISSUE: {issue}')
                if len(issues) > 20:
                    output.append(f'  ... and {len(issues)-20} more')
            files_checked += 1

output.append(f'\nSUMMARY: Checked {files_checked} files, {files_with_issues} files with issues, {total_issues} total issues')

with open(r'D:\dioxus\docs\starlight\ru_issues_v2.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

print('Done! Check ru_issues_v2.txt')
