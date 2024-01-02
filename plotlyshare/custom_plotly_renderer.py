import plotly.io as pio
import webbrowser
import requests
from datetime import datetime
from wonderwords import RandomWord

def test_connection(url, prj_key):
	r = requests.get(url+'/ping', headers={'X-API-Key': prj_key})
	if r.status_code == 200:
		if r.text == "Hello from PlotlyShare on Space! 🚀":
			return True, 'Connected, Message Received: ' + r.text
		elif 'Authorization | Deta Space' in r.text:
			return False, "No project key provided, please run this setup script again."
		elif r.text == 'not found\n':
			return False, "Bad app url provided, please run this setup script again."
	elif r.status_code == 401:
		return False, "Bad project key provided, please run this setup script again."
	else:
		r.raise_for_status()
	return False, "Unknown error occured, please run this setup script again. "

def open_url_in_browser(url, using=None, new=0, autoraise=True):
	"""
	Displays the uploaded plot in a web browser.

	Parameters
	----------
	url: str
		URL of uploaded plot
	using, new, autoraise:
		See docstrings in webbrowser.get and webbrowser.open
	"""
	browser = None

	if using is None:
		browser = webbrowser.get(None)
	else:
		if not isinstance(using, tuple):
			using = (using,)
		for browser_key in using:
			try:
				browser = webbrowser.get(browser_key)
				if browser is not None:
					break
			except webbrowser.Error:
				pass

		if browser is None:
			raise ValueError("Can't locate a browser with key in " + str(using))

	browser.open(url, new=new, autoraise=autoraise)

def ordinal(n): # converting dates to 1st etc
	return str(n)+("th" if 4<=n%100<=20 else {1:"st",2:"nd",3:"rd"}.get(n%10, "th"))

class PlotlyShareRenderer(pio.base_renderers.ExternalRenderer):
	"""
	Renderer to upload interactive figures to your personal Deta Space.
	This can also open a new browser window or tab when the
	show function is called on a figure (controllable by option `open_browser_after_upload`).

	mime type: 'text/html'
	"""

	def __init__(
		self,
		plotlyshare_config,
		config=None,
		auto_play=False,
		using=None,
		new=0,
		autoraise=True,
		post_script=None,
		animation_opts=None,
	):
		self.config = config
		self.auto_play = auto_play
		self.using = using
		self.new = new
		self.autoraise = autoraise
		self.post_script = post_script
		self.animation_opts = animation_opts

		self.base_url = plotlyshare_config['DETA_APP_URL']
		self.auth_header = {'X-API-Key': plotlyshare_config['DETA_PROJECT_KEY']}
		self.open_browser = plotlyshare_config['open_browser_after_upload']
		self.plot_name = None
		self.w = RandomWord()

	def render(self, fig):
		# fig is a dict
		from plotly.io import to_html

		html = to_html(
			fig,
			config=self.config,
			auto_play=self.auto_play,
			include_plotlyjs="cdn",
			include_mathjax="cdn",
			post_script=self.post_script,
			full_html=True,
			animation_opts=self.animation_opts,
			default_width="100%",
			default_height="100%",
			validate=False,
		)

		data = {'html_text': html}
		now = datetime.now()
		
		if self.plot_name:
			data['name'] = self.plot_name
		else:
			data['name'] = f"{self.w.word(include_categories=['adjective'], word_max_length=10)} {self.w.word(include_categories=['noun'], word_max_length=10)}"
			data['name'] += f" {ordinal(now.day)} {now.strftime('%b')}"

		data['timestamp'] = str(now.timestamp()).split('.')[0]
		data['time'] = 	now.astimezone().strftime('%Y-%m-%dT%H:%M:%S%z') # seconds since epoch and timezone

		r = requests.post(self.base_url+'/upload', data=data, headers=self.auth_header)
		if not r.ok:
			print(f"PlotlyShare: The server at {self.base_url+'/upload'} sent an error response")
			r.raise_for_status()

		# print(r.content)
		res = r.json()
		plot_url = self.base_url+'/plot/'+res['key']
		print(f"PlotlyShare: New plot {data['name']} created at {plot_url} of size {res['sent_bytes']/1024 :.2f}kB")

		if self.open_browser:
			open_url_in_browser(plot_url, self.using, self.new, self.autoraise)

		# Reset plot name to check if passed next time
		self.plot_name = None

