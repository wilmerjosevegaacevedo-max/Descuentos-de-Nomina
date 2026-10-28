import re

f = open('records_data.py', 'r', encoding='utf-8')
lines = f.readlines()
f.close()

new_lines = []
for line in lines:
    new_lines.append(line)
    if line.strip() == 'from registro_log import get_logger':
        new_lines.append('from services.firebase_service import guardar_log_nube\n')
    if 'Bitacora actualizada' in line or 'cora actualizada' in line:
        spaces = '        '
        new_lines.append(spaces + 'guardar_log_nube(item_id, cliente, estado, mensaje)\n')

f = open('records_data.py', 'w', encoding='utf-8')
f.writelines(new_lines)
f.close()
print('LISTO! records_data.py actualizado con Firebase!')
