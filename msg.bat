FOR /r msg/ %%i IN (*.dcx) DO yabber\Yabber.DCX "%%i"

FOR /r msg/ %%i IN (*.msgbnd) DO yabber\Yabber "%%i"

FOR /r msg/ %%i IN (*.fmg) DO yabber\Yabber "%%i"

FOR /r msg/ %%i IN (*.fmg.xml) DO copy "%%i" xml\%%~ni.xml