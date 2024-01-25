version := ${shell yq -oy ".project.version" pyproject.toml}

all:
	@:

build:
	py -m build --outdir=dist/${version}

upload:
	py -m twine upload dist/${version}/*
