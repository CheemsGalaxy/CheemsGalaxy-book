# Edge-Optimizer.ps1
# 1 = Tat AI tren Edge | 2 = Tat dich vu/tinh nang thua | 3 = Lam ca hai | 4 = Hoan tac
# Chay bang PowerShell quyen Administrator.

$ErrorActionPreference = 'SilentlyContinue'
$EdgePath = "HKLM:\SOFTWARE\Policies\Microsoft\Edge"

# ---- Kiem tra quyen Admin ----
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Hay chay PowerShell bang quyen Administrator roi chay lai script." -ForegroundColor Red
    Read-Host "Nhan Enter de thoat"
    exit
}

# ---- Ham ghi policy Edge ----
function Set-EdgePolicies {
    param([hashtable]$Policies)
    if (-not (Test-Path $EdgePath)) { New-Item -Path $EdgePath -Force | Out-Null }
    foreach ($name in $Policies.Keys) {
        New-ItemProperty -Path $EdgePath -Name $name -Value $Policies[$name] -PropertyType DWord -Force | Out-Null
        Write-Host "  [OK] $name = $($Policies[$name])" -ForegroundColor DarkGray
    }
}

# ---- Ham doi kieu khoi dong dich vu ----
function Set-Svc {
    param([string]$Name, [string]$Type, [switch]$Stop)
    $svc = Get-Service -Name $Name -ErrorAction SilentlyContinue
    if (-not $svc) { Write-Host "  [--] Khong co dich vu $Name, bo qua" -ForegroundColor DarkGray; return }
    Set-Service -Name $Name -StartupType $Type
    if ($Stop) { Stop-Service -Name $Name -Force }
    Write-Host "  [OK] $Name -> $Type" -ForegroundColor DarkGray
}

# ---- 1. Tat AI ----
function Disable-EdgeAI {
    Write-Host "`n>> Dang tat tinh nang AI tren Edge..." -ForegroundColor Cyan
    Set-EdgePolicies @{
        "HubsSidebarEnabled"                  = 0
        "CopilotPageContext"                  = 0
        "CopilotCDPPageContext"               = 0
        "Microsoft365CopilotChatIconEnabled"  = 0
        "EdgeEntraCopilotPageContext"         = 0
        "ComposeInlineEnabled"                = 0
        "TextPredictionEnabled"               = 0
        "AIGenThemesEnabled"                  = 0
        "BuiltInAIAPIsEnabled"                = 0
        "GenAILocalFoundationalModelSettings" = 1
        "EdgeShoppingAssistantEnabled"        = 0
        "DiscoverPageContextEnabled"          = 0
        "VisualSearchEnabled"                 = 0
        "ShowRecommendationsEnabled"          = 0
        "NewTabPageBingChatEnabled"           = 0
    }
    Write-Host "Xong phan AI." -ForegroundColor Green
}

# ---- 2. Tat dich vu / tinh nang thua ----
function Disable-Extras {
    Write-Host "`n>> Dang tat tinh nang thua cua Edge..." -ForegroundColor Cyan
    Set-EdgePolicies @{
        "StartupBoostEnabled"                           = 0
        "BackgroundModeEnabled"                         = 0
        "EdgeCollectionsEnabled"                        = 0
        "ShowMicrosoftRewards"                          = 0
        "EdgeFollowEnabled"                             = 0
        "EdgeWorkspacesEnabled"                         = 0
        "ShowAcrobatSubscriptionButton"                 = 0
        "SpotlightExperiencesAndRecommendationsEnabled" = 0
        "PromotionalTabsEnabled"                        = 0
        "MetricsReportingEnabled"                       = 0
        "PersonalizationReportingEnabled"               = 0
        "SendSiteInfoToImproveServices"                 = 0
        "UserFeedbackAllowed"                           = 0
        "DiagnosticData"                                = 0
        "NetworkPredictionOptions"                      = 2
        "EfficiencyModeEnabled"                         = 1
        "SleepingTabsEnabled"                           = 1
        "WebWidgetAllowed"                              = 0
        "TabServicesEnabled"                            = 0
        "HideFirstRunExperience"                        = 1
    }

    Write-Host "`n>> Dang chinh dich vu Windows..." -ForegroundColor Cyan
    Set-Svc -Name "edgeupdate"       -Type Manual
    Set-Svc -Name "edgeupdatem"      -Type Manual
    Set-Svc -Name "DiagTrack"        -Type Disabled -Stop
    Set-Svc -Name "dmwappushservice" -Type Disabled -Stop
    Set-Svc -Name "MapsBroker"       -Type Manual
    Write-Host "Xong phan dich vu thua." -ForegroundColor Green
}

# ---- 4. Hoan tac ----
function Restore-Defaults {
    Write-Host "`n>> Dang hoan tac..." -ForegroundColor Yellow
    if (Test-Path $EdgePath) { Remove-Item $EdgePath -Recurse -Force }
    Write-Host "  [OK] Da xoa toan bo policy Edge" -ForegroundColor DarkGray
    Set-Svc -Name "edgeupdate"       -Type Automatic
    Set-Svc -Name "edgeupdatem"      -Type Manual
    Set-Svc -Name "DiagTrack"        -Type Automatic
    Set-Svc -Name "dmwappushservice" -Type Manual
    Set-Svc -Name "MapsBroker"       -Type Automatic
    Start-Service -Name "DiagTrack"
    Write-Host "Da hoan tac ve mac dinh." -ForegroundColor Green
}

# ---- Menu ----
do {
    Clear-Host
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "      EDGE OPTIMIZER (Admin)         " -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host " 1. Tat toan bo tinh nang AI tren Edge"
    Write-Host " 2. Tat dich vu / tinh nang thua"
    Write-Host " 3. Tat tat ca (1 + 2)"
    Write-Host " 4. Hoan tac ve mac dinh"
    Write-Host " 0. Thoat"
    Write-Host "-------------------------------------"
    $choice = Read-Host "Chon"

    switch ($choice) {
        "1" { Disable-EdgeAI }
        "2" { Disable-Extras }
        "3" { Disable-EdgeAI; Disable-Extras }
        "4" { Restore-Defaults }
        "0" { break }
        default { Write-Host "Lua chon khong hop le." -ForegroundColor Red }
    }

    if ($choice -in "1","2","3","4") {
        Write-Host "`nHay dong han Edge roi mo lai. Kiem tra tai edge://policy" -ForegroundColor Yellow
    }
    if ($choice -ne "0") { Read-Host "`nNhan Enter de quay lai menu" | Out-Null }
} while ($choice -ne "0")
