Add-Type -AssemblyName System.Drawing

$sourcePath = (Resolve-Path "public/tapit-logo.png").Path
$source = [System.Drawing.Image]::FromFile($sourcePath)

function Resize-Image($width, $height, $targetPath, $isMaskable = $false) {
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::FromArgb(4, 12, 26))

    if ($isMaskable) {
        $padX = [int]($width * 0.1)
        $padY = [int]($height * 0.1)
        $drawW = $width - ($padX * 2)
        $drawH = $height - ($padY * 2)
        $g.DrawImage($source, $padX, $padY, $drawW, $drawH)
    } else {
        $g.DrawImage($source, 0, 0, $width, $height)
    }
    $g.Dispose()
    $bmp.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

New-Item -ItemType Directory -Force -Path "public/icons" | Out-Null
Resize-Image 192 192 "public/icons/icon-192x192.png" $false
Resize-Image 512 512 "public/icons/icon-512x512.png" $false
Resize-Image 192 192 "public/icons/maskable-icon-192x192.png" $true
Resize-Image 512 512 "public/icons/maskable-icon-512x512.png" $true
Resize-Image 180 180 "public/icons/apple-touch-icon.png" $false
Resize-Image 32 32 "public/icons/favicon-32x32.png" $false

$source.Dispose()
Write-Host "PWA icons generated successfully!"
