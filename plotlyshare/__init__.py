from plotlyshare.custom_plotly_renderer import PlotlyShareRenderer, test_connection
import json
from rich import console
import sys, time

config_file_path = 'plotlyshare/config.json'

force_setup = False
if len(sys.argv) == 2 and sys.argv[1] == 'force_setup':
	force_setup = True

with open(config_file_path) as f:
	config = json.load(f)

if force_setup or not config['setup_done']:
	c = console.Console()

	c.print('''
	[italic magenta]PlotlyShare on Deta Space 🚀 setup in progress[/italic magenta]

	Please make an account on deta space: https://deta.space

	Then, install the app 'PlotlyShare' on your personal space from this link:
	https://deta.space/discovery/

	Once you have done that, open the newly installed app from your horizon (home screen in deta space) by 
	just typing 'PlotlyShare' or double clicking the icon. This will open the app in a new tab.

	Then, click on the 'How do I set this up?' button on the bottom.
	Read the instructions there and enter the values for 'DETA_APP_URL' and 'DETA_PROJECT_KEY' one by one:
	''')
	time.sleep(0.5)
	config['DETA_APP_URL'] = c.input('[bold #FF84AC] DETA_APP_URL: [/bold #FF84AC]')
	config['DETA_PROJECT_KEY'] = c.input('[bold #FF84AC] DETA_PROJECT_KEY: [/bold #FF84AC]')

	with c.status('Testing credentials...', spinner='shark'):
		passed, display = test_connection(config['DETA_APP_URL'], config['DETA_PROJECT_KEY'])

		if passed:
			config['setup_done'] = True

			with open(config_file_path, 'w') as f:
				json.dump(config, f, indent=4)

			c.print('[bold green]Setup completed!🚀[/bold green]')
		else:
			c.print('[bold red]Setup failed:[/bold red]\n'+display)


import plotly.io as pio
pio.renderers['plotlyshare'] = PlotlyShareRenderer(config, {})