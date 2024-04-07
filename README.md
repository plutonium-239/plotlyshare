# `plotlyshare`
[![Downloads](https://static.pepy.tech/badge/plotlyshare)](https://pepy.tech/project/plotlyshare)

The purpose of this package is to provide a seamless way to share interactive `plotly` plots, providing a similar experience to google docs/etc. 

This requires a free account on deta space: https://deta.space, which is essentially a *personal* cloud computer *at no cost*.

The idea is to preserve the interactivity and responsiveness of `plotly` plots with the ease of **link-based sharing** and without all the hassle of sending an html file, or worse, a static image/document.

To use this, first run `python -m plotlyshare setup` and install [plotlyshare on deta space](https://deta.space/discovery/@pu239/plotlyshare) .
And then whenever making a plot,

```py
...
import plotly.express as px
import plotly.graph_objects as go
import plotlyshare
...
fig = px.line(...)
fig = go.Figure(...)
fig.show(renderer='plotlyshare')
```

and that's it, the package will upload your plot to your instance of plotlyshare running in deta space and assign it a randomly generated name (which can be edited from the app's page) 
It will print the name that was generated and the direct link to the plot, ready to share with anyone.
