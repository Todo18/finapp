@echo off

rem Ensure this Node.js and npm are first in the PATH
set "PATH=%APPDATA%\npm;C:\Program Files\nodejs;%PATH%"

rem error:0308010C:digital envelope routines::unsupported
set NODE_OPTIONS=--openssl-legacy-provider

setlocal enabledelayedexpansion
pushd "C:\Program Files\nodejs"

rem Figure out the Node.js version.
set print_version=.\node.exe -p -e "process.versions.node + ' (' + process.arch + ')'"
for /F "usebackq delims=" %%v in (`%print_version%`) do set version=%%v

rem Print message.
if exist npm.cmd (
  echo Your environment has been set up for using Node.js !version! and npm.
) else (
  echo Your environment has been set up for using Node.js !version!.
)

popd
endlocal

npm run dev
