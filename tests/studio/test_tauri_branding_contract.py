# SPDX-License-Identifier: AGPL-3.0-only
# Copyright 2026-present the Unsloth AI Inc. team. All rights reserved. See /studio/LICENSE.AGPL-3.0

"""Desktop display-branding contracts."""

import importlib.util
import json
from pathlib import Path
import re
import struct

import pytest


REPO = Path(__file__).resolve().parents[2]
FRONTEND = REPO / "studio/frontend"
TAURI = REPO / "studio/src-tauri"


def read(path: Path) -> str:
    return path.read_text(encoding = "utf-8")


def bmp_metadata(path: Path) -> tuple[int, int, int]:
    data = path.read_bytes()
    assert data[:2] == b"BM"
    width, height = struct.unpack_from("<ii", data, 18)
    bits_per_pixel = struct.unpack_from("<H", data, 28)[0]
    return width, height, bits_per_pixel


def png_metadata(path: Path) -> tuple[int, int, int]:
    data = path.read_bytes()
    assert data[:8] == b"\x89PNG\r\n\x1a\n"
    width, height = struct.unpack_from(">II", data, 16)
    color_type = data[25]
    return width, height, color_type


def tiff_first_image_size(path: Path) -> tuple[int, int]:
    """Width and height of the first image in a TIFF, ignoring later hidpi pages."""
    data = path.read_bytes()
    assert data[:2] in (b"II", b"MM")
    order = "<" if data[:2] == b"II" else ">"

    ifd_offset = struct.unpack_from(order + "I", data, 4)[0]
    entry_count = struct.unpack_from(order + "H", data, ifd_offset)[0]

    sizes: dict[int, int] = {}
    for index in range(entry_count):
        entry = ifd_offset + 2 + index * 12
        tag, field_type = struct.unpack_from(order + "HH", data, entry)
        if tag in (256, 257):
            # tag 256 is ImageWidth and 257 is ImageLength, either SHORT or LONG
            sizes[tag] = struct.unpack_from(
                order + ("H" if field_type == 3 else "I"), data, entry + 8
            )[0]
    return sizes[256], sizes[257]


def test_desktop_display_name_and_compatibility_ids() -> None:
    config = json.loads(read(TAURI / "tauri.conf.json"))
    assert config["productName"] == "XOne"
    assert config["mainBinaryName"] == "X1-Studio"
    assert config["app"]["windows"][0]["title"] == "XOne"
    assert config["bundle"]["publisher"] == "XOne AI"

    assert config["identifier"] == "ai.xone.desktop"
    assert config["plugins"]["deep-link"]["desktop"]["schemes"] == ["xone", "x1", "unsloth"]
    assert 'name = "X1-Studio"' in read(TAURI / "Cargo.toml")


def test_private_alpha_has_no_desktop_updater_endpoint() -> None:
    config = json.loads(read(TAURI / "tauri.conf.json"))
    assert "updater" not in config["plugins"]
    assert config["bundle"]["createUpdaterArtifacts"] is False
    assert "updater:default" not in read(TAURI / "capabilities/default.json")
    assert "tauri-plugin-updater" not in read(TAURI / "Cargo.toml")
    assert "tauri_plugin_updater" not in read(TAURI / "src/main.rs")

    features = read(FRONTEND / "src/xone/features.ts")
    assert "desktopUpdater: false" in features


def test_desktop_package_transitions_preserve_legacy_installs() -> None:
    config = json.loads(read(TAURI / "tauri.conf.json"))
    deb = config["bundle"]["linux"]["deb"]
    assert deb["provides"] == ["x1-studio-desktop"]
    for field in ("conflicts", "replaces"):
        assert deb[field] == ["unsloth-studio-desktop"]

    installer = read(TAURI / "windows/installer.nsi")
    assert '!define INSTALLIDENTITY "Unsloth Studio (Desktop)"' in installer
    assert "Uninstall\\${INSTALLIDENTITY}" in installer
    assert "${MANUKEY}\\${INSTALLIDENTITY}" in installer
    assert "$LOCALAPPDATA\\${INSTALLIDENTITY}" in installer

    assert 'StrCmp "$R0" "${PRODUCTNAME}" wix_name_match' in installer
    assert 'StrCmp "$R0" "${INSTALLIDENTITY}" 0 wix_loop' in installer
    assert '"$SMPROGRAMS\\${INSTALLIDENTITY}.lnk" "$INSTDIR\\$OldMainBinaryName"' in installer
    assert '"$DESKTOP\\${INSTALLIDENTITY}.lnk" "$INSTDIR\\$OldMainBinaryName"' in installer
    assert 'Rename "$SMPROGRAMS\\${INSTALLIDENTITY}.lnk"' in installer
    assert 'Rename "$DESKTOP\\${INSTALLIDENTITY}.lnk"' in installer


