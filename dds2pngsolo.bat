FOR /r dds\solo\ %%i IN (*.dds) DO texconv -r:keep "%%i" -y -ft png -o images2\solo