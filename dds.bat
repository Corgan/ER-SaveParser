FOR /r dcx\01_common-tpf %%i IN (*.dds) DO copy "%%i" dds2\%%~ni.dds
FOR /r dds2\ %%i IN (*.dds) DO texconv -r:keep "%%i" -y -ft png -o images2
