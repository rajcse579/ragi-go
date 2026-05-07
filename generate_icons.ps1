Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param (
        [string]$sourcePath,
        [string]$destPath,
        [int]$width,
        [int]$height
    )
    try {
        $img = [System.Drawing.Image]::FromFile($sourcePath)
        $newImg = New-Object System.Drawing.Bitmap($width, $height)
        $g = [System.Drawing.Graphics]::FromImage($newImg)
        $scale = 0.6
        $contentWidth = [int]($width * $scale)
        $contentHeight = [int]($height * $scale)
        $posX = [int](($width - $contentWidth) / 2)
        $posY = [int](($height - $contentHeight) / 2)
        
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        
        $g.DrawImage($img, $posX, $posY, $contentWidth, $contentHeight)
        
        # Ensure the destination directory exists
        $dir = [System.IO.Path]::GetDirectoryName($destPath)
        if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force }
        
        $newImg.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $img.Dispose()
        $newImg.Dispose()
        $g.Dispose()
        Write-Host "Successfully saved: $destPath"
    } catch {
        Write-Error "Failed to process $destPath : $($_.Exception.Message)"
    }
}

$source = "C:\Users\Rajesh\OneDrive\Desktop\My_Files\Projects\ragi_go\ragi_go_app\ragi-go-web\public\logo_icon.png"
$baseDir = "C:\Users\Rajesh\OneDrive\Desktop\My_Files\Projects\ragi_go\ragi_go_app\ragi-go-web\android\app\src\main\res"
$publicDir = "C:\Users\Rajesh\OneDrive\Desktop\My_Files\Projects\ragi_go\ragi_go_app\ragi-go-web\public"

# Android Icons
$folders = @("mipmap-mdpi", "mipmap-hdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi")
$sizes = @(48, 72, 96, 144, 192)

for ($i=0; $i -lt $folders.Count; $i++) {
    $folder = $folders[$i]
    $size = $sizes[$i]
    
    $destFile = "$baseDir\$folder\ic_launcher.png"
    $destFileRound = "$baseDir\$folder\ic_launcher_round.png"
    $destFileForeground = "$baseDir\$folder\ic_launcher_foreground.png"
    
    Resize-Image -sourcePath $source -destPath $destFile -width $size -height $size
    Resize-Image -sourcePath $source -destPath $destFileRound -width $size -height $size
    Resize-Image -sourcePath $source -destPath $destFileForeground -width $size -height $size
}

# PWA Icons
Write-Host "Updating PWA icons..."
Resize-Image -sourcePath $source -destPath "$publicDir\pwa-192x192.png" -width 192 -height 192
Resize-Image -sourcePath $source -destPath "$publicDir\pwa-512x512.png" -width 512 -height 512
Resize-Image -sourcePath $source -destPath "$publicDir\maskable-icon.png" -width 512 -height 512

Write-Host "Icon generation completed."
