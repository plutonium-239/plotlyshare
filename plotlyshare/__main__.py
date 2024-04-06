import os, sys, json
import time
from rich import console, pretty
from plotlyshare.custom_plotly_renderer import test_connection

allowed_commands = ['setup']
assert len(sys.argv) == 2, f'Please give only one argument out of {allowed_commands}'
command = sys.argv[1]
assert command in allowed_commands, f'Given command not in {allowed_commands}'

dir_path = os.path.dirname(os.path.realpath(__file__))
config_file_path = f'{dir_path}/config.json'

if os.path.exists(config_file_path):
	with open(config_file_path) as f:
		old_config = json.load(f)
else:
	old_config = {'setup_done': False}

if command == 'setup':
	if old_config['setup_done']:
		print('Previous setup detected, printing and resetting.')
		pretty.pprint(old_config)

	old_config['setup_done'] = False	
	with open(config_file_path, 'w') as f:
		json.dump(old_config, f, indent=4)

	config = {}

	c = console.Console()

	c.print('''
	[italic magenta]PlotlyShare on Deta Space 🚀 setup in progress[/italic magenta]

	Please make an account on deta space: https://deta.space

	Then, install the app 'PlotlyShare' on your personal space from this link:
	https://deta.space/discovery/@pu239/plotlyshare

	Once you have done that, open the newly installed app from your horizon (home screen in deta space) by 
	just typing 'PlotlyShare' or double clicking the icon. This will open the app in a new tab.

	Then, click on the 'How do I set this up?' button on the bottom.
	Read the instructions there and enter the values for 'DETA_APP_URL' and 'DETA_PROJECT_KEY' one by one:
	''')
	time.sleep(0.5)
	config['DETA_APP_URL'] = c.input('[bold #FF84AC] DETA_APP_URL: [/bold #FF84AC]')
	config['DETA_PROJECT_KEY'] = c.input('[bold #FF84AC] DETA_PROJECT_KEY: [/bold #FF84AC]')
	pref_open_browser = c.input(r'[italic #FF84AC] Would you like to open the plot in a browser after plotting? (default: yes) (\[y]/n) [/italic #FF84AC]')
	print(pref_open_browser)
	if pref_open_browser.lower() in ['n', 'no']:
		config['open_browser_after_upload'] = False
	else:
		config['open_browser_after_upload'] = True

	with c.status('Testing credentials...', spinner='shark'):
		passed, display = test_connection(config['DETA_APP_URL'], config['DETA_PROJECT_KEY'])

		if passed:
			config['setup_done'] = True

			with open(config_file_path, 'w') as f:
				json.dump(config, f, indent=4)

			c.print('[bold green]Setup completed!🚀[/bold green]')
		else:
			c.print('[bold red]Setup failed:[/bold red]\n'+display)
