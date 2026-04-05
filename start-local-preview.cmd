@echo off
set NODE_ENV=development
echo Starting local preview...

cd /d C:\Users\John_Israel\Desktop\HTML\Quiz
start cmd /k py -m http.server 8000

cd /d C:\Users\John_Israel\Desktop\HTML\Quiz\backend
start cmd /k npm run dev