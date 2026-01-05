# Tesi Magistrale – Setup locale

Questo repository contiene l'esportazione offline da Overleaf della tesi di Giacomo Golino (`main.tex`, capitoli in sottocartelle e cartella `images/`). Il progetto è stato adattato per essere compilato interamente in locale su Windows senza dipendere da Overleaf.

## Requisiti

- **Windows 10/11** con accesso amministratore.
- **MiKTeX** aggiornato e configurato per installare automaticamente i pacchetti mancanti.
- **Strawberry Perl** (necessario perché `latexmk` è uno script Perl).
- Variabili d'ambiente aggiornate in modo che `pdflatex`, `latexmk` e `biber` siano visibili da qualsiasi terminale.

## Procedura rapida di installazione (Windows)

1. **Installare MiKTeX** (versione completa o basic va bene):
   ```powershell
   winget install --id MiKTeX.MiKTeX --accept-package-agreements --accept-source-agreements
   ```
   - Aprire “MiKTeX Console” → scheda *Updates* → *Check for updates* → *Update now*.
   - Abilitare l’installazione automatica dei pacchetti: scheda *Settings* → *General* → “Install missing packages on-the-fly” = *Yes* (equivale al comando `initexmf --set-config-value="[MPM]AutoInstall=1"`).

2. **Installare Strawberry Perl** (per `latexmk`):
   ```powershell
   winget install --id StrawberryPerl.StrawberryPerl --accept-package-agreements --accept-source-agreements
   ```

3. **Aggiornare il `PATH` utente** (log out/in dopo la modifica):
   - Aggiungere `C:\Users\<utente>\AppData\Local\Programs\MiKTeX\miktex\bin\x64`.
   - Aggiungere `C:\Strawberry\perl\bin` e `C:\Strawberry\c\bin`.
   Si può usare “Modifica variabili d’ambiente” di Windows oppure:
   ```powershell
   $miktex = "$env:LOCALAPPDATA\Programs\MiKTeX\miktex\bin\x64"
   $perl   = "C:\Strawberry\perl\bin;C:\Strawberry\c\bin"
   setx PATH "$miktex;$perl;$env:PATH"
   ```
   (attenzione a non troncare valori personalizzati già presenti).

4. **Verificare che gli eseguibili siano raggiungibili** aprendo un nuovo terminale PowerShell e lanciando:
   ```powershell
   pdflatex --version
   biber --version
   latexmk --version
   ```

## Compilazione del progetto

1. Aprire un terminale dentro `Tesi_Magistrale_Golino_Giacomo`.
2. Lanciare `latexmk`, che gestisce automaticamente i passaggi `pdflatex`/`biber`:
   ```powershell
   latexmk -pdf -interaction=nonstopmode -halt-on-error -file-line-error main.tex
   ```
3. Il PDF finale viene creato come `main.pdf` nella stessa cartella.
4. Per ripulire i file temporanei: `latexmk -c`.

### Note importanti

- Le immagini sono tutte referenziate rispetto alla cartella `images/` (ad esempio `images/Chap - 3/...`). Spostare la cartella o rinominare i file richiede l’aggiornamento dei path nei capitoli.
- Nel preambolo è presente una piccola patch (`\providecommand{\insert@pcolumn}{\insert@column}`) che risolve un bug noto fra le versioni recenti di `array` e `xcolor` su MiKTeX. Non va rimossa.
- `latexmk` esegue automaticamente `biber` per la bibliografia (`refs.bib`), quindi non serve lanciare `biber` manualmente.
- In caso di installazione su un nuovo PC è sufficiente copiare l’intera cartella della tesi, ripetere i passaggi di installazione MiKTeX/Perl e rilanciare `latexmk`.

## Struttura del progetto

- `main.tex`: entry point del documento (imposta i pacchetti e importa tutti i capitoli).
- `0 - Intestazioni extra/`: frontespizio, introduzione e conclusioni.
- `1 - Capitoli/`: tre capitoli della tesi.
- `images/`: tutte le figure organizzate per capitolo/sottosezione.
- `refs.bib`: archivio bibliografico usato da `biblatex`/`biber`.
- `README.md`: questa guida operativa.

Seguendo i passaggi sopra si può lavorare totalmente offline (anche su più macchine) mantenendo la stessa struttura dell’esportazione Overleaf originale.
