param(
    [ValidateSet('Enable','Restore','Status')]
    [string]$Action,
    [switch]$NoRestart
)

$ErrorActionPreference = 'SilentlyContinue'
$RegPath = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\MTCUVC'
$RegNativePath = 'HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\MTCUVC'
$ValueName = 'EnableMtcUvc'
$BackupFile = Join-Path $env:TEMP 'CheemsGalaxy-OldVolumeControl-backup.reg'

function Test-Admin {
    $principal = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Get-VolumeState {
    if (-not (Test-Path $RegPath)) { return 'modern' }
    $item = Get-ItemProperty -Path $RegPath -Name $ValueName -ErrorAction SilentlyContinue
    if ($null -eq $item) { return 'missing' }
    if ($item.EnableMtcUvc -eq 0) { return 'old' }
    return 'modern'
}

function Show-Status {
    $state = Get-VolumeState
    switch ($state) {
        'old'     { Write-Host "  Trang thai: dang dung volume control CU" -ForegroundColor Green }
        'modern'  { Write-Host "  Trang thai: dang dung volume control MOI" -ForegroundColor Yellow }
        'missing' { Write-Host "  Trang thai: key MTCUVC ton tai nhung thieu EnableMtcUvc" -ForegroundColor Yellow }
    }
}

function Restart-Explorer {
    Write-Host "`n>> Dang khoi dong lai Explorer..." -ForegroundColor Cyan
    Stop-Process -Name explorer -Force
    Start-Sleep -Seconds 3
    if (-not (Get-Process -Name explorer -ErrorAction SilentlyContinue)) {
        Start-Process -FilePath 'explorer.exe'
    }
    Write-Host "  [OK] Explorer da khoi dong lai" -ForegroundColor DarkGray
}

function Remove-OldVolumeKey {
    if (Test-Path $RegPath) {
        Remove-ItemProperty -Path $RegPath -Name $ValueName -Force
        $key = Get-Item -Path $RegPath
        if ($key.Property.Count -eq 0 -and $key.SubKeyCount -eq 0) {
            Remove-Item -Path $RegPath -Force
        }
    }
}

function Enable-OldVolume {
    param([switch]$SkipRestart)
    if ((Test-Path $RegPath) -and -not (Test-Path $BackupFile) -and (Get-VolumeState) -ne 'old') {
        reg.exe export $RegNativePath $BackupFile /y | Out-Null
    }
    if (-not (Test-Path $RegPath)) {
        New-Item -Path $RegPath -Force | Out-Null
    }
    New-ItemProperty -Path $RegPath -Name $ValueName -PropertyType DWord -Value 0 -Force | Out-Null
    Write-Host "`n>> Da bat volume control cu" -ForegroundColor Green
    Write-Host "  [OK] $ValueName = 0" -ForegroundColor DarkGray
    if (Test-Path $BackupFile) {
        Write-Host "  [OK] Backup: $BackupFile" -ForegroundColor DarkGray
    }
    if (-not $SkipRestart) { Restart-Explorer }
}

function Restore-NewVolume {
    param([switch]$SkipRestart)
    Write-Host "`n>> Dang khoi phuc volume control moi..." -ForegroundColor Yellow
    if (Test-Path $BackupFile) {
        reg.exe import $BackupFile | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Remove-Item $BackupFile -Force
            Write-Host "  [OK] Da khoi phuc tu backup" -ForegroundColor DarkGray
        } else {
            Remove-OldVolumeKey
            Write-Host "  [OK] Da xoa cau hinh cu" -ForegroundColor DarkGray
        }
    } else {
        Remove-OldVolumeKey
        Write-Host "  [OK] Da xoa cau hinh cu" -ForegroundColor DarkGray
    }
    if (-not $SkipRestart) { Restart-Explorer }
}

if ($Action -eq 'Status') {
    Show-Status
    exit
}

if (-not (Test-Admin)) {
    $params = @('-NoProfile','-ExecutionPolicy','Bypass','-File',"`"$PSCommandPath`"")
    if ($Action) { $params += @('-Action', $Action) }
    if ($NoRestart) { $params += '-NoRestart' }
    Start-Process -FilePath 'powershell.exe' -Verb RunAs -ArgumentList $params
    exit
}

if ($Action -eq 'Enable') {
    Enable-OldVolume -SkipRestart:$NoRestart
    exit
}

if ($Action -eq 'Restore') {
    Restore-NewVolume -SkipRestart:$NoRestart
    exit
}

do {
    Clear-Host
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "   OLD VOLUME CONTROL (Admin)        " -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Show-Status
    Write-Host "-------------------------------------"
    Write-Host " 1. Bat volume control cu (Win7/8)"
    Write-Host " 2. Khoi phuc volume control moi (Win10/11)"
    Write-Host " 0. Thoat"
    Write-Host "-------------------------------------"
    $choice = Read-Host "Chon"

    switch ($choice) {
        "1" { Enable-OldVolume -SkipRestart:$NoRestart }
        "2" { Restore-NewVolume -SkipRestart:$NoRestart }
        "0" { }
        default { Write-Host "Lua chon khong hop le." -ForegroundColor Red }
    }

    if ($choice -in "1","2") {
        Read-Host "`nNhan Enter de quay lai menu" | Out-Null
    }
} while ($choice -ne "0")
