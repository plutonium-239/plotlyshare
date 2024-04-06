from plotlyshare.custom_plotly_renderer import PlotlyShareRenderer
import json
import os, sys

dir_path = os.path.dirname(os.path.realpath(__file__))
config_file_path = f'{dir_path}/config.json'

found_config = os.path.exists(config_file_path)
if found_config:
	with open(config_file_path) as f:
		config = json.load(f)
else:
	config = {'setup_done': False}

if not found_config or not config['setup_done']:
	from rich import console
	from rich.markdown import Markdown
	c = console.Console()
	c.print("[bold red]Config file not found, run [reverse]python -m plotlyshare setup[/reverse].[/bold red]")
else:
	import plotly.io as pio
	pio.renderers['plotlyshare'] = PlotlyShareRenderer(config, {})