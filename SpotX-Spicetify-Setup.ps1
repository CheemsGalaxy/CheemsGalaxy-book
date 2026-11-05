param(
    [switch]$SkipSpotX
)

$ErrorActionPreference = 'Stop'
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

$SpotifyDir = Join-Path $env:APPDATA 'Spotify'
$SpotifyExe = Join-Path $SpotifyDir 'Spotify.exe'
$PrefsPath = Join-Path $SpotifyDir 'prefs'
$AppsDir = Join-Path $SpotifyDir 'Apps'
$XpuiSpa = Join-Path $AppsDir 'xpui.spa'
$XpuiDir = Join-Path $AppsDir 'xpui'
$SpiceDir = Join-Path $env:LOCALAPPDATA 'spicetify'
$SpiceExe = Join-Path $SpiceDir 'spicetify.exe'
$SpotXUrl = 'https://raw.githubusercontent.com/SpotX-Official/SpotX/refs/heads/main/run.ps1'
$SpotXScript = Join-Path $env:TEMP 'SpotX-run.ps1'
$Transcript = Join-Path $env:TEMP ('SpotX-Spicetify-{0}.log' -f (Get-Date -Format 'yyyyMMdd-HHmmss'))

function Write-Step {
    param([string]$Text)
    Write-Host "`n==================================================" -ForegroundColor Cyan
    Write-Host " $Text" -ForegroundColor Cyan
    Write-Host "==================================================" -ForegroundColor Cyan
}

function Write-Ok {
    param([string]$Text)
    Write-Host "  [OK] $Text" -ForegroundColor Green
}

function Write-Info {
    param([string]$Text)
    Write-Host "  [..] $Text" -ForegroundColor DarkGray
}

function Stop-Spotify {
    Get-Process -Name 'Spotify*' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

function Add-SpicetifyPath {
    if (($env:Path -split ';') -notcontains $SpiceDir) {
        $env:Path = "$env:Path;$SpiceDir"
    }
}

function Install-Spicetify {
    Write-Info 'Dang tai Spicetify CLI ban moi nhat...'
    $release = Invoke-RestMethod -Uri 'https://api.github.com/repos/spicetify/cli/releases/latest'
    $version = $release.tag_name -replace '^v', ''
    switch ($env:PROCESSOR_ARCHITECTURE) {
        'AMD64' { $arch = 'x64' }
        'ARM64' { $arch = 'arm64' }
        default { $arch = 'x32' }
    }
    $zip = Join-Path $env:TEMP 'spicetify.zip'
    $url = "https://github.com/spicetify/cli/releases/download/v$version/spicetify-$version-windows-$arch.zip"
    Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
    if (-not (Test-Path $SpiceDir)) {
        New-Item -ItemType Directory -Path $SpiceDir -Force | Out-Null
    }
    Expand-Archive -Path $zip -DestinationPath $SpiceDir -Force
    Remove-Item $zip -Force -ErrorAction SilentlyContinue
    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    if (($userPath -split ';') -notcontains $SpiceDir) {
        [Environment]::SetEnvironmentVariable('Path', "$userPath;$SpiceDir", 'User')
    }
    Add-SpicetifyPath
    if (-not (Test-Path $SpiceExe)) {
        throw "Cai Spicetify that bai: khong thay $SpiceExe"
    }
    Write-Ok "Spicetify $version da cai tai $SpiceDir"
}

function Invoke-Spice {
    param([string[]]$Arguments)
    & $SpiceExe @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "spicetify $($Arguments -join ' ') that bai (exit code $LASTEXITCODE)"
    }
}

$exitCode = 0
Start-Transcript -Path $Transcript -Force | Out-Null