def test_desktop_artwork_uses_configurable_xone_lockups() -> None:
    config = json.loads(read(TAURI / "tauri.conf.json"))
    nsis = config["bundle"]["windows"]["nsis"]
    assert nsis["headerImage"] == "./windows/branding/nsis-header.bmp"
    assert nsis["sidebarImage"] == "./windows/branding/nsis-sidebar.bmp"

    for component in ("startup-screen.tsx", "update-screen.tsx"):
        source = read(FRONTEND / "src/components/tauri" / component)
        assert "XONE_BRAND.icons.app" in source
        assert "fontFamily: '\"Hellix\", sans-serif'" in source
        assert "XONE_BRAND.wordmark" in source
        assert "/studio.png" not in source

    sidebar = read(FRONTEND / "src/components/app-sidebar.tsx")
    assert "XONE_BRAND.icons.wordmark" in sidebar
    assert "XONE_BRAND.wordmark" in sidebar

    brand = read(FRONTEND / "src/xone/brand.ts")
    assert 'VITE_XONE_APP_ICON ?? "/xone/icon.png"' in brand
    assert 'VITE_XONE_WORDMARK_ICON ?? "/xone/icon.png"' in brand
    for name in ("icon.png", "icon-32.png", "icon-64.png", "icon-180.png"):
        assert (FRONTEND / "public/xone" / name).exists()

    assert config["bundle"]["icon"] == [
        "icons/xone/32x32.png",
        "icons/xone/128x128.png",
        "icons/xone/icon.ico",
        "icons/xone/icon.icns",
    ]
    assert config["bundle"]["windows"]["nsis"]["installerIcon"] == "./icons/xone/icon.ico"
    for name in ("32x32.png", "128x128.png", "128x128@2x.png", "icon.png", "icon.ico", "icon.icns"):
        assert (TAURI / "icons/xone" / name).exists()
    assert png_metadata(TAURI / "icons/xone/32x32.png") == (32, 32, 6)
    assert png_metadata(TAURI / "icons/xone/128x128.png") == (128, 128, 6)
    assert png_metadata(TAURI / "icons/xone/128x128@2x.png") == (256, 256, 6)

    # Existing upstream artwork remains available for compatibility and attribution.
    assert (FRONTEND / "public/sticker.png").exists()
    assert (FRONTEND / "public/circle-logo-small.png").exists()

    assert 'chatDisabled && "pointer-events-none opacity-50"' not in sidebar
    assert not (FRONTEND / "public/studio.png").exists()

    branding = TAURI / "windows/branding"
    assert bmp_metadata(branding / "nsis-header.bmp") == (300, 114, 24)
    assert bmp_metadata(branding / "nsis-sidebar.bmp") == (328, 628, 24)


def test_dmg_install_window_matches_its_background_art() -> None:
    dmg = json.loads(read(TAURI / "tauri.macos.conf.json"))["bundle"]["macOS"]["dmg"]
    assert dmg["background"] == "./dmg/background.tiff"

    # Finder lays the background out from the same origin it uses for icon
    # coordinates, so the base page has to match the configured window size or
    # the artwork drifts out from under the app and Applications icons.
    window = (dmg["windowSize"]["width"], dmg["windowSize"]["height"])
    assert window == (660, 400)
    assert tiff_first_image_size(TAURI / "dmg/background.tiff") == window

    assert dmg["appPosition"] == {"x": 180, "y": 170}
    assert dmg["applicationFolderPosition"] == {"x": 480, "y": 170}


