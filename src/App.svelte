<script lang="ts">
    import Router from "svelte-spa-router";
    
    import Dashboard from './lib/Dashboard.svelte'
    import Plot from './lib/Plot.svelte'
    // import { text } from "itty-router";
    import  { location } from 'svelte-spa-router';
    import { meta } from "./lib/data";

    const routes = {
        // Exact path
        '/': Dashboard,

        // Using named parameters, with last being optional
        '/plot/:id': Plot,

        // Catch-all
        // This is optional, but if present it must be the last
        // '*': NotFound,
    }
    window.onscroll = () => {
        let header = document.getElementById("header")!
        header.classList.toggle("scrolled", window.scrollY > 0)
    }
    let title = "All Plots"
    if ($location.startsWith('/plot/')) {
        const id = $location.replace('/plot/', '')
        title = meta.get(id)?.name || "No plot name found"
    }
</script>

<main>
    <section class="content md:h-screen">
        <header id="header" class="sticky top-0 bg-base-100 max-h-24 transition-all duration-150 text-xl md:text-2xl">
            <div id="header_logo" class="inline-flex gap-4 items-center max-h-[inherit]">
                <img class="justify-self-start max-h-[inherit]" src="/public/icons/icon-nobg.svg" alt="logo">
                <h3 class="max-md:hidden w-fit h-fit text-primary">plotlyshare</h3>
            </div>
        	<h1 class="text-center text-accent xl:absolute xl:left-1/2 xl:-translate-x-1/2">{ title }</h1>
            <!-- <div></div> -->
        </header>
        <!-- {% for message in get_flashed_messages() %}
            <div class="flash">{{ message }}</div>
        {% endfor %} -->
        <Router {routes} />
    </section>
</main>

<style type="text/postcss">
    :global(#header) {
        @apply z-10 navbar shadow-xl flex-nowrap gap-2 justify-between px-[--header-padding-x] max-md:px-4;
    }
    :global(#header.scrolled) {
        @apply max-h-12 [--header-padding-x:6em];
    }
</style>
