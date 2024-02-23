BACKUP_DIR=".next.backup"

if [ -d "$BACKUP_DIR" ]; then
  rm -rf .next
  cp -r .next.backup .next
else
  cp -r .next .next.backup
fi

BASE_PATH=$NEXT_PUBLIC_BASE_PATH

# If BASE_PATH == "/", change it to ""
if [ "$BASE_PATH" = "/" ]; then
  BASE_PATH=""
fi

find .next \
  -type f \
  -exec sed -i \
    -e "s#/@BASE_PATH@/#${BASE_PATH}/#g" \
    -e "s#/@BASE_PATH@#${BASE_PATH}#g" \
    {} +

pnpm serve:next
