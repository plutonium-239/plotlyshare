<script lang="ts">
    import { onMount } from 'svelte';
    import { forceDarkPlots, loggedIn, type PlotData } from './data';
    // import Plotly from 'plotly.js-dist-min'
    import type { Writable } from 'svelte/store';
    export let params: any;
    
    let plotContainer: HTMLDivElement
    let plotID = params.id
    let plotLoaded: boolean = false
    let plotjson: PlotData | undefined
    let plotlyDarkTemplate: any
    let loadingProgress: string = "Initializing Plotly.js 🧐"
    let plotlyNormalTemplateFromPlot: any
    const getDarkTemplate = () => fetch('./plotly_dark.json')
    .then((res) => res.json())
    .then(res => {plotlyDarkTemplate = res; console.log("Loaded force dark template");})
    

    // window.onscroll = () => {};
    document.getElementById("header")!.classList.add('scrolled');
    
    // onMount(async () => {
    //     let plotHTML: string = ""
    //     if (!$loggedIn) {
    //         plotHTML = await fetch(`./public_plots/${plotID}.html`).then((res) => res.text());
    //         console.log("received plotHTML", plotHTML.length);
    //     }
    //     if (typeof window !== 'undefined') { 
    //         // const Plotly = await import('plotly.js-dist'); // Import Plotly.js
    //         // Plotly.purge(plotContainer)

    //         // plotContainer.innerHTML = plotHTML; // Add the HTML
    //         // console.log(`plotly is ${Plotly}`);
            
    //         const divFragment = document.createRange().createContextualFragment(plotHTML);
    //         plotContainer.append(divFragment);
    //         plotContainer.classList.toggle('skeleton')
    //         // document.body.append(plotContainer);

    //         // const scripts = plotContainer.getElementsByTagName('script');
    //         // for (let script of scripts) {
    //         //     const newScript = document.createElement('script');
    //         //     newScript.textContent = script.textContent;
    //         //     document.body.appendChild(newScript);
    //         //     script.parentNode?.removeChild(script);
    //         // }
    //         Plotly.Plots.resize(document.querySelector('.plotly-graph-div.js-plotly-plot')! as HTMLElement);
    //         console.log("resize success");
            
    //     }
    // });
    $: if (Plotly) {
        loadingProgress = "Plotting Plotly Plot 😙"
    }
    onMount(async () => {
        await getDarkTemplate();
        if (!$loggedIn) {
            plotjson = await fetch(`./public_plots/${plotID}.json`)
                .then((res) => res.json())
                .catch((e) => {
                    console.error("error fetching plot plotjson");
                    console.log(e);
                    // return Error("error fetching plot plotjson")
                })
                
            }
            if (plotjson) {
            await Plotly.newPlot(
                plotContainer, 
                plotjson.data, 
                plotjson.layout, 
                plotjson.config
            );
            Plotly.Plots.resize(plotContainer);
            plotLoaded = true
            plotlyNormalTemplateFromPlot = structuredClone(plotjson.layout?.template)
            // console.log("original template");
            // console.log(plotlyNormalTemplateFromPlot);
            plotContainer.classList.toggle('skeleton')
            
        }
    })
    $: updatePlot($forceDarkPlots, plotLoaded).then(() => {console.log("Done")})
    const updatePlot = async (forceDarkPlots: boolean, plotLoaded: boolean) => {
        if (forceDarkPlots && plotLoaded) {
            console.log("Enabling force dark mode");
            if (!plotlyDarkTemplate) await getDarkTemplate();
            // console.log(plotlyDarkTemplate);
            return await Plotly.relayout(plotContainer, {
                template: plotlyDarkTemplate,
            })
        } else if (plotLoaded) {
            console.log("Enabling normal mode");
            // console.log(plotlyNormalTemplateFromPlot);
            return await Plotly.relayout(plotContainer, {
                template: plotlyNormalTemplateFromPlot,
        })
    } 
    }

</script>

<svelte:head>
    <link rel="stylesheet" href="/plotonly.css"/>
    <script fetchpriority="high" charset="utf-8" src="https://cdn.plot.ly/plotly-2.25.2.min.js"></script>
</svelte:head>
<div class="w-full overflow-x-auto !h-[calc(100%-4em)]" id="plotContainer" bind:this={plotContainer}>
    {#if !plotLoaded}
    <div class="skeleton [animation-duration:1s] flex justify-center items-center">{loadingProgress}</div>
    {/if}
</div>
<!-- <div class="w-full h-full"> -->
    <!-- <iframe srcdoc={plotHTML} class="w-full h-full" title="Plot"></iframe> -->
    <!-- {@html plotHTML} -->
<!-- </div> -->

<style type="postcss">
    :global(#plotContainer > div, .js-plotly-plot, .plot-container.plotly) {
        @apply md:w-full md:h-full max-md:aspect-video max-md:min-h-[360px];
    }
</style>

