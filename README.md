# Moje Řemeslo — prototyp v2

Mobilní PWA pracovní nástroj pro řemeslníka. Projekt je bez buildu a je připravený pro přímé nahrání na GitHub Pages.

## Co je ve v2

- Přehled pracovního dne
- Kalendář
- Samostatná záložka **Úkoly**
- Zakázky + archiv dokončených prací
- Kontakty zákazníků
- Samostatná záložka **Nabídky**
- Rychlé `+`
- Lokální/offline ukládání dat

### Nabídky

Nabídku lze vytvořit jako:

- **Koncept** — bez konkrétního zákazníka, plně editovatelný
- **Pro zákazníka** — zákazník může být vybrán z kontaktů nebo zadán pouze pro danou nabídku

Pokud je nabídka vytvořena pro nového zákazníka mimo kontakty, aplikace se při potvrzení zeptá, zda ho chce uživatel uložit také do kontaktů.

Hotová nabídka má náhled a lze ji:

- vygenerovat do PDF s českou diakritikou,
- sdílet přes systémové sdílení zařízení (pokud ho prohlížeč podporuje),
- upravit,
- odstranit,
- převést na zakázku.

Po převodu nabídky na zakázku nabídka zmizí ze seznamu rozpracovaných nabídek, ale vazba zůstane uložená v datech.

## GitHub Pages

Nahraj obsah ZIPu do kořene repozitáře a v **Settings → Pages** zvol publikování z větve `main` / root.

Aplikace nepoužívá CDN. Knihovna jsPDF i český PDF font jsou součástí repozitáře, takže PDF funguje i bez externích závislostí.
