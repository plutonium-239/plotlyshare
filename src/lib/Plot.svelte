<script lang="ts">
    import { onMount } from 'svelte';
    // import Plotly from 'plotly.js-dist-min'
    export let params = {};
    
    let plotContainer: HTMLDivElement
    
    window.onscroll = () => {};
    document.getElementById("header")!.classList.add('scrolled');
    
    onMount(async () => {
        const sampleplot  = await import('../../oldproj/f92fea41fde6a67166062947bd5ad69f.html?raw');
        if (typeof window !== 'undefined') { 
            // const Plotly = await import('plotly.js-dist'); // Import Plotly.js
            // Plotly.purge(plotContainer)

            // plotContainer.innerHTML = sampleplot; // Add the HTML
            // console.log(`plotly is ${Plotly}`);
            
            const divFragment = document.createRange().createContextualFragment(sampleplot.default);
            plotContainer.append(divFragment);
            plotContainer.classList.toggle('skeleton')
            // document.body.append(plotContainer);

            // const scripts = plotContainer.getElementsByTagName('script');
            // for (let script of scripts) {
            //     const newScript = document.createElement('script');
            //     newScript.textContent = script.textContent;
            //     document.body.appendChild(newScript);
            //     script.parentNode?.removeChild(script);
            // }
            Plotly.Plots.resize(document.querySelector('.plotly-graph-div.js-plotly-plot')! as HTMLElement);
            console.log("resize success");
            
        }
    });
        

</script>

<svelte:head>
    <link rel="stylesheet" href="/plotonly.css"/>
    <script fetchpriority="high" charset="utf-8" src="https://cdn.plot.ly/plotly-2.25.2.min.js"></script>
</svelte:head>
<div class="w-full h-[calc(100%-4em)] skeleton" id="plotContainer" bind:this={plotContainer}></div>
<!-- <div class="w-full h-full"> -->
    <!-- <iframe srcdoc={sampleplot} class="w-full h-full" title="Plot"></iframe> -->
    <!-- {@html sampleplot} -->
<!-- </div> -->

<style type="postcss">
    :global(#plotContainer > div, .js-plotly-plot, .plot-container.plotly) {
        @apply md:w-full md:h-full max-md:aspect-video max-md:min-h-[360px];
    }
</style>

