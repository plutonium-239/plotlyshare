version := ${shell yq -oy ".project.version" pyproject.toml}

all:
	@:

build: check_existing
	py -m build --outdir=dist/${version}

upload:
	py -m twine upload dist/${version}/*

check_existing:
ifneq ("$(wildcard dist/${version})", "")
	@echo "dist/${version} already exists, forgot to increase in pyproject.toml?"
	exit 1
else
	@echo "New dist/${version} will be created"
endif

