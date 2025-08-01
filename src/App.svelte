<script lang="ts">
    import Router from "svelte-spa-router";
    
    import Dashboard from './lib/Dashboard.svelte'
    import Plot from './lib/Plot.svelte'
    import Page404 from './lib/404.svelte'
    import Profile from "./lib/Profile.svelte";
    // import { text } from "itty-router";
    import  { location } from 'svelte-spa-router';
    import { docTitle, plotTitle } from "./lib/data";
    import Landing from "./lib/Landing.svelte";
    import {Toasts} from 'svoast';
    import About from "./lib/About.svelte";

    const routes = {
        '/': Landing,
        '/about': About,
        '/dash/*': Dashboard,
        '/plot/:uid/:plotid': Plot,
        '*': Page404,
    }
    console.log({$location});
    window.onscroll = () => {        
        if (!$location.startsWith('/dash/') && $location !== '/about/') return
        // console.log("executing on location", $location);
        
        let header = document.getElementById("header")!
        header.classList.toggle("scrolled", window.scrollY > 0)
    }
    // let title = "All Plots"

    // function updateTitleFromPlot(location: string, plotTitle: string) {
    //     if (location.startsWith('/plot/')) title = plotTitle
    //     else if (location.startsWith('/dash/')) title = "All Plots"
    //     else if (location === '/') title = ""
    //     else if (location === '/about/') title = "About"
    // }
    // $: updateTitleFromPlot($location, $plotTitle)
    
    const titleEl = document.getElementsByTagName('title')[0]
    $: titleEl.innerText = $docTitle
    
    console.log("MAIN LOAD");
    
</script>

<!-- <svelte:head>
    
</svelte:head> -->

<Toasts position='top-right' />
<main>
    <section class="content">
        <header id="header" class="sticky top-0 bg-base-100 max-h-24 transition-all duration-150 text-xl md:text-2xl">
            <a href="/" id="header_logo" class="inline-flex gap-4 items-center max-h-[inherit] relative">
                <img class="justify-self-start max-h-[inherit]" src="/icons/icon-nobg.svg" alt="logo"/>
                <h3 class="max-md:hidden w-fit h-fit text-primary">plotlyshare</h3>
                <span class="max-md:hidden absolute bottom-0 right-0 m-1 text-base">v2</span>
            </a>
        	<h1 class="text-center font-bold text-accent absolute left-1/2 -translate-x-1/2">{ $plotTitle }</h1>
            <Profile />
        </header>
        <Router {routes} />
        {#if !$location.startsWith('/plot/')}
            <footer class="footer footer-center bg-base-300 text-base-content p-4">
                <aside>
                    <p>PlotlyShare is not affiliated to Plotly in any way.</p>
                </aside>
            </footer>
        {/if}
    </section>
</main>

<style type="text/postcss">
    :global(#header) {
        @apply z-10 navbar shadow-xl flex-nowrap gap-2 justify-between px-[--header-padding-x] max-lg:px-4 max-xl:px-24;
    }
    :global(#header.scrolled) {
        @apply max-h-12 [--header-padding-x:6em];
        & span {
            @apply static text-sm;
        }
    }
</style>
