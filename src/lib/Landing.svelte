<script>
    import { docTitle, loggedIn, plotTitle, rootCollections, savedCollections, savedData } from "./data";
    import FolderIcon from '$icons/folder.svg?raw';
    import PlotIcon from '$icons/icon-nobg.svg?raw'

    $docTitle = "PlotlyShare"
    $plotTitle = "Welcome to PlotlyShare!"
</script>
<!-- h-[calc(100vh-6rem-2rem-20px)] -->
<div class="w-full min-h-[calc(100vh-6rem-2rem-20px)] flex flex-col justify-evenly items-center">
    <!-- <h1 class="text-xl p-4">
        Welcome to plotlyshare!
    </h1> -->
    <div class="hidden from-accent/20 to-secondary/20"></div>
    <div class="hero bg-base-200 ">
        <div class="hero-content text-center flex-wrap">
            <div class="max-w-md">
                <h1 class="text-5xl font-bold"><mark>PlotlyShare</mark></h1>
                <p class="py-6 text-[17px]">
                    is a <mark>seamless</mark> way to share any <code>plotly</code> plots, 
                    preserving <mark>interactivity</mark>, while providing a <mark>convenient</mark>
                    link-based experience. 
                    <!-- experience similar to <span class="line-through">google</span> docs/etc. -->
                </p>
                <!-- <button class="btn btn-primary">Get Started</button> -->
                <a class="btn btn-secondary" href="/#/about/">
                    What is this?
                </a>
            </div>
            <div class="h-72 w-72 mask mask-heart hero-image-heart-effect flex justify-center items-center">
                <img class="h-[65%] ml-1" src="/icons/icon-nobg.svg" alt="logo"/>
            </div>
            <!-- <div class="h-72 w-72 mask mask-heart hero-image-heart-effect flex justify-center items-center">
                <img class="" src="/icons/icon.svg" alt="logo"/>
            </div> -->
        </div>
    </div>
    {#if $loggedIn}
    <div class="stats shadow bg-secondary/15 max-md:stats-vertical">
        <div class="stat place-items-center">
            <div class="stat-figure text-primary h-12 w-12">{@html FolderIcon}</div>
            <div class="stat-title font-bold">Collections</div>
            <div class="stat-value text-primary">{$savedCollections.size}</div>
            <div class="stat-desc italic">(<span class="text-secondary">{$rootCollections.length}</span> at root)</div>
        </div>
        <div class="stat place-items-center">
            <div class="stat-figure text-accent h-12 w-12">{@html PlotIcon}</div>
            <div class="stat-title font-bold">Plots</div>
            <div class="stat-value text-accent">{$savedData.size}</div>
            <div class="stat-desc italic">In all collections</div>
        </div>
    </div>
    {/if}
    <a class="btn btn-primary btn-lg" href="/#/dash/">
        Go to {$loggedIn ? "your": "demo"} dashboard
    </a>
</div>

<style type="text/postcss">
    .hero-image-heart-effect {
        @apply [mask-size:100%] bg-[#7fe2e7] hover:[mask-size:200%] transition-all duration-[400ms];
    }

    mark {
        @apply box-decoration-clone bg-gradient-to-r from-accent to-secondary px-2 font-semibold;
    }
</style>