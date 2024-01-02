import sys, json

allowed_commands = ['setup']
assert len(sys.argv) == 2, f'Please give only one argument out of {allowed_commands}'
command = sys.argv[1]
assert command in allowed_commands, f'Given command not in {allowed_commands}'

config_file_path = 'plotlyshare/config.json'

with open(config_file_path) as f:
	old_config = json.load(f)

if command == 'setup':
	if old_config['setup_done']:
		print('Previous setup detected, printing and resetting.')
		print(json.dumps(old_config, indent=4))

	old_config['setup_done'] = False	
	with open(config_file_path, 'w') as f:
		json.dump(old_config, f, indent=4)

	import plotlyshare.__init__