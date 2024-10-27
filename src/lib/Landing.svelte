<script>
    import { loggedIn, rootCollections, savedCollections, savedData } from "./data";
    import FolderIcon from '$icons/folder.svg?raw';
    import PlotIcon from '$icons/icon-nobg.svg?raw'

</script>

<div class="w-full h-[calc(100vh-6rem-2rem-20px)] flex flex-col justify-evenly items-center">
    <h1 class="text-xl p-4">
        Welcome to plotlyshare!
    </h1>
    <a class="btn btn-secondary" href="/#/about/">
        What is this?
    </a>
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
        Go to dashboard
    </a>
</div>