#!/bin/bash

echo "Executando 'npm run build'"
npm run build

echo "Executando ionic cap sync android"
ionic cap sync android

cd android

# Gera o APK Release
# echo "Gerando APK Release"
# ./gradlew assembleRelease || { echo "❌ APK assembly failed"; exit 1; }

# Gera o Android App Bundle (AAB)
echo "Gerando AAB Bundle"
./gradlew bundleRelease || { echo "❌ AAB bundling failed"; exit 1; }

# Mensagem de conclusão
echo -e "\n✅ Build concluído!"
# echo "📁 APK (Release):  android/app/build/outputs/apk/release/app-release.apk"
echo "📁 AAB (Bundle):   android/app/build/outputs/bundle/release/app-release.aab"

# Abre a pasta no Windows (Explorer)
explorer "app\\build\\outputs"