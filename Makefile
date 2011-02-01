BIN = bin/plants

docs:
	dox \
		--title "Plants.js" \
		--intro docs/intro.md \
    lib/*.js > docs/index.html

test:
	@./$(BIN) test/*.js

.PHONY: docs test
