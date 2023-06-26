@echo off 
start chrome http://192.168.1.200:8000/
E:
cd E:\LC Hospital\Lotus_Hospital\Nehru_Nursing
py manage.py runserver 0.0.0.0:8000
pause