param([string]$UnixDir, [string]$Log)
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
$gitBin = "C:\Program Files\Git\usr\bin"
$env:PATH = "$env:JAVA_HOME\bin;$gitBin;$env:PATH"
$bash = "$gitBin\bash.exe"
& $bash -c "cd '$UnixDir' && ./mvnw spring-boot:run" *> $Log 2>&1
