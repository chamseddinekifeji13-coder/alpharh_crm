import os
import re

FILES = [
    "src/pages/crm/CrmContacts.tsx",
    "src/pages/crm/CrmEntreprises.tsx",
    "src/pages/crm/CrmInteractions.tsx",
    "src/pages/crm/CrmOpportunites.tsx",
    "src/components/Sidebar.tsx"
]

REPLACEMENTS = [
    (
        r"style=\{\{ maxWidth: '1100px', margin: '0 auto' \}\}",
        "className=\"crm-container-1100\""
    ),
    (
        r"style=\{\{ maxWidth: '1400px', margin: '0 auto' \}\}",
        "className=\"crm-container-1400\""
    ),
    (
        r"style=\{\{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' \}\}",
        "className=\"crm-page-header-lg\""
    ),
    (
        r"style=\{\{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1\.5rem' \}\}",
        "className=\"crm-page-header\""
    ),
    (
        r"style=\{\{ fontSize: '1\.875rem', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '0\.75rem' \}\}",
        "className=\"crm-page-title\""
    ),
    (
        r"style=\{\{ color: '#64748b', marginTop: '0\.25rem' \}\}",
        "className=\"crm-page-subtitle\""
    ),
    (
        r"style=\{\{ background: 'white', borderRadius: '0\.75rem', padding: '1\.25rem 1\.5rem', marginBottom: '1\.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', boxShadow: '0 1px 3px rgba\(0,0,0,0\.06\)' \}\}",
        "className=\"crm-filter-bar\""
    ),
    (
        r"style=\{\{ background: 'white', borderRadius: '0\.75rem', padding: '1\.25rem', boxShadow: '0 1px 3px rgba\(0,0,0,0\.06\)', border: '1px solid #f1f5f9' \}\}",
        "className=\"crm-card\""
    ),
    (
        r"style=\{\{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0\.875rem' \}\}",
        "className=\"crm-card-header\""
    ),
    (
        r"style=\{\{ display: 'flex', alignItems: 'center', gap: '0\.875rem' \}\}",
        "className=\"crm-card-title-group\""
    ),
    (
        r"style=\{\{ display: 'flex', gap: '0\.25rem' \}\}",
        "className=\"crm-card-actions\""
    ),
    (
        r"style=\{\{ display: 'grid', gridTemplateColumns: 'repeat\(auto-fill, minmax\(300px, 1fr\)\)', gap: '1rem' \}\}",
        "className=\"crm-grid-cards\""
    ),
    (
        r"style=\{\{ padding: '0\.35rem', borderRadius: '0\.35rem', cursor: 'pointer', color: '#64748b', background: '#f8fafc', border: 'none' \}\}",
        "className=\"crm-btn-icon\""
    ),
    (
        r"style=\{\{ padding: '0\.35rem', borderRadius: '0\.35rem', cursor: 'pointer', color: '#ef4444', background: '#fef2f2', border: 'none' \}\}",
        "className=\"crm-btn-danger\""
    ),
    (
        r"style=\{\{ position: 'fixed', inset: 0, background: 'rgba\(0,0,0,0\.5\)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' \}\}",
        "className=\"crm-modal-overlay\""
    ),
    (
        r"style=\{\{ position: 'fixed', inset: 0, background: 'rgba\(0,0,0,0\.55\)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' \}\}",
        "className=\"crm-modal-overlay-dark\""
    ),
    (
        r"style=\{\{ background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflow: 'auto' \}\}",
        "className=\"crm-modal-content-lg\""
    ),
    (
        r"style=\{\{ padding: '1\.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' \}\}",
        "className=\"crm-modal-header\""
    ),
    (
        r"style=\{\{ padding: '1\.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' \}\}",
        "className=\"crm-modal-body-grid\""
    ),
    (
        r"style=\{\{ padding: '1rem 2rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0\.75rem', justifyContent: 'flex-end' \}\}",
        "className=\"crm-modal-footer\""
    ),
    (
        r"style=\{\{ margin: 0, fontSize: '1\.25rem', color: '#1e293b' \}\}",
        "className=\"crm-modal-title\""
    ),
    (
        r"style=\{\{ gridColumn: '1/-1' \}\}",
        "className=\"crm-col-span-full\""
    )
]

for filepath in FILES:
    if not os.path.exists(filepath): continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    for pattern, repl in REPLACEMENTS:
        # Some are adjacent to existing className, e.g. className="form-group" style={{...}}
        # Let's just do a naive replace first
        content = re.sub(pattern, repl, content)
    
    # Merge double classNames: className="form-group" className="crm-col-span-full" -> className="form-group crm-col-span-full"
    content = re.sub(r'className="([^"]+)"\s+className="([^"]+)"', r'className="\1 \2"', content)
    
    if orig != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated " + filepath)