def load_module(path: Path):
    spec = importlib.util.spec_from_file_location(path.stem, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_dmg_background_art_is_what_its_renderer_produces() -> None:
    """The checked-in TIFF is generated, so it has to track its own script."""
    np = pytest.importorskip("numpy")
    ImageSequence = pytest.importorskip("PIL.ImageSequence")
    from PIL import Image

    renderer = load_module(REPO / "scripts/make_dmg_background.py")
    image = renderer.build()
    expected = [
        image.resize((renderer.WIN_W, renderer.WIN_H), Image.LANCZOS).convert("RGB"),
        image.convert("RGB"),
    ]

    # the iterator seeks one shared handle, so each page is copied off it
    tiff = Image.open(TAURI / "dmg/background.tiff")
    pages = [page.convert("RGB") for page in ImageSequence.Iterator(tiff)]
    assert [page.size for page in pages] == [page.size for page in expected]

    # a tolerance, not equality, so no one Pillow build is baked in. a stale asset is far worse
    for page, reference in zip(pages, expected):
        drift = np.abs(np.asarray(page, dtype = np.int16) - np.asarray(reference, dtype = np.int16))
        assert drift.max() <= 2


def test_dmg_icon_label_stays_legible_over_the_halo() -> None:
    """Finder draws the XOne app label here, so tinting it up is an accessibility change."""
    np = pytest.importorskip("numpy")
    pytest.importorskip("PIL")

    renderer = load_module(REPO / "scripts/make_dmg_background.py")
    scale = renderer.SCALE
    # the band Finder puts the icon label in, just under the app icon
    label = (
        np.asarray(renderer.build().convert("RGB"), dtype = np.float32)[
            238 * scale : 260 * scale, 140 * scale : 220 * scale
        ]
        / 255.0
    )

    channel = np.where(label <= 0.04045, label / 12.92, ((label + 0.055) / 1.055) ** 2.4)
    luminance = channel @ np.array([0.2126, 0.7152, 0.0722], dtype = np.float32)
    assert (luminance.min() + 0.05) / 0.05 >= 7.0  # WCAG AAA for body text


def test_upstream_release_workflow_names_remain_attributed() -> None:
    workflow = read(REPO / ".github/workflows/release-desktop.yml")
    assert "re.sub(r'[^0-9A-Za-z]+', '_', app_version).strip('_')" in workflow

    # This remains the upstream workflow, not a fabricated XOne release channel.
    assert "base_name = f'Unsloth-Desktop-{os.environ[\"ASSET_VERSION\"]}'" in workflow
    expected_suffixes = {
        "MacOS.dmg",
        "ARM64.app.tar.gz",
        "ARM64.app.tar.gz.sig",
        "Linux.AppImage",
        "Linux.AppImage.sig",
        "Ubuntu.deb",
        "Windows.exe",
        "Windows.exe.sig",
    }
    for suffix in expected_suffixes:
        assert f"f'{{base_name}}-{suffix}'" in workflow


LOCALES = FRONTEND / "src/i18n/locales"

# Every translated display surface uses XOne. Upstream names remain only in
# attribution, package identifiers, compatibility paths, and external project links.
LOCALE_REMOTE_SERVER_KEYS: frozenset[str] = frozenset()

LOCALE_KEY = re.compile(r"^(\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:")


def locale_entries(text: str) -> list[tuple[str, str]]:
    """Every leaf entry of a locale module as (dotted key path, value text).

    The catalogs are plain nested object literals, and values routinely wrap onto their
    own line, so an entry runs from its key to the next key or closing brace.
    """
    stack: list[tuple[int, str]] = []
    out: list[tuple[str, str]] = []
    path: str | None = None
    buf = ""
    for line in text.splitlines():
        match = LOCALE_KEY.match(line)
        if match:
            if path is not None:
                out.append((path, buf))
            indent, name = len(match.group(1)), match.group(2)
            while stack and stack[-1][0] >= indent:
                stack.pop()
            path = ".".join([held for _, held in stack] + [name])
            buf = line[match.end() :]
            if line.rstrip().endswith(("{", "[")):
                stack.append((indent, name))
                path, buf = None, ""
        elif path is not None:
            buf += "\n" + line
            if re.match(r"^\s*[}\]]", line):
                out.append((path, buf))
                path, buf = None, ""
    if path is not None:
        out.append((path, buf))
    return out


def test_desktop_surfaces_do_not_restore_studio_branding() -> None:
    # App-shell and translated display sources may not restore the upstream product name.
    display_sources = [
        TAURI / "Info.plist",
        TAURI / "capabilities/default.json",
        TAURI / "src/main.rs",
        TAURI / "src/process.rs",
        TAURI / "src/diagnostics/report.rs",
        TAURI / "src/diagnostics/phase_log.rs",
        TAURI / "windows/sign-with-trusted-signing.ps1",
        REPO / ".github/workflows/release-desktop.yml",
        FRONTEND / "index.html",
        *sorted(
            path
            for suffix in ("*.ts", "*.tsx")
            for path in (FRONTEND / "src").rglob(suffix)
            if LOCALES not in path.parents
        ),
    ]
    offenders = [
        str(path.relative_to(REPO)) for path in display_sources if "Unsloth Studio" in read(path)
    ]

    # The locale catalogs are swept too, just at key granularity rather than file
    # granularity, so only the remote-server prose is spared.
    offenders += [
        f"{path.relative_to(REPO)}::{key}"
        for path in sorted(LOCALES.rglob("*.ts"))
        for key, value in locale_entries(read(path))
        if "Unsloth Studio" in value and key not in LOCALE_REMOTE_SERVER_KEYS
    ]
    assert offenders == []

    workflow = read(REPO / ".github/workflows/release-desktop.yml")
    assert "Desktop app for Unsloth." in workflow
    assert '--title "Unsloth Desktop updater channel"' not in workflow


def test_xone_display_brand_does_not_rename_technical_unsloth_surfaces() -> None:
    brand = read(FRONTEND / "src/xone/brand.ts")
    messages = read(FRONTEND / "src/i18n/messages.ts")
    main = read(TAURI / "src/main.rs")

    assert 'name: "XOne"' in brand
    assert "applyXOneDisplayBrand(key, fallback)" in messages
    assert 'value.replaceAll("Unsloth", XONE_BRAND.name)' in brand
    assert "XONE_DISPLAY_TRANSLATION_KEYS" not in brand

    for old_display in (
        '"Open Unsloth"',
        '"Quit Unsloth"',
        '.tooltip("Unsloth")',
        '"Run Unsloth at login"',
        'info!("Unsloth desktop app starting")',
    ):
        assert old_display not in main

    config = json.loads(read(TAURI / "tauri.conf.json"))
    assert config["plugins"]["deep-link"]["desktop"]["schemes"] == ["xone", "x1", "unsloth"]
    assert config["bundle"]["linux"]["deb"]["provides"] == ["x1-studio-desktop"]
    assert 'name = "X1-Studio"' in read(TAURI / "Cargo.toml")


def test_legal_and_attribution_surfaces_are_preserved() -> None:
    for path in (
        REPO / "LICENSE",
        REPO / "COPYING",
        TAURI.parent / "LICENSE.AGPL-3.0",
    ):
        assert path.exists()

    about = read(FRONTEND / "src/features/settings/tabs/about-tab.tsx")
    assert "Open Source & Third-Party Licenses" in about
    assert 'label="Upstream project"' in about
    assert "XOne is derived from Unsloth" not in about
    assert "XONE_LINKS.copying" in about
    assert "derived from [Unsloth]" in read(REPO / "README.md")


def test_the_branding_sweep_still_covers_the_frontend() -> None:
    """The locale exemption must stay narrow.

    A sweep that matches nothing passes this contract while proving nothing. Both halves
    can fail that way: move src and the rglob goes empty, or reformat the catalogs and the
    key parser yields nothing, either one leaving the test green over an unchecked tree.
    """
    swept = [
        path
        for suffix in ("*.ts", "*.tsx")
        for path in (FRONTEND / "src").rglob(suffix)
        if LOCALES not in path.parents
    ]
    locales = sorted(LOCALES.rglob("*.ts"))

    assert LOCALES.is_dir(), f"the exempt directory moved: {LOCALES}"
    assert len(locales) >= 10, f"locales look wrong, found {len(locales)}"
    assert len(swept) > 20 * len(locales), f"sweep collapsed to {len(swept)} files"

    # The catalogs are parsed by key. Display keys are centrally transformed for all
    # locales; technical Unsloth values remain intact in the source catalogs.
    for path in locales:
        entries = dict(locale_entries(read(path)))
        assert len(entries) > 500, f"{path.name} parsed to {len(entries)} entries"
        for key in (
            "shell.product",
            "settings.general.startup.launchAtLogin",
            "settings.appearance.description",
        ):
            assert key in entries, f"{path.name} lost {key}, so the sweep no longer sees it"

    # The allowlist is prose-level, not a blanket: it spares three of the ~1,500 entries a
    # catalog holds, and every exempt key has to be one the catalogs actually define.
    english = dict(locale_entries(read(LOCALES / "en.ts")))
    assert LOCALE_REMOTE_SERVER_KEYS <= set(
        english
    ), f"exempt keys missing from en.ts: {sorted(LOCALE_REMOTE_SERVER_KEYS - set(english))}"
    assert len(LOCALE_REMOTE_SERVER_KEYS) < len(english) / 100