try {
    $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    if ($isAdmin) {
        throw 'Khong chay script bang quyen Admin. Hay mo PowerShell thuong (User) roi chay lai.'
    }

    Write-Step '1/6 Kiem tra va khoi tao cau hinh Spotify'
    if (-not (Test-Path $SpotifyExe)) {
        throw "Khong tim thay Spotify tai $SpotifyDir"
    }
    Write-Info "Spotify: $((Get-Item $SpotifyExe).VersionInfo.ProductVersion)"
    Stop-Spotify

    if (-not (Test-Path $PrefsPath)) {
        Write-Info 'Chua co prefs, mo Spotify va doi 35 giay...'
        Start-Process -FilePath $SpotifyExe -WorkingDirectory $SpotifyDir
        Start-Sleep -Seconds 35
        Stop-Spotify
        if (-not (Test-Path $PrefsPath)) {
            Write-Info 'prefs van chua co, doi them toi da 30 giay...'
            $deadline = (Get-Date).AddSeconds(30)
            while (-not (Test-Path $PrefsPath) -and (Get-Date) -lt $deadline) {
                Start-Sleep -Seconds 2
            }
        }
        if (-not (Test-Path $PrefsPath)) {
            throw 'Spotify khong tao duoc file prefs.'
        }
    }
    Write-Ok 'prefs san sang'

    Write-Step '2/6 Cap nhat Spicetify va lam sach backup'
    if (-not (Test-Path $SpiceExe)) {
        Install-Spicetify
    } else {
        Write-Ok "Spicetify da co tai $SpiceDir"
    }
    Add-SpicetifyPath

    Invoke-Spice @('update')
    Stop-Spotify

    $wasApplied = (Test-Path $XpuiDir) -and -not (Test-Path $XpuiSpa)
    if ($wasApplied) {
        Write-Info 'Phat hien Spicetify da apply len Spotify, restore ve vanilla truoc khi patch SpotX...'
        Invoke-Spice @('restore')
        if (-not (Test-Path $XpuiSpa)) {
            throw 'Restore Spicetify that bai: khong thay Apps\xpui.spa'
        }
        Write-Ok 'Da restore Spotify ve vanilla'
    }

    Invoke-Spice @('clear')
    Write-Ok 'Da xoa backup cu'

    if ($SkipSpotX) {
        Write-Step '3/6 Bo qua SpotX (-SkipSpotX)'
    } else {
        Write-Step '3/6 Cai SpotX o che do unattended'
        Stop-Spotify
        if (-not (Test-Path $XpuiSpa)) {
            throw 'Khong thay Apps\xpui.spa, khong the patch SpotX.'
        }
        Write-Info 'Dang tai SpotX run.ps1...'
        Invoke-WebRequest -Uri $SpotXUrl -OutFile $SpotXScript -UseBasicParsing
        $spotxArgs = @(
            '-NoProfile',
            '-ExecutionPolicy', 'Bypass',
            '-File', "`"$SpotXScript`"",
            '-new_theme',
            '-confirm_spoti_recomended_over',
            '-podcasts_off',
            '-block_update_on',
            '-defender_exclusions_off',
            '-confirm_uninstall_ms_spoti',
            '-no_pause'
        )
        $spotx = Start-Process -FilePath 'powershell.exe' -ArgumentList $spotxArgs -Wait -PassThru -NoNewWindow
        if ($spotx.ExitCode -ne 0) {
            throw "SpotX ket thuc voi exit code $($spotx.ExitCode)"
        }
        if (-not (Test-Path (Join-Path $AppsDir 'xpui.bak'))) {
            throw 'SpotX khong tao duoc Apps\xpui.bak, kiem tra log phia tren.'
        }
        Write-Ok 'SpotX da patch xong'
    }

    Write-Step '4/6 Mo Spotify 15 giay de xac nhan cau hinh'
    Stop-Spotify
    Start-Process -FilePath $SpotifyExe -WorkingDirectory $SpotifyDir
    Write-Info 'Doi 15 giay...'
    Start-Sleep -Seconds 15
    Stop-Spotify
    Write-Ok 'Da dong Spotify'

    Write-Step '5/6 Cau hinh Spicetify va apply len SpotX'
    Stop-Spotify
    Add-SpicetifyPath
    Invoke-Spice @('config', 'spotify_path', $SpotifyDir)
    Invoke-Spice @('config', 'prefs_path', $PrefsPath)
    Write-Ok "spotify_path = $SpotifyDir"
    Write-Ok "prefs_path = $PrefsPath"

    Invoke-Spice @('backup', 'apply', '--no-restart')
    Write-Ok 'Spicetify da backup va apply'

    Write-Step '6/6 Cai Spicetify Marketplace va mo Spotify'
    Stop-Spotify
    $marketUrl = 'https://raw.githubusercontent.com/spicetify/marketplace/main/resources/install.ps1'
    $marketScript = Join-Path $env:TEMP 'marketplace-install.ps1'
    $spiceUserData = (& $SpiceExe path userdata | Select-Object -Last 1).ToString().Trim()
    if (-not $spiceUserData) {
        $spiceUserData = Join-Path $env:APPDATA 'spicetify'
    }
    $marketApp = Join-Path $spiceUserData 'CustomApps\marketplace'
    $previousTheme = (& $SpiceExe config current_theme | Out-String).Trim()
    if ($previousTheme -ne 'marketplace') {
        Invoke-Spice @('config', 'current_theme', 'marketplace')
    }
    try {
        Write-Info 'Dang tai Marketplace installer...'
        Invoke-WebRequest -Uri $marketUrl -OutFile $marketScript -UseBasicParsing
        $marketArgs = @(
            '-NoProfile',
            '-ExecutionPolicy', 'Bypass',
            '-File', "`"$marketScript`""
        )
        $market = Start-Process -FilePath 'powershell.exe' -ArgumentList $marketArgs -Wait -PassThru -NoNewWindow
        if ($market.ExitCode -ne 0) {
            throw "Marketplace installer ket thuc voi exit code $($market.ExitCode)"
        }
        if (-not (Test-Path (Join-Path $marketApp 'manifest.json'))) {
            throw 'Marketplace chua duoc cai dat dung, kiem tra log phia tren.'
        }
    }
    catch {
        if ($previousTheme -ne 'marketplace') {
            & $SpiceExe config current_theme $previousTheme | Out-Null
        }
        throw
    }
    Write-Ok 'Marketplace da cai'

    if (-not (Get-Process -Name 'Spotify' -ErrorAction SilentlyContinue)) {
        Start-Process -FilePath $SpotifyExe -WorkingDirectory $SpotifyDir
    }
    Write-Ok 'Da mo Spotify'

    Write-Host "`nHOAN TAT. Log: $Transcript" -ForegroundColor Green
}
catch {
    $exitCode = 1
    Write-Host "`nLOI: $($_.Exception.Message)" -ForegroundColor Red
}
finally {
    Stop-Transcript | Out-Null
}

exit $exitCode
