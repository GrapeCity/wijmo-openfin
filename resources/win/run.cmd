@echo off

set "base_dir=%~dp0"
set "base_dir=%base_dir:~0,-1%"
set "main_app_dir=%base_dir%\apps\stock-portfolio"
set "main_app_url=file:///%main_app_dir:\=/%"
set "pipe_name=wj-stock-portfolio"

CALL :CREATE_MANIFEST
CALL :CREATE_CFG_FILES
if /i "%1" EQU "--wait-for-exit" (
  CALL :RUN_APP_SYNC
) else (
  CALL :RUN_APP_ASYNC
)
CALL :DONE

GOTO:EOF

:CREATE_MANIFEST

echo "Generating app manifest file ..."

(
echo {
echo    "devtools_port": 9090,
echo    "startup_app": {
echo        "name": "Stock Portfolio",
echo        "description": "A financial OpenFin application that was developed using GrapeCity's Wijmo controls",
echo        "url": "%main_app_url%/index.html",
echo        "icon": "%main_app_url%/favicon.ico",
echo        "uuid": "3f1eb5a5-0ad9-4bf2-9660-0a5719c11c5c",
echo        "autoShow": true,
echo        "saveWindowState": true,
echo        "taskbarIconGroup": "ade6c57c-14f2-4c6d-802b-bee130ca432d",
echo        "maximizable": false,
echo        "frame": false
echo    },
echo    "runtime": {
echo        "arguments": "",
echo        "version": "14.78.47.21"
echo    },
echo    "shortcut": {
echo        "company": "GrapeCity",
echo        "description": "A financial OpenFin application that was developed using GrapeCity's Wijmo controls",
echo        "icon": "%main_app_url%/favicon.ico",
echo        "name": "Stock Portfolio"
echo    },
echo    "services": [
echo        {"name": "layouts"},
echo        {"name": "notifications"}
echo    ],
echo    "features": {
echo        "snap": true,
echo        "dock": true,
echo        "tab": true
echo    }
echo }
) > "%main_app_dir%\app.json"

GOTO:EOF

:CREATE_CFG_FILES

echo "Generating app config files ..."

set "app_dir=%base_dir%\apps\stock-portfolio-chart"
set "app_url=file:///%app_dir:\=/%"

(
echo {
echo     "name": "Stock Changes",
echo     "uuid": "8458ae53-c7c1-49fe-8945-3cad82512f17",
echo     "url": "%app_url%/index.html#/changes",
echo     "icon": "%app_url%/favicon.ico"
echo }
) > "%main_app_dir%\assets\app.changes.json"

set "app_dir=%base_dir%\apps\stock-charts"
set "app_url=file:///%app_dir:\=/%"

(
echo {
echo     "name": "Stock HLOC",
echo     "uuid": "c274228d-18aa-486c-a5bd-d1f6475a237f",
echo     "url": "%app_url%/index.html",
echo     "icon": "%app_url%/favicon.ico"
echo }
) > "%main_app_dir%\assets\app.hloc.json"

(
echo {
echo     "name": "Stock Trendline",
echo     "uuid": "7589b670-fb41-4889-8cd8-51f00fbd3e8b",
echo     "url": "%app_url%/index.html",
echo     "icon": "%app_url%/favicon.ico"
echo }
) > "%main_app_dir%\assets\app.trendline.json"

set "app_dir=%base_dir%\apps\stock-trading"
set "app_url=file:///%app_dir:\=/%"

(
echo {
echo     "name": "Stock Trading",
echo     "uuid": "e6f6dcb3-4739-4cd5-b556-c5c2f3936f9c",
echo     "url": "%app_url%/index.html",
echo     "icon": "%app_url%/favicon.ico"
echo }
) > "%main_app_dir%\assets\app.trading.json"

GOTO:EOF

:RUN_APP_ASYNC

echo "Running OpenFin app ..."

"%base_dir%\OpenFinRVM.exe" --config "%main_app_dir%\app.json" --runtime-arguments=--runtime-information-channel-v6=%pipe_name%

GOTO:EOF

:RUN_APP_SYNC

CALL :RUN_APP_ASYNC

echo "Waiting for OpenFin app to exit ..."

"%base_dir%\node_6.5.0.exe" index.js %pipe_name%

GOTO:EOF

:DONE

echo "Done: app started"

GOTO:EOF