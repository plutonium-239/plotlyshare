<script lang="ts">
    import { onMount } from 'svelte';
    import { cachedPlots, data, forceDarkPlots, loggedIn, plotTitle, type CachedPlot, type PlotFullData } from './data';
        // import Plotly from 'plotly.js-dist-min'
    export let params: any;
    
    let plotContainer: HTMLDivElement
    let plotID : string = params.plotid
    let userID : string = params.uid
    let plotLoaded = false
    let plotjson: PlotFullData | undefined
    let plotlyDarkTemplate: any
    let loadingProgress: string = "Initializing Plotly.js 🧐"
    let plotlyNormalTemplateFromPlot: any
    const getDarkTemplate = () => fetch('./plotly_dark.json')
    .then((res) => res.json())
    .then(res => {plotlyDarkTemplate = res; console.log("Loaded force dark template");})
    
    document.getElementById("header")!.classList.add('scrolled');
    
    // if (userID === 'demo_plots') {
    //     plotID = plotID.slice(5)
    //     console.log("demo plot detected, changed id to", plotID);
    // }
    
    $: if (window.Plotly) {
        loadingProgress = "Plotting Plotly Plot 😙\nFetching data"
    }
    onMount(async () => {
        // const Plotly = await import("https://cdn.plot.ly/plotly-2.25.2.min.js")
        // console.log("plotly is");
        // console.log(Plotly);
        await getDarkTemplate();
        let plotURL: string | undefined;
        let plotData: CachedPlot = {} as CachedPlot
        if ($cachedPlots.has(`${userID}/${plotID}`)) {
            console.log("Loaded from cached data");
            plotData = $cachedPlots.get(`${userID}/${plotID}`)!
            plotjson = plotData.plot_data
            plotLoaded = true
        } else if (!$loggedIn && $data.has(plotID)) {
            console.log("Got demo plot");
            const plotinfo = $data.get(plotID)!
            console.log(plotinfo);
            plotURL = plotinfo.linked_file
            plotData.name = plotinfo.name
            plotData.timestamp = plotinfo.timestamp
        } else {
            plotURL = `/api/plot/${userID}/${plotID}`
        }
        if (plotURL) {
            console.log("entered fetcher with", plotURL);
            plotjson = await fetch(plotURL)
            .then((res) => {
                console.log("received response from", plotURL);
                plotData.name = res.headers.get('PlotlyShare-Plot-Name') ?? plotData.name ?? "No name found"
                plotData.timestamp = parseInt(res.headers.get('PlotlyShare-Plot-Timestamp') ?? plotData.timestamp.toString() ?? "0")
                return res.json()
            })
            .catch((e) => {
                console.error("error fetching plot plotjson");
                console.log(e);
                // return Error("error fetching plot plotjson")
            }) as PlotFullData
            plotData.plot_data = plotjson
            if (plotjson) {
                $cachedPlots.set(`${userID}/${plotID}`, plotData)
                $cachedPlots = $cachedPlots
                console.log("setting cachedPlots");
                console.log($cachedPlots);
            }
        }

        if (plotjson) {
            // setContext(`title${plotID}`, plotData.name)
            $plotTitle = plotData.name
            await ensurePlotly();
            await window.Plotly.newPlot(
                plotContainer, 
                plotjson.data, 
                plotjson.layout, 
                plotjson.config
            );
            console.log("config was");
            console.log(plotjson.config);            
            window.Plotly.Plots.resize(plotContainer);
            plotLoaded = true
            plotlyNormalTemplateFromPlot = structuredClone(plotjson.layout?.template)
            // console.log("original template");
            // console.log(plotlyNormalTemplateFromPlot);
        } else {
            loadingProgress = "Could not find plot 😔"
        }
    })
    $: updatePlot($forceDarkPlots, plotLoaded).then(() => {console.log("Force dark plots Done")})
    const updatePlot = async (forceDarkPlots: boolean, plotLoaded: boolean) => {
        await ensurePlotly();
        if (forceDarkPlots && plotLoaded) {
            console.log("Enabling force dark mode");
            if (!plotlyDarkTemplate) await getDarkTemplate();
            // console.log(plotlyDarkTemplate);
            return await window.Plotly.relayout(plotContainer, {
                template: plotlyDarkTemplate,
            })
            // TODO: check if plot is still not dark mode and alert message
        } else if (plotLoaded) {
            console.log("Enabling normal mode");
            // console.log(plotlyNormalTemplateFromPlot);
            return await window.Plotly.relayout(plotContainer, {
                template: plotlyNormalTemplateFromPlot,
            })
        } 
    }

    let PlotlyjsLoaded = false
    const ensurePlotly = async () => {
        if (!PlotlyjsLoaded && !window.Plotly) {
            await new Promise((resolve) => {
                setTimeout(resolve, 500)
            });
            PlotlyjsLoaded = true;
        }
    }

</script>

<svelte:head>
    <link rel="stylesheet" href="/plotonly.css" />
    <!-- REVIEW: update plotlyjs version manually or set to latest -->
    <script fetchpriority="high" charset="utf-8" src="https://cdn.plot.ly/plotly-2.25.2.min.js"></script>

</svelte:head>
<div
    class="w-full overflow-x-auto !h-[calc(100vh-4em)]"
    id="plotContainer"
    bind:this={plotContainer}
>
    {#if !plotLoaded}
        <div class:skeleton={!plotLoaded}
            class="[animation-duration:1s] text-center flex justify-center items-center whitespace-pre-wrap"
        >
            {loadingProgress}
        </div>
    {/if}
</div>

<!-- <div class="w-full h-full"> -->
<!-- <iframe srcdoc={plotHTML} class="w-full h-full" title="Plot"></iframe> -->
<!-- {@html plotHTML} -->
<!-- </div> -->

<style type="postcss">
    :global(#plotContainer, .js-plotly-plot, .plot-container.plotly) {
        @apply w-auto md:w-full md:h-full max-md:aspect-video max-md:min-h-[360px];
    }
</style>
