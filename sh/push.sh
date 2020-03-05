#!/bin/bash

npm run build

git add -A .
git commit -m "."

git push origin --all
git push gitlab --all
git push github --all

