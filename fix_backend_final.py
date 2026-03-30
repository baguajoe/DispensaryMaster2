#!/usr/bin/env python3
"""
Run this from /workspaces/DispensaryMaster2:
  python3 fix_backend_final.py
"""
import re, ast, sys

with open('src/api/routes.py', 'r') as f:
    content = f.read()

# Find ALL route URLs and detect true URL conflicts
# Flask fails when same URL + same HTTP methods are registered twice under different function names
all_routes = list(re.finditer(r"@api\.route\('([^']+)'([^)]*)\)\s*\n(?:@[^\n]+\n)*def (\w+)", content))

print(f"Total routes found: {len(all_routes)}")

# Build URL+methods -> [func_names, positions]
url_map = {}
for m in all_routes:
    url = m.group(1)
    methods_str = m.group(2)
    func = m.group(3)
    # Extract methods list
    methods_match = re.search(r"methods=\[([^\]]+)\]", methods_str)
    if methods_match:
        methods = frozenset(x.strip().strip("'\"") for x in methods_match.group(1).split(","))
    else:
        methods = frozenset(["GET"])
    
    key = (url, methods)
    if key not in url_map:
        url_map[key] = []
    url_map[key].append((func, m.start()))

# Find conflicts
conflicts = {k: v for k, v in url_map.items() if len(v) > 1}
print(f"URL+method conflicts: {len(conflicts)}")
for (url, methods), funcs in list(conflicts.items())[:10]:
    print(f"  {url} {set(methods)}: {[f for f, _ in funcs]}")

# Remove second+ occurrences by position (working backwards)
positions_to_remove = []
for (url, methods), funcs in conflicts.items():
    for func_name, pos in funcs[1:]:  # Keep first, remove rest
        # Find the @api.route decorator start
        route_start = content.rfind('\n@api.route', 0, pos)
        if route_start == -1:
            route_start = content.rfind('@api.route', 0, pos)
        else:
            route_start += 1  # skip the \n
        
        # Find the end of this function
        end_match = re.search(r'\n(?=@api\.route|@pos_bp\.route|# ={3,})', content[pos:])
        if end_match:
            func_end = pos + end_match.start()
        else:
            func_end = len(content)
        
        positions_to_remove.append((route_start, func_end, func_name))
        print(f"  Will remove: {func_name} at char {route_start}")

# Sort by position descending to remove from end first
positions_to_remove.sort(key=lambda x: x[0], reverse=True)

for start, end, func_name in positions_to_remove:
    print(f"Removing {func_name} ({end-start} chars)")
    content = content[:start] + content[end:]

# Verify syntax
try:
    ast.parse(content)
    routes = len(re.findall(r'@api\.route\(', content))
    print(f"\n✓ Syntax valid — {routes} routes remaining")
    with open('src/api/routes.py', 'w') as f:
        f.write(content)
    print("✓ Saved routes.py")
except SyntaxError as e:
    print(f"✗ SyntaxError at line {e.lineno}: {e.msg}")
    sys.exit(1)
