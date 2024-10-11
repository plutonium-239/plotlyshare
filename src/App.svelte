<script lang="ts">
    import Router from "svelte-spa-router";
    
    import Dashboard from './lib/Dashboard.svelte'
    import Plot from './lib/Plot.svelte'
    import Page404 from './lib/404.svelte'
    import Profile from "./lib/Profile.svelte";
    // import { text } from "itty-router";
    import  { location } from 'svelte-spa-router';
    import { plotTitle } from "./lib/data";
    import Landing from "./lib/Landing.svelte";

    const routes = {
        '/': Landing,
        '/dash/*': Dashboard,
        '/plot/:uid/:plotid': Plot,
        '*': Page404,
    }
    console.log({$location});
    window.onscroll = () => {        
        if (!$location.startsWith('/dash/')) return
        // console.log("executing on location", $location);
        
        let header = document.getElementById("header")!
        header.classList.toggle("scrolled", window.scrollY > 0)
    }
    let title = "All Plots"

    function updateTitleFromPlot(location: string, plotTitle: string) {
        if (location.startsWith('/plot/')) title = plotTitle
        else if (location.startsWith('/dash/')) title = "All Plots"
    }
    $: updateTitleFromPlot($location, $plotTitle)

    console.log("MAIN LOAD");
    
</script>

<main>
    <section class="content md:h-screen">
        <header id="header" class="sticky top-0 bg-base-100 max-h-24 transition-all duration-150 text-xl md:text-2xl">
            <a href="/" id="header_logo" class="inline-flex gap-4 items-center max-h-[inherit] relative">
                <img class="justify-self-start max-h-[inherit]" src="/icons/icon-nobg.svg" alt="logo"/>
                <h3 class="max-md:hidden w-fit h-fit text-primary">plotlyshare</h3>
                <span class="max-md:hidden absolute bottom-0 right-0 m-1 text-base">v2</span>
            </a>
        	<h1 class="text-center font-bold text-accent absolute left-1/2 -translate-x-1/2">{ title }</h1>
            <Profile />
        </header>
        <!-- {% for message in get_flashed_messages() %}
            <div class="flash">{{ message }}</div>
        {% endfor %} -->
        <Router {routes} />
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
