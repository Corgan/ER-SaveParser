FOR /r dds\common\ %%i IN (*.dds) DO texconv -r:keep "%%i" -y -ft png -o images2\common