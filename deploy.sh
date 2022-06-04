#!/bin/bash
rm -rf ../hego-front/dist
cp -a dist ../hego-front/dist
cd ../hego-front
git add .
git commit -m "add"
git push
./deploy.sh