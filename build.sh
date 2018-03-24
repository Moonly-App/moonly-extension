rm -rf dist
cp -r src dist
cp ./dist/js/config.prod.js ./dist/js/config.js
rm -rf ./dist/key.pem
# rm dist.zip
# zip -r dist.zip dist
