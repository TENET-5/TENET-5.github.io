from playwright.sync_api import sync_playwright
import time, json

time.sleep(2)
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    errors = []
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda err: errors.append(str(err)))
    page.goto("http://localhost:8773/red-duster-game.html", wait_until="networkidle", timeout=30000)

    checks = {}
    checks["three_js"] = page.evaluate('typeof THREE !== "undefined"')
    checks["buildWeaponModel"] = page.evaluate('typeof buildWeaponModel === "function"')
    checks["buildSoldier"] = page.evaluate('typeof buildSoldier === "function"')
    checks["weapon_group"] = page.evaluate('weapon.isGroup === true')
    checks["muzzle_flash"] = page.evaluate('typeof muzzleFlash !== "undefined"')
    checks["capture_zones"] = page.evaluate('Array.isArray(STATE.captureZones) && STATE.captureZones.length === 3')
    checks["sprint"] = page.evaluate('typeof STATE.sprint === "number"')
    checks["damage_numbers"] = page.evaluate('Array.isArray(STATE.damageNumbers)')
    checks["hit_marker"] = page.evaluate('document.getElementById("hitMarker") !== null')
    checks["crosshair"] = page.evaluate('document.getElementById("crosshair").children.length >= 4')
    checks["soldier_ok"] = page.evaluate('(function(){try{return buildSoldier("grunt").children.length>15}catch(e){return false}})()')
    checks["heavy_ok"] = page.evaluate('(function(){try{return buildSoldier("heavy").children.length>15}catch(e){return false}})()')
    
    passed = sum(1 for v in checks.values() if v)
    total = len(checks)
    print(f"=== Health Check (post Phase 68) ===")
    for k, v in checks.items():
        print(f"  [{'PASS' if v else 'FAIL'}] {k}")
    print(f"\nJS Errors: {len(errors)}")
    for e in errors[:10]:
        print(f"  ERR: {e[:200]}")
    print(f"\n=== {passed}/{total} {'ALL GREEN' if passed==total and len(errors)==0 else 'ISSUES'} ===")
    browser.close()
